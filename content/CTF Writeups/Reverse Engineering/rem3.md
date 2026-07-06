---
tags:
  - reverse
Date: 2026-01-20
draft: true
---

# Writeup: Reverse Engineering `rem3.ks`

## Challenge Overview
**File**: `rem3.ks`  
**Type**: 64-bit ELF Executable  
**Size**: ~524MB (mostly padding)

## 1. Initial Reconnaissance
Upon examining the file, two things stood out immediately:
1.  **File Size**: The binary is over 500MB. Running `readelf -S` revealed standard section headers, but an analysis of the file content showed that the vast majority of the file (after offset `0x4000`) consists of zero-byte padding. This is a common anti-analysis technique designed to discourage uploading the file to online sandboxes or decompilers.
2.  **Strings**: Running `strings` returned several potential flags, clearly designed to mislead:
    *   `KCTF{fake_flag_for_reversers}`
    *   `KCTF{str1ngs_lie_dont_trust!}`
    *   `KCTF{hash_passes_but_fake!!!}`

## 2. Static Analysis
Disassembling the binary with `objdump` revealed the control flow in the `main` function (around `0x10c0`).

### Validation Logic
The program performs a series of checks on the user input:

1.  **Length Check**: It calls `fgets` to read input and verifies that the length is exactly **29 characters** (0x1d).

2.  **Decoy Check 1 (String Comparison)**:
    It compares the input against the hardcoded string `KCTF{str1ngs_lie_dont_trust!}`. If it matches, the program *claims* success but this is a false positive.

3.  **Decoy Check 2 (Hash Check)**:
    It computes a 64-bit FNV-1a hash of the input. If the hash equals `0xe76fa3daba5d6f3a`, it prints another success message for the flag `KCTF{hash_passes_but_fake!!!}`. This is another trap.

4.  **The Real Check**:
    If the input passes the hash check (meaning it *doesn't* match the decoy hash), the program proceeds to a custom encryption routine at offset `0x14c0`.

## 3. The Encryption Routine
The function at `0x14c0` is a custom stream cipher. It encrypts the input buffer in place.

### State & Constants
The algorithm uses two large 64-bit constants:
*   `K1 = 0x2f910ed35ca71942`
*   `K2 = 0x6a124de908b17733`

It maintains state variables (`edi`, `esi`, `r8d`) that evolve as the loop iterates over the 29 input characters.

### Per-Byte Operation
For each byte of the input:
1.  **Context Generation**: It derives several shift counts and masks using the current index `i` and the constants `K1`, `K2`.
2.  **Transformation**:
    *   It adds `edi` to a derived value.
    *   It XORs the input byte with a value derived from `K1`.
    *   It performs a **left rotation** (ROL) on the byte.
    *   It adds `esi`.
    *   It XORs with a value derived from `r8d` and `K2`.
    *   It performs a **right rotation** (ROR) on the result.
3.  **State Update**:
    *   `edi` is updated by adding `0x1d`.
    *   `r8d` is updated by adding `0x11`.
    *   `esi` is updated in a complex calculation involving `K1` and the current `eax` value.

### Verification
After encryption, the program compares the transformed buffer against three chunks of hardcoded bytes stored in the `.data` section.

## 4. Solution
Since the algorithm is deterministic and uses reversible arithmetic operations (Add/Sub, XOR, Rol/Ror), we can reverse the process to recover the plaintext.

We extracted the target ciphertext bytes:
```
dc 6b bb 4d fd 25 e4 7e c3 26
f5 72 ab 96 fc 8d 55 10 93 c1
fd 81 46 5b 7e 33 83 8f 2f
```

We then wrote a Python script to simulate the state updates forward (to get the correct rotation counts and masks for each step) while reversing the byte transformations backwards.

### Solver Script Snippet
```python
# Reverse Logic for byte 'C' (ciphertext)
# 1. Reverse ROR (becomes ROL)
# 2. Reverse XOR (remains XOR)
# 3. Reverse ADD (becomes SUB)
# 4. Reverse ROL (becomes ROR)
# 5. Reverse XOR (remains XOR)
# 6. Reverse ADD (becomes SUB)
```

Running the full solver script yielded the flag.

## Flag
`KCTF{w3Lc0m3_T0_tHE_r3_w0rLD}`
