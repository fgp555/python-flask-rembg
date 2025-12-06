# Install Nginx

```sh
sudo apt update
sudo apt install nginx -y
nginx -v

sudo service nginx start
sudo service nginx enable
sudo service nginx status
sudo service nginx stop

curl http://localhost
curl http://91.108.126.37
```

# Config Domains and Subdomains

```conf
server {
    listen 80;
    server_name rembg2.ivanageraldine.com;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

```sh
sudo vim /etc/nginx/sites-available/ivanageraldine.com
sudo ln -s /etc/nginx/sites-available/ivanageraldine.com /etc/nginx/sites-enabled/
ls -l /etc/nginx/sites-available
ls -l /etc/nginx/sites-enabled

sudo nginx -t
sudo systemctl reload nginx

curl http://rembg2.ivanageraldine.com
```

# Install Certbot SSL

```sh
# Instalar Certbot (Let’s Encrypt)
sudo apt install certbot python3-certbot-nginx -y
certbot --version

sudo certbot --nginx -d rembg2.ivanageraldine.com --cert-name ivanageraldine.com
sudo certbot certificates
sudo certbot delete --cert-name ivanageraldine.com
# Renovación automática SSL (IMPORTANTE)
sudo certbot renew --dry-run

sudo systemctl status nginx
sudo systemctl restart nginx
sudo systemctl reload nginx

curl https://rembg2.ivanageraldine.com/ping

# HTTP HEAD
curl -I https://rembg2.ivanageraldine.com/ping
```

# Redirect IP → domain

```sh
curl http://91.108.126.37

sudo vim /etc/nginx/sites-enabled/default
```

```conf
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    return 301 https://rembg2.ivanageraldine.com$request_uri;
}
```
