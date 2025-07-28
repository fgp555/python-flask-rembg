#!/bin/bash

# 1. Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
  echo "🟢 Creando entorno virtual..."
  python -m venv venv
else
  echo "⚠️ El entorno virtual ya existe."
fi

# 2. Activar entorno virtual
echo "✅ Activando entorno virtual..."
source venv/Scripts/activate 2>/dev/null || source venv/bin/activate

# 3. Instalar dependencias
echo "📦 Instalando dependencias..."
pip install -r requirements.txt

echo "🎉 Listo. Entorno configurado."
