#### Deploying CTFd on a VPS with a Custom Domain, Cloudflare Full (Strict) SSL, and Authenticated Origin Pulls (mTLS)

**Scope:** This document walks through deploying CTFd from scratch on a bare VPS (e.g. a GCP Compute Engine instance/AWS EC2), using Docker Compose end-to-end (including the reverse proxy), fronted by Cloudflare with Full (strict) SSL and Authenticated Origin Pulls (mTLS), with real visitor IPs correctly preserved for CTFd's admin panel (needed for cheat detection).

**Assumed example domain:** `ctf.bupcopc.tech`
**Assumed CTFd internal port:** `8000` (verify against your CTFd image before deploying)

---

### Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [VPS Base Setup](#3-vps-base-setup)
4. [Cloudflare DNS Setup](#4-cloudflare-dns-setup)
5. [Cloudflare Origin CA Certificate](#5-cloudflare-origin-ca-certificate)
6. [Authenticated Origin Pulls (mTLS) Certificate](#6-authenticated-origin-pulls-mtls-certificate)
7. [CTFd Docker Compose Setup](#7-ctfd-docker-compose-setup)
8. [Nginx Configuration (TLS + mTLS + Real IP)](#8-nginx-configuration-tls--mtls--real-ip)
9. [Cloudflare SSL/TLS Mode Configuration](#9-cloudflare-ssltls-mode-configuration)
10. [Deployment](#11-deployment)
11. [Verification & Testing](#12-verification--testing)
12. [Troubleshooting](#13-troubleshooting)
13. [Maintenance Notes](#14-maintenance-notes)

---

### 1. Architecture Overview

```
Participant Browser
        │
        │  HTTPS (Cloudflare-managed cert)
        ▼
  Cloudflare Edge (anycast)
        │
        │  HTTPS, Full (strict) + Client Cert (mTLS)
        │  Header: CF-Connecting-IP: <real visitor IP>
        ▼
   VPS :443 — Nginx (in Docker Compose)
        │  - Verifies Cloudflare's client cert (mTLS)
        │  - Presents Cloudflare Origin CA cert
        │  - Rewrites $remote_addr via CF-Connecting-IP
        │  - Forwards X-Forwarded-For / X-Real-IP correctly
        ▼
   ctfd:8000 (internal Docker network)
        │
        ▼
   db (MariaDB) + cache (Redis)
```

Key properties this design guarantees:

- **Full (strict):** Cloudflare only accepts a valid, CA-trusted cert from the origin (Cloudflare Origin CA cert satisfies this).
- **Authenticated Origin Pulls:** the origin only accepts TLS connections that present Cloudflare's client certificate — direct-to-IP bypass of Cloudflare becomes cryptographically impossible.
- **Correct participant IPs:** Nginx's `realip` module rewrites the connection's apparent source IP using Cloudflare's `CF-Connecting-IP` header, but only trusts that header when the connection genuinely originates from Cloudflare's published IP ranges.
- **Single Docker Compose stack:** no host-level Nginx install required; the whole stack (app, db, cache, proxy) ships and tears down together.

---

### 2. Prerequisites

- A VPS with a public static IP (e.g. GCP Compute Engine/AWS EC2), Ubuntu 22.04/24.04 or higher recommended.
- A domain/subdomain managed in Cloudflare DNS (e.g. `bupcopc.tech` with `cp` subdomain).
- Cloudflare account with access to **SSL/TLS → Origin Server** and **SSL/TLS → Client Certificates** sections.
- Docker Engine + Docker Compose plugin installed on the VPS.
- SSH access to the VPS.

---

### 3. VPS Base Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker Engine + Compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

Clone CTFd for the deployment:

```bash
cd ~
git clone https://github.com/CTFd/CTFd.git
cd ~/CTFd
```

---

### 4. Cloudflare DNS Setup

1. In the Cloudflare dashboard, go to **DNS → Records**.
2. Add an `A` record:
   - **Name:** `ctf` (resolves to `ctf.bupcopc.tech`)
   - **IPv4 address:** your VPS's public IP
   - **Proxy status:** **Proxied** (orange cloud) — this is required for Full (strict) and mTLS to apply.
3. Save.

> [!warning]- Proxied Mode
> Proxied mode is what routes traffic through Cloudflare's edge in the first place. If this is set to "DNS only" (grey cloud), none of the Cloudflare-layer protections below apply.

---

### 5. Cloudflare Origin CA Certificate

This certificate is what Nginx presents to Cloudflare so Cloudflare can verify your origin (required for Full **strict**, as opposed to plain Full).

1. Cloudflare dashboard → **SSL/TLS → Origin Server**.
2. Click **Create Certificate**.
3. Leave the default options (RSA, 15 years validity is fine for an internal-facing origin cert).
4. Add hostnames: `ctf.bupcopc.tech` (and `*.bupcopc.tech` if you want it to cover future subdomains too).
5. Click **Create** — Cloudflare shows you:
   - **Origin Certificate** → save as `cloudflare_origin.pem`
   - **Private Key** → save as `cloudflare_origin.key`

```bash
# On the VPS, in ~/CTFd/certs/
mkdir ~/CTFd/certs
cd ~/CTFd/certs
nano cloudflare_origin.pem   # paste the Origin Certificate
nano cloudflare_origin.key   # paste the Private Key
chmod 600 cloudflare_origin.key
```

> [!warning]
> Keep `cloudflare_origin.key` private — never commit it to a public repo.

---

### 6. Authenticated Origin Pulls (mTLS) Certificate

This is the certificate your origin uses to verify that incoming TLS connections genuinely come from Cloudflare's edge (not a client who found your raw IP).

1. Cloudflare dashboard → **SSL/TLS → Origin Server → Authenticated Origin Pulls**.
2. Enable **Authenticated Origin Pulls** (zone-level toggle).
3. Cloudflare provides a **Cloudflare Origin Pull CA certificate** — this is a fixed, publicly documented certificate (same for all Cloudflare customers using the per-zone feature), available in Cloudflare's docs.
4. Save it on the VPS:

```bash
sudo wget -O /CTFd/certs/cloudflare_pull.pem \
  https://developers.cloudflare.com/ssl/static/authenticated_origin_pull_ca.pem
```

> [!info]-
> This is the cert your Nginx `ssl_client_certificate` directive references — it lets Nginx verify that the connecting client (Cloudflare) presents a certificate signed by this CA.

---

### 7. CTFd Docker Compose Setup

Edit `docker-compose.yml` — replace the existing `nginx` service block with the following (rest of the file — `ctfd`, `permissions`, `db`, `cache`, `networks` — stays as CTFd ships it):

```yaml
services:
  ctfd:
    build: .
    restart: always
    ports:
      - "8000:8000"
    environment:
      - UPLOAD_FOLDER=/var/uploads
      - DATABASE_URL=mysql+pymysql://ctfd:ctfd@db/ctfd
      - REDIS_URL=redis://cache:6379
      - WORKERS=1
      - LOG_FOLDER=/var/log/CTFd
      - ACCESS_LOG=-
      - ERROR_LOG=-
      - REVERSE_PROXY=true
    volumes:
      - .data/CTFd/logs:/var/log/CTFd
      - .data/CTFd/uploads:/var/uploads
      - .:/opt/CTFd:ro
    depends_on:
      permissions:
        condition: service_completed_successfully
      db:
        condition: service_started
      cache:
        condition: service_started
    networks:
      default:
      internal:

  permissions:
    image: alpine:3.23
    user: root
    volumes:
      - .data/CTFd/logs:/var/log/CTFd
      - .data/CTFd/uploads:/var/uploads
    command: chown -R 1001:1001 /var/uploads /var/log/CTFd

  nginx:
    image: nginx:stable
    restart: always
    volumes:
      - ./conf/nginx/https.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - ctfd

  db:
    image: mariadb:10.11
    restart: always
    environment:
      - MARIADB_ROOT_PASSWORD=ctfd
      - MARIADB_USER=ctfd
      - MARIADB_PASSWORD=ctfd
      - MARIADB_DATABASE=ctfd
      - MARIADB_AUTO_UPGRADE=1
    volumes:
      - .data/mysql:/var/lib/mysql
    networks:
      internal:
    command: [mysqld, --character-set-server=utf8mb4, --collation-server=utf8mb4_unicode_ci, --wait_timeout=28800, --log-warnings=0]

  cache:
    image: redis:4
    restart: always
    volumes:
      - .data/redis:/data
    networks:
      internal:

networks:
  default:
  internal:
    internal: true
```

> [!warning]
> **Important:** change the default `ctfd`/`ctfd`/`ctfd` DB credentials before going live — these defaults are fine for local testing only.

---

### 8. Nginx Configuration (TLS + mTLS + Real IP)

Create `~/CTFD/conf/nginx/https.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    # ---- Cloudflare IPv4 ranges (trusted for CF-Connecting-IP) ----
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;

    # ---- Cloudflare IPv6 ranges ----
    set_real_ip_from 2400:cb00::/32;
    set_real_ip_from 2606:4700::/32;
    set_real_ip_from 2803:f800::/32;
    set_real_ip_from 2405:b500::/32;
    set_real_ip_from 2405:8100::/32;
    set_real_ip_from 2a06:98c0::/29;
    set_real_ip_from 2c0f:f248::/32;

    real_ip_header CF-Connecting-IP;

    server {
        listen 80;
        server_name ctf.bupcopc.tech;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl;
        server_name ctf.bupcopc.tech;

        # Full (strict): cert Cloudflare validates against its trust store
        ssl_certificate     /etc/nginx/certs/cloudflare_origin.pem;
        ssl_certificate_key /etc/nginx/certs/cloudflare_origin.key;

        # Authenticated Origin Pulls (mTLS): verify the client (Cloudflare) cert
        ssl_client_certificate /etc/nginx/certs/cloudflare_pull.pem;
        ssl_verify_client on;

        client_max_body_size 100M;

        location / {
            proxy_pass http://ctfd:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

>[!info]- Why this preserves correct participant IPs?
>`set_real_ip_from` + `real_ip_header CF-Connecting-IP` tells Nginx to trust the `CF-Connecting-IP` header — but *only* when the TCP connection itself originates from one of Cloudflare's published ranges. Nginx then rewrites `$remote_addr` to the real visitor IP before any `proxy_set_header` directives run, so `X-Real-IP` and `X-Forwarded-For` downstream both carry the genuine client IP. Because this is combined with Authenticated Origin Pulls, a connection can only reach this `server{}` block at all if it presents Cloudflare's client certificate — so header spoofing from a non-Cloudflare source is not possible in the first place.

Current Cloudflare IP ranges: https://www.cloudflare.com/ips/ — re-check periodically, as they are occasionally updated.

>[!info]
> Adjust `client_max_body_size` if your CTF has larger file-upload challenges. Currently it limits up-to 100 mega bytes.

---

### 9. Cloudflare SSL/TLS Mode Configuration

1. Cloudflare dashboard → **SSL/TLS → Overview**.
2. Set encryption mode to **Full (strict)**.
   - *Flexible* or plain *Full* will not validate your origin cert and are not appropriate here.
1. Confirm **Edge Certificates** are active (Cloudflare's Universal SSL, issued automatically) — this is what serves HTTPS to browsers; it is separate from the Origin CA cert from Step 5, which is what your origin presents *to Cloudflare*.

---

### 11. Deployment

```bash
cd ~/CTFd
docker compose up -d
docker compose ps
docker compose logs -f nginx
```

Confirm all services (`ctfd`, `nginx`, `db`, `cache`, `permissions`) report healthy/running, and that `nginx` logs show no TLS handshake errors.

---

### 12. Verification & Testing

**a. Browser test:**
Visit `https://ctf.bupcopc.tech` — should load CTFd over HTTPS with a valid padlock (Cloudflare-issued edge cert).

**b. Confirm origin is unreachable directly (mTLS working):**
```bash
curl -k https://<VPS_PUBLIC_IP> -H "Host: cp.bupcopc.tech"
```
This should **fail** the TLS handshake (no client certificate presented) — confirming direct-to-origin bypass is blocked.

**c. Confirm real IPs are recorded correctly:**
- Log in to CTFd from two different networks (e.g. home Wi-Fi + mobile data).
- Check **Admin Panel → Users → [user] → IP Addresses**.
- Each session should show one distinct, correct real IP per network — not multiple Cloudflare edge IPs from different regions for the same physical connection.

**d. SSL Labs check (optional):**
Run `ctf.bupcopc.tech` through Qualys SSL Labs to confirm cipher/config health from the public edge side.

---

### 13. Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Cloudflare shows "521 Web Server Is Down" | Nginx container not listening on 443, or firewall blocking Cloudflare IPs | Check `docker compose ps`, check firewall rules |
| Cloudflare shows "526 Invalid SSL Certificate" | Origin CA cert/key mismatch or wrong mode (Full instead of Full strict expecting CA-trusted cert) | Re-verify `cloudflare_origin.pem`/`.key` pair, confirm Full (strict) mode |
| Browser can reach site but participant IPs in CTFd still show Cloudflare-like IPs across regions | `real_ip_header`/`set_real_ip_from` missing or CTFd not reading `X-Forwarded-For` | Confirm Nginx `https.conf` has `real_ip_header CF-Connecting-IP;` and CTFd has `REVERSE_PROXY=true` |
| `curl -k` direct-to-IP succeeds (mTLS not enforced) | `ssl_verify_client` not set to `on`, or wrong pull CA cert | Re-check `ssl_client_certificate` path and `ssl_verify_client on;` in the `server{}` block, confirm Cloudflare's Authenticated Origin Pulls toggle is enabled zone-side |
| 400 Bad Request from Nginx on all requests | `client_max_body_size` too small for upload-heavy challenges, or malformed `nginx.conf` | Check `docker compose logs nginx` for the specific config error |

---

### 14. Maintenance Notes

- **Cloudflare IP ranges** (used in both `set_real_ip_from` and firewall rules) are occasionally updated — re-pull from https://www.cloudflare.com/ips/ every few months or after Cloudflare infrastructure announcements.
- **Origin CA certs** issued via Cloudflare's dashboard can be set for up to 15 years, but confirm your organization's cert-rotation policy; regenerate and swap `cloudflare_origin.pem`/`.key` if ever suspected compromised.
- **DB/Redis credentials** in `docker-compose.yml` should be changed from CTFd's shipped defaults (`ctfd`/`ctfd`) before production use.
- **Backups:** the `.data/mysql`, `.data/CTFd/uploads`, and `.data/CTFd/logs` volumes should be included in your regular VPS backup/snapshot routine — this is where all challenge state, user data, and submissions live.
- This same pattern (Docker-Compose-only Nginx, per-service) can be repeated for additional `bupcopc.tech` subdomains, each with their own compose stack and unique host ports if co-located on the same VPS — or migrated to a shared host-Nginx layer later if you end up running several services on one machine (see discussion notes: at that point, a single host-level Nginx acting as an SNI-aware front for multiple containers becomes the better long-term architecture).
