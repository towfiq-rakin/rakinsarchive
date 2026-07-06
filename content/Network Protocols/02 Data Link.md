# Section 2: Layer 2 - Data Link Protocols

---

## 2.1 Overview

The **Data Link Layer (Layer 2)** is responsible for:

- Node-to-node data transfer
- Physical addressing (MAC addresses)
- Error detection (but not correction)
- Frame synchronization
- Flow control on local link

### Layer 2 Sub-Layers

```
LLC (Logical Link Control) - IEEE 802.2
  - Multiplexing protocols over MAC layer
  - Flow control
  - Error control

MAC (Media Access Control) - IEEE 802.3
  - Physical addressing (MAC addresses)
  - Channel access control (CSMA/CD, CSMA/CA)
  - Frame delimiting
```

---

## 2.2 Ethernet Frame Structure

Ethernet (IEEE 802.3) is the most common Layer 2 protocol.

### Ethernet II Frame Format

```
+-----------+--------+----------+------------+--------+---------+----------+
| Preamble  |  SFD   | Dest MAC | Source MAC |  Type  | Payload |   FCS    |
|  7 bytes  | 1 byte | 6 bytes  |  6 bytes   | 2 bytes| 46-1500 | 4 bytes  |
+-----------+--------+----------+------------+--------+---------+----------+

Total Frame Size: 64 - 1518 bytes (without preamble/SFD)
Jumbo Frames: Up to 9000 bytes
```

### Field Descriptions

| Field          | Size          | Description                               |
| -------------- | ------------- | ----------------------------------------- |
| **Preamble**   | 7 bytes       | `10101010...` pattern for synchronization |
| **SFD**        | 1 byte        | Start Frame Delimiter `10101011`          |
| **Dest MAC**   | 6 bytes       | Destination MAC address                   |
| **Source MAC** | 6 bytes       | Source MAC address                        |
| **EtherType**  | 2 bytes       | Protocol identifier (e.g., 0x0800 = IPv4) |
| **Payload**    | 46-1500 bytes | Data from upper layers                    |
| **FCS**        | 4 bytes       | Frame Check Sequence (CRC-32)             |

### Common EtherType Values

| EtherType | Protocol                             |
| --------- | ------------------------------------ |
| 0x0800    | IPv4                                 |
| 0x0806    | ARP (Address Resolution Protocol)    |
| 0x8100    | VLAN-tagged frame (802.1Q)           |
| 0x86DD    | IPv6                                 |
| 0x8847    | MPLS unicast                         |
| 0x8848    | MPLS multicast                       |
| 0x88CC    | LLDP (Link Layer Discovery Protocol) |
| 0x88E5    | MAC Security (802.1AE)               |

---

## 2.3 MAC Addressing

### MAC Address Format

**Example**: `00:0C:29:F7:5D:C5` (from your PCAP capture)

```
+---------------------------+---------------------------+
|           OUI             |           NIC             |
| (Organizationally         | (Network Interface        |
|  Unique Identifier)       |  Controller Specific)     |
+---------------------------+---------------------------+
|        00:0C:29           |        F7:5D:C5           |
|        (VMware)           |   (Unique to this NIC)    |
+---------------------------+---------------------------+

Total: 48 bits (6 bytes)
Format: XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX
```

### OUI (First 3 Bytes) - Manufacturer Identification

| OUI Prefix | Manufacturer             |
| ---------- | ------------------------ |
| 00:0C:29   | VMware, Inc.             |
| 00:50:56   | VMware, Inc.             |
| 08:00:27   | Oracle VirtualBox        |
| 00:1A:A0   | Dell Inc.                |
| 00:1E:C9   | Dell Inc.                |
| 3C:D9:2B   | HP Inc.                  |
| 00:25:00   | Apple, Inc.              |
| AC:DE:48   | Apple, Inc.              |
| 00:15:5D   | Microsoft (Hyper-V)      |
| B8:27:EB   | Raspberry Pi Foundation  |
| DC:A6:32   | Raspberry Pi Trading Ltd |
| 00:1B:21   | Intel Corporation        |

> [!tip]
> Lookup tool: https://macvendors.com/

### Special MAC Address Bits

**First Byte Bit Meanings:**

- **Bit 0 (LSB)**: Individual/Group bit
  - 0 = Unicast (individual address)
  - 1 = Multicast/Broadcast (group address)

- **Bit 1**: Universal/Local bit
  - 0 = Universally administered (OUI assigned)
  - 1 = Locally administered (custom)

**Example Analysis:**

```
00:0C:29:F7:5D:C5
││
│└─ Bit 1 = 0 (Universal - assigned by IEEE)
└── Bit 0 = 0 (Unicast - single destination)
```

**Special Addresses:**

- `FF:FF:FF:FF:FF:FF` = Broadcast (sent to all hosts on segment)
- `01:00:5E:XX:XX:XX` = IPv4 Multicast
- `33:33:XX:XX:XX:XX` = IPv6 Multicast

---

## 2.4 ARP (Address Resolution Protocol)

ARP maps IP addresses to MAC addresses. It's essential for communication on a local network.

### Why ARP is Needed

You want to communicate with 192.168.1.138 (from your PCAP):

- **Layer 3 knows**: Destination IP = 192.168.1.138
- **Layer 2 needs**: Destination MAC = ???

ARP solves this by asking: _"Who has IP 192.168.1.138? Tell me your MAC address!"_

### ARP Packet Structure

```
+----------------+----------------+-----------+-----------+-----------------+
| Hardware Type  | Protocol Type  | HW Length | P Length  |    Operation    |
|   (2 bytes)    |   (2 bytes)    | (1 byte)  | (1 byte)  |    (2 bytes)    |
+----------------+----------------+-----------+-----------+-----------------+
|                    Sender Hardware Address (6 bytes)                      |
+--------------------------------------------------------------------------+
|                    Sender Protocol Address (4 bytes)                      |
+--------------------------------------------------------------------------+
|                    Target Hardware Address (6 bytes)                      |
+--------------------------------------------------------------------------+
|                    Target Protocol Address (4 bytes)                      |
+--------------------------------------------------------------------------+

Total Size: 28 bytes (for IPv4 over Ethernet)
```

### ARP Field Values

| Field         | Value  | Description  |
| ------------- | ------ | ------------ |
| Hardware Type | 1      | Ethernet     |
| Protocol Type | 0x0800 | IPv4         |
| Operation     | 1      | ARP Request  |
| Operation     | 2      | ARP Reply    |
| Operation     | 3      | RARP Request |
| Operation     | 4      | RARP Reply   |

### ARP Request/Reply Process

```
Host A (192.168.1.1)                          Host B (192.168.1.138)
MAC: 00:50:56:C0:00:08                        MAC: 00:0C:29:F7:5D:C5

STEP 1: ARP Request (Broadcast)
========================================
    "Who has 192.168.1.138? Tell 192.168.1.1"

    Dest MAC: FF:FF:FF:FF:FF:FF (Broadcast)
    Src MAC:  00:50:56:C0:00:08
    Opcode:   1 (Request)
              │
              │  Broadcast to ALL hosts
              ▼
    [PC1] [PC2] [PC3] [PC4] [Host B] ← Only Host B responds
    Ignore Ignore Ignore Ignore    │
                                   │
STEP 2: ARP Reply (Unicast)        │
================================   ▼
    "192.168.1.138 is at 00:0C:29:F7:5D:C5"

    Dest MAC: 00:50:56:C0:00:08 (Unicast to requester)
    Src MAC:  00:0C:29:F7:5D:C5
    Opcode:   2 (Reply)

STEP 3: Cache the mapping
=========================
Host A stores: 192.168.1.138 → 00:0C:29:F7:5D:C5 in ARP cache
```

### Example from Your PCAP

```
06:52:06.782133 ARP Request
============================
  - Who has 192.168.1.138?
  - Tell 192.168.1.1

06:52:06.782152 ARP Reply
=========================
  - 192.168.1.138 is at 00:0C:29:F7:5D:C5

Interpretation:
  - 192.168.1.1 (Router/Gateway) needed to send packets to .138
  - .138 is a VMware VM (00:0C:29 = VMware OUI)
```

### ARP Cache Commands

**View ARP cache (Windows):**

```bash
arp -a
```

**View ARP cache (Linux):**

```bash
arp -n
ip neigh show
```

**Clear ARP cache (Windows - Admin):**

```bash
arp -d *
```

**Clear ARP cache (Linux):**

```bash
sudo ip neigh flush all
```

**Add static ARP entry:**

```bash
arp -s 192.168.1.100 AA:BB:CC:DD:EE:FF
```

### Gratuitous ARP

A Gratuitous ARP is sent by a host announcing its own IP/MAC mapping. It's unsolicited - no one asked for it.

**Uses:**

- Announce IP address claim (DHCP)
- Update other hosts' ARP caches
- Detect IP address conflicts
- Failover in high-availability setups

**Format:**

- Sender IP = Target IP (same address)
- Destination MAC = FF:FF:FF:FF:FF:FF (broadcast)

> [!warning]
> Attackers use gratuitous ARP for ARP spoofing/poisoning

### ARP Spoofing Attack

**Normal Communication:**

```
Victim (192.168.1.100) ◄──────────────────────► Router (192.168.1.1)
                         Direct communication
```

**After ARP Spoofing:**

```
Victim              Attacker               Router
192.168.1.100       192.168.1.50          192.168.1.1
    │                    │                    │
    │  Fake ARP Reply    │                    │
    │◄───────────────────│                    │
    │ "192.168.1.1 is at │                    │
    │  [Attacker's MAC]" │                    │
    │                    │                    │
    │───────────────────►│───────────────────►│
    │  Traffic goes to   │ Attacker forwards  │
    │     attacker       │    to router       │
```

**Result**: Man-in-the-Middle (MITM) attack - Attacker can intercept, modify, or drop traffic

### ARP Security Mitigations

1. **Static ARP Entries**
   - Manually configure critical mappings
   - Prevents dynamic updates

2. **Dynamic ARP Inspection (DAI)**
   - Switch feature validates ARP packets
   - Checks against DHCP snooping database

3. **ARP Watch Tools**
   - arpwatch (Linux)
   - XArp (Windows)
   - Monitor for suspicious ARP activity

4. **VLAN Segmentation**
   - Limit broadcast domains
   - ARP only works within same VLAN

5. **Port Security**
   - Limit MAC addresses per port
   - Prevent MAC flooding attacks

---

## 2.5 Spanning Tree Protocol (STP)

STP prevents loops in Layer 2 networks.

### The Problem: Layer 2 Loops

```
   Switch A ◄──────────────► Switch B
      │                          │
      │                          │
      └──────────────────────────┘
```

**Without STP:**

- Broadcast storms (frames loop forever)
- MAC address table instability
- Network meltdown

### The Solution: STP

STP creates a loop-free logical topology by:

1. Electing a Root Bridge
2. Calculating shortest path to root
3. Blocking redundant paths

```
   Switch A ◄──────────────► Switch B
(Root Bridge)                    │
      │                          │
      │                    [BLOCKED]
      └──────────────────────────┘
```

### STP Port States

| State      | Data | Learn MAC | Duration              |
| ---------- | ---- | --------- | --------------------- |
| Blocking   | No   | No        | Until topology change |
| Listening  | No   | No        | 15 seconds (default)  |
| Learning   | No   | Yes       | 15 seconds (default)  |
| Forwarding | Yes  | Yes       | Stable state          |
| Disabled   | No   | No        | Admin disabled        |

- **Total convergence time**: ~30-50 seconds (classic STP)
- **RSTP (Rapid STP)** converges in ~1-2 seconds

---

## 2.6 VLANs (Virtual LANs)

VLANs logically segment a network at Layer 2.

### Without VLANs vs With VLANs

```
WITHOUT VLANs:                          WITH VLANs:
+---------------------+                 +---------------------+
|      Switch         |                 |      Switch         |
|                     |                 |                     |
| All hosts in ONE    |                 | VLAN 10 │ VLAN 20   |
| broadcast domain    |                 | (Sales) │ (IT)      |
|                     |                 |         │           |
| PC1 PC2 PC3 PC4     |                 | PC1 PC2 │ PC3 PC4   |
+---------------------+                 +---------------------+
```

**Benefits of VLANs:**

- Reduced broadcast traffic
- Improved security (isolation)
- Logical grouping (department-based)
- Easier management

### 802.1Q VLAN Tagging

**Standard Ethernet Frame:**

```
+----------+----------+----------+--------------------+-----------+
| Dest MAC | Src MAC  |   Type   |      Payload       |    FCS    |
| 6 bytes  | 6 bytes  | 2 bytes  |    46-1500 bytes   |  4 bytes  |
+----------+----------+----------+--------------------+-----------+
```

**802.1Q Tagged Frame:**

```
+----------+----------+---------------+----------+-------------+-------+
| Dest MAC | Src MAC  |  802.1Q Tag   |   Type   |   Payload   |  FCS  |
| 6 bytes  | 6 bytes  |   4 bytes     | 2 bytes  | 46-1500     |4 bytes|
+----------+----------+---------------+----------+-------------+-------+
```

**802.1Q Tag Structure (4 bytes):**

```
+-----------------+-----+-----+-----------------------+
|      TPID       | PCP | DEI |       VLAN ID         |
|    (0x8100)     |3 bit|1 bit|      12 bits          |
|    2 bytes      |     |     |     (0-4095)          |
+-----------------+-----+-----+-----------------------+
```

| Field   | Description                             |
| ------- | --------------------------------------- |
| TPID    | Tag Protocol Identifier (always 0x8100) |
| PCP     | Priority Code Point (QoS, 0-7)          |
| DEI     | Drop Eligible Indicator                 |
| VLAN ID | 12 bits = 4096 possible VLANs (0-4095)  |

**Reserved VLANs:**

- VLAN 0: Priority tagging only
- VLAN 1: Default VLAN (usually)
- VLAN 4095: Reserved

---

## 2.7 Layer 2 Wireshark Filters

### Ethernet Filters

| Filter                          | Description                |
| ------------------------------- | -------------------------- |
| `eth.addr == 00:0c:29:f7:5d:c5` | MAC (src or dst)           |
| `eth.src == 00:0c:29:f7:5d:c5`  | Source MAC only            |
| `eth.dst == 00:0c:29:f7:5d:c5`  | Destination MAC only       |
| `eth.dst == ff:ff:ff:ff:ff:ff`  | Broadcast frames           |
| `eth.type == 0x0800`            | IPv4 frames                |
| `eth.type == 0x0806`            | ARP frames                 |
| `eth.type == 0x86dd`            | IPv6 frames                |
| `eth.lg == 1`                   | Locally administered MACs  |
| `eth.ig == 1`                   | Multicast/broadcast frames |

### ARP Filters

| Filter                                | Description            |
| ------------------------------------- | ---------------------- |
| `arp`                                 | All ARP traffic        |
| `arp.opcode == 1`                     | ARP Requests only      |
| `arp.opcode == 2`                     | ARP Replies only       |
| `arp.src.proto_ipv4 == 192.168.1.1`   | ARP from specific IP   |
| `arp.dst.proto_ipv4 == 192.168.1.138` | ARP for specific IP    |
| `arp.src.hw_mac == 00:0c:29:f7:5d:c5` | ARP from specific MAC  |
| `arp.duplicate-address-detected`      | Duplicate IP detection |

### VLAN Filters

| Filter               | Description            |
| -------------------- | ---------------------- |
| `vlan`               | All VLAN tagged frames |
| `vlan.id == 10`      | Specific VLAN          |
| `vlan.priority == 5` | Priority tagged        |

### STP Filters

| Filter                   | Description          |
| ------------------------ | -------------------- |
| `stp`                    | All STP traffic      |
| `stp.root.prio == 32768` | Root bridge priority |

### LLDP Filters

| Filter | Description                   |
| ------ | ----------------------------- |
| `lldp` | Link Layer Discovery Protocol |

---

## 2.8 Chapter Summary

> [!summary]
> **Key Takeaways:**
>
> - Layer 2 handles node-to-node communication using MAC addresses
> - Ethernet frames: Dest MAC + Src MAC + Type + Payload + FCS
> - MAC addresses are 48 bits (6 bytes), first 3 bytes = OUI
> - ARP resolves IP addresses to MAC addresses (Request = Broadcast, Reply = Unicast)
> - ARP spoofing is a common attack - use DAI, static entries
> - STP prevents Layer 2 loops by blocking redundant paths
> - VLANs segment networks logically (802.1Q tagging)
> - From your PCAP: VMware VMs (00:0C:29) communicating via ARP

---

_Next: [[03 Network]] - IPv4/IPv6, ICMP, Subnetting_
