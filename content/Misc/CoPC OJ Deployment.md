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

```
-----BEGIN CERTIFICATE-----
MIIEpDCCA4ygAwIBAgIUYal63ic/9k4wO0qCZ1Dws2CeuDQwDQYJKoZIhvcNAQEL
BQAwgYsxCzAJBgNVBAYTAlVTMRkwFwYDVQQKExBDbG91ZEZsYXJlLCBJbmMuMTQw
MgYDVQQLEytDbG91ZEZsYXJlIE9yaWdpbiBTU0wgQ2VydGlmaWNhdGUgQXV0aG9y
aXR5MRYwFAYDVQQHEw1TYW4gRnJhbmNpc2NvMRMwEQYDVQQIEwpDYWxpZm9ybmlh
MB4XDTI2MDIyNDEzMDgwMFoXDTQxMDIyMDEzMDgwMFowYjEZMBcGA1UEChMQQ2xv
dWRGbGFyZSwgSW5jLjEdMBsGA1UECxMUQ2xvdWRGbGFyZSBPcmlnaW4gQ0ExJjAk
BgNVBAMTHUNsb3VkRmxhcmUgT3JpZ2luIENlcnRpZmljYXRlMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxWibwAdRlAzY1TlX2Ptn46adPsQFQxAMYv6c
jsJK3ty4Pgis66LIgZ0HYU6Q4XS/mzKSCJoTI6yo8+tUQoNX7XEbNHvCVH/56gCk
YJUZZ/8cqvT3LB7Biwchc7j473eOY2fhZmTqKEXFXoG0FQ+bewePAjgFLqa3l0m1
0Ac7BS7XTLsPPBp6gfzgKG76Y6hp7fhdnEnGQznL0nJOvWz8xKNEXl5iljXgdT3S
sxBOHlu1h30f+oVGOkTKGPzqgW4rzIqLtnmV2FkwcBHvkPc7DtdFpd1Aah5cgCr3
2b8Sb6Uls7fiI2gEOoKO72tTM5YflY8zo0DCU5FCFZMgApCvjwIDAQABo4IBJjCC
ASIwDgYDVR0PAQH/BAQDAgWgMB0GA1UdJQQWMBQGCCsGAQUFBwMCBggrBgEFBQcD
ATAMBgNVHRMBAf8EAjAAMB0GA1UdDgQWBBSuzC6VGFhMbMLnRbhLM/ER2hkaxzAf
BgNVHSMEGDAWgBQk6FNXXXw0QIep65TbuuEWePwppDBABggrBgEFBQcBAQQ0MDIw
MAYIKwYBBQUHMAGGJGh0dHA6Ly9vY3NwLmNsb3VkZmxhcmUuY29tL29yaWdpbl9j
YTAnBgNVHREEIDAegg4qLmJ1cGNvcGMudGVjaIIMYnVwY29wYy50ZWNoMDgGA1Ud
HwQxMC8wLaAroCmGJ2h0dHA6Ly9jcmwuY2xvdWRmbGFyZS5jb20vb3JpZ2luX2Nh
LmNybDANBgkqhkiG9w0BAQsFAAOCAQEAZm9sSvSi/sEifg0WKmfsDdT3ri1CzV6e
z3Yq6RozXrOZvy/xAjzjj67ojigYIRllO/EFJjD+toUMO/8nTZJYgIZKtrPS2WCW
FmBp2axwgwSYUxwU2+cWHmZi9LMfBfhE01qVXAFva2SHKcBoZlMilPIgU0zmLgTh
ebUfAuUYhRl+MNEkQYtrp1gi/UFQWTXwKuECkMp3Xw5hgl+w8tGcACUK1lOOCifT
LRe+iQBw2KkRobjDWBU3m7qI0bYfmVma5ewnbCDQ14vHtBRrIIBWLEyfjZi89e6H
ge+6a1V7tS8fo0yzDIuh9s3P7c60h/iNDXL4CQLxYmEZAvpgvUJ7HA==
-----END CERTIFICATE-----
```

```
-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDFaJvAB1GUDNjV
OVfY+2fjpp0+xAVDEAxi/pyOwkre3Lg+CKzrosiBnQdhTpDhdL+bMpIImhMjrKjz
61RCg1ftcRs0e8JUf/nqAKRglRln/xyq9PcsHsGLByFzuPjvd45jZ+FmZOooRcVe
gbQVD5t7B48COAUupreXSbXQBzsFLtdMuw88GnqB/OAobvpjqGnt+F2cScZDOcvS
ck69bPzEo0ReXmKWNeB1PdKzEE4eW7WHfR/6hUY6RMoY/OqBbivMiou2eZXYWTBw
Ee+Q9zsO10Wl3UBqHlyAKvfZvxJvpSWzt+IjaAQ6go7va1Mzlh+VjzOjQMJTkUIV
kyACkK+PAgMBAAECggEADuu4tft3oYqVCwzCBI8AC7dotDlJsodwgD0BZVLvKMgj
DuFF/Kt5nz5Ys/Slw7y4zMi2O/s1TiF7RbB4VmyqBTLi3QUrq4pev96bjgdG+9LO
/mb0lbufYlxAHYiSHDt7oizUXxJqlm+rmtiP3XWoCVUJbKACWEPWpZM3MEmTnvEI
t1VDSincnjEojmezOn0ClWRSd/hnwKThqnFyEB9HFL/HXYVYJ+Fav83Yy/5zZZQn
zWiXZpyx/6XalbZq+d4GDDctleZTDNHs9PqnbLVSEynwUft80Q/lGAqhOfMysqhD
FmzYCR/KLHC7YyJoGlRDOXwrgBrq4NPRF/qOjghKlQKBgQD7gwdIoaP88edK1InY
rhtI853uDLXUrutHahy+DyX8lbIynMA5PYtEm7B51lbAFKKpYK1Tm+UkeF6TCyZi
geZblCtNHIffkmqPK4TcFjfD/0cOjZHZ6B2yQWnBPIT93an8Ic3LNcZa4ff/5nyU
BPmG2+h6ypI4SBs1Mjev+29oqwKBgQDI7mwj3WhDhc+5XyXuqjHvRCh3w1EVUF2X
idfnRKZ++vvql77kXe/1HrIjdWBpUT8CgoZEQhfETRU04UoHF4lDyqR0hqwF9Q2f
v4T3mtrQujzoKCUDGPoEGF7MsMq6DyC4tzSddF817l5G/759nO5TpChWe+S6LDDU
Bi6g9vzcrQKBgGWYexO6v4xIhv5yNjCBu+HPDqd/GOANvFp/oZagdd6+9Vl+eiNl
GeGf5jyA+U/jxgUXWUxht8DwontRULMP9+ZcRtWCRdxov4SPtr5UdzhD4Qce5qCY
I47C354//RSzOpvvZ7rDQRmrF8uV5hLAo673G8SmGUSE1AC8BUSgE1O7AoGAdnYK
j4KDa/vCIfn0tSbmVbgLW8BtV3GQHD2KarDQsGBskTxxsNWpGQzF3Z3f/3eE/IfT
fP6yYGtJq2l/aXr41FzuZDzZwpFdPOd/DzPe+dwy+HRijdb13+A2U9uPSe6NThnF
DWeEkpk8QAObXRdeczV/Cq30hcZz6yzR5Nh47+kCgYAYJJl9/u98tw5vKE0AwY6b
yD2rnrfg/rpGHeJKfdiNDNf4HmEaH558E2BXoV7YoHcgUivmW+KpYtGpij3fJrLr
RnfMzrbYQDjawRMtplJzx6wAVNAKWG0FtBEzPCDEexz8jCxxMZIQ6QqRh5mkqUTt
1ja82a19O+s2+5htdGlN+Q==
-----END PRIVATE KEY-----
```
