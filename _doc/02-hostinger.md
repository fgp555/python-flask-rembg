# removebg.service

```conf
[Unit]
Description=Gunicorn Flask RemoveBG API
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=/root/python-flask-rembg
Environment="PATH=/root/python-flask-rembg/venv/bin"
ExecStart=/root/python-flask-rembg/venv/bin/gunicorn \
          --workers 3 \
          --threads 1 \
          --timeout 120 \
          --max-requests 200 \
          --max-requests-jitter 20 \
          --access-logfile - \
          --error-logfile - \
          --bind 127.0.0.1:8000 \
          main:app

Restart=always

[Install]
WantedBy=multi-user.target
```

# removebg

```conf
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
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```
