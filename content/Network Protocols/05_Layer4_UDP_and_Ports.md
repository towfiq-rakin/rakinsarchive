# Section 5: Layer 4 - UDP and Port Numbers

---

## 5.1 UDP Overview

**UDP (User Datagram Protocol)** is a connectionless, lightweight transport protocol.

### UDP Key Characteristics

- **Connectionless** - No handshake required before sending data
- **Unreliable** - No guarantee of delivery, order, or integrity
- **No flow control** - Sender can transmit at any rate
- **Low overhead** - Only 8-byte header (vs TCP's 20-60 bytes)
- **Fast** - No connection setup delay
- **Stateless** - No connection state to maintain
- **Supports broadcast** - Can send to multiple recipients

> [!tip] Best For
> Real-time applications where speed > reliability: DNS, VoIP (RTP), video streaming, gaming, DHCP

### UDP vs TCP Comparison

| Feature             | UDP                | TCP                  |
| ------------------- | ------------------ | -------------------- |
| Connection          | Connectionless     | Connection-oriented  |
| Reliability         | Unreliable         | Reliable (ACKs)      |
| Ordering            | No ordering        | Ordered delivery     |
| Header Size         | 8 bytes            | 20-60 bytes          |
| Speed               | Faster             | Slower (overhead)    |
| Flow Control        | None               | Yes (window)         |
| Congestion Control  | None               | Yes                  |
| Error Recovery      | None (app handles) | Automatic retransmit |
| Broadcast/Multicast | Supported          | Not supported        |

**Use Cases:**

- **UDP:** DNS, DHCP, SNMP, RTP/VoIP, TFTP, Gaming, Streaming
- **TCP:** HTTP, HTTPS, FTP, SSH, SMTP, Telnet, SIP (signaling)

---

## 5.2 UDP Header Structure

```
UDP HEADER FORMAT (8 bytes fixed)

 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |  Bytes
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+  0-3
|            Length             |           Checksum            |  Bytes
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+  4-7
|                                                               |
|                          Data (Payload)                       |
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

Total Header Size: 8 bytes (64 bits) - Fixed, no options
```

### UDP Header Fields Explained

| Field            | Size    | Description                                                                                                                         |
| ---------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Source Port      | 16 bits | Sender's port number (0-65535). Optional (can be 0 if no reply needed). Used for reply traffic.                                     |
| Destination Port | 16 bits | Receiver's port number. Identifies the application/service.                                                                         |
| Length           | 16 bits | Total datagram length (header + data). Minimum: 8 bytes (header only). Maximum: 65,535 bytes. Practical max limited by IP (65,507). |
| Checksum         | 16 bits | Error detection. Optional in IPv4, mandatory in IPv6. Covers header, data, and pseudo-header. 0x0000 means checksum not computed.   |

---

## 5.3 UDP Checksum Calculation

The UDP checksum is calculated over a pseudo-header + UDP header + data:

```
IPv4 Pseudo-Header:

+-------+-------+-------+-------+-------+-------+-------+-------+
|             Source IP Address (32 bits)                       |
+-------+-------+-------+-------+-------+-------+-------+-------+
|          Destination IP Address (32 bits)                     |
+-------+-------+-------+-------+-------+-------+-------+-------+
|  Zero | Proto |          UDP Length                           |
| (8b)  | (17)  |            (16 bits)                          |
+-------+-------+-------+-------+-------+-------+-------+-------+
```

**Why pseudo-header?**

- Verifies datagram reached correct destination
- Detects misrouted packets
- Protocol field ensures it's interpreted as UDP

> [!note] Checksum Values
>
> - `0x0000` means "not computed" (IPv4 only)
> - `0xFFFF` after calculation means "valid zero checksum"

---

## 5.4 UDP Communication Model

```
UDP COMMUNICATION - No Handshake

     CLIENT                                              SERVER
       |                                                    |
       |              UDP Datagram 1                        |
       |    ------------------------------------------>     |
       |    Src Port: 54321, Dst Port: 53                   |
       |    "DNS Query: A record for example.com"           |
       |                                                    |
       |              UDP Datagram 2 (Response)             |
       |    <------------------------------------------     |
       |    Src Port: 53, Dst Port: 54321                   |
       |    "DNS Response: 93.184.216.34"                   |
       |                                                    |
       |                                                    |
       |  No connection setup, no teardown, no ACKs         |
       |  Each datagram is independent                      |
       |                                                    |

Contrast with TCP:
TCP: SYN -> SYN-ACK -> ACK -> Data -> ACK -> FIN -> ACK -> FIN -> ACK
UDP: Data -> Data (done!)
```

### What Happens if UDP Packet is Lost?

**Scenario 1: Request Lost**

- Client sends DNS query... lost in transit
- Server never receives it, never responds
- Client times out, may retry (application-level decision)

**Scenario 2: Response Lost**

- Server sends DNS response... lost in transit
- Client never receives it
- Client times out, may retry (sends new query)

> [!warning] Key Point
> UDP itself does NOT handle retransmission. The application layer must implement reliability if needed.

**Examples of application-level reliability:**

- **DNS:** Retry with timeout, try alternate server
- **TFTP:** Block acknowledgments, retransmit on timeout
- **RTP:** Sequence numbers for loss detection, FEC for recovery

---

## 5.5 Port Numbers Overview

| Range         | Name                              | Assignment                                 |
| ------------- | --------------------------------- | ------------------------------------------ |
| 0 - 1023      | Well-Known Ports (System Ports)   | IANA assigned, requires root/admin         |
| 1024 - 49151  | Registered Ports (User Ports)     | IANA registered, available to users        |
| 49152 - 65535 | Dynamic/Private (Ephemeral Ports) | Ephemeral (temporary), client source ports |

- Total possible ports: **65,536** (0-65535) per protocol (TCP and UDP)
- A socket is uniquely identified by: **Protocol + IP + Port**

---

## 5.6 Well-Known Ports (0-1023)

| Port | Protocol | Service     | Description                           |
| ---- | -------- | ----------- | ------------------------------------- |
| 20   | TCP      | FTP-Data    | FTP data transfer                     |
| 21   | TCP      | FTP         | FTP control/commands                  |
| 22   | TCP      | SSH         | Secure Shell, SFTP, SCP               |
| 23   | TCP      | Telnet      | Unencrypted remote access             |
| 25   | TCP      | SMTP        | Simple Mail Transfer Protocol         |
| 53   | TCP/UDP  | DNS         | Domain Name System                    |
| 67   | UDP      | DHCP Server | Dynamic Host Configuration            |
| 68   | UDP      | DHCP Client | DHCP client responses                 |
| 69   | UDP      | TFTP        | Trivial File Transfer Protocol        |
| 80   | TCP      | HTTP        | Hypertext Transfer Protocol           |
| 110  | TCP      | POP3        | Post Office Protocol v3               |
| 119  | TCP      | NNTP        | Network News Transfer Protocol        |
| 123  | UDP      | NTP         | Network Time Protocol                 |
| 137  | UDP      | NetBIOS-NS  | NetBIOS Name Service                  |
| 138  | UDP      | NetBIOS-DGM | NetBIOS Datagram Service              |
| 139  | TCP      | NetBIOS-SSN | NetBIOS Session Service               |
| 143  | TCP      | IMAP        | Internet Message Access Protocol      |
| 161  | UDP      | SNMP        | Simple Network Management Protocol    |
| 162  | UDP      | SNMP-Trap   | SNMP Trap messages                    |
| 389  | TCP/UDP  | LDAP        | Lightweight Directory Access Protocol |
| 443  | TCP      | HTTPS       | HTTP over TLS/SSL                     |
| 445  | TCP      | SMB         | Server Message Block (file sharing)   |
| 465  | TCP      | SMTPS       | SMTP over SSL (deprecated)            |
| 514  | UDP      | Syslog      | System logging                        |
| 587  | TCP      | Submission  | Email submission (SMTP with auth)     |
| 636  | TCP      | LDAPS       | LDAP over SSL                         |
| 993  | TCP      | IMAPS       | IMAP over SSL                         |
| 995  | TCP      | POP3S       | POP3 over SSL                         |

---

## 5.7 Registered Ports (1024-49151)

| Port  | Protocol | Service    | Description                       |
| ----- | -------- | ---------- | --------------------------------- |
| 1080  | TCP      | SOCKS      | SOCKS proxy protocol              |
| 1194  | UDP      | OpenVPN    | OpenVPN default port              |
| 1433  | TCP      | MSSQL      | Microsoft SQL Server              |
| 1434  | UDP      | MSSQL-Mon  | MS SQL Server Monitor             |
| 1521  | TCP      | Oracle     | Oracle database                   |
| 1701  | UDP      | L2TP       | Layer 2 Tunneling Protocol        |
| 1723  | TCP      | PPTP       | Point-to-Point Tunneling Protocol |
| 1883  | TCP      | MQTT       | Message Queue Telemetry Transport |
| 2049  | TCP/UDP  | NFS        | Network File System               |
| 3306  | TCP      | MySQL      | MySQL database                    |
| 3389  | TCP      | RDP        | Remote Desktop Protocol           |
| 3478  | UDP      | STUN       | Session Traversal for NAT         |
| 5060  | TCP/UDP  | SIP        | Session Initiation Protocol       |
| 5061  | TCP      | SIPS       | SIP over TLS                      |
| 5432  | TCP      | PostgreSQL | PostgreSQL database               |
| 5900  | TCP      | VNC        | Virtual Network Computing         |
| 5938  | TCP      | TeamViewer | TeamViewer remote access          |
| 6379  | TCP      | Redis      | Redis database                    |
| 8080  | TCP      | HTTP-Alt   | HTTP alternate (proxy/cache)      |
| 8443  | TCP      | HTTPS-Alt  | HTTPS alternate                   |
| 9000  | TCP      | Various    | PHP-FPM, SonarQube, etc.          |
| 27017 | TCP      | MongoDB    | MongoDB database                  |

**VoIP/Media Ports:**

| Port        | Protocol | Service | Description                                              |
| ----------- | -------- | ------- | -------------------------------------------------------- |
| 5060        | UDP/TCP  | SIP     | VoIP signaling                                           |
| 5061        | TCP      | SIPS    | Secure SIP (TLS)                                         |
| 10000-20000 | UDP      | RTP     | Real-time Transport Protocol (voice/video media streams) |

---

## 5.8 Dynamic/Ephemeral Ports (49152-65535)

**Used for:** Client-side source ports for outgoing connections

### How it works:

```
Client (192.168.1.100)                    Server (93.184.216.34)

Application requests connection to web server
OS assigns ephemeral port: 52431

Src: 192.168.1.100:52431  ------>  Dst: 93.184.216.34:443
Dst: 192.168.1.100:52431  <------  Src: 93.184.216.34:443
```

### Default Ranges by OS

| Operating System    | Ephemeral Port Range |
| ------------------- | -------------------- |
| IANA Recommendation | 49152 - 65535        |
| Linux (default)     | 32768 - 60999        |
| Windows (Vista+)    | 49152 - 65535        |
| Windows (XP/2003)   | 1025 - 5000          |
| FreeBSD             | 49152 - 65535        |
| macOS               | 49152 - 65535        |

**Linux commands:**

```bash
# Check current range
cat /proc/sys/net/ipv4/ip_local_port_range

# Modify range
sysctl -w net.ipv4.ip_local_port_range="32768 65535"
```

---

## 5.9 Socket Identification

A socket (endpoint) is uniquely identified by a **5-tuple:**

1. **Protocol** (TCP or UDP)
2. **Source IP** (e.g., 192.168.1.100)
3. **Source Port** (e.g., 52431)
4. **Dest IP** (e.g., 93.184.216.34)
5. **Dest Port** (e.g., 443)

### Example - Multiple connections to same server:

```
Connection 1: TCP | 192.168.1.100:52431 | 93.184.216.34:443
Connection 2: TCP | 192.168.1.100:52432 | 93.184.216.34:443
Connection 3: TCP | 192.168.1.100:52433 | 93.184.216.34:443
```

All three connect to same server:port but have unique source ports.

> [!note] Same port, different protocols
> TCP port 53 (DNS over TCP) != UDP port 53 (DNS over UDP). These are **SEPARATE** sockets.

---

## 5.10 UDP in Practice - DNS Example

### Wireshark Capture of DNS Query

**Frame 1: 74 bytes on wire**

| Layer       | Details                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| Ethernet II | Src: aa:bb:cc:dd:ee:ff, Dst: 11:22:33:44:55:66                                                                |
| IPv4        | Src: 192.168.1.100, Dst: 192.168.1.2 (DNS server), Protocol: UDP (17)                                         |
| UDP         | Src Port: 54321, Dst Port: 53, Length: 40, Checksum: 0x1a2b [correct]                                         |
| DNS (query) | Transaction ID: 0x4e2a, Flags: 0x0100 (Standard query), Questions: 1, Queries: example.com (Type A, Class IN) |

**UDP Header Breakdown (8 bytes):**

| Bytes | Field       | Value                            |
| ----- | ----------- | -------------------------------- |
| 0-1   | Source Port | 54321 (0xD431)                   |
| 2-3   | Dest Port   | 53 (0x0035)                      |
| 4-5   | Length      | 40 (0x0028) - header + DNS query |
| 6-7   | Checksum    | 0x1A2B                           |

---

## 5.11 Common UDP Protocol Patterns

### Pattern 1: Query-Response (DNS, SNMP)

Client sends query, server responds. Simple, one round-trip.

```
Client --[Query]-->  Server
Client <--[Response]--  Server
```

### Pattern 2: Streaming (RTP, Video)

Continuous one-way or bidirectional flow. Lost packets acceptable.

```
Sender --[Packet 1]--> Receiver
Sender --[Packet 2]--> Receiver
Sender --[Packet 3]--> Receiver  (continuous stream)
```

### Pattern 3: Broadcast/Multicast (DHCP, mDNS)

One sender, multiple receivers. Efficient for discovery.

```
Sender --[Broadcast]--> All hosts on subnet
```

### Pattern 4: Reliable UDP (QUIC, TFTP)

Application implements reliability on top of UDP.

```
Client --[Block 1]--> Server
Client <--[ACK 1]-- Server
Client --[Block 2]--> Server
Client <--[ACK 2]-- Server
```

---

## 5.12 Wireshark Display Filters for UDP

### Basic UDP Filters

| Filter                | Description                         |
| --------------------- | ----------------------------------- |
| `udp`                 | All UDP traffic                     |
| `udp.port == 53`      | DNS traffic (port 53)               |
| `udp.srcport == 67`   | DHCP server responses               |
| `udp.dstport == 5060` | SIP signaling                       |
| `udp.length > 100`    | UDP datagrams larger than 100 bytes |
| `udp.length < 50`     | Small UDP datagrams                 |

### Checksum Filters

| Filter                   | Description            |
| ------------------------ | ---------------------- |
| `udp.checksum == 0x0000` | No checksum computed   |
| `udp.checksum_bad == 1`  | Bad/incorrect checksum |

### Combine with IP

| Filter                                     | Description                    |
| ------------------------------------------ | ------------------------------ |
| `ip.addr == 192.168.1.2 && udp.port == 53` | DNS traffic to/from DNS server |
| `udp && ip.dst == 255.255.255.255`         | UDP broadcast traffic          |

### Protocol-Specific

| Filter | Description                    |
| ------ | ------------------------------ |
| `dns`  | All DNS (auto-detects UDP/TCP) |
| `dhcp` | All DHCP traffic               |
| `sip`  | SIP signaling                  |
| `rtp`  | RTP media streams              |
| `snmp` | SNMP traffic                   |
| `ntp`  | NTP time sync                  |
| `tftp` | TFTP file transfers            |

### VoIP Capture Filters

| Filter                                   | Description                   |
| ---------------------------------------- | ----------------------------- |
| `udp.port == 5060`                       | SIP signaling (192.168.1.138) |
| `udp.port >= 10000 && udp.port <= 10003` | RTP media streams             |
| `rtp && ip.addr == 192.168.1.130`        | RTP to/from extension 4321    |

---

## 5.13 Capture Filters for UDP

Capture filters are applied **DURING** capture to reduce file size. They use Berkeley Packet Filter (BPF) syntax, different from display filters.

### Basic UDP Capture Filters

| Filter                      | Description           |
| --------------------------- | --------------------- |
| `udp`                       | Capture all UDP       |
| `udp port 53`               | DNS traffic only      |
| `udp port 5060`             | SIP signaling only    |
| `udp portrange 10000-20000` | RTP port range        |
| `udp dst port 161`          | SNMP queries          |
| `udp src port 67`           | DHCP server responses |

### Combine with Host

| Filter                                   | Description             |
| ---------------------------------------- | ----------------------- |
| `host 192.168.1.138 and udp`             | All UDP to/from PBX     |
| `src host 192.168.1.1 and udp port 5060` | SIP from extension 1234 |

### Exclude Traffic

| Filter                  | Description              |
| ----------------------- | ------------------------ |
| `udp and not port 53`   | UDP except DNS           |
| `not broadcast and udp` | UDP excluding broadcasts |

> [!warning] Important
> Capture filters cannot be changed during capture! Use broad capture filters and refine with display filters later.

---

## 5.14 UDP Troubleshooting

### Common UDP Issues

**1. PACKET LOSS**

- **Symptoms:** Missing responses, timeouts, choppy audio/video
- **Diagnosis:** Look for gaps in RTP sequence numbers
- **Filter:** `rtp.seq` (check for missing numbers)

**2. PORT UNREACHABLE (ICMP)**

- **Symptoms:** ICMP "Destination Unreachable, Port Unreachable"
- **Cause:** No application listening on destination port
- **Filter:** `icmp.type == 3 && icmp.code == 3`

**3. FIREWALL BLOCKING**

- **Symptoms:** Requests sent but no responses received
- **Diagnosis:** Compare sent packets vs received
- **Common:** UDP stateless, firewall may not track return traffic

**4. CHECKSUM ERRORS**

- **Symptoms:** `udp.checksum_bad == 1`
- **Note:** Modern NICs do checksum offload - Wireshark may show bad checksums for OUTGOING traffic (calculated by NIC later)
- **Fix:** Disable checksum verification in Wireshark preferences

**5. MTU/FRAGMENTATION**

- **Symptoms:** Large UDP datagrams fragmented
- **Filter:** `ip.flags.mf == 1` (More Fragments flag)
- **Best Practice:** Keep UDP payloads under 1472 bytes (1500 - headers)

---

## 5.15 Chapter Summary

> [!summary] Key Takeaways

**UDP CHARACTERISTICS:**

- Connectionless, unreliable, fast transport protocol
- 8-byte header (minimal overhead)
- No flow control, no congestion control
- Supports broadcast and multicast

**UDP HEADER:**

- Source Port (16 bits)
- Destination Port (16 bits)
- Length (16 bits)
- Checksum (16 bits) - optional in IPv4, mandatory in IPv6

**PORT RANGES:**

- 0-1023: Well-Known (system services, requires admin)
- 1024-49151: Registered (user applications)
- 49152-65535: Dynamic/Ephemeral (client source ports)

**COMMON UDP SERVICES:**

- DNS (53), DHCP (67/68), NTP (123), SNMP (161)
- VoIP: SIP (5060), RTP (10000-20000)

**WIRESHARK FILTERS:**

- `udp.port == X`, `udp.length`, `dns`, `rtp`, `sip`

---

_Previous: [[04_Layer4_TCP_Deep_Dive]]_
_Next: [[06_Layer7_DNS]]_
