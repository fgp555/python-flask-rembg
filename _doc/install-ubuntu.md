```sh
# Desinstalar / Importar el snapshot
wsl --unregister Ubuntu
wsl --import Ubuntu D:/wsl2/Ubuntu D:/wsl2/ubuntu_snapshot.tar --version 2
```

# Installation Ubuntu

```sh
rm -rf venv __pycache__
wsl
python3 --version

sudo apt update
sudo apt install -y python3.12-venv python3-pip
pip --version

python3  -m venv venv
source venv/bin/activate
pip install -r requirements_v1.txt
pip install -r requirements_v2.txt
deactivate

python3 main_v2.py
flask --app main_v2.py run --reload
nodemon --exec "python" main_v2.py
curl http://127.0.0.1:5000/
curl http://127.0.0.1:5000/ping
```

# 🔫 Ejecutar con Gunicorn (producción)

```sh
pip install gunicorn
which gunicorn
gunicorn --bind 127.0.0.1:8000 main_v2:app

curl http://127.0.0.1:8000/ping

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
          main_v2:app

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
        main_v2:app

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
curl http://18.222.21.11/ping

sudo systemctl stop removebg
# Verificar que 8000 esté libre
sudo lsof -i :8000

# Reiniciar el service systemd correctamente
sudo systemctl start removebg
sudo systemctl status removebg -l

```
