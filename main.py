# main.py

from fastapi import FastAPI, File, UploadFile
from rembg import remove
from fastapi.responses import HTMLResponse, Response
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
def serve_html():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/remove-background/")
async def remove_bg(file: UploadFile = File(...)):
    input_data = await file.read()
    output_data = remove(input_data)

    return Response(content=output_data, media_type="image/png")
