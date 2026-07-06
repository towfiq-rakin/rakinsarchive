# Section 7: Layer 7 - HTTP, HTTPS & TLS

---

## 7.1 HTTP Overview

**HTTP (Hypertext Transfer Protocol)** is the foundation of data communication on the web.

### HTTP Characteristics

- Application layer protocol (Layer 7)
- Client-server model (request-response)
- Stateless (each request is independent)
- Text-based protocol (human-readable)
- Uses TCP as transport (port 80 for HTTP, 443 for HTTPS)

```
HTTP Request-Response Model

Client (Browser)          Server (Web Server)
      |                          |
      |--- TCP Handshake ------->|
      |<-- TCP Handshake --------|
      |                          |
      |--- HTTP Request -------->|
      |    GET /index.html       |
      |                          |
      |<-- HTTP Response --------|
      |    200 OK + HTML content |
      |                          |
```

---

## 7.2 HTTP Versions Comparison

| Feature               | HTTP/1.0            | HTTP/1.1                | HTTP/2                   | HTTP/3                 |
| --------------------- | ------------------- | ----------------------- | ------------------------ | ---------------------- |
| Year                  | 1996                | 1997                    | 2015                     | 2022                   |
| Connection            | New TCP per request | Persistent (keep-alive) | Multiplexed (single TCP) | Multiplexed (QUIC/UDP) |
| Requests per conn     | Sequential          | Sequential (pipelining) | Parallel (streams)       | Parallel (streams)     |
| Header Format         | Text                | Text                    | Binary (compressed)      | Binary (compressed)    |
| Server Push           | No                  | No                      | Yes                      | Yes                    |
| Head-of-Line Blocking | Yes                 | Yes                     | No (TCP HOL)             | No                     |
| Transport             | TCP                 | TCP                     | TCP                      | QUIC (UDP)             |
| Encryption            | Optional            | Optional                | Practical TLS            | Built-in TLS           |

### HTTP/1.1 vs HTTP/2 Visual

```
HTTP/1.1 (Multiple Connections):

Browser                                                   Server
   |                                                        |
   |===== Connection 1 (TCP) ===== Request 1 =============>|
   |<==================================== Response 1 =======|
   |                                                        |
   |===== Connection 2 (TCP) ===== Request 2 =============>|
   |<==================================== Response 2 =======|
   |                                                        |
   |===== Connection 3 (TCP) ===== Request 3 =============>|
   |<==================================== Response 3 =======|

Limit: ~6 parallel connections per domain


HTTP/2 (Single Multiplexed Connection):

Browser                                                   Server
   |                                                        |
   |============ Single TCP Connection =====================|
   |                                                        |
   |--- Stream 1: Request 1 ------------------------------->|
   |--- Stream 3: Request 2 ------------------------------->|
   |--- Stream 5: Request 3 ------------------------------->|
   |<--------------------------------- Stream 1: Response 1-|
   |<--------------------------------- Stream 5: Response 3-|
   |<--------------------------------- Stream 3: Response 2-|
   |                                                        |

All requests/responses multiplexed on single connection
Responses can arrive out of order
```

---

## 7.3 HTTP Request Structure

```
HTTP REQUEST FORMAT

+-----------------------------------------------------------------------+
|  REQUEST LINE                                                         |
|  METHOD  SP  REQUEST-URI  SP  HTTP-VERSION  CRLF                     |
|  GET /index.html HTTP/1.1\r\n                                        |
+-----------------------------------------------------------------------+
|  HEADERS                                                              |
|  Header-Name: Header-Value CRLF                                      |
|  Host: www.example.com\r\n                                           |
|  User-Agent: Mozilla/5.0...\r\n                                      |
|  Accept: text/html,application/xhtml+xml\r\n                         |
|  Accept-Language: en-US,en;q=0.9\r\n                                 |
|  Connection: keep-alive\r\n                                          |
+-----------------------------------------------------------------------+
|  BLANK LINE (CRLF)                                                   |
|  \r\n                                                                 |
+-----------------------------------------------------------------------+
|  BODY (optional, for POST/PUT)                                       |
|  username=admin&password=secret                                       |
+-----------------------------------------------------------------------+

CRLF = Carriage Return + Line Feed (\r\n)
SP = Space
```

---

## 7.4 HTTP Methods (Verbs)

| Method  | Safe | Idempotent | Request Body | Response Body | Description                                   |
| ------- | ---- | ---------- | ------------ | ------------- | --------------------------------------------- |
| GET     | Yes  | Yes        | No           | Yes           | Retrieve resource (most common)               |
| HEAD    | Yes  | Yes        | No           | No            | Same as GET, no body (headers only)           |
| POST    | No   | No         | Yes          | Yes           | Submit data/create (forms, file uploads)      |
| PUT     | No   | Yes        | Yes          | Yes           | Replace/create resource (full update)         |
| PATCH   | No   | No         | Yes          | Yes           | Partial modification (update specific fields) |
| DELETE  | No   | Yes        | Maybe        | Maybe         | Remove resource (delete by identifier)        |
| OPTIONS | Yes  | Yes        | No           | Yes           | Get allowed methods (CORS preflight)          |
| TRACE   | Yes  | Yes        | No           | Yes           | Echo request back (debugging, often disabled) |
| CONNECT | No   | No         | No           | Yes           | Establish tunnel (HTTPS proxy tunneling)      |

- **Safe:** Does not modify server state
- **Idempotent:** Multiple identical requests = same result

---

## 7.5 HTTP Response Structure

```
HTTP RESPONSE FORMAT

+-----------------------------------------------------------------------+
|  STATUS LINE                                                          |
|  HTTP-VERSION  SP  STATUS-CODE  SP  REASON-PHRASE  CRLF              |
|  HTTP/1.1 200 OK\r\n                                                 |
+-----------------------------------------------------------------------+
|  HEADERS                                                              |
|  Date: Mon, 15 Jan 2026 12:00:00 GMT\r\n                            |
|  Server: Apache/2.4.41\r\n                                           |
|  Content-Type: text/html; charset=UTF-8\r\n                          |
|  Content-Length: 1256\r\n                                            |
|  Cache-Control: max-age=3600\r\n                                     |
|  Connection: keep-alive\r\n                                          |
+-----------------------------------------------------------------------+
|  BLANK LINE (CRLF)                                                   |
|  \r\n                                                                 |
+-----------------------------------------------------------------------+
|  BODY                                                                 |
|  <!DOCTYPE html>                                                      |
|  <html>                                                               |
|  <head><title>Example</title></head>                                 |
|  <body><h1>Hello World</h1></body>                                   |
|  </html>                                                              |
+-----------------------------------------------------------------------+
```

---

## 7.6 HTTP Status Codes

### 1XX - INFORMATIONAL (Request received, continuing process)

| Code | Name                | Description                                      |
| ---- | ------------------- | ------------------------------------------------ |
| 100  | Continue            | Client should continue with request              |
| 101  | Switching Protocols | Server switching to protocol in Upgrade header   |
| 103  | Early Hints         | Preload resources while server prepares response |

### 2XX - SUCCESS (Request successfully received and processed)

| Code | Name            | Description                               |
| ---- | --------------- | ----------------------------------------- |
| 200  | OK              | Standard success response                 |
| 201  | Created         | Resource created (POST/PUT)               |
| 202  | Accepted        | Request accepted, processing not complete |
| 204  | No Content      | Success, but no body to return            |
| 206  | Partial Content | Range request successful                  |

### 3XX - REDIRECTION (Further action needed)

| Code | Name               | Description                              |
| ---- | ------------------ | ---------------------------------------- |
| 301  | Moved Permanently  | Resource permanently at new URL (cached) |
| 302  | Found              | Temporary redirect (legacy, see 303/307) |
| 303  | See Other          | Redirect with GET method                 |
| 304  | Not Modified       | Cached version is still valid            |
| 307  | Temporary Redirect | Temporary redirect, preserve method      |
| 308  | Permanent Redirect | Permanent redirect, preserve method      |

### 4XX - CLIENT ERROR (Request contains bad syntax or cannot be fulfilled)

| Code | Name               | Description                            |
| ---- | ------------------ | -------------------------------------- |
| 400  | Bad Request        | Malformed request syntax               |
| 401  | Unauthorized       | Authentication required                |
| 403  | Forbidden          | Server refuses to authorize            |
| 404  | Not Found          | Resource does not exist                |
| 405  | Method Not Allowed | HTTP method not supported for resource |
| 408  | Request Timeout    | Server timeout waiting for request     |
| 413  | Payload Too Large  | Request body exceeds server limit      |
| 414  | URI Too Long       | Request URI exceeds server limit       |
| 429  | Too Many Requests  | Rate limiting in effect                |

### 5XX - SERVER ERROR (Server failed to fulfill valid request)

| Code | Name                  | Description                            |
| ---- | --------------------- | -------------------------------------- |
| 500  | Internal Server Error | Generic server error                   |
| 501  | Not Implemented       | Server doesn't support functionality   |
| 502  | Bad Gateway           | Invalid response from upstream server  |
| 503  | Service Unavailable   | Server temporarily overloaded/down     |
| 504  | Gateway Timeout       | Upstream server didn't respond in time |

---

## 7.7 Common HTTP Headers

### Request Headers

| Header                           | Description                            |
| -------------------------------- | -------------------------------------- |
| `Host: www.example.com`          | Required in HTTP/1.1 (virtual hosting) |
| `User-Agent: Mozilla/5.0...`     | Client application identifier          |
| `Accept: text/html, */*`         | Acceptable response content types      |
| `Accept-Language: en-US`         | Preferred language                     |
| `Accept-Encoding: gzip, br`      | Supported compression                  |
| `Connection: keep-alive`         | Connection management                  |
| `Cookie: session=abc123`         | Send cookies to server                 |
| `Authorization: Bearer <token>`  | Authentication credentials             |
| `Referer: https://google.com`    | Previous page URL                      |
| `Origin: https://example.com`    | Request origin (CORS)                  |
| `Content-Type: application/json` | Body content type (POST/PUT)           |
| `Content-Length: 128`            | Body size in bytes                     |

### Response Headers

| Header                          | Description                 |
| ------------------------------- | --------------------------- |
| `Date: Mon, 15 Jan 2026...`     | Response timestamp          |
| `Server: nginx/1.18.0`          | Server software             |
| `Content-Type: text/html`       | Response body type          |
| `Content-Length: 1256`          | Response body size          |
| `Content-Encoding: gzip`        | Compression used            |
| `Cache-Control: max-age=3600`   | Caching directives          |
| `ETag: "abc123"`                | Resource version identifier |
| `Last-Modified: Mon, 14 Jan...` | Last modification time      |
| `Set-Cookie: session=xyz`       | Set cookie on client        |
| `Location: /new-page`           | Redirect destination        |
| `Access-Control-Allow-Origin`   | CORS allowed origins        |

### Security Headers

| Header                      | Description              |
| --------------------------- | ------------------------ |
| `Strict-Transport-Security` | Force HTTPS              |
| `Content-Security-Policy`   | Control resource loading |
| `X-Frame-Options`           | Prevent clickjacking     |
| `X-Content-Type-Options`    | Prevent MIME sniffing    |
| `X-XSS-Protection`          | XSS filter (legacy)      |

---

## 7.8 HTTP Cookies

Cookies maintain state in stateless HTTP.

### Server Sets Cookie

```http
HTTP/1.1 200 OK
Set-Cookie: session=abc123; Path=/; HttpOnly; Secure; SameSite=Strict
Set-Cookie: user=john; Expires=Wed, 15 Jan 2027 12:00:00 GMT
```

### Client Sends Cookie

```http
GET /dashboard HTTP/1.1
Cookie: session=abc123; user=john
```

### Cookie Attributes

| Attribute | Description                                  |
| --------- | -------------------------------------------- |
| Expires   | Absolute expiration date/time                |
| Max-Age   | Seconds until expiration                     |
| Domain    | Domains that receive the cookie              |
| Path      | URL path scope                               |
| Secure    | Only send over HTTPS                         |
| HttpOnly  | Not accessible via JavaScript                |
| SameSite  | Cross-site request control (Strict/Lax/None) |

- **Session Cookie:** No Expires/Max-Age = deleted when browser closes
- **Persistent Cookie:** Has Expires/Max-Age = stored until expiration

---

## 7.9 HTTPS and TLS Overview

### HTTPS = HTTP + TLS

**HTTPS provides:**

- **Encryption:** Data cannot be read by eavesdroppers
- **Integrity:** Data cannot be modified in transit
- **Authentication:** Server identity verified via certificate

```
Protocol Stack Comparison

HTTP (Plaintext)              HTTPS (Encrypted)

Application: HTTP             Application: HTTP
     |                              |
     v                        +-----v-----+
Transport: TCP                | TLS/SSL   |  <-- Encryption Layer
     |                        +-----------+
     v                              |
Network: IP                   Transport: TCP
                                    |
                              Network: IP
```

**Ports:**

- HTTP: Port 80
- HTTPS: Port 443

---

## 7.10 TLS 1.3 Handshake

```
TLS 1.3 HANDSHAKE (Simplified)

     CLIENT                                              SERVER
        |                                                   |
        |                                                   |
        |   1. ClientHello                                  |
        |   -------------------------------------------->   |
        |   - Supported TLS versions                        |
        |   - Cipher suites                                 |
        |   - Key share (Diffie-Hellman public key)        |
        |   - Random number                                 |
        |                                                   |
        |                                                   |
        |   2. ServerHello + Certificate + Finished         |
        |   <--------------------------------------------   |
        |   - Selected cipher suite                         |
        |   - Server key share                              |
        |   - Server certificate                            |
        |   - Certificate verify (signature)                |
        |   - Finished (encrypted)                          |
        |                                                   |
        |   [Both can now compute shared secret]            |
        |                                                   |
        |   3. Finished                                     |
        |   -------------------------------------------->   |
        |   - Client finished (encrypted)                   |
        |                                                   |
        |                                                   |
        |<============ ENCRYPTED DATA EXCHANGE ===========>|
        |   4. Application Data (HTTP request/response)     |
        |                                                   |
```

### TLS 1.3 Advantages over TLS 1.2

- 1-RTT handshake (vs 2-RTT in TLS 1.2)
- 0-RTT resumption possible
- Removed insecure algorithms (RSA key exchange, RC4, SHA-1)
- Forward secrecy mandatory
- Encrypted handshake (after ServerHello)

### TLS Version Comparison

| Feature                | TLS 1.2                        | TLS 1.3                               |
| ---------------------- | ------------------------------ | ------------------------------------- |
| Handshake RTT          | 2                              | 1 (0-RTT possible)                    |
| Key Exchange           | RSA, DHE, ECDHE (RSA = no PFS) | ECDHE, DHE only (all have PFS)        |
| Ciphers                | Many legacy (CBC, RC4...)      | Only AEAD ciphers (AES-GCM, ChaCha20) |
| Handshake Encryption   | Mostly plaintext               | Encrypted after ServerHello           |
| Certificate Encryption | After handshake (plaintext)    | During handshake (encrypted)          |
| Session Resumption     | Session IDs, Session Tickets   | PSK-based resumption                  |

- **PFS** = Perfect Forward Secrecy
- **AEAD** = Authenticated Encryption with Associated Data

---

## 7.11 Certificate Chain

```
TLS CERTIFICATE CHAIN (Trust Hierarchy)

+-------------------------+
|     ROOT CA             |  <-- Pre-installed in OS/browser
|  (Self-signed, trusted) |      (DigiCert, Let's Encrypt, etc.)
+------------+------------+
             |
             | Signs
             v
+-------------------------+
|   INTERMEDIATE CA       |  <-- Signed by Root CA
|   (Signed by Root)      |      (Protects Root key)
+------------+------------+
             |
             | Signs
             v
+-------------------------+
|   SERVER CERTIFICATE    |  <-- Your website's certificate
|   (www.example.com)     |      (Signed by Intermediate)
+-------------------------+
```

### Certificate Contains

- Subject (domain name, organization)
- Issuer (CA that signed it)
- Validity period (not before, not after)
- Public key
- Signature algorithm
- Serial number
- Extensions (SAN, Key Usage, etc.)

---

## 7.12 HTTP/HTTPS in Wireshark

### HTTP (Unencrypted - Port 80)

Fully visible in Wireshark - can see all headers and body

**Frame 5: HTTP GET Request**

```
Hypertext Transfer Protocol
  GET /index.html HTTP/1.1\r\n
  Host: www.example.com\r\n
  User-Agent: Mozilla/5.0...\r\n
  Accept: text/html,application/xhtml+xml\r\n
  \r\n
```

### HTTPS (Encrypted - Port 443)

You see: TLS handshake, then "Application Data" (encrypted)

**Frame 10: TLS Record**

```
Transport Layer Security
  TLS Record Layer: Application Data Protocol: http-over-tls
    Content Type: Application Data (23)
    Version: TLS 1.2 (0x0303)
    Encrypted Application Data: 4a8b2c...
    [Cannot decrypt without keys]
```

### To Decrypt HTTPS in Wireshark

1. Use pre-master secret log file (browser exports keys)
2. Edit → Preferences → Protocols → TLS → (Pre)-Master-Secret log
3. Set `SSLKEYLOGFILE` environment variable in browser

---

## 7.13 Wireshark HTTP/TLS Display Filters

### HTTP Filters

| Filter                               | Description                  |
| ------------------------------------ | ---------------------------- |
| `http`                               | All HTTP traffic             |
| `http.request`                       | HTTP requests only           |
| `http.response`                      | HTTP responses only          |
| `http.request.method == "GET"`       | GET requests                 |
| `http.request.method == "POST"`      | POST requests                |
| `http.request.uri contains "/api"`   | Requests to /api paths       |
| `http.host == "example.com"`         | Requests to specific host    |
| `http.response.code == 200`          | Successful responses         |
| `http.response.code >= 400`          | Client/server errors         |
| `http.response.code == 404`          | Not found errors             |
| `http.response.code >= 500`          | Server errors                |
| `http.content_type contains "json"`  | JSON responses               |
| `http.cookie contains "session"`     | Requests with session cookie |
| `http.set_cookie`                    | Responses setting cookies    |
| `http.user_agent contains "Mozilla"` | Browser requests             |
| `http.content_length > 10000`        | Large responses              |

### TLS/SSL Filters

| Filter                                 | Description            |
| -------------------------------------- | ---------------------- |
| `tls`                                  | All TLS traffic        |
| `tls.handshake`                        | TLS handshake messages |
| `tls.handshake.type == 1`              | ClientHello            |
| `tls.handshake.type == 2`              | ServerHello            |
| `tls.handshake.type == 11`             | Certificate            |
| `tls.record.content_type == 23`        | Application Data       |
| `tls.alert_message`                    | TLS alerts (errors)    |
| `tls.handshake.extensions.server_name` | SNI hostname           |

### TCP Port Filters

| Filter             | Description      |
| ------------------ | ---------------- |
| `tcp.port == 80`   | HTTP port        |
| `tcp.port == 443`  | HTTPS port       |
| `tcp.port == 8080` | Alternative HTTP |

### Combined Filters

| Filter                                                        | Description                    |
| ------------------------------------------------------------- | ------------------------------ |
| `http.request && ip.src == 192.168.1.100`                     | HTTP requests from specific IP |
| `http.response.code >= 400 && http.host == "api.example.com"` | API errors                     |

---

## 7.14 HTTP/2 Specifics

### HTTP/2 Frame Structure

```
HTTP/2 FRAME

+-----------------------------------------------+
|                 Length (24)                   |
+---------------+---------------+---------------+
|   Type (8)    |   Flags (8)   |
+-+-------------+---------------+-------------------------------+
|R|                  Stream Identifier (31)                     |
+-+-------------------------------------------------------------+
|                   Frame Payload (0...)                        |
+---------------------------------------------------------------+
```

### Frame Types

| Type | Name          | Purpose                                |
| ---- | ------------- | -------------------------------------- |
| 0x0  | DATA          | Request/response body                  |
| 0x1  | HEADERS       | HTTP headers (compressed)              |
| 0x2  | PRIORITY      | Stream priority (deprecated in HTTP/3) |
| 0x3  | RST_STREAM    | Terminate a stream                     |
| 0x4  | SETTINGS      | Connection configuration               |
| 0x5  | PUSH_PROMISE  | Server push notification               |
| 0x6  | PING          | Keepalive and RTT measurement          |
| 0x7  | GOAWAY        | Graceful shutdown                      |
| 0x8  | WINDOW_UPDATE | Flow control                           |
| 0x9  | CONTINUATION  | Continue HEADERS                       |

### Wireshark HTTP/2 Filters

| Filter                           | Description          |
| -------------------------------- | -------------------- |
| `http2`                          | All HTTP/2 traffic   |
| `http2.streamid == 1`            | Specific stream      |
| `http2.type == 0`                | DATA frames          |
| `http2.type == 1`                | HEADERS frames       |
| `http2.header.name == ":method"` | Method pseudo-header |
| `http2.header.value == "GET"`    | GET requests         |

---

## 7.15 Chapter Summary

> [!summary] Key Takeaways

**HTTP BASICS:**

- Request-response protocol on TCP (port 80/443)
- Stateless, text-based (HTTP/1.x) or binary (HTTP/2+)
- HTTP/2 multiplexes requests on single connection

**HTTP METHODS:**

- **GET:** Retrieve resource
- **POST:** Submit data
- **PUT:** Replace resource
- **DELETE:** Remove resource
- **HEAD:** Get headers only
- **OPTIONS:** Get allowed methods

**STATUS CODES:**

- 2xx: Success (200 OK, 201 Created)
- 3xx: Redirect (301 Permanent, 302/307 Temporary)
- 4xx: Client Error (400 Bad Request, 401, 403, 404)
- 5xx: Server Error (500 Internal, 502 Bad Gateway, 503)

**HTTPS/TLS:**

- HTTPS = HTTP + TLS encryption
- TLS 1.3: 1-RTT handshake, mandatory PFS, AEAD only
- Certificate chain: Root CA → Intermediate → Server cert

**WIRESHARK:**

- HTTP: Fully visible (`http.request`, `http.response.code`)
- HTTPS: Encrypted (need SSLKEYLOGFILE to decrypt)
- TLS filters: `tls.handshake`, `tls.alert_message`

---

_Previous: [[06 DNS]]_
_Next: [[08 Other Protocols]]_
