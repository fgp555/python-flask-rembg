# =========================
# Imports
# =========================
from flask import Flask, request, send_file
from flask_cors import CORS
from rembg import remove
from io import BytesIO
from PIL import Image
import os
import time
import psutil
import logging


# =========================
# App & Config
# =========================
app = Flask(__name__, static_folder="static", static_url_path="/")
CORS(app)

API_KEY = "MY_API_KEY"
MOCK_BEARER_TOKEN = "Bearer my_secret_token"

start_time = time.time()
active_jobs = 0


# =========================
# Logging (tipo morgan)
# =========================
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s"
)
logger = logging.getLogger("http")


# =========================
# Middlewares
# =========================
@app.before_request
def before_request():
    global active_jobs
    active_jobs += 1
    request.start_time = time.time()


@app.after_request
def after_request(response):
    global active_jobs
    elapsed = int((time.time() - request.start_time) * 1000)

    logger.info(
        "%s %s %s %dms pid=%s jobs=%d",
        request.method,
        request.path,
        response.status_code,
        elapsed,
        os.getpid(),
        active_jobs
    )

    active_jobs -= 1
    return response


# =========================
# Health & Status
# =========================
@app.route("/ping", methods=["GET"])
def ping():
    return "pong"


@app.route("/status", methods=["GET"])
def status():
    cpu = psutil.cpu_percent(interval=0.2)
    mem = psutil.virtual_memory().percent

    return {
        "status": "ok",
        "cpu": cpu,
        "memory": mem,
        "busy": cpu > 85 or mem > 85,
        "pid": os.getpid(),
        "uptime": int(time.time() - start_time),
        "active_jobs": active_jobs
    }


# =========================
# API v2.0
# =========================
@app.route("/v2.0/removebg", methods=["POST"])
def remove_background_v2():
    if request.headers.get("X-Api-Key") != API_KEY:
        return {"error": "Invalid API Key"}, 401

    if "image_file" not in request.files:
        return {"error": "Missing 'image_file'"}, 400

    file = request.files["image_file"]
    max_height = request.args.get("max_height")
    compress_image = request.args.get("compress_image", "false").lower() == "true"
    output_format = request.args.get("format", "png").lower()

    # Abrir imagen original
    img = Image.open(file)

    # Redimensionar antes de eliminar el fondo
    if max_height and max_height.isdigit():
        max_height = int(max_height)
        if img.height > max_height:
            ratio = max_height / img.height
            img = img.resize(
                (int(img.width * ratio), max_height),
                Image.LANCZOS
            )

    # Convertir la imagen redimensionada a bytes para rembg
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    output_data = remove(buf.read())

    # Abrir resultado de rembg
    img = Image.open(BytesIO(output_data))

    # Guardar salida en el formato solicitado
    buffer = BytesIO()
    if output_format == "jpeg":
        img.convert("RGB").save(buffer, "JPEG", quality=70 if compress_image else 95)
        mimetype, filename = "image/jpeg", "no-bg.jpg"
    elif output_format == "webp":
        img.save(buffer, "WEBP", quality=70 if compress_image else 95)
        mimetype, filename = "image/webp", "no-bg.webp"
    else:
        img.save(buffer, "PNG", optimize=True)
        mimetype, filename = "image/png", "no-bg.png"

    buffer.seek(0)
    return send_file(buffer, mimetype=mimetype, download_name=filename)



# =========================
# API v1.0 (legacy)
# =========================
@app.route("/v1.0/removebg", methods=["POST"])
def remove_background_v1():
    if request.headers.get("X-Api-Key") != API_KEY:
        return {"error": "Invalid API Key"}, 401

    if "image_file" not in request.files:
        return {"error": "Missing 'image_file'"}, 400

    output = remove(request.files["image_file"].read())

    return send_file(
        BytesIO(output),
        mimetype="image/png",
        download_name="no-bg.png"
    )


# =========================
# Static Pages
# =========================
@app.route("/", methods=["GET"])
def home():
    return _static_file("home.html")


@app.route("/app", methods=["GET"])
def app_page():
    return _static_file("index.html")


def _static_file(filename):
    try:
        with open(os.path.join(app.static_folder, filename), encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return f"<h1>{filename} not found</h1>", 404


# =========================
# Auth Test
# =========================
@app.route("/authTest", methods=["GET"])
def test_token():
    if request.headers.get("Authorization") != MOCK_BEARER_TOKEN:
        return {"error": "Unauthorized"}, 401
    return "authTest"


# =========================
# Local Run
# =========================
if __name__ == "__main__":
    app.run(debug=True)
