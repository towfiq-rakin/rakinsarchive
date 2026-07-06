---
draft: false
---

#### Architecture Documentation: Securing CTFd via Cloudflare mTLS and Nginx Reverse Proxy

This document outlines the sequential protocol executed to secure a Google Compute Engine (GCE) VPS hosting CTFd : a Dockerized Capture The Flag platform. The architecture mandates that all ingress traffic is routed exclusively through Cloudflare, utilizing Mutual TLS (mTLS) for cryptographic verification, while host Nginx serves as a reverse proxy to the internal Docker network.

---

## 1. Infrastructure Overview

|Component|Details|
|---|---|
|Cloud Provider|Google Compute Engine (GCE)|
|OS|Ubuntu (fresh instance)|
|Application|CTFd (Dockerized)|
|Domain|`ctf.bupcopc.tech`|
|DNS / Proxy|Cloudflare (Proxied)|
|SSL Mode|Full (Strict) + Authenticated Origin Pulls|
|Reverse Proxy|Host Nginx → Docker CTFd container|

---

## 2. Docker Deployment

CTFd was cloned and launched via Docker Compose, which provisions the following containers:

- `ctfd-ctfd-1` — Main application (port 8000 internally)
- `ctfd-db-1` — MariaDB database
- `ctfd-cache-1` — Redis cache
- `ctfd-nginx-1` — Internal Nginx proxy

### 2.1 Clone and Launch

```bash
cd /opt
sudo git clone https://github.com/CTFd/CTFd.git
sudo chown -R $USER:$USER /opt/CTFd
cd /opt/CTFd
docker compose up -d
```

### 2.2 Port Reallocation

To resolve port binding conflicts between the Docker Nginx container and the host Nginx service, the internal Nginx was isolated to the local loopback interface on port 8080.

Modified the `nginx` service in `docker-compose.yml`:

```yaml
  nginx:
    image: nginx:stable
    restart: always
    volumes:
      - ./conf/nginx/http.conf:/etc/nginx/nginx.conf
    ports:
      - "127.0.0.1:8080:80"    # Bind to loopback only, relinquish host ports 80/443
    depends_on:
      - ctfd
```

Reinitialized the Docker network:

```bash
docker compose down
docker compose up -d
```

---

## 3. Host Nginx Installation

The host Nginx daemon was installed and enabled to handle SSL termination and reverse proxying.

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 4. Default Nginx Configuration (IP Access Termination)

The host Nginx was configured to terminate any direct IP requests or requests lacking a valid `Host` header, preventing origin IP discovery.

Replaced the contents of `/etc/nginx/sites-available/default`:

```nginx
server {
    listen 80 default_server;
    listen 443 ssl default_server;
    server_name _;

    ssl_reject_handshake on;
    return 444;
}
```

---

## 5. Cryptographic Asset Provisioning

Cloudflare cryptographic certificates were provisioned to enable strict end-to-end encryption and mTLS client verification. The wildcard origin certificate (`*.bupcopc.tech`) was reused from the existing `cp.bupcopc.tech` deployment.

### 5.1 Create Certificate Directories

```bash
sudo mkdir -p /etc/ssl/certs /etc/ssl/private
```

### 5.2 Install Origin Certificate and Private Key

```bash
sudo nano /etc/ssl/certs/cloudflare_origin.pem    # Paste wildcard origin certificate
sudo nano /etc/ssl/private/cloudflare_origin.key   # Paste private key
sudo chmod 600 /etc/ssl/private/cloudflare_origin.key
sudo chmod 644 /etc/ssl/certs/cloudflare_origin.pem
```

### 5.3 Download Authenticated Origin Pulls CA Certificate

```bash
sudo wget -O /etc/ssl/certs/cloudflare_pull.pem \
  https://developers.cloudflare.com/ssl/static/authenticated_origin_pull_ca.pem
```

---

## 6. Nginx Reverse Proxy and mTLS Configuration

A dedicated server block was established for `ctf.bupcopc.tech` to enforce HTTPS, validate the Cloudflare client certificate via mTLS, and proxy traffic to the internal Docker container.

### 6.1 Create Domain Configuration

```bash
sudo nano /etc/nginx/sites-available/ctf.bupcopc.tech
```

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name ctf.bupcopc.tech;
    return 301 https://$host$request_uri;
}

# Main HTTPS server with mTLS
server {
    listen 443 ssl;
    http2 on;
    server_name ctf.bupcopc.tech;

    ssl_certificate     /etc/ssl/certs/cloudflare_origin.pem;
    ssl_certificate_key /etc/ssl/private/cloudflare_origin.key;

    # mTLS — only accept connections presenting Cloudflare's client certificate
    ssl_client_certificate /etc/ssl/certs/cloudflare_pull.pem;
    ssl_verify_client on;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 300;
        proxy_send_timeout    300;
        proxy_read_timeout    300;
    }
}
```

> **Note:** The `listen 443 ssl http2` directive is deprecated in newer Nginx versions. Use `listen 443 ssl` with a separate `http2 on` directive instead.

### 6.2 Enable Configuration and Reload

```bash
sudo ln -s /etc/nginx/sites-available/ctf.bupcopc.tech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. GCE Firewall Configuration

Firewall rules were configured in Google Cloud Console to allow HTTP and HTTPS ingress traffic.

|Rule Name|Protocol|Port|Source|
|---|---|---|---|
|`allow-http`|TCP|80|`0.0.0.0/0`|
|`allow-https`|TCP|443|`0.0.0.0/0`|
|`allow-ssh`|TCP|22|`0.0.0.0/0`|

---

## 8. Cloudflare Edge Enforcement

The Cloudflare Dashboard was configured to mandate secure communication between the edge network and the origin VPS.

1. Navigated to **SSL/TLS → Overview** and set encryption mode to **Full (Strict)**.
2. Navigated to **SSL/TLS → Origin Server** and enabled **Authenticated Origin Pulls**.
3. Navigated to **SSL/TLS → Edge Certificates** and enabled:
    - **Always Use HTTPS**
    - **Automatic HTTPS Rewrites**
4. Navigated to **DNS → Records** and verified the `ctf` A record points to the GCE external IP with **Proxied** status (orange cloud).

---

## 9. DNS Configuration

| Type | Name  | Content         | Proxy Status |
| ---- | ----- | --------------- | ------------ |
| A    | `ctf` | `gce-public-ip` | Proxied ☁️   |

> The resolved IPs (`172.67.189.155`, `104.21.81.135`) belong to Cloudflare's proxy network — confirming correct DNS and proxy configuration.

---

## 10. Security Architecture Summary

```
User
 │
 │  HTTPS (TLS 1.2/1.3)
 ▼
Cloudflare Edge
 │
 │  HTTPS + mTLS Client Certificate (Authenticated Origin Pulls)
 ▼
GCE VPS — Host Nginx (:443)
 │  ssl_verify_client on  →  rejects any non-Cloudflare connection
 │
 │  HTTP proxy_pass
 ▼
Docker Nginx (127.0.0.1:8080)
 │
 ▼
CTFd Application (:8000)
```

| Threat                        | Mitigation                                                |
| ----------------------------- | --------------------------------------------------------- |
| Direct IP access (HTTP)       | `return 444` in default server block                      |
| Direct IP access (HTTPS)      | `ssl_reject_handshake on` in default server block         |
| Non-Cloudflare HTTPS requests | `ssl_verify_client on` — mTLS rejects missing client cert |
| HTTP downgrade                | `return 301` redirect + Cloudflare "Always Use HTTPS"     |

---

## 11. Verification

```bash
# Confirm all containers are running
docker compose ps

# Validate Nginx config
sudo nginx -t

# Test domain HTTPS
curl -I https://ctf.bupcopc.tech

# Confirm direct IP is blocked
curl -I http://GCE-public-ip     # Expected: empty / 444
curl -I https://GCE-public-ip    # Expected: SSL handshake failure
```