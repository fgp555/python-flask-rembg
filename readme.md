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

# Installation Ubuntu

```sh
python3 --version
sudo apt update
sudo apt install python3.12-venv -y
sudo apt install -y python3 python3-pip python3-venv nginx

python3  -m venv venv
source venv/bin/activate
pip install -r requirements.txt

python3 main.py
flask --app main.py run --reload
nodemon --exec "python" main.py

curl http://127.0.0.1:5000/
curl http://127.0.0.1:5000/ping -H "Authorization: Bearer my_secret_token"

deactivate
```

# 🔫 7. Ejecutar con Gunicorn (producción)

```sh
pip install gunicorn
pip install gunicorn flask flask-cors rembg pillow
gunicorn --bind 127.0.0.1:8000 main:app

curl http://127.0.0.1:8000/ping -H "Authorization: Bearer my_secret_token"

which gunicorn

# Crear servicio systemd (auto-start)
sudo vim /etc/systemd/system/removebg.service

```

# removebg.service

```ini
[Unit]
Description=Gunicorn Flask RemoveBG API
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/python-flask-rembg
Environment="PATH=/home/ubuntu/python-flask-rembg/venv/bin"
ExecStart=/home/ubuntu/python-flask-rembg/venv/bin/gunicorn \
          --workers 2 \
          --bind 127.0.0.1:8000 \
          main:app

Restart=always

[Install]
WantedBy=multi-user.target
```

```ini
[Unit]
Description=Gunicorn Flask RemoveBG API
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/python-flask-rembg
Environment="PATH=/home/ubuntu/python-flask-rembg/venv/bin"
ExecStart=/var/www/removebg/venv/bin/gunicorn \
        --workers 1 \
        --threads 1 \
        --timeout 120 \
        --bind 127.0.0.1:8000 \
        main:app

Restart=always

[Install]
WantedBy=multi-user.target
```

```sh
# Aplicar cambios
sudo systemctl daemon-reload
sudo systemctl restart removebg

# Activar
sudo systemctl daemon-reload
sudo systemctl start removebg
sudo systemctl enable removebg

# Ver estado
sudo systemctl status removebg

sudo systemctl daemon-reload
sudo systemctl restart removebg
sudo systemctl status removebg -l

# Ver los logs en tiempo real
journalctl -u removebg -f


```

# 🌍 9. Configurar Nginx (IP pública → Flask)

```sh
sudo vim /etc/nginx/sites-available/removebg
```

```ini
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```ini
server {
    listen 80;
    server_name 18.222.21.11;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```sh
# Revisa TODOS los server blocks activos
ls -l /etc/nginx/sites-enabled/
sudo tail -n 50 /var/log/nginx/error.log

# Activar sitio:
sudo rm /etc/nginx/sites-enabled/removebg
sudo rm /etc/nginx/sites-enabled/aws_rds
sudo ln -s /etc/nginx/sites-available/removebg /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx



curl http://18.222.21.11/
curl http://18.222.21.11/ping -H "Authorization: Bearer my_secret_token"

sudo systemctl stop removebg
# Verificar que 8000 esté libre
sudo lsof -i :8000

# Reiniciar el service systemd correctamente
sudo systemctl start removebg
sudo systemctl status removebg -l

```
