# Installation Windows

```sh
python --version

python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt

python main.py
flask --app main.py run --reload
nodemon --exec "python" main.py

deactivate
```
