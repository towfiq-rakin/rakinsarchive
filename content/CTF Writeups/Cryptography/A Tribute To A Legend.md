---
draft: true
---

# Writeup: A Tribute To A Legend

**Challenge:** A Tribute To A Legend  
**Category:** Cryptography  
**Flag:** `buetctf{Allah_r_k1_05H3Sh_r0h0m0t_l47h1r_v1t0r3_5h0rb0t}`
`nc 178.128.102.122 6100`

## Challenge Description

We are provided with a Python script  and a server endpoint. The script generates three 1024-bit primes $p, q, r$ and computes:
- $N = p \cdot q \cdot r$
- $s = p + q + r$
- $ss = p^2 + q^2 + r^2$

The server gives us $N$ and four ciphertexts of a secret message $m$:
1. $ct1 = m^e \pmod N$ (where $e = 65537$)
2. $ct2 = m^s \pmod N$
3. $ct3 = m^{s^2} \pmod N$
4. $ct4 = m^{ss} \pmod N$

Our goal is to recover $m$ and send it back to the server to get the flag.

## Mathematical Analysis

We need to find a relation between the exponents $s, s^2, ss$ and the modulus $N$ to isolate $m$.

Recall the algebraic identity for the square of a sum:
$$s^2 = (p+q+r)^2 = p^2 + q^2 + r^2 + 2(pq + qr + rp)$$

Substituting $ss = p^2 + q^2 + r^2$:
$$s^2 = ss + 2(pq + qr + rp)$$
$$s^2 - ss = 2(pq + qr + rp)$$

Let $K = pq + qr + rp$. Then:
$$s^2 - ss = 2K \quad \dots (1)$$

Now consider the Euler's totient function $\phi(N)$ for $N = pqr$:
$$\phi(N) = (p-1)(q-1)(r-1)$$
$$\phi(N) = pqr - (pq + qr + rp) + (p + q + r) - 1$$
$$\phi(N) = N - K + s - 1$$

Rearranging for $K$:
$$K = N + s - 1 - \phi(N)$$

Substitute this $K$ back into equation (1):
$$s^2 - ss = 2(N + s - 1 - \phi(N))$$
$$s^2 - ss = 2N + 2s - 2 - 2\phi(N)$$

We can now look at the powers of $m$. By Euler's Theorem, $m^{\phi(N)} \equiv 1 \pmod N$. Therefore:
$$m^{s^2 - ss} \equiv m^{2N + 2s - 2 - 2\phi(N)} \pmod N$$
$$m^{s^2 - ss} \equiv m^{2N - 2} \cdot m^{2s} \cdot (m^{\phi(N)})^{-2} \pmod N$$
$$m^{s^2 - ss} \equiv m^{2N - 2} \cdot m^{2s} \pmod N$$

We can express these terms using the given ciphertexts:
- LHS: $m^{s^2 - ss} = m^{s^2} \cdot (m^{ss})^{-1} = ct3 \cdot ct4^{-1}$
- RHS: $m^{2N - 2} \cdot m^{2s} = m^{2N - 2} \cdot (m^s)^2 = m^{2N - 2} \cdot ct2^2$

Equating them:
$$ct3 \cdot ct4^{-1} \equiv m^{2N - 2} \cdot ct2^2 \pmod N$$

Solving for the unknown term $m^{2N - 2}$:
$$m^{2N - 2} \equiv ct3 \cdot ct4^{-1} \cdot ct2^{-2} \pmod N$$

Let $E_2 = 2N - 2$ and $C_2$ be the value we just computed ($m^{E_2} \pmod N$).
We now have two equations:
1. $m^e \equiv ct1 \pmod N$
2. $m^{E_2} \equiv C_2 \pmod N$

Since $e = 65537$ is a small prime, it is extremely likely that $\gcd(e, 2N-2) = 1$. We can use the Extended Euclidean Algorithm to find integers $a, b$ such that:
$$a \cdot e + b \cdot (2N - 2) = 1$$

Then we can recover $m$:
$$m = m^{a \cdot e + b \cdot (2N - 2)} = (m^e)^a \cdot (m^{2N-2})^b \equiv ct1^a \cdot C_2^b \pmod N$$

## Solution Script

```python
import socket
import re
import sys

# Euclidean Algorithm to find gcd and coefficients
def egcd(a, b):
    if a == 0:
        return (b, 0, 1)
    else:
        g, y, x = egcd(b % a, a)
        return (g, x - (b // a) * y, y)

def solve():
    HOST = '178.128.102.122'
    PORT = 6100
    
    # ... (connection and parsing code) ...
    
    N = values['N']
    ct1 = values['ct1']
    ct2 = values['ct2']
    ct3 = values['ct3']
    ct4 = values['ct4']
    e = 65537
    
    # 1. Compute m^(2N-2)
    # m^(2N-2) = ct3 / (ct4 * ct2^2)
    def inverse(val):
        return pow(val, -1, N)
        
    term1 = ct3
    term2 = inverse(ct4)
    term3 = inverse(pow(ct2, 2, N))
    
    val_derived = (term1 * term2 * term3) % N
    exp_derived = 2 * N - 2
    
    # 2. Use Common Modulus Attack (Extended Euclidean Algorithm)
    # m^e = ct1
    # m^exp_derived = val_derived
    
    g, a, b = egcd(e, exp_derived)
    
    # m = ct1^a * val_derived^b
    base1 = ct1
    exp1 = a
    if exp1 < 0:
        base1 = inverse(base1)
        exp1 = -exp1
        
    base2 = val_derived
    exp2 = b
    if exp2 < 0:
        base2 = inverse(base2)
        exp2 = -exp2
        
    m = (pow(base1, exp1, N) * pow(base2, exp2, N)) % N
    
    print(f"Calculated secret m: {m}")
    # ... (sending m to server) ...
```
