---
draft: true
---

> [!ABSTRACT] Summary
> 
> A curated reference of industry-standard tools for web application security assessments. This note covers reconnaissance, enumeration, exploitation, and post-exploitation utilities current as of late 2025/2026.

## 1. Network Scanning & Enumeration

### Nmap (Network Mapper)

The *de facto* standard for network discovery and security auditing. It uses raw IP packets to determine available hosts, services, operating systems, and packet filters/firewalls.

> [!TIP] Stealth Mode
> 
> Use -sS (SYN Scan) for faster, stealthier scans that do not complete the TCP handshake, often bypassing basic logging.

**Essential Commands:**

```
# Aggressive scan (OS detect, version detect, script scanning, traceroute)
nmap -A -T4 <target_ip>

# Scan all 65535 ports with version detection
nmap -p- -sV <target_ip>

# Vulnerability scanning using NSE (Nmap Scripting Engine)
nmap --script vuln <target_ip>
```

### Reconnaissance Utilities

- **Whois**: Queries databases that store registered users or assignees of an Internet resource.
- **theHarvester**: Gathers emails, subdomains, hosts, employee names, open ports, and banners from different public sources (search engines, PGP key servers).

## 2. Web Proxies & Traffic Analysis

### Burp Suite

An integrated platform for performing security testing of web applications. It acts as a Man-in-the-Middle (MitM) proxy.

|   |   |
|---|---|
|**Feature**|**Description**|
|**Proxy**|Intercepts HTTP/S traffic between browser and target.|
|**Repeater**|Manually modify and resend individual requests.|
|**Intruder**|Automated attacks (brute-force, fuzzing). _Note: Rate-limited in Community Edition._|
|**Decoder**|Encodes/decodes data (URL, Base64, Hex, HTML).|

> [!WARNING] Scope Configuration
> 
> Always configure your Target Scope in Burp Suite to avoid accidentally attacking unauthorized domains during automated scanning.

### OWASP ZAP (Zed Attack Proxy)

The open-source alternative to Burp Suite. Excellent for automated scanning and CI/CD integration.

- **HUD**: unique heads-up display overlay on the target website.
- **Automation Framework**: Allows ZAP to be run via command line or Docker for pipeline security checks.
## 3. Directory & Subdomain Brute-Forcing

Tools used to discover hidden content (directories, files) and subdomains that are not linked publicly.
### Gobuster
A high-speed tool written in Go. Preferred for its speed and simplicity.
**Modes:**
- `dir`: Enumerates directories/files.
- `dns`: Enumerates subdomains.
- `vhost`: Enumerates virtual hosts (vital for shared hosting environments).

```
# Directory enumeration
gobuster dir -u http://<target> -w /usr/share/wordlists/dirb/common.txt

# Virtual Host discovery
gobuster vhost -u http://<target> -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```

### ffuf (Fuzz Faster U Fool)

A fast web fuzzer written in Go. highly flexible and allows for advanced filtering and fuzzing locations (headers, POST data, parameters).

```
# Fuzzing a parameter ID
ffuf -u http://<target>/api?id=FUZZ -w numbers.txt

# Recursive scanning with extension filter
ffuf -u http://<target>/FUZZ -w wordlist.txt -recursion -e .php,.html
```

## 4. Vulnerability Assessment & Exploitation

### SQLMap

Automatic SQL injection and database takeover tool. It detects and exploits SQL injection flaws (Union-based, Time-based blind, Boolean-based blind, etc.).

> [!DANGER] Destructive Actions
> 
> Flags like --os-shell or --sql-shell can make significant changes to the server. Use with caution.

**Cheat Sheet:**

```
# Basic injection test
sqlmap -u "http://<target>/page.php?id=1" --batch

# Dump the entire database
sqlmap -u "http://<target>/page.php?id=1" --dump

# Get an OS shell (if privileges permit)
sqlmap -u "http://<target>/page.php?id=1" --os-shell
```

### Metasploit Framework (MSF)

A modular penetration testing framework.
- **Auxiliary**: Scanners, crawlers, and fuzzers.
- **Exploits**: Code that targets specific vulnerabilities (e.g., buffer overflows, RCE).
- **Payloads**: Code that runs after exploitation (e.g., [[Reverse Shell]], [[Meterpreter]]).

**Usage Workflow:**
1. `msfconsole`
2. `search <service_name>`
3. `use <exploit_path>`
4. `set RHOSTS <target_ip>`
5. `run`

### Nikto
Open Source (GPL) web server scanner which performs comprehensive tests against web servers for multiple items, including over 6700 potentially dangerous files/programs.

```
# Basic scan
nikto -h http://<target>
```

## 5. Password Cracking

### John the Ripper & Hashcat
- **John**: Great for automatically detecting hash types and cracking "weak" passwords using wordlists + rules.
- **Hashcat**: GPU-accelerated password recovery. Preferred for large lists or complex algorithms (e.g., WPA2, bcrypt).

### Hydra
A parallelized login cracker which supports numerous protocols to attack (SSH, FTP, HTTP-FORM-POST, etc.).

```
# Brute force SSH
hydra -l user -P /path/to/passwords.txt ssh://<target_ip>
```

## Related Notes

- [[Common Ports and Services]]
- [[Web Vulnerability Types (OWASP Top 10)]]
- [[Privilege Escalation Guide]]