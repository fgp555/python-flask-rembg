from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware

from your_main_fastapi_app import app as fastapi_app  # importa tu FastAPI app principal

app = WSGIMiddleware(fastapi_app)
