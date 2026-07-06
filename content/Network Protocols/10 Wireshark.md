# Section 10: Wireshark Cheatsheet & Practical Analysis

---

## 10.1 Display Filters vs Capture Filters

### Capture Filters (BPF Syntax)

- Applied **during** capture
- Reduces capture file size
- Cannot be changed while capturing
- Uses Berkeley Packet Filter (BPF) syntax
- Set in: **Capture > Options > [interface] > Capture filter**

### Display Filters (Wireshark Syntax)

- Applied **after** capture
- Filters what you see, not what's captured
- Can be changed anytime
- Richer, more powerful syntax
- Set in: **Filter toolbar** at top of window

### Syntax Comparison

| Purpose    | Capture Filter (BPF)    | Display Filter (Wireshark)  |
| ---------- | ----------------------- | --------------------------- |
| Host IP    | `host 192.168.1.1`      | `ip.addr == 192.168.1.1`    |
| Source IP  | `src host 192.168.1.1`  | `ip.src == 192.168.1.1`     |
| Dest IP    | `dst host 192.168.1.1`  | `ip.dst == 192.168.1.1`     |
| Port       | `port 80`               | `tcp.port == 80`            |
| Port range | `portrange 10000-20000` | `tcp.port >= 10000`         |
| Protocol   | `tcp`, `udp`, `icmp`    | `tcp`, `udp`, `icmp`        |
| Network    | `net 192.168.1.0/24`    | `ip.addr == 192.168.1.0/24` |
| Not        | `not`, `!`              | `not`, `!`                  |
| And        | `and`, `&&`             | `and`, `&&`                 |
| Or         | `or`, `\|\|`            | `or`, `\|\|`                |

---

## 10.2 Display Filter Quick Reference

### IP and Ethernet Filters

**IP Address Filters:**

| Filter                                               | Description         |
| ---------------------------------------------------- | ------------------- |
| `ip.addr == 192.168.1.1`                             | Traffic to/from IP  |
| `ip.src == 192.168.1.1`                              | Source IP only      |
| `ip.dst == 192.168.1.1`                              | Destination IP only |
| `ip.addr == 192.168.1.0/24`                          | Entire subnet       |
| `ip.src == 192.168.1.0/24`                           | Source from subnet  |
| `!(ip.addr == 192.168.1.1)`                          | Exclude IP          |
| `ip.addr == 192.168.1.1 \|\| ip.addr == 192.168.1.2` | Multiple IPs        |

**IPv6 Filters:**

| Filter                    | Description      |
| ------------------------- | ---------------- |
| `ipv6.addr == fe80::1`    | IPv6 address     |
| `ipv6.src == 2001:db8::1` | IPv6 source      |
| `ipv6`                    | All IPv6 traffic |

**Ethernet Filters:**

| Filter                          | Description              |
| ------------------------------- | ------------------------ |
| `eth.addr == aa:bb:cc:dd:ee:ff` | MAC address (src or dst) |
| `eth.src == aa:bb:cc:dd:ee:ff`  | Source MAC               |
| `eth.dst == aa:bb:cc:dd:ee:ff`  | Destination MAC          |
| `eth.dst == ff:ff:ff:ff:ff:ff`  | Broadcast frames         |
| `eth.type == 0x0800`            | IPv4 frames              |
| `eth.type == 0x0806`            | ARP frames               |
| `eth.type == 0x86dd`            | IPv6 frames              |

**ARP Filters:**

| Filter                              | Description         |
| ----------------------------------- | ------------------- |
| `arp`                               | All ARP traffic     |
| `arp.opcode == 1`                   | ARP requests        |
| `arp.opcode == 2`                   | ARP replies         |
| `arp.src.proto_ipv4 == 192.168.1.1` | ARP for specific IP |

### TCP and UDP Filters

**TCP Filters:**

| Filter                                | Description            |
| ------------------------------------- | ---------------------- |
| `tcp`                                 | All TCP traffic        |
| `tcp.port == 80`                      | Source OR dest port 80 |
| `tcp.srcport == 443`                  | Source port 443        |
| `tcp.dstport == 22`                   | Destination port 22    |
| `tcp.port == 80 \|\| tcp.port == 443` | Multiple ports         |
| `tcp.port >= 1 && tcp.port <= 1024`   | Port range             |

**TCP Flags:**

| Filter                                     | Description                |
| ------------------------------------------ | -------------------------- |
| `tcp.flags.syn == 1`                       | SYN flag set               |
| `tcp.flags.ack == 1`                       | ACK flag set               |
| `tcp.flags.fin == 1`                       | FIN flag set               |
| `tcp.flags.reset == 1`                     | RST flag set               |
| `tcp.flags.push == 1`                      | PSH flag set               |
| `tcp.flags.syn == 1 && tcp.flags.ack == 0` | SYN only (new connections) |
| `tcp.flags.syn == 1 && tcp.flags.ack == 1` | SYN-ACK                    |

**TCP Analysis:**

| Filter                             | Description            |
| ---------------------------------- | ---------------------- |
| `tcp.analysis.retransmission`      | Retransmissions        |
| `tcp.analysis.duplicate_ack`       | Duplicate ACKs         |
| `tcp.analysis.lost_segment`        | Lost segments          |
| `tcp.analysis.zero_window`         | Zero window            |
| `tcp.analysis.window_full`         | Window full            |
| `tcp.analysis.fast_retransmission` | Fast retransmits       |
| `tcp.analysis.flags`               | Any TCP analysis flags |

**TCP Stream:**

| Filter            | Description                      |
| ----------------- | -------------------------------- |
| `tcp.stream == 5` | Follow specific stream           |
| `tcp.len > 0`     | TCP with payload                 |
| `tcp.len == 0`    | TCP without payload (ACKs, etc.) |

**UDP Filters:**

| Filter                | Description               |
| --------------------- | ------------------------- |
| `udp`                 | All UDP traffic           |
| `udp.port == 53`      | DNS port                  |
| `udp.srcport == 67`   | DHCP server               |
| `udp.dstport == 5060` | SIP destination           |
| `udp.length > 100`    | UDP larger than 100 bytes |

### Protocol-Specific Filters

**DNS:**

| Filter                           | Description            |
| -------------------------------- | ---------------------- |
| `dns`                            | All DNS traffic        |
| `dns.qry.name == "example.com"`  | Query for domain       |
| `dns.qry.name contains "google"` | Domain contains string |
| `dns.qry.type == 1`              | A record queries       |
| `dns.qry.type == 28`             | AAAA record queries    |
| `dns.qry.type == 15`             | MX record queries      |
| `dns.flags.response == 0`        | DNS queries only       |
| `dns.flags.response == 1`        | DNS responses only     |
| `dns.flags.rcode == 0`           | Successful (NOERROR)   |
| `dns.flags.rcode == 3`           | NXDOMAIN (not found)   |

**HTTP:**

| Filter                               | Description         |
| ------------------------------------ | ------------------- |
| `http`                               | All HTTP traffic    |
| `http.request`                       | HTTP requests       |
| `http.response`                      | HTTP responses      |
| `http.request.method == "GET"`       | GET requests        |
| `http.request.method == "POST"`      | POST requests       |
| `http.response.code == 200`          | 200 OK responses    |
| `http.response.code >= 400`          | Error responses     |
| `http.host == "example.com"`         | Host header         |
| `http.request.uri contains "/api"`   | URI contains string |
| `http.content_type contains "json"`  | JSON content        |
| `http.user_agent contains "Mozilla"` | Browser traffic     |

**TLS/SSL:**

| Filter                                                  | Description        |
| ------------------------------------------------------- | ------------------ |
| `tls`                                                   | All TLS traffic    |
| `tls.handshake`                                         | TLS handshake only |
| `tls.handshake.type == 1`                               | Client Hello       |
| `tls.handshake.type == 2`                               | Server Hello       |
| `tls.handshake.type == 11`                              | Certificate        |
| `tls.record.content_type == 23`                         | Application Data   |
| `tls.alert_message`                                     | TLS alerts         |
| `tls.handshake.extensions.server_name == "example.com"` | SNI                |

**DHCP:**

| Filter                                   | Description      |
| ---------------------------------------- | ---------------- |
| `dhcp`                                   | All DHCP traffic |
| `dhcp.type == 1`                         | DHCP Discover    |
| `dhcp.type == 2`                         | DHCP Offer       |
| `dhcp.type == 3`                         | DHCP Request     |
| `dhcp.type == 5`                         | DHCP ACK         |
| `bootp.hw.mac_addr == aa:bb:cc:dd:ee:ff` | Specific client  |

**ICMP:**

| Filter            | Description                |
| ----------------- | -------------------------- |
| `icmp`            | All ICMP traffic           |
| `icmp.type == 8`  | Echo request (ping)        |
| `icmp.type == 0`  | Echo reply                 |
| `icmp.type == 3`  | Destination unreachable    |
| `icmp.type == 11` | Time exceeded (traceroute) |

### VoIP Filters (SIP/RTP)

**SIP:**

| Filter                       | Description                  |
| ---------------------------- | ---------------------------- |
| `sip`                        | All SIP traffic              |
| `sip.Method == "INVITE"`     | INVITE requests (call setup) |
| `sip.Method == "BYE"`        | BYE requests (call end)      |
| `sip.Method == "REGISTER"`   | Registration                 |
| `sip.Method == "ACK"`        | ACK messages                 |
| `sip.Status-Code == 200`     | 200 OK responses             |
| `sip.Status-Code == 180`     | Ringing                      |
| `sip.Status-Code >= 400`     | Errors (4xx, 5xx, 6xx)       |
| `sip.From contains "1234"`   | From extension 1234          |
| `sip.To contains "4321"`     | To extension 4321            |
| `sip.Call-ID == "unique-id"` | Specific call                |

**RTP:**

| Filter                   | Description        |
| ------------------------ | ------------------ |
| `rtp`                    | All RTP traffic    |
| `rtcp`                   | All RTCP traffic   |
| `rtp.p_type == 0`        | PCMU (G.711 u-law) |
| `rtp.p_type == 8`        | PCMA (G.711 A-law) |
| `rtp.ssrc == 0x12345678` | Specific SSRC      |
| `rtp.marker == 1`        | Marker bit set     |

---

## 10.3 Capture Filter Quick Reference

**Host Filters:**

| Filter                 | Description          |
| ---------------------- | -------------------- |
| `host 192.168.1.1`     | Traffic to/from host |
| `src host 192.168.1.1` | Source only          |
| `dst host 192.168.1.1` | Destination only     |
| `not host 192.168.1.1` | Exclude host         |

**Network Filters:**

| Filter                               | Description         |
| ------------------------------------ | ------------------- |
| `net 192.168.1.0/24`                 | Entire subnet       |
| `net 192.168.1.0 mask 255.255.255.0` | Same as above       |
| `src net 10.0.0.0/8`                 | Source from network |

**Port Filters:**

| Filter                  | Description           |
| ----------------------- | --------------------- |
| `port 80`               | TCP/UDP port 80       |
| `tcp port 443`          | TCP port 443 only     |
| `udp port 53`           | UDP port 53 only      |
| `src port 67`           | Source port 67        |
| `dst port 5060`         | Destination port 5060 |
| `portrange 10000-20000` | Port range            |

**Protocol Filters:**

| Filter | Description |
| ------ | ----------- |
| `tcp`  | TCP only    |
| `udp`  | UDP only    |
| `icmp` | ICMP only   |
| `arp`  | ARP only    |
| `ip`   | IPv4 only   |
| `ip6`  | IPv6 only   |

**Combining Filters:**

| Filter                                           | Description        |
| ------------------------------------------------ | ------------------ |
| `host 192.168.1.1 and tcp port 80`               | Host AND port      |
| `tcp port 80 or tcp port 443`                    | Multiple ports     |
| `host 192.168.1.1 and not port 22`               | Exclude port       |
| `(host 192.168.1.1 or host 192.168.1.2) and tcp` | Grouped conditions |

**Special Filters:**

| Filter                            | Description                 |
| --------------------------------- | --------------------------- |
| `broadcast`                       | Broadcast traffic           |
| `multicast`                       | Multicast traffic           |
| `not broadcast and not multicast` | Exclude broadcast/multicast |
| `ether host aa:bb:cc:dd:ee:ff`    | Specific MAC address        |

---

## 10.4 Filter Operators and Syntax

### Comparison Operators

| Operator | Alias | Description      | Example                     |
| -------- | ----- | ---------------- | --------------------------- |
| `==`     | `eq`  | Equal            | `ip.addr == 192.168.1.1`    |
| `!=`     | `ne`  | Not equal        | `ip.addr != 192.168.1.1`    |
| `>`      | `gt`  | Greater than     | `frame.len > 100`           |
| `<`      | `lt`  | Less than        | `tcp.window_size < 1000`    |
| `>=`     | `ge`  | Greater or equal | `http.response.code >= 400` |
| `<=`     | `le`  | Less or equal    | `tcp.port <= 1024`          |

### Logical Operators

| Operator | Alias | Description | Example                                   |
| -------- | ----- | ----------- | ----------------------------------------- |
| `&&`     | `and` | Logical AND | `ip.src == 192.168.1.1 && tcp.port == 80` |
| `\|\|`   | `or`  | Logical OR  | `tcp.port == 80 \|\| tcp.port == 443`     |
| `!`      | `not` | Logical NOT | `!arp`                                    |

### String Operators

| Operator   | Description       | Example                         |
| ---------- | ----------------- | ------------------------------- |
| `contains` | String contains   | `http.host contains "google"`   |
| `matches`  | Regex match       | `http.host matches ".*\\.com$"` |
| `~`        | Regex (alternate) | `http.host ~ "api"`             |

### Membership Operators

| Operator | Description  | Example                                  |
| -------- | ------------ | ---------------------------------------- |
| `in`     | Value in set | `tcp.port in {80, 443, 8080}`            |
| `in`     | String set   | `http.request.method in {"GET", "POST"}` |

### Slice Operators

| Operator | Description | Example                    |
| -------- | ----------- | -------------------------- |
| `[n:m]`  | Byte slice  | `eth.src[0:3] == aa:bb:cc` |
| `[n]`    | Single byte | `ip.proto[0] == 6`         |

### Parentheses for Grouping

Use `()` for grouping and precedence:

```
(ip.src == 192.168.1.1 || ip.src == 192.168.1.2) && tcp.port == 80
```

---

## 10.5 Practical Analysis Workflow

### Step 1: Initial Assessment

- **Statistics > Capture File Properties** - Duration, size, packets
- **Statistics > Protocol Hierarchy** - Protocol distribution
- **Statistics > Conversations** - Top talkers
- **Statistics > Endpoints** - All hosts

### Step 2: Identify Traffic Patterns

- **Statistics > I/O Graph** - Traffic over time
- Look for spikes, patterns, anomalies
- Identify time ranges of interest

### Step 3: Filter Down

- Apply display filters to focus on specific traffic
- Right-click > **Follow > TCP/UDP Stream** (conversation view)
- Right-click > **Apply as Filter** (quick filtering)

### Step 4: Deep Analysis

- Examine specific packets in detail pane
- Check TCP analysis flags for problems
- Use expert info: **Analyze > Expert Information**

### Step 5: Document Findings

- **File > Export Packet Dissections** - Save analysis
- **File > Export Specified Packets** - Save subset
- Take screenshots of relevant views

### Common Analysis Scenarios

**Slow Web Page Load:**

1. Filter: `http.host == "slowsite.com"`
2. Check: DNS resolution time (`dns.time`)
3. Check: TCP handshake time
4. Check: Time to first byte (HTTP response)
5. Check: `tcp.analysis.retransmission`
6. Follow TCP stream to see request/response

**Connection Refused:**

1. Filter: `tcp.flags.reset == 1`
2. Look for RST packets
3. Check: `icmp.type == 3` (unreachable)
4. Verify destination port is correct
5. Check if SYN-ACK received before RST

**Packet Loss / Retransmissions:**

1. Filter: `tcp.analysis.retransmission`
2. Filter: `tcp.analysis.duplicate_ack`
3. Check: `tcp.analysis.lost_segment`
4. **Statistics > TCP Stream Graph > Round Trip Time**
5. Look for patterns (specific host, time of day)

**VoIP Quality Issues:**

1. **Telephony > VoIP Calls** (list all calls)
2. **Telephony > RTP > RTP Streams**
3. Check: Lost packets percentage
4. Check: Jitter values (should be < 30ms)
5. Filter: `rtp && ip.addr == 192.168.1.130`
6. "Play Streams" to hear audio quality

**DHCP Issues:**

1. Filter: `dhcp`
2. Look for DORA sequence (Discover, Offer, Request, ACK)
3. Check: `dhcp.type == 6` (NAK = failure)
4. Verify server is responding to Discover
5. Check for duplicate IP addresses

**DNS Resolution Problems:**

1. Filter: `dns`
2. Check: `dns.flags.rcode != 0` (errors)
3. Check: `dns.flags.rcode == 3` (NXDOMAIN)
4. Verify DNS server is responding
5. Check response time: `dns.time > 1`

---

## 10.6 Statistics Menu Quick Reference

### General Statistics

| Menu Item               | Description                      |
| ----------------------- | -------------------------------- |
| Capture File Properties | File info, duration, size        |
| Protocol Hierarchy      | Breakdown by protocol            |
| Conversations           | Communication pairs (L2-L4)      |
| Endpoints               | All source/destination addresses |
| Packet Lengths          | Size distribution                |

### Network Statistics

| Menu Item          | Description          |
| ------------------ | -------------------- |
| Resolved Addresses | Hostname resolutions |
| IPv4 Statistics    | IP-specific stats    |
| IPv6 Statistics    | IPv6-specific stats  |

### TCP Statistics

**TCP Stream Graphs:**

- **Round Trip Time** - RTT over time
- **Throughput** - Bandwidth over time
- **Window Scaling** - Window size changes
- **Stevens-style** - Classic time-sequence

### Protocol-Specific

| Menu Item                | Description             |
| ------------------------ | ----------------------- |
| DNS                      | DNS statistics          |
| HTTP > Requests          | HTTP request statistics |
| HTTP > Load Distribution | Request distribution    |
| HTTP > Packet Counter    | HTTP packet counts      |

### I/O Graph

- Customizable traffic graph
- Add multiple filter-based series
- Export as image

### Flow Graph

- Sequence diagram (ladder diagram)
- Great for TCP handshakes, SIP calls

---

## 10.7 Keyboard Shortcuts

### Navigation

| Shortcut    | Action                          |
| ----------- | ------------------------------- |
| `Ctrl+G`    | Go to packet number             |
| `Ctrl+F`    | Find packet                     |
| `Ctrl+N`    | Next packet matching filter     |
| `Ctrl+B`    | Previous packet matching filter |
| `Ctrl+Home` | First packet                    |
| `Ctrl+End`  | Last packet                     |
| `Tab`       | Move between panes              |

### Capture

| Shortcut | Action          |
| -------- | --------------- |
| `Ctrl+E` | Start capture   |
| `Ctrl+K` | Stop capture    |
| `Ctrl+R` | Restart capture |

### File

| Shortcut       | Action            |
| -------------- | ----------------- |
| `Ctrl+O`       | Open capture file |
| `Ctrl+S`       | Save capture file |
| `Ctrl+Shift+S` | Save As           |
| `Ctrl+W`       | Close file        |
| `Ctrl+Q`       | Quit Wireshark    |

### Editing

| Shortcut       | Action                     |
| -------------- | -------------------------- |
| `Ctrl+C`       | Copy                       |
| `Ctrl+Shift+C` | Copy as Filter             |
| `Ctrl+M`       | Mark/Unmark packet         |
| `Ctrl+T`       | Toggle time display format |

### Display

| Shortcut       | Action                      |
| -------------- | --------------------------- |
| `Ctrl+H`       | Hide display filter toolbar |
| `Ctrl+/`       | Apply display filter        |
| `Ctrl+Shift+O` | Edit preferences            |
| `Ctrl++`       | Zoom in                     |
| `Ctrl+-`       | Zoom out                    |

---

## 10.8 Color Rules Reference

### Default Color Rules

| Color           | Meaning                    |
| --------------- | -------------------------- |
| Light Purple    | TCP                        |
| Light Blue      | UDP                        |
| Light Green     | HTTP                       |
| Light Yellow    | ICMP/IGMP                  |
| Pink            | TCP errors (RST, problems) |
| Black on Red    | Bad checksum, malformed    |
| Black on Yellow | Warnings                   |
| Green on White  | Routing protocols          |
| Cyan            | Broadcast/Multicast        |

### Customize

**View > Coloring Rules**

- Add custom rules
- Modify existing rules
- Import/Export rule sets

### Temporary Coloring

**View > Colorize Conversation**

- Quick color specific conversation
- 10 preset colors available

---

## 10.9 Quick Reference Card

> [!tip] Print This!

### Essential Display Filters

| Filter               | Description        |
| -------------------- | ------------------ |
| `ip.addr == X`       | Traffic to/from IP |
| `ip.src == X`        | Source IP          |
| `ip.dst == X`        | Destination IP     |
| `tcp.port == X`      | TCP port           |
| `udp.port == X`      | UDP port           |
| `tcp.flags.syn == 1` | SYN packets        |
| `tcp.analysis.flags` | TCP problems       |
| `eth.addr == X`      | MAC address        |
| `arp`                | ARP traffic        |
| `icmp`               | ICMP traffic       |
| `http`               | HTTP traffic       |
| `dns`                | DNS traffic        |
| `tls`                | TLS traffic        |
| `sip`                | SIP traffic        |
| `rtp`                | RTP traffic        |

### Operators

| Category   | Operators                        |
| ---------- | -------------------------------- |
| Comparison | `==`, `!=`, `>`, `<`, `>=`, `<=` |
| Logical    | `&&`, `\|\|`, `!` (and, or, not) |
| String     | `contains`, `matches`            |
| Membership | `in {a, b, c}`                   |

### Capture Filters (BPF)

| Filter          | Description          |
| --------------- | -------------------- |
| `host X`        | Traffic to/from host |
| `src host X`    | Source only          |
| `dst host X`    | Destination only     |
| `net X/Y`       | Subnet               |
| `port X`        | Port                 |
| `tcp port X`    | TCP port             |
| `udp port X`    | UDP port             |
| `portrange X-Y` | Port range           |

### Key Shortcuts

| Shortcut | Action        |
| -------- | ------------- |
| `Ctrl+G` | Go to packet  |
| `Ctrl+F` | Find          |
| `Ctrl+E` | Start capture |
| `Ctrl+K` | Stop capture  |
| `Tab`    | Switch panes  |
| `Ctrl+/` | Apply filter  |

### Statistics Menu

- Protocol Hierarchy
- Conversations
- Endpoints
- I/O Graph

### Telephony Menu (VoIP)

- VoIP Calls
- RTP Streams
- SIP Flows
- Play Streams

---

## 10.10 Chapter Summary

> [!summary] Key Takeaways
>
> **Display vs Capture Filters:**
>
> - Capture: BPF syntax, applied during capture
> - Display: Wireshark syntax, applied after capture
>
> **Common Filter Patterns:**
>
> - `ip.addr == X` - Traffic to/from IP
> - `tcp.port == X` - TCP port (src or dst)
> - `tcp.flags.syn == 1` - SYN packets
> - `tcp.analysis.flags` - TCP problems
> - `[protocol]` - All traffic for protocol
>
> **Analysis Workflow:**
>
> 1. Statistics > Protocol Hierarchy (overview)
> 2. Statistics > Conversations (top talkers)
> 3. Apply filters to focus
> 4. Follow streams for detail
> 5. Check Expert Information
>
> **VoIP Analysis:**
>
> - Telephony > VoIP Calls (call list)
> - Telephony > RTP > RTP Streams (quality)
> - Play Streams to hear audio
>
> **Keyboard Shortcuts:**
>
> - `Ctrl+G`: Go to packet
> - `Ctrl+F`: Find packet
> - `Tab`: Switch panes

---

## Navigation

**Previous:** [[09 VoIP Protocols]] | **Home:** [[00 Table of Contents]]
