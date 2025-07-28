import sys
import os

# Asegura que el path al proyecto está en sys.path
sys.path.insert(0, os.path.dirname(__file__))

# Importa app desde main.py
from main import app as application  # FastAPI soporta WSGI si se adapta vía ASGI
