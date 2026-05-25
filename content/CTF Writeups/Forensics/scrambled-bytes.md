---
draft: true
---

# scrambled-bytes - PicoCTF Forensics Challenge Writeup

## Challenge Description
"I sent my secret flag over the wires, but the bytes got all mixed up!"
We are provided with `capture.pcapng` and `send.py`.
[scrambled-bytes](https://play.picoctf.org/practice/challenge/206?category=4&difficulty=3&page=1)

## Analysis

### 1. Analyzing `send.py`
The script `send.py` reveals how the data was scrambled and sent:
1.  **Read Payload**: Reads a file (likely the flag image).
2.  **Seeding**: Initializes the random number generator with `random.seed(int(time()))`.
3.  **Shuffle**: Shuffles the bytes of the payload using `random.shuffle(payload)`.
4.  **Transmission**: Iterates through the shuffled bytes and sends them as UDP packets.
    -   Each byte is XORed with a random key: `b ^ random.randrange(256)`.
    -   Also consumes a random number for the source port: `random.randrange(65536)`.

### 2. Strategy
To reverse this, we need to:
1.  **Extract Data**: Parse `capture.pcapng` to extract the encrypted bytes from the UDP stream.
2.  **Find the Seed**: Since `random.seed(int(time()))` was used, the timestamp of the first packet in the capture (rounded down to an integer) is our seed.
3.  **Decrypt (XOR)**: Re-initialize the random generator with that seed and generate the same sequence of XOR keys to decrypt the bytes.
4.  **Un-shuffle**: Re-generate the shuffle permutation to map the decrypted bytes back to their original positions.

## Solution

### Step 1: Inspect the PCAP
We inspected the pcap to find the target port and timestamp.
-   Target UDP Port: `56742` (Found by counting common destination ports).
-   First Packet Timestamp: `1614044650.91` -> Seed: `1614044650`.

### Step 2: The Solution Script
Here is the python script (`solve_flag.py`) used to reconstruct the original image.

```python
from scapy.all import *
import random
import sys

def solve():
    print("Reading packets...")
    packets = rdpcap('capture.pcapng')
    
    # Filter for target port 56742 which contained the majority of traffic
    target_packets = [p for p in packets if UDP in p and p[UDP].dport == 56742 and Raw in p]
    
    if not target_packets:
        print("No target packets found.")
        return

    encrypted_bytes = [p[Raw].load[0] for p in target_packets] 
    print(f"Got {len(encrypted_bytes)} encrypted bytes.")

    # Seed derived from the first packet timestamp: 1614044650.91
    seed = 1614044650
    print(f"Using seed: {seed}")
    
    # --- Step 1: Decrypt the XOR ---
    random.seed(seed)
    
    # We must consume the random state exactly as the original script did.
    # The original script ran: random.shuffle(payload)
    # We simulate this to advance the RNG state correctly.
    dummy_list = list(range(len(encrypted_bytes)))
    random.shuffle(dummy_list) 
    
    decrypted_shuffled_bytes = []
    for i in range(len(encrypted_bytes)):
        # Original script consumed a random number for sport
        random.randrange(65536)
        # Original script consumed a random number for XOR key
        key = random.randrange(256)
        
        decrypted_byte = encrypted_bytes[i] ^ key
        decrypted_shuffled_bytes.append(decrypted_byte)
        
    # --- Step 2: Un-shuffle ---
    # Reset seed to recreate the exact shuffle permutation used
    random.seed(seed)
    indices = list(range(len(encrypted_bytes)))
    random.shuffle(indices)
    
    # Map shuffled bytes back to their original indices
    original_bytes = [0] * len(encrypted_bytes)
    for i, original_index in enumerate(indices):
        original_bytes[original_index] = decrypted_shuffled_bytes[i]
        
    # Save the output
    result = bytearray(original_bytes)
    with open('solution.png', 'wb') as f:
        f.write(result)
        
    print(f"Written {len(result)} bytes to solution.png")
    
    if result.startswith(b'\x89PNG\r\n\x1a\n'):
        print("SUCCESS! Detected PNG header.")

if __name__ == '__main__':
    solve()
```

### Step 3: Execution
Run the script to generate `solution.png`:

```bash
python3 solve_flag.py
```

Output:
```
Reading packets...
Got 1992 encrypted bytes.
Using seed: 1614044650
Written 1992 bytes to solution.png
SUCCESS! Detected PNG header.
```

Opening `solution.png` reveals the flag.
