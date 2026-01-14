# Section 8: Layer 7 - Other Application Protocols

---

## 8.1 DHCP - Dynamic Host Configuration Protocol

### DHCP Overview

**Purpose:** Automatically assign IP addresses and network configuration

**Ports:**

- Server: UDP 67
- Client: UDP 68

**DHCP Provides:**

- IP Address
- Subnet Mask
- Default Gateway
- DNS Servers
- Lease Duration
- Domain Name
- NTP Servers (optional)
- Many more options...

> [!note] Why DHCP uses UDP
>
> - Client has no IP yet (can't establish TCP connection)
> - Broadcasts required for discovery
> - Simple request-response sufficient

### DHCP DORA Process

```
DHCP DORA PROCESS (4-Way Handshake)

     CLIENT                                              SERVER
  (No IP yet)                                       (192.168.1.1)
        |                                                   |
        |                                                   |
        |   1. DISCOVER (Broadcast)                         |
        |   ============================================>   |
        |   Src: 0.0.0.0:68  Dst: 255.255.255.255:67       |
        |   "Any DHCP servers out there?"                   |
        |   Transaction ID: 0x12345678                      |
        |                                                   |
        |                                                   |
        |   2. OFFER (Broadcast or Unicast)                 |
        |   <============================================   |
        |   "I can offer you 192.168.1.100"                 |
        |   Lease: 86400 seconds                            |
        |   Gateway: 192.168.1.1                            |
        |   DNS: 192.168.1.2                                |
        |                                                   |
        |                                                   |
        |   3. REQUEST (Broadcast)                          |
        |   ============================================>   |
        |   Src: 0.0.0.0:68  Dst: 255.255.255.255:67       |
        |   "I accept 192.168.1.100 from server X"          |
        |   (Broadcast so other servers know)               |
        |                                                   |
        |                                                   |
        |   4. ACK (Broadcast or Unicast)                   |
        |   <============================================   |
        |   "Confirmed! 192.168.1.100 is yours"            |
        |   Lease starts now                                |
        |                                                   |
  (Now has IP)                                              |
 192.168.1.100                                              |

D = Discover    O = Offer    R = Request    A = Acknowledge
```

### DHCP Message Types

| Type | Name         | Description                              |
| ---- | ------------ | ---------------------------------------- |
| 1    | DHCPDISCOVER | Client looking for DHCP servers          |
| 2    | DHCPOFFER    | Server offering IP address               |
| 3    | DHCPREQUEST  | Client requesting offered address        |
| 4    | DHCPDECLINE  | Client found address already in use      |
| 5    | DHCPACK      | Server confirms lease                    |
| 6    | DHCPNAK      | Server denies request                    |
| 7    | DHCPRELEASE  | Client releasing IP before lease expires |
| 8    | DHCPINFORM   | Client has IP, requesting other config   |

### Lease Renewal

- **At 50% lease time (T1):** Client unicasts REQUEST to server
- **At 87.5% lease time (T2):** Client broadcasts REQUEST
- **At 100%:** Lease expires, client must DISCOVER again

**Example Timeline (24-hour lease):**

- T1 (50%): 12 hours - try to renew with same server
- T2 (87.5%): 21 hours - try any server (broadcast)
- Expire: 24 hours - must release IP, start over

### DHCP Wireshark Filters

| Filter                                  | Description                |
| --------------------------------------- | -------------------------- |
| `dhcp`                                  | All DHCP traffic           |
| `bootp`                                 | Same as dhcp (legacy name) |
| `dhcp.type == 1`                        | DHCP Discover              |
| `dhcp.type == 2`                        | DHCP Offer                 |
| `dhcp.type == 3`                        | DHCP Request               |
| `dhcp.type == 5`                        | DHCP ACK                   |
| `dhcp.type == 6`                        | DHCP NAK                   |
| `dhcp.type == 7`                        | DHCP Release               |
| `dhcp.option.dhcp == 1`                 | Discover messages          |
| `dhcp.ip.your == 192.168.1.100`         | Offered/assigned IP        |
| `dhcp.hw.mac_addr == aa:bb:cc:dd:ee:ff` | Specific client            |
| `dhcp.option.hostname`                  | Hostname option present    |
| `udp.port == 67 \|\| udp.port == 68`    | DHCP ports                 |

---

## 8.2 FTP - File Transfer Protocol

### FTP Overview

**Purpose:** Transfer files between client and server

**Ports:**

- Control: TCP 21 (commands/responses)
- Data: TCP 20 (active mode) or dynamic (passive mode)

### Two Channels

```
FTP TWO-CHANNEL MODEL

Client                                Server
   |                                    |
   |========= CONTROL (21) =============| Commands/Responses
   |    USER, PASS, LIST, RETR, STOR   |
   |                                    |
   |========== DATA (20/X) =============| File Transfer
   |    Actual file contents           |
   |                                    |
```

> [!warning] Security
> FTP is **UNENCRYPTED** - use SFTP (SSH) or FTPS (TLS) instead!

### Active vs Passive Mode

**ACTIVE MODE (Traditional):**

```
    Client                                    Server
 (Random Port)                            (Port 21, 20)
       |                                       |
       |--- Control (TCP 21) ----------------->|
       |    PORT 192,168,1,100,195,80          |  (Client tells server
       |    "Connect to me on port 50000"      |   to connect back)
       |                                       |
       |<-- Data (from TCP 20) ----------------|
       |    Server initiates data connection   |
       |                                       |
```

PORT command: `PORT h1,h2,h3,h4,p1,p2`
Port = (p1 × 256) + p2 = (195 × 256) + 80 = 50000

> [!warning] Problem
> Client firewall blocks incoming connection from server

**PASSIVE MODE (Modern, Firewall-Friendly):**

```
    Client                                    Server
 (Random Port)                          (Port 21 + Random)
       |                                       |
       |--- Control (TCP 21) ----------------->|
       |    PASV                               |
       |    "I'll connect to you"              |
       |                                       |
       |<-- 227 Entering Passive Mode ---------|
       |    (192,168,1,1,234,200)              |  (Server tells client
       |    "Connect to me on port 60104"     |   which port to use)
       |                                       |
       |--- Data (to port 60104) ------------->|
       |    Client initiates data connection   |
       |                                       |
```

Port = (234 × 256) + 200 = 60104

### Common FTP Commands

| Command   | Description              | Example Response             |
| --------- | ------------------------ | ---------------------------- |
| USER      | Send username            | 331 User OK, need password   |
| PASS      | Send password            | 230 Login successful         |
| LIST      | List directory           | 150 Opening data connection  |
| NLST      | Name list only           | 150 Opening data connection  |
| PWD       | Print working directory  | 257 "/" is current directory |
| CWD       | Change directory         | 250 Directory changed        |
| CDUP      | Change to parent dir     | 250 Directory changed        |
| MKD       | Make directory           | 257 Directory created        |
| RMD       | Remove directory         | 250 Directory removed        |
| DELE      | Delete file              | 250 File deleted             |
| RETR      | Retrieve (download) file | 150 Opening data connection  |
| STOR      | Store (upload) file      | 150 Opening data connection  |
| RNFR/RNTO | Rename from/to           | 350/250                      |
| PORT      | Active mode data port    | 200 PORT command OK          |
| PASV      | Passive mode request     | 227 Entering Passive Mode    |
| TYPE      | Transfer type (A/I)      | 200 Type set to I            |
| QUIT      | Close connection         | 221 Goodbye                  |

**Response Code Ranges:**

- 1xx - Positive preliminary (action started)
- 2xx - Positive completion (action completed)
- 3xx - Positive intermediate (need more info)
- 4xx - Transient negative (temporary failure)
- 5xx - Permanent negative (command rejected)

### FTP Wireshark Filters

| Filter                          | Description                      |
| ------------------------------- | -------------------------------- |
| `ftp`                           | All FTP control traffic          |
| `ftp-data`                      | FTP data channel traffic         |
| `ftp.request.command == "USER"` | Login attempts                   |
| `ftp.request.command == "PASS"` | Password transmission (visible!) |
| `ftp.request.command == "RETR"` | File downloads                   |
| `ftp.request.command == "STOR"` | File uploads                     |
| `ftp.request.command == "LIST"` | Directory listings               |
| `ftp.request.command == "PASV"` | Passive mode requests            |
| `ftp.response.code == 230`      | Successful login                 |
| `ftp.response.code == 530`      | Login failed                     |
| `ftp.response.code >= 500`      | Errors                           |
| `tcp.port == 21`                | FTP control port                 |
| `tcp.port == 20`                | FTP data port (active)           |

> [!warning] Security Note
> FTP credentials are sent in **PLAINTEXT**!
> Filter for credentials: `ftp.request.command == "PASS"`

---

## 8.3 SSH - Secure Shell

### SSH Overview

**Purpose:** Secure remote access, file transfer, tunneling

**Port:** TCP 22

**SSH Provides:**

- Encrypted terminal access (replaces Telnet)
- Secure file transfer (SFTP, SCP)
- Port forwarding / tunneling
- X11 forwarding
- Strong authentication (password, key-based)

### SSH Components

| Layer                        | Function                                                  |
| ---------------------------- | --------------------------------------------------------- |
| Transport Layer Protocol     | Server authentication, encryption, integrity, compression |
| User Authentication Protocol | Password, public key, keyboard-interactive                |
| Connection Protocol          | Channels (session, forwarding, etc.)                      |

### SSH Connection Process

```
SSH CONNECTION ESTABLISHMENT

     CLIENT                                              SERVER
        |                                                   |
        |--- TCP SYN (port 22) ------------------------->   |
        |<-- TCP SYN-ACK --------------------------------   |
        |--- TCP ACK ----------------------------------->   |
        |                                                   |
        |   PROTOCOL VERSION EXCHANGE                       |
        |<-- "SSH-2.0-OpenSSH_8.4\r\n" ------------------   |
        |--- "SSH-2.0-OpenSSH_8.2\r\n" ----------------->   |
        |                                                   |
        |   KEY EXCHANGE (Diffie-Hellman)                   |
        |--- SSH_MSG_KEXINIT (algorithms) --------------->   |
        |<-- SSH_MSG_KEXINIT (algorithms) ----------------   |
        |--- SSH_MSG_KEXDH_INIT (client DH public) ------>   |
        |<-- SSH_MSG_KEXDH_REPLY (server DH + signature) -   |
        |                                                   |
        |   [Shared secret computed, keys derived]          |
        |                                                   |
        |   SSH_MSG_NEWKEYS                                 |
        |--- "Switching to encrypted mode" --------------->  |
        |<-- "Switching to encrypted mode" ----------------  |
        |                                                   |
        |<============= ENCRYPTED FROM HERE ==============>|
        |                                                   |
        |   USER AUTHENTICATION                             |
        |--- SSH_MSG_USERAUTH_REQUEST (password/key) ---->   |
        |<-- SSH_MSG_USERAUTH_SUCCESS -------------------   |
        |                                                   |
        |   CHANNEL OPEN                                    |
        |--- SSH_MSG_CHANNEL_OPEN (session) ------------->   |
        |<-- SSH_MSG_CHANNEL_OPEN_CONFIRMATION -----------   |
        |                                                   |
        |<============ INTERACTIVE SESSION ===============>|
```

### SSH Wireshark Analysis

**What you CAN see:**

- Protocol version exchange (plaintext)
- Key exchange init (algorithm negotiation)
- Encrypted packet sizes and timing

**What you CANNOT see:**

- Usernames and passwords
- Commands executed
- File contents (SFTP/SCP)
- Any application data

**SSH Wireshark Filters:**

| Filter                                       | Description             |
| -------------------------------------------- | ----------------------- |
| `ssh`                                        | All SSH traffic         |
| `tcp.port == 22`                             | SSH port                |
| `ssh.protocol`                               | Protocol version string |
| `ssh.message_code`                           | Message type            |
| `ssh.kex.algorithms`                         | Key exchange algorithms |
| `ssh.encryption_algorithms_client_to_server` | Encryption algorithms   |

**Sample Wireshark View:**

```
Frame 1: SSH Protocol: SSH-2.0-OpenSSH_8.4
Frame 2: Key Exchange Init
Frame 3: Diffie-Hellman Key Exchange Init
Frame 4: Diffie-Hellman Key Exchange Reply
Frame 5: New Keys
Frame 6+: Encrypted packets (no readable content)
```

---

## 8.4 Email Protocols: SMTP, POP3, IMAP

### Email Protocol Overview

```
EMAIL FLOW

SENDER                      MAIL SERVERS                RECIPIENT

[Client]                                                 [Client]
   |                                                        ^
   |  SMTP (25/587)                                        |
   |                                                        |
   v                                                        |
[Sender's      SMTP (25)        [Recipient's    POP3/IMAP |
 Mail    ] --------------->      Mail      ] ------------>|
 Server ]                        Server    ]              |
```

- **SMTP:** Send mail (client to server, server to server)
- **POP3:** Download mail (delete from server)
- **IMAP:** Access mail (keep on server, sync across devices)

**Ports:**

| Protocol | Plain Port                              | Encrypted Port     |
| -------- | --------------------------------------- | ------------------ |
| SMTP     | 25 (server-to-server), 587 (submission) | 465 (SMTPS legacy) |
| POP3     | 110                                     | 995 (POP3S)        |
| IMAP     | 143                                     | 993 (IMAPS)        |

### SMTP - Simple Mail Transfer Protocol

```
SMTP CONVERSATION

     CLIENT                                              SERVER
        |                                                   |
        |--- TCP Connect (port 25 or 587) --------------->  |
        |                                                   |
        |<-- 220 mail.example.com ESMTP Ready ------------  |
        |                                                   |
        |--- EHLO client.example.com -------------------->  |
        |<-- 250-mail.example.com Hello ------------------  |
        |    250-SIZE 52428800                              |
        |    250-AUTH LOGIN PLAIN                           |
        |    250 STARTTLS                                   |
        |                                                   |
        |--- STARTTLS (optional, upgrade to TLS) -------->  |
        |<-- 220 Ready to start TLS ---------------------   |
        |                                                   |
        |======== TLS HANDSHAKE =========================>  |
        |                                                   |
        |--- AUTH LOGIN --------------------------------->  |
        |<-- 334 VXNlcm5hbWU6 (Base64: Username:) --------  |
        |--- dXNlcg== (Base64: user) -------------------->  |
        |<-- 334 UGFzc3dvcmQ6 (Base64: Password:) --------  |
        |--- cGFzcw== (Base64: pass) -------------------->  |
        |<-- 235 Authentication successful ---------------  |
        |                                                   |
        |--- MAIL FROM:<sender@example.com> ------------->  |
        |<-- 250 OK --------------------------------------  |
        |                                                   |
        |--- RCPT TO:<recipient@other.com> -------------->  |
        |<-- 250 OK --------------------------------------  |
        |                                                   |
        |--- DATA ---------------------------------------->  |
        |<-- 354 Start mail input; end with <CRLF>.<CRLF>   |
        |                                                   |
        |--- From: sender@example.com                       |
        |    To: recipient@other.com                        |
        |    Subject: Hello                                 |
        |                                                   |
        |    This is the message body.                      |
        |    .                                               |
        |<-- 250 OK: Message queued ----------------------  |
        |                                                   |
        |--- QUIT ---------------------------------------->  |
        |<-- 221 Bye ------------------------------------   |
```

### POP3 - Post Office Protocol v3

POP3 downloads mail and typically **DELETES** from server.

```
POP3 CONVERSATION

     CLIENT                                              SERVER
        |                                                   |
        |--- TCP Connect (port 110 or 995/TLS) ---------->  |
        |                                                   |
        |<-- +OK POP3 server ready -----------------------  |
        |                                                   |
        |--- USER john@example.com ---------------------->  |
        |<-- +OK ----------------------------------------   |
        |                                                   |
        |--- PASS secretpassword ------------------------>  |
        |<-- +OK Logged in ------------------------------   |
        |                                                   |
        |--- STAT ---------------------------------------->  |
        |<-- +OK 3 4500  (3 messages, 4500 bytes total) --  |
        |                                                   |
        |--- LIST ---------------------------------------->  |
        |<-- +OK                                             |
        |    1 1500                                         |
        |    2 2000                                         |
        |    3 1000                                         |
        |    .                                               |
        |                                                   |
        |--- RETR 1 -------------------------------------->  |
        |<-- +OK 1500 octets                                |
        |    [Message headers and body]                     |
        |    .                                               |
        |                                                   |
        |--- DELE 1 -------------------------------------->  |
        |<-- +OK Message deleted -------------------------  |
        |                                                   |
        |--- QUIT ---------------------------------------->  |
        |<-- +OK Bye ------------------------------------   |
```

**POP3 Commands:**

| Command | Description       |
| ------- | ----------------- |
| USER    | Username          |
| PASS    | Password          |
| STAT    | Mailbox status    |
| LIST    | List messages     |
| RETR    | Retrieve message  |
| DELE    | Mark for deletion |
| RSET    | Reset             |
| NOOP    | No-op             |
| QUIT    | End session       |

### IMAP - Internet Message Access Protocol

IMAP keeps mail **ON SERVER**, supports folders, flags, search.

```
IMAP CONVERSATION

     CLIENT                                              SERVER
        |                                                   |
        |--- TCP Connect (port 143 or 993/TLS) ---------->  |
        |                                                   |
        |<-- * OK IMAP4rev1 server ready ----------------   |
        |                                                   |
        |--- A001 LOGIN john@example.com password ------->  |
        |<-- A001 OK LOGIN completed --------------------   |
        |                                                   |
        |--- A002 LIST "" "*" --------------------------->  |
        |<-- * LIST (\HasNoChildren) "/" "INBOX"            |
        |    * LIST (\HasNoChildren) "/" "Sent"             |
        |    * LIST (\HasNoChildren) "/" "Drafts"           |
        |    A002 OK LIST completed                         |
        |                                                   |
        |--- A003 SELECT INBOX --------------------------->  |
        |<-- * 5 EXISTS                                     |
        |    * 2 RECENT                                     |
        |    * OK [UNSEEN 3]                                |
        |    * FLAGS (\Answered \Flagged \Deleted \Seen)   |
        |    A003 OK [READ-WRITE] SELECT completed          |
        |                                                   |
        |--- A004 FETCH 1 (BODY[HEADER]) ----------------->  |
        |<-- * 1 FETCH (BODY[HEADER] {350}                  |
        |    [Headers...]                                   |
        |    )                                               |
        |    A004 OK FETCH completed                        |
        |                                                   |
        |--- A005 STORE 1 +FLAGS (\Seen) ----------------->  |
        |<-- * 1 FETCH (FLAGS (\Seen))                      |
        |    A005 OK STORE completed                        |
        |                                                   |
        |--- A006 LOGOUT ---------------------------------->  |
        |<-- * BYE Server terminating                       |
        |    A006 OK LOGOUT completed                       |
```

> [!note] IMAP Tagging
> IMAP uses tagged commands (A001, A002...) for tracking responses

### Email Wireshark Filters

**SMTP:**

| Filter                       | Description             |
| ---------------------------- | ----------------------- |
| `smtp`                       | All SMTP traffic        |
| `tcp.port == 25`             | SMTP port               |
| `tcp.port == 587`            | Submission port         |
| `smtp.req.command == "EHLO"` | EHLO commands           |
| `smtp.req.command == "AUTH"` | Authentication attempts |
| `smtp.req.command == "MAIL"` | Sender addresses        |
| `smtp.req.command == "RCPT"` | Recipient addresses     |
| `smtp.req.command == "DATA"` | Message data start      |
| `smtp.response.code == 250`  | Successful commands     |
| `smtp.response.code >= 400`  | Errors                  |

**POP3:**

| Filter                            | Description          |
| --------------------------------- | -------------------- |
| `pop`                             | All POP3 traffic     |
| `tcp.port == 110`                 | POP3 port            |
| `tcp.port == 995`                 | POP3S port           |
| `pop.request.command == "USER"`   | Usernames (visible!) |
| `pop.request.command == "PASS"`   | Passwords (visible!) |
| `pop.request.command == "RETR"`   | Message retrieval    |
| `pop.response.indicator == "+OK"` | Successful responses |

**IMAP:**

| Filter                             | Description      |
| ---------------------------------- | ---------------- |
| `imap`                             | All IMAP traffic |
| `tcp.port == 143`                  | IMAP port        |
| `tcp.port == 993`                  | IMAPS port       |
| `imap.request.command == "LOGIN"`  | Login attempts   |
| `imap.request.command == "SELECT"` | Folder selection |
| `imap.request.command == "FETCH"`  | Message fetching |

> [!warning] Security Warning
> Without TLS, all credentials are in **PLAINTEXT**!

---

## 8.5 Protocol Port Summary

| Protocol    | Plain Port | Encrypted Port      | Notes                    |
| ----------- | ---------- | ------------------- | ------------------------ |
| DHCP Server | UDP 67     | -                   | No encryption            |
| DHCP Client | UDP 68     | -                   | No encryption            |
| FTP Control | TCP 21     | TCP 990 (FTPS)      | Use SFTP instead         |
| FTP Data    | TCP 20     | Dynamic             | Active mode              |
| SSH/SFTP    | TCP 22     | (inherently secure) | Replace Telnet/FTP       |
| Telnet      | TCP 23     | -                   | **DEPRECATED** (use SSH) |
| SMTP        | TCP 25     | TCP 465 (legacy)    | Server-to-server         |
| SMTP Submit | TCP 587    | TCP 587 + STARTTLS  | Client submission        |
| POP3        | TCP 110    | TCP 995 (POP3S)     | Download & delete        |
| IMAP        | TCP 143    | TCP 993 (IMAPS)     | Keep on server           |

---

## 8.6 Chapter Summary

> [!summary] Key Takeaways

**DHCP:**

- DORA: Discover, Offer, Request, Acknowledge
- UDP 67 (server), UDP 68 (client)
- Provides IP, gateway, DNS, lease time

**FTP:**

- Two channels: Control (21) + Data (20 or dynamic)
- Active mode: Server connects to client (firewall issues)
- Passive mode: Client connects to server (firewall-friendly)
- **UNENCRYPTED** - use SFTP or FTPS

**SSH:**

- Port 22, encrypted from key exchange onwards
- Replaces Telnet, FTP (with SFTP)
- Key-based or password authentication

**EMAIL:**

- SMTP (25/587): Send mail
- POP3 (110/995): Download mail, delete from server
- IMAP (143/993): Access mail, keep on server
- Always use TLS encrypted variants (SMTPS, POP3S, IMAPS)

> [!warning] Security Warning
> FTP, POP3, IMAP, SMTP without TLS transmit credentials in **PLAINTEXT**!
> Use encrypted alternatives (SFTP, POP3S, IMAPS, STARTTLS)

---

_Previous: [[07_Layer7_HTTP_HTTPS]]_
_Next: [[09_VoIP_Protocols]]_
