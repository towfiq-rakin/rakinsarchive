---
draft: true
---

# Category: Forensics  
Difficulty: Hard  
Author: RayQuaZa

# Description  
A whistleblower inside Nexus Dynamics, a private defense contractor, was preparing to leak classified procurement fraud documents to a journalist. His name was Marcus Hale, a senior systems engineer who had been quietly collecting evidence for months.
Three days ago, Marcus vanished. His apartment was empty. His phone, offline.
Before disappearing, he managed to get a single encrypted USB drive to your contact. The drive contains a VM snapshot of his personal work laptop, the last known state of his machine before he went dark.
 Inside the VM, Marcus left something. You're sure of it.
 The document he was going to leak is locked inside VM. His decryption tool is there to but it's broken. The key is gone. Marcus was careful.
 Too careful, maybe. But nobody is perfect.
 Find what Marcus left behind. He was counting on someone like you.

  

# ZIP Pass:

# |4'97Pk9G$E0gP3!

  

# Flag:

# copc{g1t_h1st0ry_n3v3r_d13s_&_tr4sh_t4lks}

  

# copc{g1th1st0ry_n3v3r_d13s&_tr4sh_t4lks}

# otBXbCgk6PgiJauJXfzr

# unzip evidence.zip  
Archive: evidence.zip  
[evidence.zip] flag.txt password:

# zYZmMYL2SLM6  
copc{g1th1st0ry_n3v3r_d13s&_tr4sh_t4lks}

# CTF Forensic Challenge: Complete Design Guide

## Challenge Architecture Overview

[Boot VM] → [Find flag.zip] → [Find [decoder.py](http://decoder.py/) w/ missing key]

    → [Git history → recover private key]

        → [Recover deleted encrypted password from Trash]

            → [Decrypt password] → [Unzip flag.zip] → [FLAG]

  
  

## Phase 1: Base VM Preparation

1.1 Install Ubuntu with LUKS Encryption

During Ubuntu installation (22.04 LTS recommended):

Choose "Advanced features" → "Use LVM with the new Ubuntu installation" → "Encrypt the new Ubuntu installation"

Set a LUKS passphrase you keep secret — this is what blocks local mounting

Use a minimal install (no extra packages) to keep image size small

Why this blocks AI agents: Without the LUKS passphrase, any attempt to losetup, mount, or forensically inspect the .vmdk/.vdi outside VirtualBox hits an encrypted wall. The agent must interact through the running VM UI.

1.2 Post-Install Hardening (Anti-Agent)

# Remove SSH server entirely

sudo apt purge openssh-server -y

  

# Disable all network interfaces (optional: full air-gap)

# In /etc/netplan/ — set all interfaces to no addresses

# This kills curl/wget-based exfil too

  

# Remove VirtualBox Guest Additions installer

sudo apt purge virtualbox-guest-* -y

  

# Disable shared clipboard in VirtualBox settings (do this from host)

# Devices → Shared Clipboard → Disabled

# Devices → Drag and Drop → Disabled

  

## Create a dedicated challenge user:

## sudo adduser ctfplayer

## sudo passwd ctfplayer  # set a simple login password — this is NOT the flag password

  
  

## Phase 2: Plant the Challenge Assets

2.1 The Flag

# Create your flag

FLAG="CTF{g1t_h1st0ry_n3v3r_l13s_and_tr4sh_t4lks}"

  

# Create a text file, put it in a zip with a strong password

echo $FLAG > flag.txt

zip --password "$(python3 -c "print('zYZmMYL2SLM6')")" evidence.zip flag.txt

rm flag.txt

  

# Place it somewhere obvious but taunting

cp flag.zip /home/ctfplayer/Desktop/flag.zip

  

2.2 The Decoder Script

Create an RSA-based decoder. The private key will be deleted in a later commit.

mkdir -p /home/ctfplayer/tools/decoder

cd /home/ctfplayer/tools/decoder

  

[decoder.py](http://decoder.py/) (final state — key is MISSING):

#!/usr/bin/env python3

"""

Asymmetric message decoder.

Usage: python3 [decoder.py](http://decoder.py/) <base64_ciphertext>

"""

import sys

import base64

from Crypto.PublicKey import RSA

from Crypto.Cipher import PKCS1_OAEP

  

# TODO: Load private key from file or embed here

# Key was moved to secure vault - ask admin

PRIVATE_KEY_PEM = None  # <-- intentionally blank

  

def decrypt_message(b64_cipher: str) -> str:

    if PRIVATE_KEY_PEM is None:

        raise ValueError("[-] Private key not configured. Cannot decrypt.")

    key = RSA.import_key(PRIVATE_KEY_PEM)

    cipher = PKCS1_OAEP.new(key)

    plaintext = cipher.decrypt(base64.b64decode(b64_cipher))

    return plaintext.decode()

  

if __name__ == "__main__":

    if len(sys.argv) != 2:

        print("Usage: python3 [decoder.py](http://decoder.py/) <base64_ciphertext>")

        sys.exit(1)

    print(decrypt_message(sys.argv[1]))

  

2.3 Set Up the Git Repository (The Core Puzzle)

cd /home/ctfplayer/tools/decoder

git init

git config user.email "[dev@internal.corp](mailto:dev@internal.corp)"

git config [user.name](http://user.name/) "DevBot"

  

## Commit 1 — Full script WITH private key (this is what players must find):

## First, generate an actual RSA key pair:

## python3 -c "

## from Crypto.PublicKey import RSA

## key = RSA.generate(2048)

## print('=== PRIVATE ===')

## print(key.export_key().decode())

## print('=== PUBLIC ===')

## print(key.publickey().export_key().decode())

## " > /tmp/keys.txt

  

## Create the initial version of [decoder.py](http://decoder.py/) with the real key embedded, commit it, then replace it with the broken version and commit again:

## # Stage 1: commit the FULL version with key

## cp decoder_with_key.py [decoder.py](http://decoder.py/)

## git add [decoder.py](http://decoder.py/)

## git commit -m "add decoder utility"

  

## # Stage 2: "accidentally" commit an encrypted_pass.txt too

## python3 -c "

## from Crypto.PublicKey import RSA

## from Crypto.Cipher import PKCS1_OAEP

## import base64

## pub_key = RSA.import_key(open('/tmp/pub.pem').read())

## cipher = PKCS1_OAEP.new(pub_key)

## ct = cipher.encrypt(b'zYZmMYL2SLM6')

## print(base64.b64encode(ct).decode())

## " > encrypted_pass.txt

## git add encrypted_pass.txt

## git commit -m "temp: add encrypted pass for testing"

  

## # Stage 3: Remove key and delete encrypted_pass (send to trash)

## # Replace [decoder.py](http://decoder.py/) with the broken version

## cp decoder_broken.py [decoder.py](http://decoder.py/)

## git add [decoder.py](http://decoder.py/)

## git rm encrypted_pass.txt

## git commit -m "security: remove private key and test artifacts"

  

## Now delete the encrypted_pass.txt to Trash (not just git rm — also from working dir):

## # Simulate it being moved to trash

## mkdir -p /home/ctfplayer/.local/share/Trash/files

## mkdir -p /home/ctfplayer/.local/share/Trash/info

  

## # The file content (the actual encrypted password)

## cp encrypted_pass.txt /home/ctfplayer/.local/share/Trash/files/encrypted_pass.txt

  

## # Trash metadata file

## cat > /home/ctfplayer/.local/share/Trash/info/encrypted_pass.txt.trashinfo << EOF

## [Trash Info]

## Path=/home/ctfplayer/tools/decoder/encrypted_pass.txt

## DeletionDate=2025-03-14T09:23:11

## EOF

  
  

## Phase 3: Populate the Filesystem with Red Herrings

This is crucial for both making it interesting and slowing AI automation.

## /home/ctfplayer/

## ├── Desktop/

## │   └── flag.zip                    ← visible immediately

## ├── tools/

## │   └── decoder/

## │       ├── [decoder.py](http://decoder.py/)              ← broken (missing key)

## │       ├── .git/                   ← the gold mine

## │       └── [README.md](http://readme.md/)               ← vague hint: "key rotated to vault"

## ├── Documents/

## │   ├── meeting_notes.txt           ← red herring, mentions "the password is safe"

## │   └── old_backups/

## │       └── decoder_v0.py.bak       ← fake backup, similar but wrong key

## ├── .bash_history                   ← plant breadcrumbs (see below)

## └── .local/share/Trash/             ← encrypted_pass.txt lives here

  

## Plant breadcrumbs in .bash_history:

## cat > /home/marcus/.bash_history << 'EOF'

## ls -la

## cd tools/decoder

## python3 [decoder.py](http://decoder.py/)

## git log

## vim [decoder.py](http://decoder.py/)

## cd ~/Documents

## zip evidence.zip flag.txt -P $(python3 [decrypt.py](http://decrypt.py/))

## rm flag.txt

## EOF

  

## The line zip flag.zip flag.txt -P $(python3 [decrypt.py](http://decrypt.py/)) is a huge hint without giving anything away directly.

  

## Phase 4: LUKS Verification & VM Packaging

4.1 Verify LUKS is Active

# From inside the VM

lsblk

# You should see something like:

# sda

# └─sda3  LUKS

#   └─dm-0  (root filesystem)

  

sudo cryptsetup status dm-0

# Should show: type LUKS2, cipher aes-xts-plain64

  

4.2 Export the VM

In VirtualBox on your host:

File → Export Appliance → Select VM → OVA format

  

Before export, in VM Settings:

Display → Shared Clipboard: Disabled

Display → Drag'n'Drop: Disabled

Shared Folders: None

USB: Disabled

Network: Set to Internal Network or fully disabled

  

## Phase 5: Anti-AI-Agent Hardening

Here's a layered defense table:

Layer

Technique

What it blocks

L1

LUKS encryption

Local mount, raw disk forensics, file extraction without booting

L2

No SSH / no network

Remote shell access, curl exfil, automated API calls from inside VM

L3

Clipboard disabled

Copy-paste exfil from VM to host agent

L4

No Guest Additions

Shared folder mounting, seamless mode exploitation

L5

Inotify tripwire

Detects mass file scanning (see below)

L6

Visual-only hint

One clue exists only as a screenshot/image (requires OCR + reasoning)

L7

Fake git repos

Decoy repos with plausible-looking but wrong keys

L8

Bash history poisoning

Misleading commands mixed with real breadcrumbs

Inotify Tripwire (scrambles on mass scan):

# /usr/local/bin/[watchdog.sh](http://watchdog.sh/) — runs at login via .bashrc

inotifywait -m -r /home/ctfplayer --format '%w%f' -e access 2>/dev/null | \

while read FILE; do

  COUNT=$((COUNT+1))

  if [ "$COUNT" -gt 200 ]; then

    # Too many file accesses too fast — classic AI agent behavior

    # Scramble the trash file temporarily

    shred -n 1 /home/ctfplayer/.local/share/Trash/files/encrypted_pass.txt

    logger "CTF watchdog triggered"

    exit 1

  fi

done &

  

This punishes automated enumeration scripts that find / -type f everything at once.

Visual-Only Clue:

Create a PNG image on the desktop (hint.png) that contains text like:

## "The vault key was committed before the cleanup sprint.

##  Check what was staged on March 3rd."

  

## This forces the player to visually read the screen — something a terminal-only agent cannot do without extra tooling.

  

## Phase 6: Suggested Enhancements to Make It More Interesting

Enhancement A: Multi-Layer Encoding

Instead of RSA directly encrypting the password, chain it:

zip password = base64(XOR(AES_decrypt(RSA_decrypt(ciphertext), aes_key)))

  

Put the AES key in a stego image (/home/ctfplayer/Pictures/wallpaper.png) using steghide. This adds a completely different puzzle type.

Enhancement B: Wiped File Recovery

Instead of putting the encrypted password in Trash, wipe it with shred but leave inodes recoverable via extundelete or photorec. This is a much harder forensics step.

# During challenge setup:

# Write the file, then "delete" it at filesystem level

echo "ENCRYPTED_BLOB_HERE" > /home/ctfplayer/encrypted_pass.txt

# Soft unlink — recoverable with extundelete

unlink /home/ctfplayer/encrypted_pass.txt

  

Enhancement C: Git Stash Secret

Instead of (or in addition to) the commit history, hide the key in git stash:

git stash  # stash the key before "cleanup commit"

# Players must discover: git stash list → git stash show -p

  

Enhancement D: Bash History with Timestamp

Enable HISTTIMEFORMAT so bash history shows dates — this gives players temporal forensic context and feels more realistic.

Enhancement E: Symbolic Storyline

Add a /home/ctfplayer/README.txt:

## Hi,

## I'm on vacation. The flag.zip has something important in it.

## I can't remember the password but I left the tools here.

## - Alex

  

## Narrative CTF challenges are far more engaging.

  

## Phase 7: Complete Solve Path (Verify It Works)

Test this yourself before publishing:

## # Step 1: Notice flag.zip, try to open it → needs password

## unzip flag.zip  # fails

  

## # Step 2: Find [decoder.py](http://decoder.py/) → see key is missing

## cat ~/tools/decoder/[decoder.py](http://decoder.py/)

  

## # Step 3: Check git history

## cd ~/tools/decoder

## git log --oneline

## # a3f92c1 security: remove private key and test artifacts

## # b7d041e temp: add encrypted pass for testing

## # 1e8a3f0 add decoder utility

  

## git show 1e8a3f0:[decoder.py](http://decoder.py/)  # ← private key is here!

## # Extract PRIVATE_KEY_PEM block

  

## # Step 4: Recover encrypted_pass.txt from Trash

## cat ~/.local/share/Trash/files/encrypted_pass.txt

## # OR: git show b7d041e:encrypted_pass.txt

  

## # Step 5: Patch [decoder.py](http://decoder.py/) with recovered key, run it

## python3 [decoder.py](http://decoder.py/) "ENCRYPTED_BLOB"

## # Output: s3cr3t_p4ss_here

  

## # Step 6: Unzip

## unzip -P s3cr3t_p4ss_here flag.zip

## cat flag.txt

## # CTF{g1t_h1st0ry_n3v3r_l13s_and_tr4sh_t4lks}

  
  

## Summary Checklist Before Publishing

LUKS encryption verified (cryptsetup status)

SSH removed, network disabled

Clipboard/drag-drop disabled in VirtualBox settings

Git repo has correct 3-commit history

Encrypted blob verified decryptable with recovered key

Decrypted password correctly opens flag.zip

Red herring files in place (old_backups/, misleading meeting_notes.txt)

.bash_history has breadcrumbs

Visual hint image present

Inotify watchdog active in .bashrc

Tested full solve path from scratch

The LUKS layer is your strongest defense against agents — everything else adds friction and puzzle depth for human players.

## Challenge Story

  

Title: "Dead Drop"

Category: Forensics | Difficulty: Medium-Hard

  

## A whistleblower inside Nexus Dynamics — a private defense contractor — was preparing to leak classified procurement fraud documents to a journalist. His name was Marcus Hale, a senior systems engineer who had been quietly collecting evidence for months.

## Three days ago, Marcus vanished. His apartment was empty. His phone, offline.

## Before disappearing, he managed to get a single encrypted USB drive to your contact. The drive contains a VM snapshot of his personal work laptop — the last known state of his machine before he went dark.

## Inside the VM, Marcus left something. You're sure of it.

## The document he was going to leak is locked inside evidence.zip. His decryption tool is there too — but it's broken. The key is gone. Marcus was careful.

## Too careful, maybe. But nobody is perfect.

## Find what Marcus left behind. He was counting on someone like you.

  

## Flag format: CTF{...}  
"The past doesn't disappear. It just gets harder to find."

  

## Full Folder & File Structure

/home/marcus/

│

├── Desktop/

│   ├── evidence.zip                        ← password-protected, contains flag

│   ├── hint.png                            ← visual-only clue (screenshot of a sticky note)

│   └── TODO.txt

│

├── Documents/

│   ├── personal/

│   │   ├── lease_renewal_2024.pdf          ← red herring

│   │   └── grocery_list.txt                ← red herring

│   │

│   ├── nexus_work/

│   │   ├── project_delta_specs.txt         ← red herring (vague corporate jargon)

│   │   ├── meeting_minutes_Q3.txt          ← red herring, mentions "secure vault"

│   │   └── contacts.txt                    ← red herring, has journalist's fake email

│   │

│   └── notes/

│       ├── encryption_notes.txt            ← breadcrumb (Marcus's notes on RSA workflow)

│       └── journal_mar01.txt               ← story flavor + subtle breadcrumb

│

├── Pictures/

│   ├── wallpaper.jpg                       ← steghide carrier (contains AES key if used)

│   ├── family_bbq_2023.jpg                 ← red herring

│   └── nexus_badge_photo.jpg               ← red herring / flavor

│

├── tools/

│   └── decryptor/

│       ├── .git/                           ← THE CORE PUZZLE (3-commit history)

│       │   └── ...

│       ├── [decrypt.py](http://decrypt.py/)                      ← broken script, PRIVATE_KEY_PEM = None

│       ├── [README.md](http://readme.md/)                       ← "key moved to secure storage per IT policy"

│       └── old/

│           └── decrypt_v0.py.bak           ← red herring, plausible-looking wrong key

│

├── .local/

│   └── share/

│       └── Trash/

│           ├── files/

│           │   └── enc_pass.txt            ← the encrypted password blob

│           └── info/

│               └── enc_pass.txt.trashinfo

│

├── .bash_history                           ← breadcrumbs

├── .bashrc                                 ← watchdog script sourced here

└── .config/

    └── autostart/

        └── watchdog.desktop                ← starts inotify watchdog on login

  
  

## File Contents (Story-Relevant Files)

  

Desktop/TODO.txt

- [x] encrypt the documents

- [x] zip with derived password

- [ ] send the zip to sarah

- [ ] delete everything after

  

note to self: DO NOT forget to clean up.

the key cannot be on this machine when they come.

  
  

Documents/notes/journal_mar01.txt

March 1st

  

Three weeks until I hand this over. Sarah says she needs

the zip file and just the zip file — nothing else that

could trace back to me.

  

I've been using the decryptor tool I wrote last year to

protect the archive password. The script is solid.

RSA-2048, nobody is cracking that.

  

Rotated the key today per IT's request (convenient timing).

  

- M

  

This is your most direct narrative breadcrumb. It tells players what to do without telling them how.

  

Documents/notes/encryption_notes.txt

WORKFLOW (personal reference):

  

1. generate RSA keypair

2. encrypt target string with public key → base64 blob

3. store blob in enc_pass.txt

4. use decrypted string as zip password

5. DELETE enc_pass.txt after zipping

  

[decrypt.py](http://decrypt.py/) handles step 3 in reverse.

usage: python3 [decrypt.py](http://decrypt.py/) <base64_blob>

  

** key embedded in script for portability **

** updated script no longer has key per IT audit **

  
  

Documents/nexus_work/meeting_minutes_Q3.txt

...

ACTION ITEMS:

- Dev team to rotate all embedded credentials by EOD March 3rd

- Marcus: audit decryptor utility, strip hardcoded keys

- All private keys to be moved to the "secure vault" (see IT wiki)

...

  

This confirms the timeline — key was removed around March 3rd, which helps players target the right git commit.

  

tools/decryptor/[README.md](http://readme.md/)

# decryptor

  

Internal utility for asymmetric message decryption.

  

> ⚠️ Private key has been migrated to the secure vault

> as of the March sprint. Contact IT for access.

> Script will not function without configuring PRIVATE_KEY_PEM.

  

## Usage

    python3 [decrypt.py](http://decrypt.py/) <base64_encoded_ciphertext>

  

## Requirements

    pip install pycryptodome

  
  

.bash_history

cd ~/tools/decoder

python3 [decoder.py](http://decoder.py/)

git status

git log --oneline

vim [decoder.py](http://decoder.py/)

cd ~/Documents

7z a -p -mhe=on evidence.7z ~/Downloads/procurement_fraud_summary.pdf

cd ~/tools/decoder

rm encrypted_pass.txt

# zip is there. good.

# they're watching the network. going dark now.

  

The commented lines at the bottom are pure flavor and feel deeply human.

  

Desktop/hint.png

A screenshot of a handwritten sticky note (generate with any image editor):

## ┌─────────────────────────────────┐

## │  sticky note                    │

## │                                 │

## │  "cleanup commit = gone?"       │

## │                                 │

## │  git show <first commit>        │

## │  everything was there once      │

## │                                 │

## │  - don't be lazy, check ALL     │

## │    three commits                │

## └─────────────────────────────────┘

  

## This is readable only by someone looking at the VM screen — it's the one clue that purely requires visual access.

  

## Git Commit Timeline (Inside .git)

#

Hash (short)

Message

What it contains

1

# a1b2c3d

# initial: add decryptor utility

# [decrypt.py](http://decrypt.py/) WITH full private key embedded

# 2

# e4f5a6b

# temp: testing enc_pass before deletion

# adds enc_pass.txt with the encrypted blob

# 3

# c7d8e9f

# security: remove key per IT audit

# [decrypt.py](http://decrypt.py/) key wiped, enc_pass.txt removed

# Players need commit 1 for the key and commit 2 for the blob. Both are one git show away — but they have to know to look.

# import sys  
import base64  
from Crypto.PublicKey import RSA  
from Crypto.Cipher import PKCS1_OAEP

# Key was moved to secure vault - ask admin

PRIVATE_KEY_PEM ="-----BEGIN RSA PRIVATE KEY-----  
MIIEowIBAAKCAQEAgv6jN3GHKPXEzWjTKcgoZRUlz22M0kWxPM+k/cVIp50u8wEX  
6j8I+xbQ2LpTPAZUoRbNndjUi6zanaXMPBzziOLP97wqUyOAqhnEyx3t9uSlQ6Hr  
m4eaqaSVE6qGTOZnT3Wnj+ndV2AcgH1gQLltk/bckQM6MCbJ3i1Xy5YInCoa6v3q  
EEbtBHANDp1+Q6H3N2JXKsmUlw1ad1Kl01AfdoBgINkVGWsgbugO4ZEdhQL8K9wO  
7C8HAqPoW+g3A2aT2UFAFFJ9rrGqibroYAbWG/2WF93Wu1bIWzgymIqOH2LBhUbZ  
FyNtYZ/Uk4ZP7UR5xs9KrmBmmFovaErUuhjTiQIDAQABAoIBAAKe02cFh12jZPdy  
9F5umZhEDwiSOXHvYPdFdBh7fNOVil3kFLVj42sabr0XJRkbS1AZo61XrBDLOWhT  
67z8G0cOunhLNFGLcUR11YD2rU72DfRHZe4rjUV9fFnzXFJnfYOSZ/KyC/J2grtz  
Rpyk2PNPyePAu8ZA0GL4Zzw0WSG+ko2tLxBOPCkm2B6M2hRemmExShBW2M+zpfGu  
9Zwkdksgv1Fkwsog0mG5H5m9CkrYGNxt9m6X2qVrPL0SpCb4u1JEZaZ5Fp859ajg  
4knjYUtVb/aHp9RlToJ/HaHjhWKTP/EZnoCyk5gXoMLi1zxFhVwhkdTJyMyKdZqW  
zcPZt30CgYEAtsgM/nQkiVjDOeDduC6Nv3WBTLhHIFO/I4zg878BuJvusLhfzQDw  
JeiFOEYxJc+obD0xadThDrBQ64Bl9sma6veHYoGMuh9FJLHNrl+SCCj9cEeJamrg  
xgemITXWcTROV8MDB6OtEcC7ZPIxCLc8FWRdKogG/O2TaYt65MO+HMMCgYEAt3fv  
aK7Sbrm7zs5Eb1bAfuA17vyVXbMbH2sle5Qxzp9k4ZCvI/3/28LSRlQr0wUkuZ4N  
3pZet3A5LmVLufR/QGl+hPIdngG9MSCoEW4RYENPLKeXuKe4a2upeajGnDdOgLuE  
I8sfmcoNFLqZy2MwGqPgEgU6cgAPMKqMTfSAucMCgYEAgjhmYYaXXS7a78pPzF+G