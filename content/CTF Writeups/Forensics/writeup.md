---
draft: true
---

# Event-Viewing Challenge Writeup

## Challenge Description
We are provided with a Windows Event Log file (`logs.evtx`) from a computer infected by malware. The malware shuts down the computer immediately after login. We need to find evidence of:
1.  Software installation.
2.  Software execution (doing "nothing").
3.  The shutdown event.

The flag is split into 3 parts hidden within these logs.

## Tools Used
- `python-evtx` (Python library for parsing .evtx files)
- `grep` (Text search)
- `python3` (Scripting and Base64 decoding)

## Step 1: Parsing the EVTX File
The raw `.evtx` file is binary. To analyze it effectively, we converted it to XML. Since the provided `evtx_dump` tool had environment issues, we wrote a small Python script utilizing the installed `python-evtx` library.

**Script (`parser.py`):**
```python
import mmap
import contextlib
from Evtx.Evtx import FileHeader
from Evtx.Views import evtx_file_xml_view

def main():
    with open("logs.evtx", "rb") as f:
        with contextlib.closing(mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)) as buf:
            for xml, record in evtx_file_xml_view(FileHeader(buf, 0x0)):
                print(xml)

if __name__ == "__main__":
    main()
```

**Command:**
```bash
./venv/bin/python3 parser.py > dump.xml
```

## Step 2: Finding Part 1 - The Installer
The challenge description mentions "software installed using an installer". Windows Installer (MSI) logs typically use Event ID **1033**, **1040**, or **11707**. We also searched for the suspicious software name "Totally_Legit_Software".

**Command:**
```bash
grep -C 20 "Totally_Legit_Software" dump.xml
```

**Finding:**
We found an `MsiInstaller` Event ID **1033** at `2024-07-15 15:55:57`. The event data contained a Base64 string.

*   **Log Snippet:**
    ```xml
    <EventID Qualifiers="0">1033</EventID>
    ...
    <Data><string>Totally_Legit_Software</string>
    <string>1.3.3.7</string>
    ...
    <string>cGljb0NURntFdjNudF92aTN3djNyXw==</string>
    ```
*   **Decoding:**
    `cGljb0NURntFdjNudF92aTN3djNyXw==` -> `picoCTF{Ev3nt_vi3wv3r_`

## Step 3: Finding Part 2 - Persistence/Execution
The description says the software "seemed to do nothing" but causes issues on boot. This implies persistence (e.g., Registry Run keys). We searched for events related to the identified software.

**Command:**
```bash
grep -C 20 "custom_shutdown" dump.xml
```
*Note: We found "custom_shutdown.exe" by looking at Registry Event ID 4657 nearby the installation time.*

**Finding:**
We found a Security Audit Event ID **4657** (Registry Value Modified) at `15:56:19`. The malware added an entry to `HKLM\...\Run`. The *Value Name* itself contained the flag part.

*   **Log Snippet:**
    ```xml
    <EventID Qualifiers="">4657</EventID>
    ...
    <Data Name="ObjectName">\REGISTRY\MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run</Data>
    <Data Name="ObjectValueName">Immediate Shutdown (MXNfYV9wcjN0dHlfdXMzZnVsXw==)</Data>
    <Data Name="NewValue">C:\Program Files (x86)\Totally_Legit_Software\custom_shutdown.exe</Data>
    ```
*   **Decoding:**
    `MXNfYV9wcjN0dHlfdXMzZnVsXw==` -> `1s_a_pr3tty_us3ful_`

## Step 4: Finding Part 3 - The Shutdown
The final symptom is the computer shutting down. The standard event ID for a user-initiated (or application-initiated) shutdown is **1074**.

**Command:**
```bash
grep -C 30 'Provider Name="User32"' dump.xml
```

**Finding:**
We found an Event ID **1074** logged by `User32` at `17:01:05`. The shutdown reason was "No title for this reason could be found", but `param6` contained a base64 string.

*   **Log Snippet:**
    ```xml
    <EventID Qualifiers="32768">1074</EventID>
    ...
    <Data Name="param1">C:\Windows\system32\shutdown.exe (DESKTOP-EKVR84B)</Data>
    ...
    <Data Name="param5">shutdown</Data>
    <Data Name="param6">dDAwbF84MWJhM2ZlOX0=</Data>
    ```
*   **Decoding:**
    `dDAwbF84MWJhM2ZlOX0=` -> `t00l_81ba3fe9}`

## Final Flag
Concatenating the three parts:
1. `picoCTF{Ev3nt_vi3wv3r_`
2. `1s_a_pr3tty_us3ful_`
3. `t00l_81ba3fe9}`

**Flag:** `picoCTF{Ev3nt_vi3wv3r_1s_a_pr3tty_us3ful_t00l_81ba3fe9}`
