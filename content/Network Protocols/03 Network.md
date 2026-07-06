# Section 3: Layer 3 - Network Protocols

---

## 3.1 Overview

The **Network Layer (Layer 3)** is responsible for:

- Logical addressing (IP addresses)
- Routing packets between networks
- Path determination
- Packet fragmentation and reassembly

### Layer 3 Key Functions

1. **Logical Addressing**
   - IP addresses identify hosts globally
   - Unlike MAC (physical), IP is logical and hierarchical

2. **Routing**
   - Determines best path to destination
   - Uses routing tables and protocols (OSPF, BGP, RIP)

3. **Packet Forwarding**
   - Moves packets hop-by-hop toward destination
   - Decrements TTL at each hop

4. **Fragmentation**
   - Breaks large packets to fit MTU (Maximum Transmission Unit)
   - Reassembles at destination

---

## 3.2 IPv4 Header Structure

```
IPv4 HEADER FORMAT (20 bytes minimum, up to 60)

 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Version|  IHL  |    DSCP   |ECN|         Total Length          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Identification        |Flags|      Fragment Offset    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Time to Live |    Protocol   |         Header Checksum       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Source IP Address                       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Destination IP Address                     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options (if IHL > 5)                       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### IPv4 Header Fields Explained

| Field               | Size     | Description                                                                       |
| ------------------- | -------- | --------------------------------------------------------------------------------- |
| **Version**         | 4 bits   | IP version (4 for IPv4)                                                           |
| **IHL**             | 4 bits   | Internet Header Length (in 32-bit words). Min: 5 (20 bytes), Max: 15 (60 bytes)   |
| **DSCP**            | 6 bits   | Differentiated Services Code Point (QoS)                                          |
| **ECN**             | 2 bits   | Explicit Congestion Notification                                                  |
| **Total Length**    | 16 bits  | Total packet size (header + data). Max: 65,535 bytes                              |
| **Identification**  | 16 bits  | Unique ID for fragment reassembly                                                 |
| **Flags**           | 3 bits   | Bit 0: Reserved (0), Bit 1: DF (Don't Fragment), Bit 2: MF (More Fragments)       |
| **Fragment Offset** | 13 bits  | Position of fragment in original packet                                           |
| **TTL**             | 8 bits   | Time to Live (hop limit). Decremented at each router. Common values: 64, 128, 255 |
| **Protocol**        | 8 bits   | Upper layer protocol (1=ICMP, 6=TCP, 17=UDP)                                      |
| **Header Checksum** | 16 bits  | Error checking for header only                                                    |
| **Source IP**       | 32 bits  | Sender's IP address                                                               |
| **Destination IP**  | 32 bits  | Receiver's IP address                                                             |
| **Options**         | Variable | Optional fields (rarely used) - record route, timestamp, etc.                     |

### Protocol Numbers (Important)

| Number | Protocol                                    |
| ------ | ------------------------------------------- |
| 1      | ICMP (Internet Control Message Protocol)    |
| 2      | IGMP (Internet Group Management Protocol)   |
| 6      | TCP (Transmission Control Protocol)         |
| 17     | UDP (User Datagram Protocol)                |
| 41     | IPv6 encapsulation                          |
| 47     | GRE (Generic Routing Encapsulation)         |
| 50     | ESP (Encapsulating Security Payload)        |
| 51     | AH (Authentication Header)                  |
| 58     | ICMPv6                                      |
| 89     | OSPF (Open Shortest Path First)             |
| 132    | SCTP (Stream Control Transmission Protocol) |

---

## 3.3 IP Addressing

### IPv4 Address Structure

**Example**: 192.168.1.138 (from your PCAP)

```
Dotted Decimal:   192    .    168    .    1      .    138
                   │          │          │            │
Binary:       11000000   10101000   00000001   10001010

32 bits total = 4 octets (bytes)

+--------------------------------------------+
|         Network Portion │ Host Portion     |
|       (Determined by subnet mask)          |
+--------------------------------------------+

With /24 subnet mask (255.255.255.0):
  - Network: 192.168.1.0
  - Host: 138
  - Broadcast: 192.168.1.255
```

### IP Address Classes (Historical)

| Class | First Bits | Range                       | Default Mask        | Networks  | Hosts  |
| ----- | ---------- | --------------------------- | ------------------- | --------- | ------ |
| A     | 0          | 1.0.0.0 - 126.255.255.255   | 255.0.0.0 (/8)      | 128       | 16.7M  |
| B     | 10         | 128.0.0.0 - 191.255.255.255 | 255.255.0.0 (/16)   | 16,384    | 65,534 |
| C     | 110        | 192.0.0.0 - 223.255.255.255 | 255.255.255.0 (/24) | 2.1M      | 254    |
| D     | 1110       | 224.0.0.0 - 239.255.255.255 | N/A                 | Multicast | -      |
| E     | 1111       | 240.0.0.0 - 255.255.255.255 | N/A                 | Reserved  | -      |

> [!tip]
> Classful addressing is obsolete. CIDR is now used.

### Special/Reserved IP Addresses

| Address/Range   | Purpose                     |
| --------------- | --------------------------- |
| 0.0.0.0         | "This host" / Default route |
| 127.0.0.0/8     | Loopback (localhost)        |
| 169.254.0.0/16  | Link-local (APIPA)          |
| 255.255.255.255 | Limited broadcast           |

**Private IP Ranges (RFC 1918):**

| Range          | Class           | Description                   |
| -------------- | --------------- | ----------------------------- |
| 10.0.0.0/8     | Class A private | 10.0.0.0 - 10.255.255.255     |
| 172.16.0.0/12  | Class B private | 172.16.0.0 - 172.31.255.255   |
| 192.168.0.0/16 | Class C private | 192.168.0.0 - 192.168.255.255 |

**From your PCAP:**

- 192.168.1.x = Private network (Class C)
- 192.168.0.x = Different private subnet
- 192.168.56.x = VirtualBox host-only network

---

## 3.4 Subnetting Basics

### CIDR Notation

**CIDR (Classless Inter-Domain Routing)**

Notation: `IP_ADDRESS/PREFIX_LENGTH`

**Example**: 192.168.1.0/24

The /24 means:

- First 24 bits = Network portion
- Remaining 8 bits = Host portion
- Subnet mask = 255.255.255.0

```
Binary view:
11111111.11111111.11111111.00000000
├────────────────────────┤├────────┤
     Network (24 bits)     Host (8)
```

### Common Subnet Masks

| CIDR | Subnet Mask     | Hosts  | Binary Mask                         |
| ---- | --------------- | ------ | ----------------------------------- |
| /8   | 255.0.0.0       | 16.7M  | 11111111.00000000.00000000.00000000 |
| /16  | 255.255.0.0     | 65,534 | 11111111.11111111.00000000.00000000 |
| /24  | 255.255.255.0   | 254    | 11111111.11111111.11111111.00000000 |
| /25  | 255.255.255.128 | 126    | 11111111.11111111.11111111.10000000 |
| /26  | 255.255.255.192 | 62     | 11111111.11111111.11111111.11000000 |
| /27  | 255.255.255.224 | 30     | 11111111.11111111.11111111.11100000 |
| /28  | 255.255.255.240 | 14     | 11111111.11111111.11111111.11110000 |
| /29  | 255.255.255.248 | 6      | 11111111.11111111.11111111.11111000 |
| /30  | 255.255.255.252 | 2      | 11111111.11111111.11111111.11111100 |
| /31  | 255.255.255.254 | 2\*    | 11111111.11111111.11111111.11111110 |
| /32  | 255.255.255.255 | 1      | 11111111.11111111.11111111.11111111 |

\* /31 is used for point-to-point links (RFC 3021)

**Formula**: Usable hosts = 2^(32-prefix) - 2  
(Minus 2 for network address and broadcast address)

### Subnetting Example

**Given**: 192.168.1.138/24 (from your PCAP)

**Step 1: Convert to binary**

```
IP:   11000000.10101000.00000001.10001010
Mask: 11111111.11111111.11111111.00000000
```

**Step 2: Calculate network address (IP AND Mask)**

```
Network: 11000000.10101000.00000001.00000000 = 192.168.1.0
```

**Step 3: Calculate broadcast address**

```
Broadcast: 11000000.10101000.00000001.11111111 = 192.168.1.255
```

**Step 4: Determine host range**

```
First host:  192.168.1.1
Last host:   192.168.1.254
Total hosts: 254 usable
```

**Summary:**

| Property        | Value               |
| --------------- | ------------------- |
| Network Address | 192.168.1.0         |
| Subnet Mask     | 255.255.255.0 (/24) |
| First Usable    | 192.168.1.1         |
| Last Usable     | 192.168.1.254       |
| Broadcast       | 192.168.1.255       |
| Total Usable    | 254 hosts           |

---

## 3.5 ICMP (Internet Control Message Protocol)

ICMP is used for network diagnostics and error reporting.

### ICMP Header Structure

```
ICMP HEADER FORMAT

 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Type      |     Code      |          Checksum             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                   Type-specific Data                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

Minimum size: 8 bytes
```

### Common ICMP Types and Codes

| Type | Code | Description                                   |
| ---- | ---- | --------------------------------------------- |
| 0    | 0    | Echo Reply (ping response)                    |
| 3    | -    | **Destination Unreachable**                   |
| 3    | 0    | Network unreachable                           |
| 3    | 1    | Host unreachable                              |
| 3    | 2    | Protocol unreachable                          |
| 3    | 3    | Port unreachable (important!)                 |
| 3    | 4    | Fragmentation needed but DF set               |
| 3    | 13   | Communication prohibited (firewall)           |
| 4    | 0    | Source Quench (deprecated)                    |
| 5    | -    | **Redirect**                                  |
| 5    | 0    | Network redirect                              |
| 5    | 1    | Host redirect                                 |
| 8    | 0    | Echo Request (ping request)                   |
| 9    | 0    | Router Advertisement                          |
| 10   | 0    | Router Solicitation                           |
| 11   | -    | **Time Exceeded**                             |
| 11   | 0    | TTL expired in transit (traceroute uses this) |
| 11   | 1    | Fragment reassembly time exceeded             |
| 13   | 0    | Timestamp Request                             |
| 14   | 0    | Timestamp Reply                               |

### How Ping Works

```
Host A                                                       Host B
   │                                                            │
   │  ICMP Echo Request (Type 8, Code 0)                       │
   │───────────────────────────────────────────────────────────►│
   │                                                            │
   │  ICMP Echo Reply (Type 0, Code 0)                         │
   │◄───────────────────────────────────────────────────────────│
   │                                                            │

Command: ping 192.168.1.138
Output shows: RTT (Round Trip Time), TTL, packet loss
```

### How Traceroute Works

Traceroute discovers the path packets take by:

1. Sending packets with incrementing TTL values
2. Each router decrements TTL and replies with "Time Exceeded"

```
Host ──► Router1 ──► Router2 ──► Router3 ──► Destination

TTL=1: Router1 replies (TTL expired)
TTL=2: Router2 replies (TTL expired)
TTL=3: Router3 replies (TTL expired)
TTL=4: Destination replies (Echo Reply or Port Unreachable)
```

**Commands:**

- Windows: `tracert 8.8.8.8`
- Linux: `traceroute 8.8.8.8`

### ICMP Security Considerations

**Attacks Using ICMP:**

- **Ping of Death**: Oversized ICMP packets crash systems
- **Smurf Attack**: ICMP broadcast amplification DDoS
- **ICMP Flood**: Overwhelm target with ping requests
- **ICMP Redirect**: Manipulate routing tables
- **ICMP Tunneling**: Covert data channel

**Information Disclosure:**

- OS fingerprinting via ICMP responses
- Network mapping via ping sweeps
- Path discovery via traceroute

**Mitigations:**

- Rate-limit ICMP at firewall
- Block ICMP Redirect messages
- Disable ICMP timestamp responses
- Don't block all ICMP (breaks Path MTU Discovery)

---

## 3.6 IGMP (Internet Group Management Protocol)

IGMP manages multicast group membership.

**Purpose**: Allows hosts to join/leave multicast groups

**From your PCAP:**

```
06:52:11.659560 IP 192.168.1.1 > 224.0.0.22: igmp v3 report
```

- 224.0.0.22 = IGMP multicast address
- IGMPv3 report = Membership report

**IGMP Message Types:**

- **Membership Query**: Router asks "who wants this group?"
- **Membership Report**: Host says "I want this group"
- **Leave Group**: Host says "I'm leaving this group"

**Common Multicast Addresses:**

| Address     | Purpose               |
| ----------- | --------------------- |
| 224.0.0.1   | All hosts on segment  |
| 224.0.0.2   | All multicast routers |
| 224.0.0.22  | IGMP                  |
| 224.0.0.251 | mDNS                  |
| 224.0.0.252 | LLMNR                 |

---

## 3.7 IPv6 Overview

### IPv6 Header Format (Fixed 40 bytes)

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Version| Traffic Class |           Flow Label                  |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Payload Length        |  Next Header  |   Hop Limit   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                                                               +
|                       Source Address                          |
+                        (128 bits)                             +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
+                                                               +
|                    Destination Address                        |
+                        (128 bits)                             +
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### IPv4 vs IPv6 Comparison

| Feature        | IPv4            | IPv6                      |
| -------------- | --------------- | ------------------------- |
| Address Size   | 32 bits         | 128 bits                  |
| Address Format | Dotted decimal  | Hexadecimal with colons   |
| Example        | 192.168.1.138   | fe80::8946:45f6:719f:3edf |
| Address Space  | ~4.3 billion    | ~340 undecillion          |
| Header Size    | 20-60 bytes     | Fixed 40 bytes            |
| Checksum       | Yes             | No (relies on L2/L4)      |
| Fragmentation  | Routers & hosts | Only source host          |
| ARP            | Yes             | No (uses NDP)             |
| Broadcast      | Yes             | No (uses multicast)       |
| IPsec          | Optional        | Built-in                  |
| Configuration  | DHCP/Manual     | SLAAC/DHCPv6              |

**From your PCAP (IPv6 traffic):**

```
fe80::8946:45f6:719f:3edf > ff02::16 (Multicast Listener Report)
```

---

## 3.8 Layer 3 Wireshark Filters

### IPv4 Filters

| Filter                     | Description                   |
| -------------------------- | ----------------------------- |
| `ip`                       | All IPv4 traffic              |
| `ip.addr == 192.168.1.138` | Source OR destination         |
| `ip.src == 192.168.1.138`  | Source only                   |
| `ip.dst == 192.168.1.138`  | Destination only              |
| `ip.src == 192.168.1.0/24` | Source subnet                 |
| `ip.ttl < 10`              | Low TTL (traceroute, attacks) |
| `ip.ttl == 64`             | Typical Linux TTL             |
| `ip.ttl == 128`            | Typical Windows TTL           |
| `ip.proto == 6`            | TCP traffic                   |
| `ip.proto == 17`           | UDP traffic                   |
| `ip.proto == 1`            | ICMP traffic                  |
| `ip.flags.df == 1`         | Don't Fragment set            |
| `ip.flags.mf == 1`         | More Fragments set            |
| `ip.frag_offset > 0`       | Fragmented packets            |
| `ip.checksum_bad == 1`     | Bad checksum                  |

### IPv6 Filters

| Filter                 | Description                       |
| ---------------------- | --------------------------------- |
| `ipv6`                 | All IPv6 traffic                  |
| `ipv6.addr == fe80::1` | Source OR destination             |
| `ipv6.src == fe80::1`  | Source only                       |
| `ipv6.dst == ff02::1`  | Destination (all nodes multicast) |
| `ipv6.hlim < 10`       | Low hop limit                     |

### ICMP Filters

| Filter                             | Description                |
| ---------------------------------- | -------------------------- |
| `icmp`                             | All ICMP traffic           |
| `icmp.type == 8`                   | Echo Request (ping)        |
| `icmp.type == 0`                   | Echo Reply                 |
| `icmp.type == 3`                   | Destination Unreachable    |
| `icmp.type == 3 && icmp.code == 3` | Port Unreachable           |
| `icmp.type == 11`                  | Time Exceeded (traceroute) |
| `icmp.type == 5`                   | Redirect (suspicious!)     |

### IGMP Filters

| Filter              | Description          |
| ------------------- | -------------------- |
| `igmp`              | All IGMP traffic     |
| `igmp.type == 0x22` | Membership Report v3 |

### Subnet Filters

| Filter                      | Description                  |
| --------------------------- | ---------------------------- |
| `ip.src == 10.0.0.0/8`      | Source in 10.x.x.x           |
| `ip.dst == 172.16.0.0/12`   | Destination in 172.16-31.x.x |
| `ip.addr == 192.168.0.0/16` | Either in 192.168.x.x        |

### Combination Examples

| Filter                             | Description             |
| ---------------------------------- | ----------------------- |
| `ip.src == 192.168.1.138 && icmp`  | ICMP from specific host |
| `ip.addr == 192.168.1.138 && !arp` | IP traffic, not ARP     |
| `ip.ttl < 5 && !icmp.type == 11`   | Suspicious low TTL      |

---

## 3.9 Chapter Summary

> [!summary]
> **Key Takeaways:**
>
> - Layer 3 handles logical addressing and routing between networks
> - IPv4 header: 20+ bytes, includes TTL, Protocol, Source/Dest IP
> - IP addresses: Network portion + Host portion (defined by subnet mask)
> - CIDR notation: /24 = 255.255.255.0 = 254 usable hosts
> - Private IP ranges: 10.x.x.x, 172.16-31.x.x, 192.168.x.x
> - ICMP: Diagnostics (ping, traceroute) and error reporting
> - TTL prevents packets from looping forever (decremented each hop)
>
> **From your PCAP:**
>
> - 192.168.1.x subnet (VoIP devices)
> - 192.168.0.x subnet (different network)
> - 192.168.56.x (VirtualBox)
> - IGMP multicast traffic present

---

_Next: [[04 TCP]] - TCP 3-Way Handshake, Flags, Flow Control_
