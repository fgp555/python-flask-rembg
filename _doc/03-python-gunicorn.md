# WSL2 local development

```sh
wsl --unregister Ubuntu
wsl --import Ubuntu D:/wsl2/Ubuntu D:/wsl2/ubuntu_snapshot.tar --version 2
rm -rf venv __pycache__
wsl

sudo apt update
sudo apt install -y python3.12-venv python3-pip
python3 --version
pip --version

git clone https://github.com/fgp555/python-flask-rembg.git

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

python3 main.py
flask --app main.py run --reload
nodemon --exec "python" main.py
curl http://127.0.0.1:5000/ping
```

# VPS Production | Gunicorn (producción)

```sh
pip install gunicorn
gunicorn --version

gunicorn --bind 127.0.0.1:8000 main:app
gunicorn --workers 3 --threads 1 --bind 0.0.0.0:8000 main:app
curl http://127.0.0.1:8000/ping

# Crear servicio systemd (auto-start)
sudo vim /etc/systemd/system/removebg.service
which gunicorn
```

# removebg.service

```ini
[Unit]
Description=Gunicorn Flask RemoveBG API            # Descripción del servicio
After=network.target                              # Inicia luego de la red

[Service]
User=ubuntu                                       # Usuario que ejecuta el servicio
Group=www-data                                    # Grupo del proceso
WorkingDirectory=/home/ubuntu/python-flask-rembg  # Directorio del proyecto
Environment="PATH=/home/ubuntu/python-flask-rembg/venv/bin"  # Virtualenv
ExecStart=/home/ubuntu/python-flask-rembg/venv/bin/gunicorn \ # Ejecuta Gunicorn
          --workers 1 \                           # Procesos worker
          --threads 1 \                           # Hilos por worker
          --timeout 120 \                         # Timeout de requests
          --bind 127.0.0.1:8000 \                 # Escucha solo local (Nginx)
          main:app                                # App Flask

Restart=always                                    # Reinicia si falla

[Install]
WantedBy=multi-user.target                        # Arranque automático
```

```sh
# Aplicar cambios
sudo systemctl daemon-reload    # recarga unit files / SIEMPRE tras editar .service
sudo systemctl restart removebg # reinicia servicio
sudo systemctl status removebg  # ver estado

sudo systemctl enable removebg  # Habilita Nginx para que arranque al iniciar el sistema
sudo systemctl daemon-reexec    # recarga systemd (binarios) / solo si systemd se actualizó

# Ver logs en tiempo real (modo "follow")
journalctl -u removebg -f
# Ver logs recientes del servicio
journalctl -u removebg -n 50
```

# 🌐 Instalar Nginx y SSL Certbot

```sh
sudo apt install nginx -y
curl localhost
sudo vim /etc/nginx/sites-available/removebg
```

# removebg

```conf
server {
    listen 80;                                      # Puerto HTTP
    server_name vps.frankgp.com;                     # Dominio del servidor

    client_max_body_size 20M;                        # Límite de subida

    location / {
        proxy_pass http://127.0.0.1:8000;            # Backend Python (Flask/FastAPI)
        proxy_http_version 1.1;                      # HTTP/1.1 requerido para keep-alive
        proxy_set_header Host $host;                 # Preserva el dominio original
        proxy_set_header X-Real-IP $remote_addr;     # IP real del cliente
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; # IPs encadenadas
        proxy_set_header X-Forwarded-Proto $scheme;  # Protocolo original (http/https)
    }
}
```

```sh
sudo ln -s /etc/nginx/sites-available/removebg /etc/nginx/sites-enabled/
cat /etc/nginx/sites-enabled/removebg

sudo nginx -t
sudo systemctl restart nginx
curl http://vps.frankgp.com/ping

sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d vps.frankgp.com
curl https://vps.frankgp.com
```

## 🔥 Test con Carga REAL con imágenes

```bash
mkdir -p out # directorio de salida

ls *.png | xargs -n 1 -P 4 -I {} curl -X POST \
  -H "X-Api-Key: MY_API_KEY" \
  -F "image_file=@{}" \
  http://localhost:8000/v2.0/removebg -o out/{}

```
