```sh
python --version

python -m venv venv
source venv/Scripts/activate

fastapi dev main.py

deactivate
```

# Install

```sh
pip install "fastapi[standard]"
pip install rembg
pip install onnxruntime

pip uninstall onnxruntime
# Opción B: Si tienes GPU y deseas aceleración (opcional)
pip install onnxruntime-gpu
```

```sh
pip freeze > requirements.txt

python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
```
