---
draft: false
---
## Architecture Documentation: Securing a Dockerized Web Application via Cloudflare mTLS and Nginx Reverse Proxy

This document outlines the sequential protocol executed to secure a Virtual Private Server (VPS) hosting a Dockerized online judge. The architecture mandates that all ingress traffic is routed exclusively through Cloudflare, utilizing Mutual TLS (mTLS) for cryptographic verification, while local host Nginx serves as a reverse proxy to the internal Docker network.

### 1. Docker Port Reallocation

To resolve port binding conflicts between the Docker daemon and the host Nginx service, the internal application was isolated to the local loopback interface.

1. Modified the `docker-compose.yml` file to bind the `oj-backend` service strictly to `127.0.0.1` on an unprivileged port (8080), relinquishing host ports 80 and 443.

```yaml
services:
  oj-backend:
    image: registry.cn-hongkong.aliyuncs.com/oj-image/backend:1.6.1
    ports:
      - "127.0.0.1:8080:8000"
```

2. Reinitialized the Docker network architecture to apply the modifications.

```bash
docker-compose down
docker-compose up -d
```

### 2. Default Nginx Configuration (IP Access Termination)

The host Nginx daemon was configured to terminate any direct IP requests or requests lacking a valid `Host` header, preventing origin IP discovery.

1. Started and enabled the host Nginx service.

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

2. Replaced the contents of `/etc/nginx/sites-available/default` with a catch-all block.

```nginx
server {
    listen 80 default_server;
    listen 443 ssl default_server;
    server_name _;
    
    ssl_reject_handshake on;
    return 444;
}
```

### 3. Cryptographic Asset Provisioning

Cloudflare cryptographic certificates were provisioned to the host server to enable strict end-to-end encryption and mTLS client verification.

1. Created secure directories for certificate storage.

```bash
sudo mkdir -p /etc/ssl/certs /etc/ssl/private
```

2. Generated and stored the Cloudflare Origin CA Certificate and Private Key

```bash
sudo nano /etc/ssl/certs/cloudflare_origin.pem
sudo nano /etc/ssl/private/cloudflare_origin.key
sudo chmod 600 /etc/ssl/private/cloudflare_origin.key
```

3. Downloaded the Cloudflare Authenticated Origin Pulls CA certificate.

```bash
sudo wget -O /etc/ssl/certs/cloudflare_pull.pem https://developers.cloudflare.com/ssl/static/authenticated_origin_pull_ca.pem
```

### 4. Nginx Reverse Proxy and mTLS Configuration

A dedicated server block was established for the primary domain (`cp.bupcopc.tech`) to enforce HTTPS, validate the Cloudflare client certificate, and proxy traffic to the internal Docker container.

1. Created the domain configuration file.

```bash
sudo nano /etc/nginx/sites-available/cp.bupcopc.tech
```

2. Implemented the proxy and mTLS directives.

```nginx
server {
    listen 80;
    server_name cp.bupcopc.tech;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cp.bupcopc.tech;

    ssl_certificate /etc/ssl/certs/cloudflare_origin.pem;
    ssl_certificate_key /etc/ssl/private/cloudflare_origin.key;

    ssl_client_certificate /etc/ssl/certs/cloudflare_pull.pem;
    ssl_verify_client on;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. Enabled the configuration and reloaded the Nginx daemon.

```bash
sudo ln -s /etc/nginx/sites-available/cp.bupcopc.tech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Cloudflare Edge Enforcement

The Cloudflare Dashboard was configured to mandate secure communication protocols between the edge network and the origin VPS.

1. Navigated to **SSL/TLS > Overview** and configured the encryption mode to **Full (strict)**.
2. Navigated to **SSL/TLS > Origin Server** and enabled **Authenticated Origin Pulls**.
3. Navigated to **DNS > Records** and verified the `A` record for the domain was set to **Proxied**.

