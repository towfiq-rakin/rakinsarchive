# Network Protocol Analysis Guide

**Comprehensive Reference for Network Engineers & Security Analysts**

---

## Document Information

| Property              | Value             |
| --------------------- | ----------------- |
| **Version**           | 1.0               |
| **Created**           | January 2026      |
| **Author**            | Towfiq Omar Rakin |
| **Total Sections**    | 10                |
| **Estimated Reading** | 2-3 hours         |

---

## Table of Contents

### Part 1: Fundamentals

| File                          | Section                  | Description                           |
| ----------------------------- | ------------------------ | ------------------------------------- |
| [[01 Introduction OSI Model]] | Introduction & OSI Model | Visual layer breakdown, encapsulation |
| [[02 Data Link]]       | Layer 2 Protocols        | Ethernet, ARP, MAC addressing, STP    |
| [[03 Network]]         | Layer 3 Protocols        | IPv4/IPv6, ICMP, subnetting           |

### Part 2: Transport Layer Deep Dive

| File                        | Section            | Description                          |
| --------------------------- | ------------------ | ------------------------------------ |
| [[04 TCP]] | TCP Protocol       | 3-way handshake, flags, flow control |
| [[05 UDP and Ports]] | UDP & Port Numbers | UDP structure, port reference        |

### Part 3: Application Layer Deep Dive

| File                          | Section              | Description                          |
| ----------------------------- | -------------------- | ------------------------------------ |
| [[06 DNS]]             | DNS Protocol         | Query types, records, resolution     |
| [[07 HTTP, HTTPS]]      | HTTP/HTTPS & TLS     | Methods, status codes, TLS handshake |
| [[08 Other Protocols]] | DHCP, FTP, SSH, SMTP | Other application protocols          |

### Part 4: VoIP & Practical Analysis

| File                        | Section             | Description             |
| --------------------------- | ------------------- | ----------------------- |
| [[09 VoIP Protocols]]       | VoIP Protocols      | SIP, RTP, RTCP, SDP     |
| [[10 Wireshark]] | Wireshark Reference | Filters, tips, analysis |

---

## Quick Navigation

```
FUNDAMENTALS                    DEEP DIVES                      PRACTICAL
============                    ==========                      =========
01 - OSI Model          --->    04 - TCP Deep Dive      --->    09 - VoIP
02 - Layer 2 (ARP)      --->    05 - UDP & Ports        --->    10 - Wireshark
03 - Layer 3 (IP)       --->    06 - DNS Deep Dive
                                07 - HTTP/HTTPS
                                08 - Other L7 Protocols
```

---

## How to Use This Guide

1. **Beginners**: Start with Section 01 (OSI Model) and proceed sequentially
2. **Intermediate**: Jump to specific protocol sections as needed
3. **Advanced**: Use Section 10 (Wireshark Cheatsheet) as quick reference
4. **VoIP Analysis**: Focus on Section 09 for SIP/RTP analysis

---

## Protocols Covered

```
Layer 7 (Application)
├── DNS, HTTP, HTTPS, DHCP
├── FTP, SSH, SMTP, POP3, IMAP
└── SIP, SDP (VoIP Signaling)

Layer 6 (Presentation)
└── TLS/SSL Encryption

Layer 5 (Session)
└── Session Management

Layer 4 (Transport)
├── TCP (Transmission Control Protocol)
└── UDP (User Datagram Protocol)
├── RTP, RTCP (VoIP Media)

Layer 3 (Network)
├── IPv4, IPv6
├── ICMP
└── IGMP

Layer 2 (Data Link)
├── Ethernet (802.3)
├── ARP
├── STP
└── VLANs (802.1Q)

Layer 1 (Physical)
└── Electrical/Optical Signals
```

---

## Related Files

- **PCAP Analysis**: Based on `capture.pcapng` VoIP call capture
- **Audio Extraction**: See Section 10 for RTP audio extraction guide

---

_Continue to: [[01 Introduction OSI Model]]_
