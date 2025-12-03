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

# Deploy en CPanel

```sh
Python-version: 3.12.11
Application-root: repositories/python-flask-rembg
Application-URL: https://rembg.frankgp.com
Application-startup-file: passenger_wsgi.py
Application-Entry-point: application
Passenger-log-file: repositories/1python-flask-rembg.log

Configuration-files: requirements.txt
```
