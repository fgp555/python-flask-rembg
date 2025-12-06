# Installation Windows

```sh
python --version
rm -rf venv __pycache__

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

### Produccion

http://rembg.frankgp.com
https://rembg.appsystered.com
https://rembg.e-transportech.org

### dev

http://api.frankgp.com
https://api.appsystered.com
https://py.fgp.one

### task

https://api.ivanageraldine.com
https://rembg-balancer.ivanageraldine.com
https://rembg.ivanageraldine.com
http://91.108.126.37
https://rembg2.ivanageraldine.com
