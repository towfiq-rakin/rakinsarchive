# Section 6: Layer 7 - DNS Deep Dive

---

## 6.1 What is DNS?

The **Domain Name System (DNS)** translates human-readable domain names to IP addresses.

### DNS - The Internet's Phonebook

Without DNS, you would need to remember: `142.250.185.206`

With DNS, you simply type: `www.google.com`

**DNS performs:**

- **Forward Lookup:** `www.google.com` → `142.250.185.206`
- **Reverse Lookup:** `142.250.185.206` → `www.google.com`
- **Mail Routing:** Where to send email for `@google.com`
- **Service Discovery:** Find SIP servers, LDAP, etc.

**Port:** 53 (UDP for queries, TCP for zone transfers and large responses)

---

## 6.2 DNS Hierarchy

```
DNS HIERARCHICAL STRUCTURE

                          . (Root)
                             |
       +----+----+----+-----+-----+----+----+----+
       |    |    |    |           |    |    |    |
      com  net  org  edu         uk   de   jp  ...
       |                          |
 +-----+-----+              +-----+-----+
 |     |     |              |     |     |
google amazon apple       co.uk  gov.uk ...
 |                          |
+---+---+                  bbc
|   |   |                    |
www mail dns               +--+--+
                           |     |
                          www  news
```

**FQDN (Fully Qualified Domain Name):**
`www.google.com.` (note the trailing dot = root)

### DNS Components

**ROOT SERVERS (.)**

- 13 root server clusters (A through M)
- Actually hundreds of servers via anycast
- Managed by various organizations (ICANN, Verisign, etc.)
- Know where TLD servers are located

**TLD SERVERS (Top-Level Domain)**

- Generic TLDs: `.com`, `.net`, `.org`, `.edu`, `.gov`
- Country-Code TLDs: `.uk`, `.de`, `.jp`, `.au`
- New TLDs: `.app`, `.dev`, `.cloud`, `.ninja`
- Know where authoritative servers for domains are

**AUTHORITATIVE NAME SERVERS**

- Hold the actual DNS records for a domain
- Operated by domain owner or DNS provider
- Return definitive answers for their zones

**RECURSIVE RESOLVERS (DNS Servers)**

- Query other servers on behalf of clients
- Cache responses to speed up future queries
- Examples: ISP DNS, 8.8.8.8 (Google), 1.1.1.1 (Cloudflare)

---

## 6.3 DNS Resolution Process

### Recursive vs Iterative Resolution

**RECURSIVE RESOLUTION (Client to Resolver):**
Client asks resolver: "Give me the IP for www.example.com"
Resolver does ALL the work and returns the final answer

```
Client                    Recursive Resolver
   |                            |
   |---Query: www.example.com-->|
   |                            |  (resolver queries root, TLD, auth)
   |<--Answer: 93.184.216.34----|
```

**ITERATIVE RESOLUTION (Resolver to Other Servers):**
Resolver asks each server, gets referrals, follows the chain

```
Resolver    Root Server    TLD Server    Auth Server
   |             |              |              |
   |--Query----->|              |              |
   |<-Referral---|              |              |
   |   "Ask .com TLD"           |              |
   |             |              |              |
   |----------Query------------>|              |
   |<---------Referral----------|              |
   |   "Ask ns1.example.com"    |              |
   |             |              |              |
   |-------------------Query------------------>|
   |<------------------Answer-----------------|
   |   "IP is 93.184.216.34"    |              |
```

### Full DNS Resolution Example

```
FULL DNS RESOLUTION: www.example.com

Step 1: Client checks local cache - NOT FOUND
Step 2: Client checks hosts file - NOT FOUND
Step 3: Client queries recursive resolver (e.g., 192.168.1.2)

    User's PC                  Recursive Resolver
 192.168.1.100                   192.168.1.2
        |                            |
        |--"www.example.com A?"----->|
        |                            |
        |                            |         Root Server
        |                            |             (.)
        |                            |--"example.com?"-->|
        |                            |<-"Ask .com TLD"---|
        |                            |
        |                            |         TLD Server
        |                            |           (.com)
        |                            |--"example.com?"-->|
        |                            |<-"Ask ns.example.com"|
        |                            |
        |                            |       Auth Server
        |                            |     (ns.example.com)
        |                            |--"www.example.com?"->|
        |                            |<-"93.184.216.34"-----|
        |                            |
        |<--"93.184.216.34"----------|
        |                            |

Resolver caches: www.example.com = 93.184.216.34 (TTL: 3600s)
```

---

## 6.4 DNS Message Format

```
DNS MESSAGE STRUCTURE

+-----------------------------------------------------------------------+
|                            HEADER (12 bytes)                          |
+-----------------------------------------------------------------------+
|                           QUESTION SECTION                            |
|                    (Query name, type, class)                          |
+-----------------------------------------------------------------------+
|                           ANSWER SECTION                              |
|                    (Resource Records - RRs)                           |
+-----------------------------------------------------------------------+
|                         AUTHORITY SECTION                             |
|                    (NS records for referrals)                         |
+-----------------------------------------------------------------------+
|                         ADDITIONAL SECTION                            |
|                    (Extra helpful records)                            |
+-----------------------------------------------------------------------+
```

### DNS Header Format

```
DNS HEADER (12 bytes)

 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Transaction ID (16 bits)                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|QR| Opcode |AA|TC|RD|RA| Z |AD|CD|     RCODE                   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      QDCOUNT (Questions)                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      ANCOUNT (Answers)                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      NSCOUNT (Authority)                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      ARCOUNT (Additional)                     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**FLAGS EXPLAINED:**

| Flag   | Bits | Description                                       |
| ------ | ---- | ------------------------------------------------- |
| QR     | 1    | 0 = Query, 1 = Response                           |
| Opcode | 4    | 0 = Standard query, 1 = Inverse, 2 = Status       |
| AA     | 1    | Authoritative Answer                              |
| TC     | 1    | Truncated (response > 512 bytes, retry with TCP)  |
| RD     | 1    | Recursion Desired (client wants recursive lookup) |
| RA     | 1    | Recursion Available (server supports recursion)   |
| AD     | 1    | Authenticated Data (DNSSEC validated)             |
| CD     | 1    | Checking Disabled (don't validate DNSSEC)         |
| RCODE  | 4    | Response Code (0=No Error, 3=NXDOMAIN, etc.)      |

---

## 6.5 DNS Record Types

| Type  | Value | Purpose                                  | Example                                        |
| ----- | ----- | ---------------------------------------- | ---------------------------------------------- |
| A     | 1     | IPv4 address                             | www.example.com → 93.184.216.34                |
| AAAA  | 28    | IPv6 address                             | www.example.com → 2606:2800:...                |
| CNAME | 5     | Canonical name (alias)                   | www → www.example.com.cdn.net                  |
| MX    | 15    | Mail exchanger (priority + hostname)     | example.com → mail.example.com (Priority: 10)  |
| NS    | 2     | Name server (authoritative DNS)          | example.com → ns1.example.com                  |
| PTR   | 12    | Pointer (reverse DNS) IP → hostname      | 34.216.184.93.in-addr.arpa → www.example.com   |
| SOA   | 6     | Start of Authority (zone master info)    | Primary NS, email, serial, etc.                |
| TXT   | 16    | Text record (arbitrary text)             | SPF, DKIM, domain verification                 |
| SRV   | 33    | Service location (for service discovery) | \_sip.\_udp.example.com → pbx.example.com:5060 |
| CAA   | 257   | Certificate Authority Authorization      | example.com → letsencrypt.org                  |

### Detailed Record Examples

**A RECORD (Address):**

```
Name:   www.example.com
Type:   A
Class:  IN
TTL:    3600
Data:   93.184.216.34
```

**AAAA RECORD (IPv6 Address):**

```
Name:   www.example.com
Type:   AAAA
Class:  IN
TTL:    3600
Data:   2606:2800:220:1:248:1893:25c8:1946
```

**MX RECORD (Mail Exchange):**

```
Name:   example.com
Type:   MX
Class:  IN
TTL:    3600
Data:   10 mail1.example.com.    (priority 10 - lower = preferred)
        20 mail2.example.com.    (backup mail server)
```

**CNAME RECORD (Alias):**

```
Name:   www.example.com
Type:   CNAME
Class:  IN
TTL:    3600
Data:   example.com.cdn.cloudflare.net.
```

**TXT RECORD (SPF Example):**

```
Name:   example.com
Type:   TXT
Class:  IN
TTL:    3600
Data:   "v=spf1 ip4:93.184.216.0/24 include:_spf.google.com -all"
```

**SRV RECORD (SIP Service):**

```
Name:   _sip._udp.example.com
Type:   SRV
Class:  IN
TTL:    3600
Data:   10 5 5060 pbx.example.com.
        ^  ^  ^    ^
        |  |  |    +-- Target host
        |  |  +------- Port
        |  +---------- Weight (load balancing)
        +------------- Priority (lower = preferred)
```

---

## 6.6 SOA Record Deep Dive

The SOA (Start of Authority) record contains zone administration info:

```
example.com.  IN  SOA  ns1.example.com. admin.example.com. (
                        2024011401  ; Serial number (YYYYMMDDNN)
                        3600        ; Refresh (1 hour)
                        900         ; Retry (15 minutes)
                        604800      ; Expire (1 week)
                        86400       ; Minimum TTL (1 day)
                        )
```

| Field   | Description                                        |
| ------- | -------------------------------------------------- |
| MNAME   | Primary name server (ns1.example.com)              |
| RNAME   | Admin email (admin@example.com, @ replaced with .) |
| Serial  | Zone version (increment on changes)                |
| Refresh | How often slaves check for updates                 |
| Retry   | Retry interval if refresh fails                    |
| Expire  | When slave stops responding if master unreachable  |
| Minimum | Default/minimum TTL for negative caching           |

---

## 6.7 DNS Response Codes (RCODE)

| Code | Name     | Description                                |
| ---- | -------- | ------------------------------------------ |
| 0    | NOERROR  | Query successful, answer in response       |
| 1    | FORMERR  | Format error (malformed query)             |
| 2    | SERVFAIL | Server failure (can't process query)       |
| 3    | NXDOMAIN | Name does not exist (domain not found)     |
| 4    | NOTIMP   | Not implemented (query type not supported) |
| 5    | REFUSED  | Query refused (policy/security)            |
| 6    | YXDOMAIN | Name exists when it should not             |
| 7    | YXRRSET  | RR set exists when it should not           |
| 8    | NXRRSET  | RR set that should exist does not          |
| 9    | NOTAUTH  | Server not authoritative                   |
| 10   | NOTZONE  | Name not contained in zone                 |

**Common scenarios:**

- **NXDOMAIN (3):** Typo in domain name, domain doesn't exist
- **SERVFAIL (2):** DNS server error, timeout, DNSSEC validation failure
- **REFUSED (5):** Server won't answer (not allowed to recurse for you)

---

## 6.8 DNS over TCP vs UDP

### DEFAULT: UDP Port 53

- Used for most queries
- Fast, connectionless
- Limited to 512 bytes (traditional) or 4096 with EDNS

### FALLBACK: TCP Port 53

- Used when response > 512 bytes (TC flag set)
- Zone transfers (AXFR/IXFR)
- DNSSEC responses (larger due to signatures)
- Reliable delivery needed

### DNS over HTTPS (DoH) - Port 443

- Encrypts DNS queries in HTTPS
- Privacy from ISP/network
- Bypasses some filtering

### DNS over TLS (DoT) - Port 853

- Encrypts DNS with TLS
- Standard encryption for DNS

**Wireshark Filter Examples:**

| Filter              | Description         |
| ------------------- | ------------------- |
| `dns`               | All DNS traffic     |
| `dns && udp`        | DNS over UDP only   |
| `dns && tcp`        | DNS over TCP only   |
| `dns.flags.tc == 1` | Truncated responses |

---

## 6.9 DNS Caching and TTL

### TTL (Time To Live)

- Tells resolvers how long to cache the record
- In seconds (e.g., 3600 = 1 hour)
- Lower TTL = more queries, faster propagation
- Higher TTL = fewer queries, slower updates

| TTL Value | Duration  | Use Case                   |
| --------- | --------- | -------------------------- |
| 60        | 1 minute  | Failover, frequent changes |
| 300       | 5 minutes | Dynamic IPs, testing       |
| 3600      | 1 hour    | Standard websites          |
| 86400     | 1 day     | Stable records             |
| 604800    | 1 week    | Very stable (root servers) |

### Caching Hierarchy

1. **Browser cache** (very short TTL)
2. **OS cache** (respects TTL)
3. **Local resolver** (ISP/corporate DNS)
4. **Upstream resolvers** (8.8.8.8, 1.1.1.1)

### Negative Caching

NXDOMAIN responses are also cached (prevents repeated lookups). TTL from SOA minimum field.

---

## 6.10 Reverse DNS (PTR Records)

- **Forward DNS:** Name → IP
- **Reverse DNS:** IP → Name

Uses special domain: `in-addr.arpa` (IPv4) or `ip6.arpa` (IPv6)

### IPv4 Example

```
IP: 93.184.216.34
Reverse: 34.216.184.93.in-addr.arpa
                    ^-- octets reversed
```

**Query:**

```bash
dig -x 93.184.216.34
# or
dig PTR 34.216.184.93.in-addr.arpa
```

### IPv6 Example

```
IP: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
Reverse: 4.3.3.7.0.7.3.0.e.2.a.8.0.0.0.0.0.0.0.0.3.a.5.8.8.b.d.0.1.0.0.2.ip6.arpa
```

### Uses for PTR

- Email server verification (SPF/DKIM checks)
- Logging (convert IPs to hostnames)
- Security (verify connecting hosts)
- Troubleshooting

---

## 6.11 DNS in Wireshark

### Sample DNS Query/Response

**Frame 1 - DNS Query:**

| Field             | Value                                      |
| ----------------- | ------------------------------------------ |
| Internet Protocol | Src: 192.168.1.100, Dst: 192.168.1.2       |
| UDP               | Src Port: 54321, Dst Port: 53              |
| DNS               | Standard query A www.example.com           |
| Transaction ID    | 0x4e2a                                     |
| Flags             | 0x0100 (Standard query, Recursion desired) |
| Questions         | 1                                          |
| Queries           | www.example.com: type A, class IN          |

**Frame 2 - DNS Response:**

| Field             | Value                                                            |
| ----------------- | ---------------------------------------------------------------- |
| Internet Protocol | Src: 192.168.1.2, Dst: 192.168.1.100                             |
| UDP               | Src Port: 53, Dst Port: 54321                                    |
| DNS               | Standard query response A www.example.com                        |
| Transaction ID    | 0x4e2a (matches query)                                           |
| Flags             | 0x8180 (Response, No error, Recursion available)                 |
| Questions         | 1                                                                |
| Answer RRs        | 1                                                                |
| Answers           | www.example.com: type A, class IN, addr 93.184.216.34, TTL: 3600 |

---

## 6.12 Wireshark DNS Display Filters

### Basic DNS Filters

| Filter                          | Description                 |
| ------------------------------- | --------------------------- |
| `dns`                           | All DNS traffic             |
| `dns.qry.name == "example.com"` | Queries for specific domain |
| `dns.qry.type == 1`             | A record queries only       |
| `dns.qry.type == 28`            | AAAA record queries         |
| `dns.qry.type == 15`            | MX record queries           |
| `dns.qry.type == 12`            | PTR record queries          |

### Response Filters

| Filter                    | Description                    |
| ------------------------- | ------------------------------ |
| `dns.flags.response == 1` | DNS responses only             |
| `dns.flags.response == 0` | DNS queries only               |
| `dns.flags.rcode == 0`    | Successful responses (NOERROR) |
| `dns.flags.rcode == 3`    | NXDOMAIN (not found)           |
| `dns.flags.rcode == 2`    | SERVFAIL responses             |

### Answer Filters

| Filter                   | Description                   |
| ------------------------ | ----------------------------- |
| `dns.a == 93.184.216.34` | Responses with specific IP    |
| `dns.aaaa`               | Responses with IPv6 addresses |
| `dns.resp.ttl < 60`      | Short TTL responses           |

### Flag Filters

| Filter                         | Description           |
| ------------------------------ | --------------------- |
| `dns.flags.authoritative == 1` | Authoritative answers |
| `dns.flags.truncated == 1`     | Truncated (need TCP)  |
| `dns.flags.recdesired == 1`    | Recursion desired     |
| `dns.flags.recavail == 1`      | Recursion available   |

### Security/Analysis

| Filter                            | Description                 |
| --------------------------------- | --------------------------- |
| `dns.qry.name contains "malware"` | Suspicious domain patterns  |
| `dns.count.answers > 10`          | Unusual number of answers   |
| `dns.time > 0.5`                  | Slow DNS responses (>500ms) |

### For Your Capture (DNS Server: 192.168.1.2)

| Filter                          | Description                     |
| ------------------------------- | ------------------------------- |
| `dns && ip.addr == 192.168.1.2` | All DNS to/from your DNS server |

---

## 6.13 DNS Security Considerations

### Common DNS Attacks

**1. DNS Spoofing/Cache Poisoning**

- Attacker sends fake responses to resolver
- Resolver caches malicious IP
- **Mitigation:** DNSSEC, randomize source port/transaction ID

**2. DNS Amplification (DDoS)**

- Attacker spoofs victim IP as source
- Sends queries to open resolvers
- Large responses flood victim
- **Mitigation:** Rate limiting, restrict recursion

**3. DNS Tunneling**

- Hide data in DNS queries/responses
- Bypass firewalls
- **Detection:** Unusual query patterns, long domain names

**4. DNS Hijacking**

- Modify DNS settings (router, malware)
- Redirect to malicious servers
- **Mitigation:** Secure router, use DoH/DoT

### DNSSEC (DNS Security Extensions)

- Adds digital signatures to DNS records
- Validates authenticity of responses
- Chain of trust from root
- **Record types:** RRSIG, DNSKEY, DS, NSEC/NSEC3

---

## 6.14 DNS Tools Reference

### Command Line Tools

**nslookup (Windows/Linux):**

```bash
nslookup example.com                    # Basic A record lookup
nslookup -type=mx example.com           # MX records
nslookup -type=ns example.com           # Name servers
nslookup example.com 8.8.8.8            # Use specific DNS server
```

**dig (Linux/macOS):**

```bash
dig example.com                         # A record lookup
dig example.com MX                      # MX records
dig example.com ANY                     # All records
dig @8.8.8.8 example.com               # Use specific server
dig -x 93.184.216.34                    # Reverse lookup
dig +trace example.com                  # Show resolution path
dig +short example.com                  # Concise output
```

**host (Linux):**

```bash
host example.com                        # Basic lookup
host -t MX example.com                  # MX records
host 93.184.216.34                      # Reverse lookup
```

**PowerShell (Windows):**

```powershell
Resolve-DnsName example.com             # Basic lookup
Resolve-DnsName -Type MX example.com    # MX records
```

---

## 6.15 Chapter Summary

> [!summary] Key Takeaways

**DNS BASICS:**

- Translates domain names to IP addresses
- Hierarchical structure: Root → TLD → Domain → Subdomain
- Port 53 (UDP default, TCP for large responses/zone transfers)

**RECORD TYPES:**

- **A:** IPv4 address
- **AAAA:** IPv6 address
- **CNAME:** Alias
- **MX:** Mail server (with priority)
- **NS:** Name server
- **PTR:** Reverse lookup
- **SOA:** Zone authority
- **TXT:** Text data (SPF, DKIM)
- **SRV:** Service location

**RESOLUTION:**

- **Recursive:** Resolver does all work, returns final answer
- **Iterative:** Resolver follows referrals step by step
- **Caching:** TTL controls how long records are cached

**RESPONSE CODES:**

- NOERROR (0): Success
- NXDOMAIN (3): Domain doesn't exist
- SERVFAIL (2): Server error

**WIRESHARK FILTERS:**

- `dns`, `dns.qry.name`, `dns.flags.rcode`, `dns.a`

---

_Previous: [[05 UDP and Ports]]_
_Next: [[07 HTTP, HTTPS]]_
