## 🔑 Personal Parameter Values

Using the provided alphabet order table:

- **First Name:** `Towfiq`
    - $1^{\text{st}}$ letter: **T** (Order = 20)
- **Surname / Last Name:** `Rakin`
    - $1^{\text{st}}$ letter: **R** (Order = 18)
    - $2^{\text{nd}}$ letter: **A** (Order = 1)
    - $3^{\text{rd}}$ letter: **K** (Order = 11) 
#### 1. Area Code Partitions

- **Rules:** 3-digit number, cannot begin with the order of the $2^{\text{nd}}$ letter (**1**) or $3^{\text{rd}}$ letter (**11**) of your last name, and excludes the range **891–913** and the value **997**.
- **Analysis:**
    - A standard 3-digit number spans from $100$ to $999$.
    - Since it cannot begin with `1` or `11`, the entire range of $100\dots199$ becomes invalid. 
    - Excluding $891\dots913$ and $997$ splits the remaining valid numbers into specific valid/invalid blocks.  
##### Classes for Area Code:
- **Class 1:** $[-\infty \dots 99]$ (Invalid — less than 3 digits)
- **Class 2:** $[100 \dots 199]$ (Invalid — begins with 1 or 11)
- **Class 3:** $[200 \dots 890]$ (Valid)
- **Class 4:** $[891 \dots 913]$ (Invalid — explicitly excepted range)
- **Class 5:** $[914 \dots 996]$ (Valid)
- **Class 6:** $[997]$ (Invalid — explicitly excepted value)
- **Class 7:** $[998 \dots 999]$ (Valid)
- **Class 8:** $[1000 \dots \infty]$ (Invalid — more than 3 digits)

#### 2. Prefix Partitions
- **Rules:** Optional 3-digit number, excluding the first two prime numbers within the range of $(20 + 51 = 71)$ and $1$.
- **Analysis:**
    - Because it is marked as `(optional)` in the format string, the presence of the prefix itself forms a boolean choice (`Present` or `Absent`).
    - The prime numbers within the range $[1, 71]$ are single or double-digit numbers (e.g., $2, 3$ or $67, 71$). Since a standard 3-digit prefix ranges from $100$ to $999$, these excluded primes naturally fall into the invalid $<100$ class anyway.
##### Classes for Prefix Presence:
- **Class 1:** `[Present]` (Valid)
- **Class 2:** `[Absent]` (Valid)

##### Classes for Prefix Value (When Present):

- **Class 3:** $[-\infty \dots 99]$ (Invalid — less than 3 digits; contains the excepted primes)
- **Class 4:** $[100 \dots 999]$ (Valid)
- **Class 5:** $[1000 \dots \infty]$ (Invalid — more than 3 digits)

#### 3. Suffix Partitions

- **Rules:** 2-digit number, except all odd numbers starting with the result of:$$\text{Starting Digit} = (18 + 43) \pmod{10} = 61 \pmod{10} = 1$$
- **Analysis:**
    - A standard 2-digit number spans from $10$ to $99$.
    - We must exclude all **odd** numbers that start with the digit `1` (within the $10\dots19$ range). These excluded values are: **11, 13, 15, 17, and 19**.
##### Classes for Suffix:
- **Class 1:** $[-\infty \dots 9]$ (Invalid — less than 2 digits)
- **Class 2:** $[10]$ (Valid)
- **Class 3:** $[11]$ (Invalid — excepted odd number starting with 1)
- **Class 4:** $[12]$ (Valid)
- **Class 5:** $[13]$ (Invalid — excepted odd number starting with 1)
- **Class 6:** $[14]$ (Valid)
- **Class 7:** $[15]$ (Invalid — excepted odd number starting with 1)
- **Class 8:** $[16]$ (Valid)
- **Class 9:** $[17]$ (Invalid — excepted odd number starting with 1)
- **Class 10:** $[18]$ (Valid)
- **Class 11:** $[19]$ (Invalid — excepted odd number starting with 1)
- **Class 12:** $[20 \dots 99]$ (Valid)
- **Class 13:** $[100 \dots \infty]$ (Invalid — more than 2 digits)