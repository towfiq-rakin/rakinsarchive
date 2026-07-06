# Section 9: VoIP Protocols - SIP, RTP, RTCP, SDP

---

## 9.1 VoIP Protocol Overview

Voice over IP uses multiple protocols working together:

**Signaling (Call Setup/Control):**

- **SIP (Session Initiation Protocol)** - Call setup/teardown, Invite, Register, Bye - Port 5060 (UDP/TCP)
- **SDP (Session Description Protocol)** - Media capabilities, codec negotiation, carried within SIP messages

**Media (Voice/Video Data):**

- **RTP (Real-time Transport Protocol)** - Audio/video payload, sequence numbers, timestamps
- **RTCP (RTP Control Protocol)** - Quality statistics, synchronization, participant info

> [!info] Example Network Layout
>
> - **PBX Server:** 192.168.1.138 (VMware VM)
> - **Extension 1234:** 192.168.1.1
> - **Extension 4321:** 192.168.1.130
> - **SIP Port:** 5060
> - **RTP Ports:** 10000-10003

---

## 9.2 SIP - Session Initiation Protocol

### SIP Overview

**Purpose:** Establish, modify, and terminate multimedia sessions

**Ports:**

- SIP: UDP/TCP 5060
- SIPS (TLS): TCP 5061

SIP is **text-based** (similar to HTTP):

**Request Example:**

```
INVITE sip:bob@example.com
Via: SIP/2.0/UDP ...
From: <sip:alice@example.com>
To: <sip:bob@example.com>
Call-ID: abc123@example.com
CSeq: 1 INVITE
Content-Type: application/sdp

[SDP body with media info]
```

**Response Example:**

```
SIP/2.0 200 OK
Via: SIP/2.0/UDP ...
From: <sip:alice@example.com>
To: <sip:bob@example.com>
Call-ID: abc123@example.com
CSeq: 1 INVITE
Content-Type: application/sdp

[SDP body with media info]
```

### SIP Methods (Requests)

| Method        | Description                                                        | Usage                    |
| ------------- | ------------------------------------------------------------------ | ------------------------ |
| **INVITE**    | Initiate session (call), contains SDP with media offer             | Start a call             |
| **ACK**       | Confirm final response to INVITE, only for INVITE transactions     | Complete 3-way handshake |
| **BYE**       | Terminate established session, sent by either party                | End a call               |
| **CANCEL**    | Cancel pending request before final response received              | Abort before answer      |
| **REGISTER**  | Register location with server, maps SIP URI to contact address     | Phone login              |
| **OPTIONS**   | Query capabilities (like HTTP OPTIONS)                             | Feature discovery        |
| **INFO**      | Send mid-session information, doesn't change session state         | DTMF digits              |
| **NOTIFY**    | Event notification, used with SUBSCRIBE                            | Status updates           |
| **SUBSCRIBE** | Subscribe to event notifications, creates event subscription       | Presence, BLF            |
| **REFER**     | Transfer call to another party, instructs recipient to contact URI | Call transfer            |
| **MESSAGE**   | Instant message (similar to SMS)                                   | Text chat                |
| **UPDATE**    | Modify session before established (like re-INVITE but before ACK)  | Pre-answer changes       |

### SIP Response Codes

**1XX - Provisional (Request received, processing)**

| Code | Name             | Description                             |
| ---- | ---------------- | --------------------------------------- |
| 100  | Trying           | Request received, working on it         |
| 180  | Ringing          | Called party is being alerted           |
| 181  | Call Forwarded   | Call is being forwarded                 |
| 182  | Queued           | Call is queued                          |
| 183  | Session Progress | Early media (ringback tone from callee) |

**2XX - Success**

| Code | Name     | Description                       |
| ---- | -------- | --------------------------------- |
| 200  | OK       | Request successful, call answered |
| 202  | Accepted | Request accepted for processing   |

**3XX - Redirection**

| Code | Name              | Description                |
| ---- | ----------------- | -------------------------- |
| 300  | Multiple Choices  | Multiple options available |
| 301  | Moved Permanently | User at new location       |
| 302  | Moved Temporarily | User temporarily elsewhere |
| 305  | Use Proxy         | Must use specified proxy   |

**4XX - Client Error**

| Code | Name                            | Description              |
| ---- | ------------------------------- | ------------------------ |
| 400  | Bad Request                     | Malformed request        |
| 401  | Unauthorized                    | Authentication required  |
| 403  | Forbidden                       | Server refuses request   |
| 404  | Not Found                       | User not found at domain |
| 405  | Method Not Allowed              | Method not supported     |
| 408  | Request Timeout                 | Request timed out        |
| 480  | Temporarily Unavailable         | User offline/DND         |
| 481  | Call/Transaction Does Not Exist | Invalid call reference   |
| 486  | Busy Here                       | User is busy             |
| 487  | Request Terminated              | Call cancelled           |
| 488  | Not Acceptable Here             | Media incompatible       |

**5XX - Server Error**

| Code | Name                  | Description           |
| ---- | --------------------- | --------------------- |
| 500  | Server Internal Error | Server failure        |
| 501  | Not Implemented       | Feature not supported |
| 502  | Bad Gateway           | Gateway error         |
| 503  | Service Unavailable   | Server overloaded     |
| 504  | Server Time-out       | Gateway timeout       |

**6XX - Global Failure**

| Code | Name                    | Description                |
| ---- | ----------------------- | -------------------------- |
| 600  | Busy Everywhere         | User busy at all locations |
| 603  | Decline                 | User explicitly declined   |
| 604  | Does Not Exist Anywhere | User doesn't exist         |

---

## 9.3 SIP Call Flow

### Basic Call Setup

```
Extension 1234 calls Extension 4321

   Ext 1234              PBX Server                Ext 4321
  192.168.1.1           192.168.1.138            192.168.1.130
       |                      |                       |
       |  1. INVITE           |                       |
       |=====================>|                       |
       |  To: 4321@192.168.1.138                      |
       |  [SDP: audio RTP port 10000]                 |
       |                      |                       |
       |  2. 100 Trying       |                       |
       |<---------------------|                       |
       |                      |                       |
       |                      |  3. INVITE            |
       |                      |======================>|
       |                      |  [SDP: audio RTP port 10002]
       |                      |                       |
       |                      |  4. 100 Trying        |
       |                      |<----------------------|
       |                      |                       |
       |                      |  5. 180 Ringing       |
       |                      |<----------------------|
       |                      |                       |
       |  6. 180 Ringing      |                       |
       |<---------------------|                       |
       |                      |                       |
       |                      |  7. 200 OK            |
       |                      |<----------------------|
       |                      |  [SDP: accept audio port 10003]
       |                      |                       |
       |  8. 200 OK           |                       |
       |<---------------------|                       |
       |  [SDP: accept audio port 10001]              |
       |                      |                       |
       |  9. ACK              |                       |
       |=====================>|                       |
       |                      |                       |
       |                      |  10. ACK              |
       |                      |======================>|
       |                      |                       |
       |                                              |
       |<=================  RTP AUDIO  ===============>|
       |  Port 10000/10001   <----->   Port 10002/10003
       |                                              |
       |                      |                       |
       |  11. BYE             |                       |
       |=====================>|                       |
       |                      |                       |
       |                      |  12. BYE              |
       |                      |======================>|
       |                      |                       |
       |                      |  13. 200 OK           |
       |                      |<----------------------|
       |                      |                       |
       |  14. 200 OK          |                       |
       |<---------------------|                       |
       |                      |                       |
```

---

## 9.4 SDP - Session Description Protocol

### SDP Structure

SDP describes multimedia session parameters:

```
v=0                                  Version (always 0)
o=- 123456 1 IN IP4 192.168.1.1      Origin (session ID, version, address)
s=SIP Call                           Session name
c=IN IP4 192.168.1.1                 Connection info (media destination)
t=0 0                                Timing (0 0 = permanent session)
m=audio 10000 RTP/AVP 0 8 101        Media line (type, port, protocol, formats)
a=rtpmap:0 PCMU/8000                 Attribute (codec 0 = G.711 u-law)
a=rtpmap:8 PCMA/8000                 Attribute (codec 8 = G.711 A-law)
a=rtpmap:101 telephone-event/8000    DTMF events
a=fmtp:101 0-16                      DTMF format parameters
a=sendrecv                           Direction (send and receive)
a=ptime:20                           Packet time (20ms)
```

**SDP Line Types:**

| Line | Name         | Description                    |
| ---- | ------------ | ------------------------------ |
| v=   | Version      | Required, always 0             |
| o=   | Origin       | Required, session creator      |
| s=   | Session Name | Required, human-readable       |
| c=   | Connection   | Where to send media            |
| t=   | Timing       | When session is active         |
| m=   | Media        | Media type, port, codecs       |
| a=   | Attribute    | Codec details, direction, etc. |

### Common Audio Codecs

| Payload Type | Codec | Bitrate (kbps) | Sample Rate | Description                 |
| ------------ | ----- | -------------- | ----------- | --------------------------- |
| 0            | PCMU  | 64             | 8kHz        | G.711 u-law (North America) |
| 8            | PCMA  | 64             | 8kHz        | G.711 A-law (Europe)        |
| 3            | GSM   | 13             | 8kHz        | GSM Full Rate               |
| 4            | G723  | 6.3/5.3        | 8kHz        | Low bitrate, licensed       |
| 9            | G722  | 64             | 16kHz       | Wideband (HD Voice)         |
| 18           | G729  | 8              | 8kHz        | Low bitrate, licensed       |

**Dynamic Payload Types (96-127):**

| Payload Type | Codec           | Bitrate (kbps) | Sample Rate | Description          |
| ------------ | --------------- | -------------- | ----------- | -------------------- |
| 96-127       | Opus            | 6-510          | 48kHz       | Modern, high quality |
| 96-127       | iLBC            | 13.3/15.2      | 8kHz        | Internet Low Bitrate |
| 96-127       | Speex           | 2.15-44        | 8-32kHz     | Open source          |
| 96-127       | G726            | 16-40          | 8kHz        | ADPCM variants       |
| 101          | telephone-event | N/A            | N/A         | DTMF (RFC 2833/4733) |

---

## 9.5 RTP - Real-time Transport Protocol

### RTP Header Structure (12 bytes minimum)

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|V=2|P|X|  CC   |M|     PT      |       Sequence Number         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           Timestamp                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Synchronization Source (SSRC) Identifier            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|            Contributing Source (CSRC) Identifiers             |
|                             ....                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           Payload                             |
|                       (Audio Samples)                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**Header Fields:**

| Field     | Size    | Description                               |
| --------- | ------- | ----------------------------------------- |
| V         | 2 bits  | Version (always 2)                        |
| P         | 1 bit   | Padding present                           |
| X         | 1 bit   | Extension header present                  |
| CC        | 4 bits  | CSRC count (contributors in mixer)        |
| M         | 1 bit   | Marker (frame boundary, talk-spurt start) |
| PT        | 7 bits  | Payload Type (codec identifier)           |
| Sequence  | 16 bits | Counter, increments per packet            |
| Timestamp | 32 bits | Sampling instant of first byte            |
| SSRC      | 32 bits | Random ID for this source                 |

### RTP Stream Analysis

**Typical G.711 RTP Stream:**

- Codec: PCMU/PCMA (G.711)
- Sample rate: 8000 Hz
- Packet interval: 20ms (50 packets/second)
- Payload size: 160 bytes (20ms at 8000 Hz)
- Bandwidth: ~64 kbps audio + overhead

**Sequence Number Analysis:**

```
Packet 1: Seq=1000
Packet 2: Seq=1001  (OK, +1)
Packet 3: Seq=1002  (OK, +1)
Packet 4: Seq=1005  (LOST 1003, 1004!)
Packet 5: Seq=1006  (OK, +1)
```

> [!warning] Missing packets = audio gaps/glitches

**Timestamp Analysis:**

20ms packets at 8000 Hz = 160 samples per packet. Timestamp increments by 160 each packet:

```
Packet 1: Timestamp=0
Packet 2: Timestamp=160   (0 + 160)
Packet 3: Timestamp=320   (160 + 160)
Packet 4: Timestamp=480   (320 + 160)
```

---

## 9.6 RTCP - RTP Control Protocol

### RTCP Overview

**Purpose:** Provide feedback on RTP stream quality

**Port:** RTP port + 1 (if RTP=10000, RTCP=10001)

**RTCP provides:**

- Packet loss statistics
- Jitter measurements
- Round-trip time calculation
- Source identification (CNAME)
- Synchronization between streams

**RTCP Packet Types:**

| Type | Name | Description                             |
| ---- | ---- | --------------------------------------- |
| 200  | SR   | Sender Report (sent by active senders)  |
| 201  | RR   | Receiver Report (sent by receivers)     |
| 202  | SDES | Source Description (CNAME, email, etc.) |
| 203  | BYE  | Goodbye (leaving session)               |
| 204  | APP  | Application-specific data               |

**RTCP Bandwidth:** Limited to 5% of RTP session bandwidth, sent periodically (every few seconds)

### RTCP Sender Report Structure

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|V=2|P|    RC   |   PT=200      |             Length            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         SSRC of sender                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|              NTP timestamp (most significant word)            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|              NTP timestamp (least significant word)           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         RTP timestamp                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     sender's packet count                     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                      sender's octet count                     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         [Reception Report Blocks - one per source]            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**Key Statistics:**

- **Fraction lost:** 8-bit loss ratio since last report
- **Cumulative lost:** Total packets lost
- **Highest sequence:** Last sequence number received
- **Jitter:** Interarrival jitter estimate
- **LSR:** Last SR timestamp received
- **DLSR:** Delay since last SR (for RTT calculation)

---

## 9.7 VoIP Call Quality Metrics

| Metric            | Good    | Acceptable | Poor    | Impact        |
| ----------------- | ------- | ---------- | ------- | ------------- |
| Packet Loss       | < 1%    | 1-2.5%     | > 2.5%  | Audio gaps    |
| Jitter            | < 30ms  | 30-50ms    | > 50ms  | Choppy audio  |
| Latency (one-way) | < 150ms | 150-300ms  | > 300ms | Echo, overlap |
| MOS Score (1-5)   | > 4.0   | 3.5-4.0    | < 3.5   | User rating   |
| R-Factor (0-100)  | > 80    | 70-80      | < 70    | Quality score |

> [!tip] Wireshark Analysis
> Use **Telephony > RTP > RTP Streams** to view Lost packets, Max Delta, Max Jitter, Mean Jitter

---

## 9.8 VoIP Wireshark Analysis

### Wireshark VoIP Features

**Telephony > VoIP Calls**

- Lists all detected calls
- Shows call state, duration, packets
- "Flow Sequence" button shows ladder diagram
- "Play Streams" to hear audio

**Telephony > RTP > RTP Streams**

- Lists all RTP streams
- SSRC, payload type, packets, lost
- Jitter statistics
- "Analyze" for detailed stream analysis

**Telephony > RTP > RTP Stream Analysis**

- Per-packet timing analysis
- Delta (time between packets)
- Jitter visualization
- Sequence number graph

**Telephony > SIP Flows**

- SIP message ladder diagram
- Visual representation of signaling

**Statistics > Flow Graph**

- Flow Type: "Displayed" or "VoIP calls"
- Protocol-aware sequence diagram

### SIP/RTP Wireshark Filters

**SIP Filters:**

| Filter                        | Description             |
| ----------------------------- | ----------------------- |
| `sip`                         | All SIP traffic         |
| `sip.Method == "INVITE"`      | INVITE requests         |
| `sip.Method == "BYE"`         | BYE requests            |
| `sip.Method == "REGISTER"`    | Registration attempts   |
| `sip.Status-Code == 200`      | 200 OK responses        |
| `sip.Status-Code >= 400`      | Error responses         |
| `sip.Status-Code == 401`      | Authentication required |
| `sip.Status-Code == 486`      | Busy                    |
| `sip.Status-Code == 603`      | Declined                |
| `sip.From contains "1234"`    | From extension 1234     |
| `sip.To contains "4321"`      | To extension 4321       |
| `sip.Call-ID == "abc123"`     | Specific call           |
| `sip.CSeq.method == "INVITE"` | INVITE transactions     |

**RTP Filters:**

| Filter                   | Description                     |
| ------------------------ | ------------------------------- |
| `rtp`                    | All RTP traffic                 |
| `rtcp`                   | All RTCP traffic                |
| `rtp.ssrc == 0x12345678` | Specific stream by SSRC         |
| `rtp.p_type == 0`        | PCMU (G.711 u-law)              |
| `rtp.p_type == 8`        | PCMA (G.711 A-law)              |
| `rtp.marker == 1`        | Marker bit set (frame boundary) |
| `rtp.seq`                | Has sequence number (is RTP)    |

---

## 9.9 Extracting Audio from RTP

### Method 1: Via VoIP Calls Window

1. **Telephony > VoIP Calls**
2. Select the call
3. Click **"Play Streams"**
4. Select streams and click **"Play"**
5. To save: **"Save"** button > Choose format (AU, WAV)

### Method 2: Via RTP Streams

1. **Telephony > RTP > RTP Streams**
2. Select stream(s)
3. **"Analyze" > "Play Streams"**
4. Or right-click > **"Decode as..."** to verify codec

**Supported Codecs for Playback:**

- **G.711 (PCMU/PCMA)** - Fully supported
- **G.722** - Supported in newer Wireshark
- **Speex** - Supported with plugins
- **Opus** - Limited support

---

## 9.10 Common VoIP Issues

### One-Way Audio

**Symptoms:** One party can hear, other cannot

**Causes:**

- NAT issues (private IP in SDP)
- Firewall blocking RTP ports
- Codec mismatch

**Diagnosis:**

- Check SDP for correct IP addresses
- Filter: `rtp && ip.src == [problem_endpoint]`
- Verify RTP packets flow in both directions

### No Audio

**Symptoms:** Call connects but no audio

**Causes:**

- RTP ports blocked
- Wrong IP in SDP (NAT)
- Codec negotiation failed

**Diagnosis:**

- Filter: `rtp` (should see RTP packets)
- Check SDP in 200 OK for correct media info
- Verify firewall allows UDP 10000-20000

### Choppy/Garbled Audio

**Symptoms:** Audio cuts out, robotic sound

**Causes:**

- Packet loss
- High jitter
- Network congestion

**Diagnosis:**

- **Telephony > RTP > RTP Streams** > Check lost%
- Check jitter values (should be < 30ms)
- Look for retransmissions, out-of-order packets

### Call Fails to Connect

**Symptoms:** No ring, immediate failure

**Causes:**

- Authentication failure (401)
- User not found (404)
- Service unavailable (503)

**Diagnosis:**

- Filter: `sip.Status-Code >= 400`
- Check response codes in SIP messages

---

## 9.11 Chapter Summary

> [!summary] Key Takeaways
>
> **SIP (Session Initiation Protocol):**
>
> - Signaling protocol for call setup/teardown
> - Port 5060 (UDP/TCP), 5061 (TLS)
> - Methods: INVITE, ACK, BYE, REGISTER, CANCEL
> - Response codes similar to HTTP (1xx-6xx)
>
> **SDP (Session Description Protocol):**
>
> - Describes media capabilities
> - Carried within SIP messages
> - Contains codec info, ports, IP addresses
>
> **RTP (Real-time Transport Protocol):**
>
> - Carries actual audio/video data
> - Sequence numbers detect packet loss
> - Timestamps for synchronization
>
> **RTCP (RTP Control Protocol):**
>
> - Quality feedback (loss, jitter)
> - Uses RTP port + 1
>
> **Wireshark VoIP Analysis:**
>
> - Telephony menu for VoIP-specific tools
> - RTP Streams for quality metrics
> - Can play back audio from captures

---

## Navigation

**Previous:** [[08 Other Protocols]] | **Next:** [[10 Wireshark]] | **Home:** [[00 Table of Contents]]
