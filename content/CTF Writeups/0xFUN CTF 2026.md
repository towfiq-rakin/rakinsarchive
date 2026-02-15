
## 🔍 Forensics
### Tesla

#### Challenge Description
The challenge provided a `.sub` file (`Tesla.sub`), which is a Sub-GHz signal file for a Flipper Zero. The file description hinted at it being a "Bad Usb 0xfun".
#### Analysis
##### 1. Examining the File
Opening `Tesla.sub`, we observed a `RAW_Data` field containing a long sequence of binary strings separated by spaces.

```text
RAW_Data: 11111111 11111110 00100110 01000000 ...
```
##### 2. Decoding Binary to Text
Converting these binary octets to ASCII characters revealed an obfuscated Windows Batch script.

```batch
&@cls&@set "Ilc=pesbMUQl73oWnqD9rAvFRKZaf0hO5@dBN4uSzCtGjE YxITwXiVm1Jcgy26LkH8P"
%Ilc:~29,1%%Ilc:~1,1%%Ilc:~54,1%...
```
##### 3. Deobfuscation
The script used variable substring replacement (e.g., `%Ilc:~N,1%`) to construct commands. By mapping these indices to the string `pesbMUQl73oWnqD9rAvFRKZaf0hO5@dBN4uSzCtGjE YxITwXiVm1Jcgy26LkH8P`, we reconstructed the original script:

```batch
@echo off
powershell -NoProfile -Command "[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes('i could be something to this'))"
:: 5958051a1b170013520746265a0e51435b36165752470b7f03591d1b364b501608616e ::
:: ive been encrypted many in ways::
pause
```
##### 4. Decrypting the Flag
The script contained a suspicious hex string in the comments: `5958051a1b170013520746265a0e51435b36165752470b7f03591d1b364b501608616e`.
The PowerShell command referenced the string `'i could be something to this'`.

Suspecting an XOR cipher, we XORed the hex string with the key `'i could be something to this'`.

```python
hex_str = "5958051a1b170013520746265a0e51435b36165752470b7f03591d1b364b501608616e"
key_str = "i could be something to this"
# ... XOR logic ...
# Result: 0xfun{d30bfU5c473_x0r3d_w1th_k3y}
```
#### Flag
`0xfun{d30bfU5c473_x0r3d_w1th_k3y}`

---
### Nothing_Expected 

#### Challenge Analysis
We are provided with a PNG file `file.png`. 

Initial analysis using `strings` or `binwalk` reveals the presence of the string `application/vnd.excalidraw+json`, indicating that the PNG file contains embedded Excalidraw scene data. Excalidraw often saves scene data inside the PNG `tEXt` chunks.

#### Solution Steps
1. **Extract Excalidraw Data**:
   The `tEXt` chunk contains a JSON object. Inside this JSON, there is an `encoded` field which contains the actual scene data, compressed.

2. **Decompress Data**:
   The `encoded` string is a sequence of bytes (latin-1 mapping) that needs to be decompressed using zlib. 

3. **Reconstruct the Image**:
   Parsing the decompressed JSON reveals a list of elements. There are `text` elements (containing "shh, this is a secret!!") and many `freedraw` elements. The flag is likely hidden within these `freedraw` strokes, which are just arrays of coordinate points.

   Since the flag is drawn manually (freedraw) rather than typed as text, we cannot simply `grep` for it. We must reconstruct the image by plotting these points.

4. **Rendering Script**:
   We wrote a Python script to parse the JSON and render the `freedraw` elements using the `Pillow` library.

   ```python
   import json
   import zlib
   from PIL import Image, ImageDraw

   def render_drawing():
       try:
           with open("file.png", "rb") as f:
               data = f.read()

           # Find Excalidraw JSON
           keyword = b"application/vnd.excalidraw+json"
           idx = data.find(keyword)
           if idx == -1:
               print("Excalidraw data not found")
               return

           # Extract and parse outer JSON
           start = idx + len(keyword) + 1
           # Simplified partial extraction for robustness
           chunk = data[start:] 
           text = chunk.decode('latin-1')
           start_json = text.find('{')
           dec = json.JSONDecoder()
           obj, _ = dec.raw_decode(text[start_json:])
           
           # Decompress inner data
           encoded_str = obj["encoded"]
           compressed = bytes([ord(c) for c in encoded_str])
           decompressed = zlib.decompress(compressed)
           drawing_data = json.loads(decompressed)

           elements = drawing_data.get("elements", [])
           
           # Determine canvas bounds
           min_x, min_y = 10000, 10000
           max_x, max_y = 0, 0
           
           for el in elements:
               if el["type"] == "freedraw":
                   x = el["x"]
                   y = el["y"]
                   min_x = min(min_x, x)
                   min_y = min(min_y, y)
                   # Estimate bounds (points are relative)
                   for p in el.get("points", []):
                        max_x = max(max_x, x + p[0])
                        max_y = max(max_y, y + p[1])

           # Pad and create image
           width = int(max_x - min_x + 100)
           height = int(max_y - min_y + 100)
           img = Image.new('RGB', (width, height), color='white')
           draw = ImageDraw.Draw(img)
           
           offset_x = -min_x + 50
           offset_y = -min_y + 50
           
           # Draw strokes
           for el in elements:
               if el["type"] == "freedraw":
                   points = el.get("points", [])
                   if len(points) > 1:
                       abs_points = [(p[0] + el["x"] + offset_x, p[1] + el["y"] + offset_y) for p in points]
                       draw.line(abs_points, fill='black', width=2)

           img.save("reconstructed.png")
           print("Flag image saved to reconstructed.png")

       except Exception as e:
           print(f"Error: {e}")

   if __name__ == "__main__":
       render_drawing()
   ```

5. **Result**:
   Running the script generates `reconstructed.png`, which visually displays the flag drawn with strokes.
#### Flag
(Read explicitly from `reconstructed.png`)

---
## 🔐 Crypto
### A Fortune Teller 

#### Challenge Overview
Predict the next 5 full 64-bit internal states of a Linear Congruential Generator (LCG) given three consecutive 32-bit truncated outputs ("glimpses").
#### Analysis
The provided `fortune.py` reveals the LCG parameters:
- **Modulus ($M$):** $2^{64}$
- **Multiplier ($A$):** $2862933555777941757$
- **Increment ($C$):** $3037000493$

The state update is standard:
$$S_{n+1} = (A \cdot S_n + C) \pmod M$$

However, the output function truncates the lower 32 bits:
$$G_n = S_n \gg 32$$
This means for each glimpse $G_n$, the full state is $S_n = G_n \cdot 2^{32} + x_n$, where $x_n$ is the unknown lower 32 bits ($0 \le x_n < 2^{32}$).

#### Solution: Lattice Attack
Since we know the high bits, we can formulate this as a lattice problem (specifically, a Closest Vector Problem or CVP) to recover the unknown low bits $x_1$.

From the LCG relation $S_2 \equiv A \cdot S_1 + C \pmod M$, we substitute the known parts:
$$G_2 \cdot 2^{32} + x_2 \equiv A(G_1 \cdot 2^{32} + x_1) + C \pmod M$$

Rearranging to group the unknowns ($x_1, x_2$):
$$x_2 - A \cdot x_1 \equiv A \cdot G_1 \cdot 2^{32} + C - G_2 \cdot 2^{32} \pmod M$$

Let $K$ be the known constant on the right side:
$$K = (A \cdot G_1 \cdot 2^{32} + C - G_2 \cdot 2^{32}) \pmod M$$
$$x_2 - A \cdot x_1 - k \cdot M = K$$

We are looking for small integers $x_1, x_2$ satisfying this equation. We construct a 2D lattice spanned by the basis vectors:
$$v_1 = (1, A)$$
$$v_2 = (0, M)$$

Any vector in this lattice is of the form:
$$v = z_1 v_1 + z_2 v_2 = (z_1, A \cdot z_1 + z_2 \cdot M)$$

If we choose $z_1 = x_1$ and $z_2 = k$, we get $v = (x_1, A \cdot x_1 + k \cdot M)$.
We want this vector to be "close" to a target vector $T = (0, -K)$.
The difference vector is:
$$v - T = (x_1, A \cdot x_1 + k \cdot M + K) = (x_1, x_2)$$

Since $x_1, x_2 \approx 2^{32}$ are small relative to $M=2^{64}$, the vector $(x_1, x_2)$ is short. We can use Gaussian Lattice Reduction (the 2D equivalent of LLL) to find a reduced basis, then solve the CVP to find the lattice vector closest to $T$.
#### Script Logic
1.  **Data Collection:** Retrieve glimpses $G_1, G_2, G_3$ from the server.
2.  **Lattice Reduction:** Apply Gaussian reduction to the basis $\{(1, A), (0, M)\}$.
3.  **CVP Solving:** Express $T = (0, -K)$ in the reduced basis, round coefficients to the nearest integers to find the closest lattice point.
4.  **Recovery & Verification:** Calculate $x_1$ from the difference, reconstruct $S_1$, and verify it generates $G_2$ and $G_3$. (A small search radius around the rounded coefficients handles boundary cases).
5.  **Prediction:** Once $S_1$ is verified, simulate the LCG to generate the next 5 full states.
#### Flag
`0xfun{trunc4t3d_lcg_f4lls_t0_lll}`

---
### The Fortune Teller's Revenge

#### Challenge Overview
Predict the next 5 full 64-bit states from three 32-bit leaked "glimpses" with large jumps between leaks.

The service gives:
- `g1 = high32(s1)`
- jump 100000 steps, then one normal step -> `g2 = high32(s2)`
- jump 100000 steps, then one normal step -> `g3 = high32(s3)`

and asks for the next 5 **full 64-bit** states.

#### Given RNG
- $M = 2^{64}$
- $A = 2862933555777941757$
- $C = 3037000493$
- jump constants:
  - $A_J = A^{100000} \bmod M$
  - $C_J = 8391006422427229792$

Normal step:
$$x' = A x + C \pmod{M}$$

Jump step:
$$x' = A_J x + C_J \pmod{M}$$

#### Effective relation between leaked full states
Each leak happens after `jump()` then `next()` (except the first, which is just first `next()`).
So the relation between consecutive leaked **full** states is:
$$s_{i+1} = B s_i + D \pmod{M}$$
where
$$B = A\cdot A_J \bmod M$$
$$D = A\cdot C_J + C \bmod M$$

Let:
$$s_i = g_i\cdot 2^{32} + x_i, \quad 0 \le x_i < 2^{32}$$

From $s_2 = B s_1 + D \pmod M$:
$$x_2 - Bx_1 \equiv B(g_1 2^{32}) + D - g_2 2^{32} \pmod M$$
Define:
$$K = \left(B(g_1 2^{32}) + D - g_2 2^{32}\right) \bmod M$$
then
$$x_2 - Bx_1 - tM = K$$
for some integer $t$.

This is solved as a 2D CVP/lattice problem with basis:
$$v_1=(1,B),\; v_2=(0,M)$$
Target is $(0,-K)$; the closest lattice point gives $(x_1,x_2)$, then reconstruct $s_1$.
Check consistency with $g_2,g_3$.

#### Important gotcha
The challenge asks for the next 5 full states **after the third glimpse**, using normal RNG progression (`next()`), not additional jump-transitions.
So once $s_3$ is recovered:
$$s_{n+1} = A s_n + C \pmod M$$
for 5 steps.

#### Solver
```python
#!/usr/bin/env python3

from __future__ import annotations

import re
import socket
from dataclasses import dataclass

M = 2**64
A = 2862933555777941757
C = 3037000493
JUMP = 100000
A_JUMP = pow(A, JUMP, M)
C_JUMP = 8391006422427229792

# Effective recurrence between leaked full states:
# s2 = B*s1 + D (mod M), s3 = B*s2 + D (mod M)
B = (A * A_JUMP) % M
D = (A * C_JUMP + C) % M


@dataclass
class RecoverResult:
    s1: int
    s2: int
    s3: int


def round_div(num: int, den: int) -> int:
    if den == 0:
        raise ZeroDivisionError("denominator is zero")
    if den < 0:
        num = -num
        den = -den
    if num >= 0:
        return (num + den // 2) // den
    return -(((-num) + den // 2) // den)


def gauss_reduce(v1: tuple[int, int], v2: tuple[int, int]) -> tuple[tuple[int, int], tuple[int, int]]:
    b1 = list(v1)
    b2 = list(v2)

    while True:
        n1 = b1[0] * b1[0] + b1[1] * b1[1]
        n2 = b2[0] * b2[0] + b2[1] * b2[1]
        if n2 < n1:
            b1, b2 = b2, b1
            n1, n2 = n2, n1

        dot = b1[0] * b2[0] + b1[1] * b2[1]
        mu = round_div(dot, n1)
        if mu == 0:
            break

        b2[0] -= mu * b1[0]
        b2[1] -= mu * b1[1]

    return (b1[0], b1[1]), (b2[0], b2[1])


def solve_2x2_closest(v1: tuple[int, int], v2: tuple[int, int], target: tuple[int, int]) -> tuple[tuple[int, int], tuple[int, int]]:
    a, c = v1
    b, d = v2
    det = a * d - b * c
    if det == 0:
        raise ValueError("Degenerate basis")

    tx, ty = target
    alpha_num = tx * d - b * ty
    beta_num = a * ty - tx * c
    return (alpha_num, det), (beta_num, det)


def recover_state(g1: int, g2: int, g3: int) -> RecoverResult:
    # s_i = g_i*2^32 + x_i, with x_i in [0, 2^32)
    k = (B * (g1 << 32) + D - (g2 << 32)) % M

    # Lattice of vectors (x1, B*x1 + t*M). We want close to target (0, -k)
    v1 = (1, B)
    v2 = (0, M)
    r1, r2 = gauss_reduce(v1, v2)

    alpha_frac, beta_frac = solve_2x2_closest(r1, r2, (0, -k))
    alpha0 = round_div(alpha_frac[0], alpha_frac[1])
    beta0 = round_div(beta_frac[0], beta_frac[1])

    best: RecoverResult | None = None
    for da in range(-64, 65):
        for db in range(-64, 65):
            a_int = alpha0 + da
            b_int = beta0 + db

            vx = a_int * r1[0] + b_int * r2[0]
            vy = a_int * r1[1] + b_int * r2[1]

            x1 = vx
            x2 = vy + k

            if not (0 <= x1 < (1 << 32) and 0 <= x2 < (1 << 32)):
                continue

            s1 = (g1 << 32) | x1
            s2 = (B * s1 + D) % M
            s3 = (B * s2 + D) % M

            if (s2 >> 32) == g2 and (s3 >> 32) == g3:
                best = RecoverResult(s1=s1, s2=s2, s3=s3)
                return best

    raise ValueError("Failed to recover state")


def predict_next_5(s3: int) -> list[int]:
    out = []
    cur = s3
    for _ in range(5):
        cur = (A * cur + C) % M
        out.append(cur)
    return out


def parse_three_ints(text: str) -> list[int]:
    nums = re.findall(r"\d+", text)
    return [int(x) for x in nums]


def solve_remote(host: str = "chall.0xfun.org", port: int = 45348) -> str:
    with socket.create_connection((host, port), timeout=10) as sock:
        sock.settimeout(2)
        chunks: list[str] = []
        while True:
            try:
                part = sock.recv(4096)
            except socket.timeout:
                break
            if not part:
                break
            chunks.append(part.decode(errors="ignore"))
            joined = "".join(chunks)
            values = parse_three_ints(joined)
            if len(values) >= 3 and "Predict the next 5 full 64-bit states" in joined:
                break

        data = "".join(chunks)
        values = parse_three_ints(data)
        if len(values) < 3:
            raise ValueError(f"Expected 3 glimpses, got: {data!r}")

        g1, g2, g3 = values[:3]
        rec = recover_state(g1, g2, g3)
        preds = predict_next_5(rec.s3)
        payload = " ".join(str(x) for x in preds) + "\n"

        sock.sendall(payload.encode())
        response_chunks: list[str] = []
        sock.settimeout(2)
        while True:
            try:
                part = sock.recv(4096)
            except socket.timeout:
                break
            if not part:
                break
            response_chunks.append(part.decode(errors="ignore"))
        response = "".join(response_chunks)
        return data + response


def main() -> None:
    result = solve_remote()
    print(result, end="")


if __name__ == "__main__":
    main()
```

#### Flag
`0xfun{r3v3ng3_0f_th3_f0rtun3_t3ll3r}`

---
## ⏪ Reverse
### Pharaoh's Curse 

#### Overview

We're given a single binary `tomb_guardian`. The challenge is a three-stage reverse engineering puzzle themed around ancient Egypt; each stage unlocks the next.

#### Stage 1: tomb_guardian

Running `file` on the binary shows a stripped, 64-bit ELF PIE executable. It prompts for a password.

```bash
$ file tomb_guardian
tomb_guardian: ELF 64-bit LSB pie executable, x86-64, ... stripped
```

##### Anti-Debugging

The binary calls `ptrace(PTRACE_TRACEME)` on itself to detect debuggers. We patch the conditional jump to bypass this:

```python
# Patch JNE → JMP at offset 0x10db
data[0x10db] = 0xeb  # 0x75 (jne) → 0xeb (jmp)
```

##### Stack-Based VM

Disassembly reveals a **stack-based virtual machine** interpreter at the core. The bytecode lives at file offset `0x3040` and performs XOR-based character validation. The repeating pattern in the bytecode is:

```
40 01 XX 12 01 YY 20 31 91 02
```

This translates to: `if input[i] XOR YY != XX then fail`. So the password is recovered by XORing each pair:

```python
password = ''.join(chr(xx ^ yy) for xx, yy in pairs)
# → "0p3n_s3s4m3"
```

```
$ ./tomb_guardian
Enter password: 0p3n_s3s4m3
You have spoken the old tongue well, my child...
The sacred chamber awaits: Kh3ops_Pyr4m1d
```

#### Stage 2: Sacred Chamber

The output gives us the password for the next stage — a 7z archive:

```bash
$ 7z x sacred_chamber.7z -p"Kh3ops_Pyr4m1d"
```

This extracts:
- `hiero_vm` — A Rust-compiled VM interpreter
- `challenge.hiero` — 275 lines of hieroglyphic bytecode

#### Stage 3: Hieroglyphic VM

This is where it gets interesting. `challenge.hiero` uses actual **Unicode Egyptian Hieroglyphs** (U+13000 range) as opcodes and **Cuneiform characters** (U+12000 range) as numeric operands.

##### Instruction Set

| Hieroglyph | Opcode | Description |
|:---:|--------|-------------|
| 𓋴 | READ | Read a character from stdin |
| 𓁹 X | PUSH | Push value/index X |
| 𓐍 | STORE | Store to register |
| 𓑀 | POP | Pop from stack |
| 𓃭 | PUSH_IMM | Push immediate value |
| 𓈖 | OP | Binary operation on two values |
| 𓉐 | CJMP | Conditional jump (fail if ≠) |
| 𓌳 | SUCCESS | Accept input |
| 𓍯 | HALT | End execution |

Cuneiform values decode as: `value = ord(char) - 0x12000`.  
For example, `𒃘` = U+120D8 → 216.

##### Bytecode Structure

**Phase 1 (lines 1–81):** Read 27 characters into registers 0–26.

```
𓋴          # READ
𓁹 𒀀       # PUSH index 0
𓐍          # STORE
```

**Phase 2 (lines 82–273):** 24 constraint checks, each following the pattern:

```
𓁹 𒀆       # PUSH Input[6]
𓑀          # POP
𓁹 𒀇       # PUSH Input[7]
𓑀          # POP
𓃭          # PUSH_IMM
𓁹 𒃘       # PUSH 216
𓈖          # COMPARE
𓉐 𒂥 𒀁   # CJMP (fail if not equal)
```

##### The Trap: It's Not XOR

The natural assumption for `𓈖` is XOR — it's the most common operation in VM crackmes. But when we check the **cross-constraints** against the chain constraints, they're inconsistent under XOR:

```
Chain:   Input[6] ⊕ Input[10] = 216 ⊕ 156 ⊕ 166 ⊕ 166 = 68
Cross:   Input[6] ⊕ Input[10] = 164
Mismatch! → 𓈖 is NOT XOR
```

The breakthrough: **`𓈖` performs modular addition** — `(a + b) mod 256`.

##### Solving with Z3

With the correct operation identified, we use Z3 with the known flag format `0xfun{...}` (27 characters total):

```python
from z3 import *

inputs = [BitVec(f'input_{i}', 8) for i in range(27)]
solver = Solver()

# Known: flag format is 0xfun{...}
for i, ch in enumerate("0xfun{"):
    solver.add(inputs[i] == ord(ch))
solver.add(inputs[26] == ord('}'))

# Printable ASCII
for i in range(27):
    solver.add(inputs[i] >= 0x20)
    solver.add(inputs[i] <= 0x7E)

# All 24 constraints as modular addition
constraints = [
    (6, 7, 216), (7, 8, 156), (8, 9, 166), (9, 10, 166),
    (10, 11, 100), (11, 12, 152), (12, 13, 199), (13, 14, 213),
    (14, 15, 227), (15, 16, 204), (16, 17, 144), (17, 18, 159),
    (18, 19, 209), (19, 20, 150), (20, 21, 163), (21, 22, 228),
    (22, 23, 165), (23, 24, 97), (24, 25, 158),
    # Cross constraints
    (6, 10, 164), (8, 15, 161), (12, 20, 155), (15, 23, 158),
    (7, 18, 214),
]

for a, b, val in constraints:
    solver.add((inputs[a] + inputs[b]) & 0xFF == val)

assert solver.check() == sat
model = solver.model()
flag = ''.join(chr(model[inputs[i]].as_long()) for i in range(27))
print(flag)
```

```
0xfun{ph4r40h_vm_1nc3pt10n}
```

#### Verification

```bash
$ echo -n "0xfun{ph4r40h_vm_1nc3pt10n}" | ./hiero_vm challenge.hiero
The ancient seals accept your offering
```
##### Flag

```
0xfun{ph4r40h_vm_1nc3pt10n}
```