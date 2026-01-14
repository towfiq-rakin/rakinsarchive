# Section 4: Layer 4 - TCP Deep Dive

---

## 4.1 TCP Overview

**TCP (Transmission Control Protocol)** is a connection-oriented, reliable transport protocol.

### TCP Key Characteristics

- **Connection-oriented**: Must establish connection before data transfer
- **Reliable delivery**: Guarantees data arrives correctly and in order
- **Ordered delivery**: Data arrives in the same order it was sent
- **Error detection**: Checksum verifies data integrity
- **Flow control**: Prevents sender from overwhelming receiver
- **Congestion control**: Adapts to network conditions
- **Full duplex**: Data flows in both directions simultaneously

**Used by**: HTTP, HTTPS, FTP, SSH, SMTP, Telnet, SIP (signaling)

---

## 4.2 TCP Header Structure

```
TCP HEADER FORMAT (20 bytes minimum, up to 60)

 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |  Bytes 0-3
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |  Bytes 4-7
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Acknowledgment Number                      |  Bytes 8-11
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Data |       |C|E|U|A|P|R|S|F|                               |
| Offset| Rsrvd |W|C|R|C|S|S|Y|I|            Window             |  Bytes 12-15
|       |       |R|E|G|K|H|T|N|N|                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Checksum            |         Urgent Pointer        |  Bytes 16-19
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options (if Data Offset > 5)               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                             Data                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### TCP Header Fields Explained

| Field                     | Size     | Description                                                                                         |
| ------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| **Source Port**           | 16 bits  | Sender's port number (0-65535)                                                                      |
| **Destination Port**      | 16 bits  | Receiver's port number                                                                              |
| **Sequence Number**       | 32 bits  | Position of first data byte in stream. Used for ordering and reassembly. Randomly initialized (ISN) |
| **Acknowledgment Number** | 32 bits  | Next expected byte from sender. Only valid if ACK flag is set                                       |
| **Data Offset**           | 4 bits   | Header length in 32-bit words. Min: 5 (20 bytes), Max: 15 (60 bytes)                                |
| **Reserved**              | 4 bits   | Reserved for future use (set to 0)                                                                  |
| **Flags**                 | 8 bits   | Control flags (see next section)                                                                    |
| **Window Size**           | 16 bits  | Receive window size (flow control). Can be scaled with Window Scaling option                        |
| **Checksum**              | 16 bits  | Error detection for header and data                                                                 |
| **Urgent Pointer**        | 16 bits  | Offset to urgent data (if URG flag set)                                                             |
| **Options**               | Variable | Optional fields (MSS, Window Scale, etc.)                                                           |

---

## 4.3 TCP Flags (Control Bits)

| Flag    | Bit | Name                      | Purpose                                                                          |
| ------- | --- | ------------------------- | -------------------------------------------------------------------------------- |
| **CWR** | 128 | Congestion Window Reduced | Sender reduced its sending rate (ECN-capable)                                    |
| **ECE** | 64  | ECN-Echo                  | Congestion experienced notification (ECN-capable)                                |
| **URG** | 32  | Urgent                    | Urgent pointer field is valid. Data should be prioritized                        |
| **ACK** | 16  | Acknowledgment            | Acknowledgment number is valid. Set in all packets after initial SYN             |
| **PSH** | 8   | Push                      | Push data to application immediately. Don't buffer, deliver now                  |
| **RST** | 4   | Reset                     | Abort the connection. "Something went wrong, terminate now"                      |
| **SYN** | 2   | Synchronize               | Initiate connection, synchronize sequence numbers. Only set in first two packets |
| **FIN** | 1   | Finish                    | No more data from sender. Initiates graceful connection close                    |

### Common Flag Combinations

| Flags   | Notation | Meaning                       | When Used                               |
| ------- | -------- | ----------------------------- | --------------------------------------- |
| SYN     | [S]      | Connection request            | First packet of 3WHS                    |
| SYN,ACK | [S.]     | Connection accepted           | Second packet of 3WHS                   |
| ACK     | [.]      | Acknowledgment only           | Data transfer, ACKs                     |
| PSH,ACK | [P.]     | Push data, acknowledge        | Interactive data (typing, HTTP request) |
| FIN,ACK | [F.]     | Close connection, acknowledge | Graceful termination                    |
| RST     | [R]      | Reset/Abort connection        | Error, rejection                        |
| RST,ACK | [R.]     | Reset with acknowledgment     | Rejecting connection                    |

> [!warning]
> **Suspicious Flag Combinations (Potential Scans/Attacks):**
>
> - **SYN,FIN**: Invalid (both open and close) - Malicious scan
> - **NULL (no flags)**: No flags set - NULL scan
> - **FIN**: FIN without established conn - FIN scan
> - **FIN,PSH,URG**: XMAS scan (all flags lit up) - Port scan

---

## 4.4 TCP 3-Way Handshake

The 3-way handshake establishes a TCP connection.

```
        CLIENT                                              SERVER
    (Initiator)                                           (Listener)
          │                                                    │
  State:  │                                                    │  State:
  CLOSED  │                                                    │  LISTEN
          │                                                    │
          │         STEP 1: SYN (Synchronize)                 │
          │    ─────────────────────────────────────────►     │
          │    SYN=1, ACK=0                                    │
          │    Seq=X (random ISN)                              │
          │    "I want to connect, my sequence starts at X"   │
  State:  │                                                    │  State:
  SYN_SENT│                                                    │  SYN_SENT
          │                                                    │
          │         STEP 2: SYN-ACK                            │
          │    ◄─────────────────────────────────────────     │
          │    SYN=1, ACK=1                                    │
          │    Seq=Y (server's ISN), Ack=X+1                  │
          │    "OK! My sequence starts at Y, I expect X+1"    │
          │                                                    │  State:
          │                                                    │  SYN_RCVD
          │                                                    │
          │         STEP 3: ACK (Acknowledge)                  │
          │    ─────────────────────────────────────────►     │
          │    SYN=0, ACK=1                                    │
          │    Seq=X+1, Ack=Y+1                                │
          │    "Got it! Ready to communicate"                  │
  State:  │                                                    │  State:
  ESTABLISHED                                                  │  ESTABLISHED
          │                                                    │
          │◄════════════ DATA TRANSFER ═══════════════════════►│
```

### Why 3-Way Handshake?

1. **Sequence Number Synchronization**
   - Both sides share their Initial Sequence Numbers (ISN)
   - ISN is random to prevent session hijacking

2. **Verify Bidirectional Communication**
   - Confirms both parties can send AND receive
   - SYN: Client can send
   - SYN-ACK: Server can send and receive
   - ACK: Client can receive

3. **Negotiate Parameters**
   - Maximum Segment Size (MSS)
   - Window Scaling
   - Selective Acknowledgment (SACK)
   - Timestamps

### Real Example (HTTP Connection)

```
No.  Time      Source           Dest             Info
===  ====      ======           ====             ====

1    0.000000  192.168.1.100    93.184.216.34    52431 → 80 [SYN]
                                                  Seq=0 Win=64240
                                                  MSS=1460 WS=256

2    0.015234  93.184.216.34    192.168.1.100    80 → 52431 [SYN,ACK]
                                                  Seq=0 Ack=1
                                                  Win=65535 MSS=1460

3    0.015456  192.168.1.100    93.184.216.34    52431 → 80 [ACK]
                                                  Seq=1 Ack=1
                                                  Win=64240

[Connection Established - Ready for HTTP GET]
```

---

## 4.5 TCP 4-Way Termination

Graceful connection termination requires 4 packets.

```
        CLIENT                                              SERVER
          │                                                    │
  State:  │                                                    │  State:
  ESTABLISHED                                                  │  ESTABLISHED
          │                                                    │
          │         STEP 1: FIN (Client initiates close)       │
          │    ─────────────────────────────────────────►     │
          │    FIN=1, ACK=1                                    │
          │    "I'm done sending data"                         │
  State:  │                                                    │
  FIN_WAIT_1                                                   │
          │                                                    │
          │         STEP 2: ACK (Server acknowledges)          │
          │    ◄─────────────────────────────────────────     │
          │    ACK=1                                           │
          │    "OK, I received your FIN"                       │
  State:  │                                                    │  State:
  FIN_WAIT_2                                                   │  CLOSE_WAIT
          │                                                    │
          │    [Server may continue sending remaining data]    │
          │                                                    │
          │         STEP 3: FIN (Server done too)              │
          │    ◄─────────────────────────────────────────     │
          │    FIN=1, ACK=1                                    │
          │    "I'm also done sending"                         │
          │                                                    │  State:
          │                                                    │  LAST_ACK
          │                                                    │
          │         STEP 4: ACK (Client acknowledges)          │
          │    ─────────────────────────────────────────►     │
          │    ACK=1                                           │
          │    "Got it, connection closed"                     │
  State:  │                                                    │  State:
  TIME_WAIT                                                    │  CLOSED
          │                                                    │
  [Wait 2*MSL]                                                 │
          │                                                    │
  State:  │                                                    │
  CLOSED  │                                                    │
```

### TCP Connection States

| State       | Description                                              |
| ----------- | -------------------------------------------------------- |
| CLOSED      | No connection                                            |
| LISTEN      | Server waiting for connections                           |
| SYN_SENT    | Client sent SYN, waiting for SYN-ACK                     |
| SYN_RCVD    | Server received SYN, sent SYN-ACK                        |
| ESTABLISHED | Connection active, data transfer                         |
| FIN_WAIT_1  | Sent FIN, waiting for ACK                                |
| FIN_WAIT_2  | Received ACK for FIN, waiting for peer's FIN             |
| CLOSE_WAIT  | Received FIN, waiting for app to close                   |
| LAST_ACK    | Sent FIN, waiting for final ACK                          |
| TIME_WAIT   | Waiting before CLOSED (2\*MSL, typically 60-240 seconds) |

> [!tip]
> **TIME_WAIT** ensures delayed packets don't interfere with new connections and allows retransmission of final ACK if lost.

---

## 4.6 Sequence and Acknowledgment Numbers

**Sequence Number:**

- Identifies the position of the first byte of data in this segment
- Allows receiver to reassemble data in correct order
- Starts at a random Initial Sequence Number (ISN)

**Acknowledgment Number:**

- The next sequence number the receiver expects
- Implicitly acknowledges all bytes up to Ack-1
- Only valid when ACK flag is set

**Example:**

Client sends 1000 bytes, starting at Seq=1000:

```
Seq=1000, Len=1000
[Bytes 1000-1999]
```

Server responds:

```
Ack=2000
"I received up to byte 1999, send byte 2000 next"
```

**Formulas:**

- Next_Seq = Seq + Len
- Expected_Ack = Seq + Len

### Wireshark Relative Sequence Numbers

Wireshark shows RELATIVE sequence numbers by default for readability.

| Display             | Actual                    |
| ------------------- | ------------------------- |
| Seq=0 (relative)    | Seq=3784582910 (absolute) |
| Seq=1 (relative)    | Seq=3784582911 (absolute) |
| Seq=1001 (relative) | Seq=3784583911 (absolute) |

To see absolute numbers: Edit → Preferences → Protocols → TCP → Uncheck "Relative sequence numbers"

---

## 4.7 TCP Window Size and Flow Control

The **Window Size** tells the sender how much data the receiver can accept.

```
SENDER                              RECEIVER
Buffer: [████████████░░░░░░░░]      Buffer: [████░░░░░░░░░░░░░░░░░]
         ^^^^^^^^^^^^                        ^^^^
         Data to send                        Data received

"How much can I send?"              "I can handle 16384 bytes"
                                     Window = 16384
```

### Sliding Window

```
Data stream: |1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|

             ◄─── Sent & ACKed ────►◄── Sent, waiting ──►◄─ Can send ─►
             |1|2|3|4|              |5|6|7|8|            |9|10|

                                    ◄────── Window ──────►

Window slides right as ACKs are received.
```

### Window Scaling (RFC 1323)

**Problem**: Window field is only 16 bits = max 65,535 bytes

**Solution**: Window Scaling option multiplies window size

Negotiated in SYN packets: `[SYN] ... WS=7` means scale factor = 2^7 = 128

**Calculation**: Actual Window = Window Field × 2^(Scale Factor)

**Example:**

- Window Field: 512
- Scale Factor: 7
- Actual Window: 512 × 128 = 65,536 bytes

With maximum scaling (factor 14): Max window ~1 GB

> [!warning]
> Scale factor is set during handshake and CANNOT change.

### Zero Window

When receiver's buffer is full, it advertises Window=0:

```
Sender      "Here's more data"                           Receiver
   │        ────────────────────►                             │
   │        "STOP! Window=0, buffer full"                    │
   │        ◄────────────────────────────                    │
   │        [Sender pauses]                                  │
   │        "Window Probe" (1 byte)                          │
   │        ─────────────────────────►                       │
   │        "Still Window=0"                                 │
   │        ◄─────────────────                               │
   │        [Later... buffer freed]                          │
   │        "Window=8192, ready again!"                      │
   │        ◄──────────────────────────                      │
   │        [Sender resumes]                                 │
```

Wireshark shows: `[TCP ZeroWindow]` and `[TCP Window Update]`

---

## 4.8 TCP Retransmissions

When a segment is lost, TCP retransmits it.

### Timeout-Based Retransmission

```
Sender           X (Packet lost)                     Receiver
   │             │                                       │
   │  Seq=1000   │                                       │
   │────────────►X                                       │
   │  [Wait for ACK...]                                 │
   │  [RTO expires - Retransmission Timeout]            │
   │  Seq=1000 (retransmit)                             │
   │─────────────────────────────────────────────────────►│
   │             Ack=2000                                │
   │◄─────────────────────────────────────────────────────│
```

### Fast Retransmit (3 Duplicate ACKs)

```
Sender                                                   Receiver
   │  Seq=1000  ─────────────────────────────────────────► │ Ack=2000
   │  Seq=2000  ─────────────────────────────────────────► │ Ack=3000
   │  Seq=3000  ────────X (lost)                           │
   │  Seq=4000  ─────────────────────────────────────────► │ Ack=3000 (dup1)
   │  Seq=5000  ─────────────────────────────────────────► │ Ack=3000 (dup2)
   │  Seq=6000  ─────────────────────────────────────────► │ Ack=3000 (dup3)
   │  [3 dup ACKs = Fast Retransmit!]                     │
   │  Seq=3000  ─────────────────────────────────────────► │ Ack=7000
```

### Wireshark Retransmission Indicators

| Message                               | Meaning                                      |
| ------------------------------------- | -------------------------------------------- |
| `[TCP Retransmission]`                | Same data sent again (timeout or fast retx)  |
| `[TCP Fast Retransmission]`           | Retransmit triggered by 3 duplicate ACKs     |
| `[TCP Spurious Retransmission]`       | Unnecessary retransmit (original arrived)    |
| `[TCP Dup ACK]`                       | Duplicate acknowledgment (lost segment hint) |
| `[TCP Out-Of-Order]`                  | Segment arrived before expected              |
| `[TCP Previous segment not captured]` | Gap in sequence numbers                      |

**Filter for issues:**

```
tcp.analysis.retransmission || tcp.analysis.duplicate_ack
```

---

## 4.9 TCP Options

| Option             | Kind | Length | Description                                                                      |
| ------------------ | ---- | ------ | -------------------------------------------------------------------------------- |
| End of Options     | 0    | 1      | Marks end of options                                                             |
| No Operation (NOP) | 1    | 1      | Padding (alignment)                                                              |
| MSS                | 2    | 4      | Maximum Segment Size. Only in SYN packets. Default: 536, common: 1460            |
| Window Scale       | 3    | 3      | Multiplier for window size. Only in SYN packets. Scale factor 0-14               |
| SACK Permitted     | 4    | 2      | Selective ACK supported. Only in SYN packets                                     |
| SACK               | 5    | Var    | Selective ACK data. Lists received ranges                                        |
| Timestamps         | 8    | 10     | For RTT measurement and PAWS. TSval: sender's timestamp, TSecr: echoed timestamp |

---

## 4.10 TCP Wireshark Filters

### Basic TCP Filters

| Filter                                | Description                   |
| ------------------------------------- | ----------------------------- |
| `tcp`                                 | All TCP traffic               |
| `tcp.port == 80`                      | Source OR destination port 80 |
| `tcp.srcport == 5060`                 | Source port only              |
| `tcp.dstport == 443`                  | Destination port only         |
| `tcp.port == 80 \|\| tcp.port == 443` | HTTP or HTTPS                 |

### Flag Filters

| Filter                                     | Description                  |
| ------------------------------------------ | ---------------------------- |
| `tcp.flags.syn == 1`                       | SYN packets                  |
| `tcp.flags.syn == 1 && tcp.flags.ack == 0` | SYN only (connection starts) |
| `tcp.flags.syn == 1 && tcp.flags.ack == 1` | SYN-ACK                      |
| `tcp.flags.fin == 1`                       | FIN packets                  |
| `tcp.flags.rst == 1`                       | RST packets (resets/errors)  |
| `tcp.flags.push == 1`                      | PSH packets (data)           |
| `tcp.flags == 0x12`                        | SYN-ACK (hex)                |
| `tcp.flags == 0x02`                        | SYN only (hex)               |

### Analysis Filters (Wireshark Expert)

| Filter                             | Description          |
| ---------------------------------- | -------------------- |
| `tcp.analysis.retransmission`      | Retransmissions      |
| `tcp.analysis.fast_retransmission` | Fast retransmissions |
| `tcp.analysis.duplicate_ack`       | Duplicate ACKs       |
| `tcp.analysis.lost_segment`        | Lost segments        |
| `tcp.analysis.out_of_order`        | Out of order         |
| `tcp.analysis.zero_window`         | Zero window          |
| `tcp.analysis.window_update`       | Window updates       |
| `tcp.analysis.keep_alive`          | Keep-alive packets   |
| `tcp.analysis.flags`               | Any TCP issues       |

### Window Filters

| Filter                            | Description           |
| --------------------------------- | --------------------- |
| `tcp.window_size == 0`            | Zero window           |
| `tcp.window_size < 1000`          | Very small window     |
| `tcp.window_size_scalefactor > 0` | Window scaling in use |

### Connection Tracking

| Filter                   | Description                      |
| ------------------------ | -------------------------------- |
| `tcp.stream == 5`        | Specific stream/connection       |
| `tcp.completeness == 31` | Complete conversations (SYN→FIN) |

### Scan Detection

| Filter                                     | Description             |
| ------------------------------------------ | ----------------------- |
| `tcp.flags == 0x00`                        | NULL scan (no flags)    |
| `tcp.flags == 0x29`                        | XMAS scan (FIN+PSH+URG) |
| `tcp.flags.syn == 1 && tcp.flags.fin == 1` | Invalid SYN+FIN         |

---

## 4.11 Chapter Summary

> [!summary]
> **Key Takeaways:**
>
> - TCP is connection-oriented, reliable, ordered transport
> - 3-Way Handshake: SYN → SYN-ACK → ACK
> - 4-Way Termination: FIN → ACK → FIN → ACK
> - Key Flags: SYN (connect), ACK (acknowledge), FIN (close), RST (abort)
> - Sequence numbers track byte position in stream
> - Window size controls flow (how much sender can transmit)
> - Retransmissions handle lost packets (timeout or 3 dup ACKs)
> - Common options: MSS, Window Scale, SACK, Timestamps
> - Watch for: RST packets, retransmissions, zero windows (problems)

---

_Next: [[05_Layer4_UDP_and_Ports]] - UDP Structure, Port Numbers_
