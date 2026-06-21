# Error Detection and Correction
> **Source:** Chapter 10 — Data Communications & Networking  

---

## Overview

> [!note] Core Concept
> Data can be corrupted during transmission. Some applications require that errors be **detected** and **corrected**. Error Detection and Correction are implemented at the **Data Link Layer** and the **Transport Layer** of the Internet model.

---

## 10.1 Introduction

### Types of Errors

Errors occur when one or more bits in a transmitted data unit are altered during transit. There are two fundamental types:

#### 1. Single-Bit Error
- Only **1 bit** in the data unit changes from 0→1 or 1→0.
- Least common in real networks (requires a very brief, isolated noise spike).

#### 2. Burst Error
- **2 or more bits** in the data unit have changed.
- Measured from the **first corrupted bit** to the **last corrupted bit**.
- Bits *in between* may or may not be corrupted.
- Much more common in practice (noise tends to affect multiple consecutive bits).

> [!tip] Key Distinction
> A burst error of length `n` means the corruption spans `n` bit positions — not that all `n` bits are necessarily wrong.

---

### Redundancy

> [!important] Definition
> **Redundancy** is the central concept behind all error detection and correction. Extra (redundant) bits are appended to the data at the sender and checked at the receiver.

- A **shorter group of redundant bits** is appended to each data unit rather than repeating the entire stream.
- These extra bits are **discarded** once accuracy is verified.

$$\text{Transmitted unit} = \text{Data bits} + \text{Redundant bits}$$

---

### Error Detection vs. Error Correction

| Aspect | Error Detection | Error Correction |
|---|---|---|
| Goal | Know *if* an error occurred | Know *where* and *how many* bits changed |
| Complexity | Simpler | More complex |
| Redundancy needed | Less | More |
| Action | Discard / request retransmission | Fix the corrupted bits directly |

> [!warning]
> Error correction requires knowing the **exact number** of corrupted bits and, more importantly, their **locations** in the message.

---

### Forward Error Correction vs. Retransmission

- **Forward Error Correction (FEC):** Receiver corrects errors on its own using redundant bits — no need to contact sender.
- **Retransmission (ARQ):** Receiver detects an error and requests the sender to retransmit the data.

---

### Modular Arithmetic

In **modulo-N arithmetic**, only integers from `0` to `N−1` are used (wrapping around after reaching `N`).

#### Modulo-2 Arithmetic (XOR)

This is the foundation of most coding schemes:

| Operation | Result |
|---|---|
| 0 + 0 | 0 |
| 0 + 1 | 1 |
| 1 + 0 | 1 |
| 1 + 1 | **0** (carry discarded) |

- Addition and subtraction are **identical** in mod-2.
- Equivalent to the **XOR (⊕) operation**.

> [!note]
> Modulo-2 arithmetic has no carries — this makes it very efficient for hardware implementation.

---

## 10.2 Block Coding

> [!info] Definition
> In **block coding**, a message is divided into blocks of **k bits** called **datawords**. Then **r redundant bits** are added to each block, making an **n-bit codeword**, where:
> $$n = k + r$$

The pair is described as a **C(n, k)** coding scheme.

---

### Error Detection in Block Coding

For a receiver to detect errors, **two conditions** must be met:
1. The receiver has (or can compute) a **list of valid codewords**.
2. The original codeword has been **changed to an invalid one** during transmission.

#### Example — C(3, 2) Code

| Dataword | Codeword |
|---|---|
| 00 | 000 |
| 01 | 011 |
| 10 | 101 |
| 11 | 110 |

**Scenario — Sender sends `011` (dataword `01`):**

| Received | Valid? | Outcome                                                       |
| -------- | ------ | ------------------------------------------------------------- |
| `011`    | Yes    | Dataword `01` extracted correctly                             |
| `111`    | No     | Discarded — error detected                                    |
| `000`    | Yes    | Dataword `00` extracted **wrongly** — 2-bit error undetected! |

> [!warning] Limitation
> Not all errors can be detected. If corruption happens to produce *another valid codeword*, the error goes unnoticed.

---

### Error Correction in Block Coding

In error correction, the receiver must **find (or guess) the original codeword** sent. This requires **more redundant bits** than detection alone.

#### Example — C(5, 2) Code

5-bit codewords from 2-bit datawords (3 redundant bits added):

| Dataword | Codeword |
|---|---|
| 00 | 00000 |
| 01 | 01011 |
| 10 | 10101 |
| 11 | 11110 |

**Scenario:** Sender sends `01011`. Receiver gets `01001` (1 bit corrupted).

**Correction strategy (assuming only 1 bit is corrupted):**
1. `01001` vs `00000` → differ by **2 bits** → not the original.
2. `01001` vs `01011` → differ by **1 bit** →  **This is the match!**
3. `01001` vs `10101` → differ by **4 bits** → not the original.
4. `01001` vs `11110` → differ by **3 bits** → not the original.

→ Receiver corrects to `01011` → extracts dataword `01`.

---

### Hamming Distance

> [!info] Definition
> The **Hamming distance** `d(x, y)` between two words of equal size is the **number of bit positions** in which they differ.

**Calculation method:** XOR the two words and count the number of `1`s in the result.

#### Example

$$d(000,\ 011) = 000 \oplus 011 = 011 \Rightarrow \text{two 1s} \Rightarrow d = 2$$

$$d(10101,\ 11110) = 10101 \oplus 11110 = 01011 \Rightarrow \text{three 1s} \Rightarrow d = 3$$

---

### Minimum Hamming Distance (d_min)

> [!important]
> The **minimum Hamming distance** (`d_min`) of a coding scheme is the **smallest Hamming distance** among all possible pairs of valid codewords.

- For the C(3,2) scheme: `d_min = 2`
- For the C(5,2) scheme: `d_min = 3`

---

### Using d_min for Error Detection and Correction

#### Error Detection

$$\boxed{d_{\min} = s + 1}$$

To detect up to **s errors**, the minimum Hamming distance must be at least `s + 1`.

| d_min | Max errors detectable |
|---|---|
| 2 | 1 |
| 3 | 2 |
| 4 | 3 |

#### Error Correction

$$\boxed{d_{\min} = 2t + 1}$$

To correct up to **t errors**, the minimum Hamming distance must be at least `2t + 1`.

| d_min | Max errors correctable |
|---|---|
| 3 | 1 |
| 5 | 2 |
| 7 | 3 |

> [!example] Combined Detection + Correction
> To both **detect** `s` errors **and correct** `t` errors (where `s > t`):
> $$d_{\min} = s + t + 1$$

---

## 10.3 Linear Block Codes

> [!info] Definition
> A **linear block code** is one in which the **XOR of any two valid codewords** produces another valid codeword.

- Almost all block codes used today are linear block codes.
- Formally, the set of codewords is **closed under XOR**.

**Property for d_min:**
> In a linear block code, `d_min` equals the **number of 1s in the non-zero valid codeword with the fewest 1s** (i.e., the minimum weight of any non-zero codeword).

---

### Simple Parity-Check Code

> [!info]
> A **k-bit dataword** becomes an **n-bit codeword** where `n = k + 1`. The extra bit (parity bit) is chosen to make the total number of `1`s **even** (even parity) or **odd** (odd parity).

$$C(n,k) = C(k+1, k),\quad d_{\min} = 2$$

- **Detects:** Single-bit errors (and any **odd** number of errors).
- **Cannot correct** any error.
- Cannot detect **even numbers** of errors.

#### C(5, 4) Example

For dataword `1011`:
- Count of 1s = 3 (odd) → parity bit = `1` to make total even
- Codeword = `10111`

**Syndrome check at receiver:** XOR all bits; if result is `0` → no error; if `1` → error detected.

| Case             | Received | Syndrome | Result                      |
| ---------------- | -------- | -------- | --------------------------- |
| No error         | `10111`  | 0        | Dataword `1011` extracted   |
| 1-bit error (a₁) | `10011`  | 1        | Error detected              |
| 1-bit error (r₀) | `10110`  | 1        | Error detected              |
| 2-bit error      | `00110`  | 0        | **Wrong dataword accepted** |
| 3-bit error      | `01011`  | 1        | Error detected              |

> [!note]
> A simple parity-check code can detect **any odd number of errors**.

---

### Two-Dimensional Parity-Check Code

- Data bits are organized in a **table (rows × columns)**.
- A **parity bit** is computed for each row **and** each column.
- The entire table (including parity row/column) is transmitted.
- Receiver checks syndromes for each row and column.

**Capability:** Can detect up to **3 errors** anywhere in the table.

> [!tip]
> Two-dimensional parity is more powerful than simple parity but adds more overhead (parity bits for every row and column).

---

### Hamming Code

The **Hamming Code** is a linear block code designed for **single-bit error correction**.

$$C(n, k) \text{ where } n = 2^r - 1,\quad k = 2^r - r - 1,\quad r = \text{number of redundant bits}$$

- `d_min = 3` → can **detect 2 errors** or **correct 1 error**.

#### Structure

- Redundant bits are placed at positions that are **powers of 2**: 1, 2, 4, 8, ...
- Each redundant bit checks a specific set of data bit positions.

#### Example — C(7, 4)

4-bit dataword → 7-bit codeword with 3 parity bits at positions 1, 2, 4.

| Bit position | 7 | 6 | 5 | 4 | 3 | 2 | 1 |
|---|---|---|---|---|---|---|---|
| Type | d₄ | d₃ | d₂ | **r₃** | d₁ | **r₂** | **r₁** |

**Parity assignments:**
- `r₁` (pos 1): checks positions 1, 3, 5, 7
- `r₂` (pos 2): checks positions 2, 3, 6, 7
- `r₃` (pos 4): checks positions 4, 5, 6, 7

**Error location (syndrome):**
- At the receiver, re-calculate each parity. The binary value formed by the syndrome bits points directly to the position of the corrupted bit.
- If syndrome = `011` (= 3 in decimal) → bit 3 is corrupted → flip it.

> [!success] Key Advantage of Hamming Code
> The syndrome value directly gives the **position** of the erroneous bit, enabling single-bit correction without retransmission.

---

## 10.4 Cyclic Codes

> [!info] Definition
> **Cyclic codes** are a special subset of linear block codes with an extra property:
> If a codeword is **cyclically shifted (rotated)**, the result is also a valid codeword.

Example: If `1011000` is a codeword, then `0110001` (left-shift by 1) is also a codeword.

$$b_1=a_0,\ b_2=a_1,\ \ldots,\ b_6=a_5,\ b_0=a_6$$

---

### Cyclic Redundancy Check (CRC)

**CRC** is the most widely used cyclic code, employed in LANs and WANs.

> CRC is based on **binary division** (polynomial division in GF(2)).

#### Two Required Properties of CRC
1. CRC must have **exactly one fewer bit** than the divisor (generator polynomial).
2. The resulting bit sequence (Data + CRC) must be **exactly divisible** by the divisor with **remainder 0**.

#### Process

**At the Sender:**
1. Append `r` zeros to the dataword (where `r` = degree of the generator polynomial).
2. Divide the augmented dataword by the **generator** (using mod-2 division).
3. The **remainder** of this division is the **CRC**.
4. Replace the appended zeros with the CRC and transmit.

**At the Receiver:**
1. Divide the received codeword by the same generator.
2. If remainder = `0` → No error (or undetected error).
3. If remainder ≠ `0` → Error detected.

> [!note] Syndrome Interpretation
> - `S(x) = 0` → Either no bit is corrupted, OR some bits are corrupted but the decoder **failed to detect** them.
> - `S(x) ≠ 0` → One or more bits are **definitely corrupted**.

---

### CRC Using Polynomials

CRC can be elegantly expressed using **polynomial representation**:

- Each bit string is treated as a polynomial with binary coefficients.
- Example: `10110` → $x^4 + x^2 + x$

**Standard generator polynomials:**

| Standard | Generator Polynomial |
|---|---|
| CRC-8 | $x^8 + x^2 + x + 1$ |
| CRC-16 | $x^{16} + x^{15} + x^2 + 1$ |
| CRC-32 | $x^{32} + x^{26} + x^{23} + \ldots + 1$ |

---

### Advantages of Cyclic Codes

- Can detect all **single-bit errors**.
- Can detect all **double errors** (if the generator has an appropriate factor).
- Can detect all **odd numbers of errors** (if `(x+1)` is a factor of the generator).
- Can detect all **burst errors** with length ≤ `r` (where `r` is the degree of the generator).
- **Easily implemented** in both hardware and software.
- **Extremely fast** in hardware (shift-register based).

---

## 10.5 Checksum

> [!info]
> The **checksum** is an error detection method used primarily in the **Internet layer** (not the data link layer). It is used by protocols such as **UDP**, **TCP**, and **IP**.

Like other methods, checksum is based on **redundancy**.

> [!note]
> The tendency is to replace checksum with CRC in modern systems, but many protocols still use it.

---

### Basic Idea

1. **Sender** adds all data segments together and sends the **sum** (or its complement) along with the data.
2. **Receiver** re-adds all segments (including the checksum). If the result is `0` → no error.

#### Example (Simple Sum)

Data: `(7, 11, 12, 0, 6)` → Sum = `36`  
Sender transmits: `(7, 11, 12, 0, 6, 36)`  
Receiver adds all 6 numbers and compares with `36`.

#### Using Complement (Checksum)

Sender transmits the **negative (complement)** of the sum instead:  
`(7, 11, 12, 0, 6, −36)`  
Receiver adds all → if result = `0`, no error.

---

### One's Complement Arithmetic

> [!info]
> In **one's complement** arithmetic with `n` bits:
> - Unsigned numbers range from `0` to `2ⁿ − 1`.
> - If the sum exceeds `n` bits, the **extra (overflow) bits are wrapped around** and added back to the `n`-bit result.
> - The **negative** of a number is found by **inverting all bits**.

#### Example — Representing 21 in 4-bit One's Complement

$$21_{10} = 10101_2$$

5-bit number → wrap the leftmost bit:
$$0101 + 1 = 0110 = 6$$

So 21 mod (2⁴ − 1) = 6 in one's complement.

#### Example — Representing −6 in 4-bit One's Complement

$$+6 = 0110_2 \Rightarrow -6 = 1001_2 \quad (\text{invert all bits})$$

Alternatively: $2^4 - 1 - 6 = 15 - 6 = 9 = 1001_2$ 

---

### Checksum Worked Example

#### At the Sender (8-bit checksum, 16-bit data block)

```
Original data : 10101001  00111001

  10101001
+ 00111001
----------
  11100010   ← Sum

Checksum = complement of Sum = 00011101

Transmitted: 10101001  00111001  00011101
```

#### At the Receiver — No Error Case

```
  10101001
  00111001
+ 00011101
----------
  11111111   ← Sum

Complement = 00000000   → No error 
```

#### At the Receiver — With Error (burst of length 5)

```
Received: 10101111  11111001  00011101  (4 bits flipped)

Sum = 11000110
Complement = 00111001  → Non-zero → Error detected 
```

---

### Internet Checksum Algorithm

#### Sender Side

1. Divide the message into **16-bit words**.
2. Set the checksum word to **0**.
3. Add all words (including checksum) using **one's complement addition**.
4. **Complement** the sum → this becomes the checksum.
5. Send the data **with the checksum**.

#### Receiver Side

1. Divide received message (including checksum) into **16-bit words**.
2. Add all words using **one's complement addition**.
3. **Complement** the result.
4. If result = `0` →  **Accept** the message.  
   If result ≠ `0` →  **Reject** the message (error detected).

---

## Summary Comparison Table

| Method              | Type         | d_min  | Detects           | Corrects      | Used In              |
| ------------------- | ------------ | ------ | ----------------- | ------------- | -------------------- |
| Simple Parity Check | Linear Block | 2      | Odd # of errors   | None          | Basic links          |
| 2D Parity Check     | Linear Block | ≥3     | Up to 3 errors    | Limited       | Enhanced links       |
| Hamming Code        | Linear Block | 3      | 2 errors          | 1 error       | Memory, hardware     |
| CRC                 | Cyclic       | Varies | Burst + multi-bit | (detect only) | LANs, WANs, Ethernet |
| Checksum            | Arithmetic   | —      | Some errors       | None          | IP, TCP, UDP         |

---

## Key Formulas at a Glance

| Formula | Meaning |
|---|---|
| $n = k + r$ | Codeword = dataword + redundant bits |
| $d_{\min} = s + 1$ | Detect up to `s` errors |
| $d_{\min} = 2t + 1$ | Correct up to `t` errors |
| $d_{\min} = s + t + 1$ | Detect `s` AND correct `t` errors |
| $n = 2^r - 1$ | Hamming codeword length |
| $k = 2^r - r - 1$ | Hamming dataword length |

---

> [!summary] Chapter Takeaway
> Error control in networks is a layered problem. **Checksums** handle it at the network/transport layer with simple arithmetic. **CRC** handles it at the data link layer with powerful polynomial division. **Hamming codes** handle it in memory systems where correction is needed. The choice depends on the trade-off between overhead, speed, and the type of errors expected.
