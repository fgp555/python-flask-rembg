# main.py

from flask import Flask, request, send_file
from flask_cors import CORS
from rembg import remove
from io import BytesIO
import os

# app = Flask(__name__, static_folder="static")
app = Flask(__name__, static_folder="static", static_url_path="/")
CORS(app)

MOCK_BEARER_TOKEN = "Bearer my_secret_token"
API_KEY = "MY_API_KEY"

@app.route("/v1.0/removebg", methods=["POST"])
def remove_background_v1():
    api_key = request.headers.get("X-Api-Key")
    if api_key != API_KEY:
        return {"error": "Invalid API Key"}, 401

    # Validar que venga el archivo con el nombre esperado por el JS
    if "image_file" not in request.files:
        return {"error": "Missing 'image_file'"}, 400

    # Leer el archivo y quitar fondo
    file = request.files["image_file"]
    input_data = file.read()
    output_data = remove(input_data)

    return send_file(
        BytesIO(output_data),
        mimetype="image/png",
        as_attachment=False,
        download_name="no-bg.png"
    )


@app.route("/remove-background/", methods=["POST"])
def remove_background():
    auth_header = request.headers.get("Authorization")
    if auth_header != MOCK_BEARER_TOKEN:
        return {"error": "Unauthorized"}, 401

    if "file" not in request.files:
        return {"error": "No file part"}, 400

    file = request.files["file"]
    input_data = file.read()
    output_data = remove(input_data)

    return send_file(
        BytesIO(output_data),
        mimetype="image/png",
        as_attachment=False,
        download_name="output.png"
    )

@app.route("/", methods=["GET"])
def home():
    try:
        with open(os.path.join(app.static_folder, "dev-credit.html"), encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "<h1>dev-credit.html not found</h1>", 404

@app.route("/app", methods=["GET"])
def app_page():
    try:
        with open(os.path.join(app.static_folder, "index.html"), encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "<h1>index.html not found</h1>", 404

@app.route("/app_basic", methods=["GET"])
def app_basic():
    try:
        with open(os.path.join(app.static_folder, "index-picocss.html"), encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "<h1>index-picocss.html not found</h1>", 404

@app.route("/hello", methods=["GET"])
def hello():
    auth_header = request.headers.get("Authorization")
    if auth_header != MOCK_BEARER_TOKEN:
        return {"error": "Unauthorized"}, 401
    return "Hello, World!"

if __name__ == "__main__":
    app.run()
