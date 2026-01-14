# Section 1: Introduction & OSI Model

---

## 1.1 What is the OSI Model?

The **Open Systems Interconnection (OSI) Model** is a conceptual framework that standardizes how different network protocols communicate. Developed by the International Organization for Standardization (ISO) in 1984, it divides network communication into **seven distinct layers**.

### Why OSI Matters

The OSI Model helps us:

- Understand how data flows through a network
- Troubleshoot network problems layer by layer
- Design and implement network protocols
- Communicate using standard terminology
- Analyze packet captures (like in Wireshark)

---

## 1.2 The Seven Layers - Visual Breakdown

```
                        OSI MODEL - 7 LAYERS

  Layer    Name            Function                    Protocols/Examples

    7    APPLICATION    User interface & services      HTTP, DNS, FTP,
                        Network applications           SMTP, SSH, SIP

    6    PRESENTATION   Data formatting & encryption   SSL/TLS, JPEG,
                        Compression, encoding          MPEG, ASCII

    5    SESSION        Session management             NetBIOS, RPC,
                        Dialog control                 PPTP, SIP

    4    TRANSPORT      End-to-end delivery            TCP, UDP,
                        Segmentation, flow control     SCTP, RTP

    3    NETWORK        Logical addressing & routing   IP, ICMP, IGMP,
                        Path determination             IPsec, ARP*

    2    DATA LINK      Physical addressing            Ethernet, Wi-Fi,
                        Frame transmission             PPP, ARP*

    1    PHYSICAL       Bit transmission               Cables, Hubs,
                        Electrical/optical signals     NICs, Repeaters

  * ARP operates between Layer 2 and Layer 3
```

---

## 1.3 Memory Trick - Remember the Layers

### Top-Down (Layer 7 to 1)

> [!tip] "All People Seem To Need Data Processing"

| Letter | Layer | Name         |
| ------ | ----- | ------------ |
| A      | 7     | Application  |
| P      | 6     | Presentation |
| S      | 5     | Session      |
| T      | 4     | Transport    |
| N      | 3     | Network      |
| D      | 2     | Data Link    |
| P      | 1     | Physical     |

### Bottom-Up (Layer 1 to 7)

> [!tip] "Please Do Not Throw Sausage Pizza Away"

| Letter | Layer | Name         |
| ------ | ----- | ------------ |
| P      | 1     | Physical     |
| D      | 2     | Data Link    |
| N      | 3     | Network      |
| T      | 4     | Transport    |
| S      | 5     | Session      |
| P      | 6     | Presentation |
| A      | 7     | Application  |

---

## 1.4 OSI vs TCP/IP Model Comparison

```
    OSI MODEL (7 Layers)              TCP/IP MODEL (4 Layers)

    ┌──────────────────┐              ┌──────────────────┐
    │   Application    │──────────────│                  │
    ├──────────────────┤              │   Application    │
    │   Presentation   │──────────────│                  │
    ├──────────────────┤              │                  │
    │   Session        │──────────────│                  │
    ├──────────────────┤              ├──────────────────┤
    │   Transport      │──────────────│   Transport      │
    ├──────────────────┤              ├──────────────────┤
    │   Network        │──────────────│   Internet       │
    ├──────────────────┤              ├──────────────────┤
    │   Data Link      │──────────────│                  │
    ├──────────────────┤              │   Network Access │
    │   Physical       │──────────────│                  │
    └──────────────────┘              └──────────────────┘

    Theoretical Model                 Practical Implementation
    (Reference)                       (Real-world Internet)
```

### Key Differences

| Aspect                   | OSI Model            | TCP/IP Model            |
| ------------------------ | -------------------- | ----------------------- |
| **Layers**               | 7                    | 4                       |
| **Development**          | ISO (theoretical)    | DARPA (practical)       |
| **Approach**             | Protocol-independent | Protocol-specific       |
| **Usage**                | Reference/teaching   | Real-world networking   |
| **Session/Presentation** | Separate layers      | Combined in Application |

---

## 1.5 Data Encapsulation Process

When data travels down the OSI stack, each layer adds its own header (and sometimes trailer). This process is called **encapsulation**.

```
SENDER (Encapsulation - Adding Headers)

Layer 7   ┌─────────────────────────────────────────────┐
App       │                    DATA                     │
          └─────────────────────────────────────────────┘
                               │
                               ▼
Layer 4   ┌───────┬─────────────────────────────────────┐
Transport │TCP/UDP│                DATA                 │
          │Header │                                     │
          └───────┴─────────────────────────────────────┘
                               │
                               ▼
Layer 3   ┌───────┬───────┬─────────────────────────────┐
Network   │  IP   │TCP/UDP│            DATA             │
          │Header │Header │                             │
          └───────┴───────┴─────────────────────────────┘
                               │
                               ▼
Layer 2   ┌────────┬───────┬───────┬────────────────┬─────┐
Data Link │Ethernet│  IP   │TCP/UDP│      DATA      │ FCS │
          │ Header │Header │Header │                │     │
          └────────┴───────┴───────┴────────────────┴─────┘
                               │
                               ▼
Layer 1   ┌────────────────────────────────────────────────┐
Physical  │  1010110101001011010101010101010110101010...   │
          │              (Electrical Signals / Bits)       │
          └────────────────────────────────────────────────┘
```

---

## 1.6 Protocol Data Units (PDUs)

Each layer has its own name for the data it handles:

| Layer | PDU Name                       | Description                                  |
| ----- | ------------------------------ | -------------------------------------------- |
| 7-5   | Data (Message)                 | Application data (payload)                   |
| 4     | Segment (TCP) / Datagram (UDP) | Transport layer unit, includes port numbers  |
| 3     | Packet                         | Network layer unit, includes IP addresses    |
| 2     | Frame                          | Data link layer unit, includes MAC addresses |
| 1     | Bit                            | Physical layer unit, binary 1s and 0s        |

### Visual Representation

```
     DATA                              ← Layer 7-5 (Application Data)
       │
       ▼
  ┌────┬────────┐
  │HDR │  DATA  │                      ← Layer 4 (Segment/Datagram)
  └────┴────────┘
       │
       ▼
  ┌────┬────┬────────┐
  │HDR │HDR │  DATA  │                 ← Layer 3 (Packet)
  └────┴────┴────────┘
       │
       ▼
  ┌────┬────┬────┬────────┬─────┐
  │HDR │HDR │HDR │  DATA  │ FCS │      ← Layer 2 (Frame)
  └────┴────┴────┴────────┴─────┘
       │
       ▼
  10101010101010101010101010101010     ← Layer 1 (Bits)
```

---

## 1.7 Layer Functions Summary

### Layer 7 - Application

**Function:** Provides network services directly to applications

- User interface for network access
- Email, file transfer, web browsing
- Network virtual terminal

**Protocols:** HTTP, HTTPS, FTP, SMTP, DNS, SSH, Telnet, SNMP, SIP, LDAP, NFS, SMB

---

### Layer 6 - Presentation

**Function:** Data translation, encryption, compression

- Character encoding (ASCII, Unicode)
- Data compression (reduces size)
- Encryption/Decryption (security)

**Examples:** SSL/TLS, JPEG, MPEG, GIF, ASCII, EBCDIC

---

### Layer 5 - Session

**Function:** Manages sessions between applications

- Establishes, maintains, terminates sessions
- Synchronization (checkpoints)
- Dialog control (half/full duplex)

**Protocols:** NetBIOS, RPC, PPTP, PAP, SIP (session aspects)

---

### Layer 4 - Transport

**Function:** End-to-end communication and data integrity

- Segmentation and reassembly
- Flow control
- Error detection and correction
- Connection-oriented (TCP) or connectionless (UDP)

**Protocols:** TCP, UDP, SCTP, RTP, RTCP

---

### Layer 3 - Network

**Function:** Logical addressing and routing

- IP addressing (source and destination)
- Path determination (routing)
- Packet forwarding
- Fragmentation

**Protocols:** IPv4, IPv6, ICMP, IGMP, IPsec, OSPF, BGP

---

### Layer 2 - Data Link

**Function:** Physical addressing and frame transmission

- MAC addressing
- Frame creation and error detection (FCS)
- Media access control
- Flow control (local)

**Protocols:** Ethernet (802.3), Wi-Fi (802.11), PPP, HDLC, ARP

**Sub-layers:**

- **LLC** (Logical Link Control) - Error/flow control
- **MAC** (Media Access Control) - Physical addressing

---

### Layer 1 - Physical

**Function:** Physical transmission of raw bits

- Electrical/optical signal transmission
- Bit synchronization
- Physical topology (bus, star, ring)
- Transmission mode (simplex, half/full duplex)

**Devices:** Cables, Hubs, Repeaters, NICs, Connectors

**Standards:** RS-232, RJ-45, 100BASE-TX, 1000BASE-T

---

## 1.8 Real-World Example: Web Request

Let's trace an HTTP request through all layers:

**Layer 7 (Application)**
Browser creates HTTP GET request:
`GET / HTTP/1.1\r\nHost: www.example.com\r\n\r\n`

**Layer 6 (Presentation)**

- If HTTPS: TLS encrypts the data
- Character encoding: UTF-8

**Layer 5 (Session)**

- Establishes session with server
- Manages TLS session if HTTPS

**Layer 4 (Transport)**
TCP segments data, adds:

- Source Port: 52431 (random ephemeral)
- Destination Port: 80 (HTTP) or 443 (HTTPS)
- Sequence numbers for ordering

**Layer 3 (Network)**
IP packet created with:

- Source IP: 192.168.1.100 (your PC)
- Destination IP: 93.184.216.34 (example.com)
- TTL: 64

**Layer 2 (Data Link)**
Ethernet frame created with:

- Source MAC: AA:BB:CC:DD:EE:FF (your NIC)
- Destination MAC: 11:22:33:44:55:66 (router/gateway)
- EtherType: 0x0800 (IPv4)
- FCS (Frame Check Sequence) for error detection

**Layer 1 (Physical)**
Electrical signals transmitted over:

- Ethernet cable (Cat5e/Cat6)
- Or Wi-Fi radio waves
- Bits: 10101010101010101010101010...

---

## 1.9 Wireshark and OSI Layers

In Wireshark, you can see each layer's information:

```
WIRESHARK PACKET DETAILS PANE

▼ Frame 1: 342 bytes on wire                          ← Physical (L1)
▼ Ethernet II, Src: aa:bb:cc:dd:ee:ff, Dst: ...       ← Data Link (L2)
▼ Internet Protocol Version 4, Src: 192.168.1.100    ← Network (L3)
▼ Transmission Control Protocol, Src Port: 52431    ← Transport (L4)
▼ Hypertext Transfer Protocol                         ← Application (L7)
    GET / HTTP/1.1
    Host: www.example.com
    User-Agent: Mozilla/5.0...
```

Each expandable section corresponds to a layer's header information.

---

## 1.10 Chapter Summary

> [!summary] Key Takeaways
>
> - OSI Model has 7 layers (Application → Physical)
> - Each layer has specific functions and protocols
> - Data is encapsulated with headers as it moves down the stack
> - PDU names: Data → Segment → Packet → Frame → Bits
> - TCP/IP model is the practical implementation (4 layers)
> - Understanding layers helps troubleshoot network issues
> - Wireshark displays information organized by layers

---

_Next: [[02_Layer2_Data_Link|Section 2: Layer 2 - Data Link]] - Ethernet, ARP, MAC Addressing_
