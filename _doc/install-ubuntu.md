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

git clone https://github.com/fgp555/python-flask-rembg.git

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

python3 main.py
flask --app main.py run --reload
nodemon --exec "python" main.py
curl http://127.0.0.1:5000/
curl http://127.0.0.1:5000/ping
```

# 🔫 Ejecutar con Gunicorn (producción)

```sh
pip install gunicorn
which gunicorn
gunicorn --bind 127.0.0.1:8000 main:app
gunicorn --workers 2 --threads 1 --bind 0.0.0.0:8000 main:app

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
User=root
Group=www-data
WorkingDirectory=/root/python-flask-rembg
Environment="PATH=/root/python-flask-rembg/venv/bin"
ExecStart=/root/python-flask-rembg/venv/bin/gunicorn \
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

# Ver estado
sudo systemctl status removebg
sudo systemctl status removebg -l

# Ver los logs en tiempo real
journalctl -u removebg -f
```

# 🌍 9. Configurar Nginx (IP pública → Flask)

```sh
sudo apt install nginx -y
sudo systemctl status nginx
nginx -v
sudo systemctl enable nginx


sudo vim /etc/nginx/sites-available/removebg
```

# removebg

```js
server {
    listen 80;
    server_name rembg2.ivanageraldine.com;

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
sudo ln -s /etc/nginx/sites-available/removebg /etc/nginx/sites-enabled/
sudo vim /etc/nginx/sites-enabled/removebg
sudo nginx -t
sudo systemctl restart nginx

curl localhost
curl http://91.108.126.37
curl http://91.108.126.37/ping

# Ver logs recientes del servicio
sudo journalctl -u removebg.service -n 50

# Ver logs en tiempo real (modo "follow")
sudo journalctl -u removebg.service -f
```

## 🔥 Carga REAL con imágenes

```bash
mkdir -p out

ls *.png | xargs -n 1 -P 4 -I {} curl -X POST \
  -H "X-Api-Key: MY_API_KEY" \
  -F "image_file=@{}" \
  http://localhost:8000/v2.0/removebg -o out/{}

```
