# Install Nginx

```sh
sudo apt update
sudo apt install nginx -y
nginx -v

sudo nginx -t # probar la configuración antes de recargar o reiniciar.

sudo systemctl enable nginx    # Habilita Nginx para que arranque al iniciar el sistema
sudo systemctl reload nginx    # Recarga la configuración sin cortar conexiones
sudo systemctl restart nginx   # Reinicia Nginx (detiene y vuelve a iniciar)
sudo systemctl start nginx     # Inicia Nginx si está detenido
sudo systemctl status nginx    # Muestra el estado actual de Nginx
sudo systemctl stop nginx      # Detiene Nginx cortando todas las conexiones

curl localhost
curl localhost -I # HEAD
curl http://3.12.152.230

sudo mkdir -p /var/www/hello-world
echo "hello world" | sudo tee /var/www/hello-world/index.html

sudo vim /etc/nginx/sites-available/vps.frankgp.com
```

```conf
server {
    listen 80;
    server_name vps.frankgp.com;

    root /var/www/hello-world;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

```sh
# Crear un enlace simbólico (symbolic link / symlink)
sudo ln -s /etc/nginx/sites-available/vps.frankgp.com /etc/nginx/sites-enabled/
cat /etc/nginx/sites-enabled/vps.frankgp.com

sudo nginx -t
sudo systemctl reload nginx

curl http://vps.frankgp.com
```

# Install SSL Certbot

```sh
# Instalar Certbot (Let’s Encrypt)
sudo apt install certbot python3-certbot-nginx -y
certbot --version

sudo certbot --nginx -d vps.frankgp.com
sudo certbot --nginx -d frankgp.com -d www.frankgp.com --cert-name frankgp.com
sudo certbot certificates
sudo certbot delete --cert-name vps.frankgp.com

# simular la renovación de tus certificados
sudo certbot renew --dry-run

curl https://vps.frankgp.com
```

# Redirect IP → domain

```sh
sudo vim /etc/nginx/sites-available/default
cat /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
curl http://checkip.amazonaws.com
curl http://3.12.152.230
```

# default

```conf
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    return 301 https://vps.frankgp.com$request_uri;
}
```

# Subdominio con reverse proxy al puerto 3000

```sh
echo "hello world 3000" > index.html
sudo python3 -m http.server 3000
curl localhost:3000

sudo vim /etc/nginx/sites-available/nodejs.frankgp.com
sudo ln -s /etc/nginx/sites-available/nodejs.frankgp.com /etc/nginx/sites-enabled/
cat /etc/nginx/sites-enabled/nodejs.frankgp.com

sudo nginx -t
sudo systemctl reload nginx
curl http://nodejs.frankgp.com
sudo certbot --nginx -d nodejs.frankgp.com
curl https://nodejs.frankgp.com
```

```conf
server {
    listen 80;
    listen [::]:80;

    server_name nodejs.frankgp.com;

    location / {
        proxy_pass http://127.0.0.1:3000;       # Redirige las peticiones

        proxy_http_version 1.1;                 # Usa HTTP/1.1 (requerido para WebSockets)
        proxy_set_header Upgrade $http_upgrade; # Permite upgrade de conexión (WebSockets)
        proxy_set_header Connection 'upgrade';  # Mantiene la conexión abierta (WebSockets)
        proxy_set_header Host $host;            # Conserva el dominio original
        proxy_cache_bypass $http_upgrade;       # Evita cache cuando hay upgrade
    }
}
```

# Restore configuration

```sh
ls -l /etc/nginx/sites-available
ls -l /etc/nginx/sites-enabled

sudo certbot certificates
sudo certbot delete --cert-name vps.frankgp.com
sudo certbot delete --cert-name nodejs.frankgp.com

sudo rm /etc/nginx/sites-enabled/vps.frankgp.com
sudo rm /etc/nginx/sites-available/vps.frankgp.com
sudo rm /etc/nginx/sites-enabled/nodejs.frankgp.com
sudo rm /etc/nginx/sites-available/nodejs.frankgp.com
sudo rm -rf /var/www/hello-world
rm index.html

sudo nginx -t
sudo systemctl reload nginx

curl localhost
curl http://3.12.152.230

sudo vim /etc/nginx/sites-available/default
cat /etc/nginx/sites-enabled/default
```

# Default server configuration

```conf
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;
    server_name _;
    location / {
        try_files $uri $uri/ =404;
    }
}
```
