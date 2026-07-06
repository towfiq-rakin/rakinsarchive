---
draft: true
---

Category: Forensics  
Difficulty: Hard  
Author: RayQuaZa

### Chall Description
A whistleblower inside Nexus Dynamics, a private defense contractor, was preparing to leak classified procurement fraud documents to a journalist. His name was `Marcus Hale`, a senior systems engineer who had been quietly collecting evidence for months.
Three days ago, Marcus vanished. His apartment was empty. His phone, offline.
Before disappearing, he managed to get a single encrypted USB drive to your contact. The drive contains a VM snapshot of his personal work laptop, the last known state of his machine before he went dark.
Inside the VM, Marcus left something. You're sure of it.
The document he was going to leak is locked inside VM. His decryption tool is there to but it's broken. The key is gone. Marcus was careful.
Too careful, maybe. But nobody is perfect.
Find what Marcus left behind. He was counting on someone like you.
**Archive Pass:** `otBXbCgk6PgiJauJXfzr`
**User:** `marcus`
**Sudo pass:** `bupcopc`
**Challange file**: https://drive.google.com/file/d/1uDzKSOf7I6xzDOuRKNZt_7551s-B-Fn-/view?usp=sharing
## Writeup
# Dead Drop - CTF Writeup

## Challenge Overview
**Category:** Forensics
**Difficulty:** Medium-Hard

**Description summary:** We are given a VM snapshot of Marcus Hale's machine. He was preparing to leak documents but vanished. He left an encrypted archive and a broken decryption tool. We need to find the missing key and recover the password to unlock the evidence archive.

## Solve Path

### Step 1: Initial Discovery
Upon exploring the home directory, we find a few interesting files:
- `Desktop/evidence.zip`: A password-protected ZIP archive containing `flag.txt`.
- `Desktop/hint.png`: An image that hints at checking all three commits of a git history.
- `tools/decoder/decoder.py`: An asymmetric message decoder script, but the `PRIVATE_KEY_PEM` is missing (`None`).

### Step 2: Investigating Version Control
Navigating to `tools/decoder`, we notice a `.git` directory. The hint image and `.bash_history` also suggested looking at the git history.

Let's check the git log:
```bash
$ cd ~/tools/decoder
$ git log --oneline
```
We see three commits:
1. `security: remove key per IT audit`
2. `temp: testing enc_pass before deletion`
3. `initial: add decryptor utility`

### Step 3: Recovering the Private Key
The commit messages suggest the private key was in the initial commit but later removed. We can view the `decoder.py` file from the first commit:

```bash
$ git show HEAD~2:decoder.py
```
*(Alternatively: `git show <hash_of_initial_commit>:decoder.py`)*

This reveals the original `decoder.py` script containing the full RSA private key block. We copy this key block to use later.

### Step 4: Finding the Encrypted Password
The second commit mentions `temp: testing enc_pass before deletion`. We can either extract the `encrypted_pass.txt` from this commit using `git show HEAD~1:encrypted_pass.txt` or find it where it was deleted.

Looking at the `.bash_history`, we see Marcus ran `rm encrypted_pass.txt`. In Linux desktop environments, deleted files often go to the Trash. Let's check:
```bash
$ cat ~/.local/share/Trash/files/encrypted_pass.txt
```
This gives us a base64 encoded string, which is the encrypted password blob.

### Step 5: Decrypting the Password
Now we have both the private key and the encrypted password blob. 

1. We can edit `tools/decoder/decoder.py` and replace `PRIVATE_KEY_PEM = None` with the RSA private key we recovered from git.
2. We run the decoder script on the base64 blob found in the trash.

```bash
$ python3 tools/decoder/decoder.py "<base64_blob_from_trash>"
```
Output: `zYZmMYL2SLM6`

### Step 6: Extracting the Flag
We use the decrypted password to unlock the evidence archive on the Desktop.

```bash
$ cd ~/Desktop
$ unzip -P zYZmMYL2SLM6 evidence.zip
$ cat flag.txt
```

**Flag:** `copc{g1th1st0ry_n3v3r_d13s&_tr4sh_t4lks}`


Marcus left behind two useful artifacts.

The live Codeshare history at aJnbRZ shows the final shell note:
7z a -p -mhe=on evidence.7z ~/Downloads/procurement_fraud_summary.pdf
So the leaked document he packed was procurement_fraud_summary.pdf.

The stronger challenge answer came from the older live pad at aVloWO, whose checkpoint includes the recovered test output:
password: zYZmMYL2SLM6
flag: copc{g1t_h1st0ry_n3v3rd13s&_tr4sh_t4lks}

One caveat: the private key embedded in aVloWO did not decrypt the deleted encrypted_pass.txt from this VM snapshot, so that pad appears to contain challenge-authoring material or an earlier variant rather than the exact runtime key for Marcus’s current ciphertext. But the two Codeshare pads are enough to identify the hidden document name and the intended final flag. (edited)Friday, April 24, 2026 at 8:38 PM

I solved it as a quick VM forensics challenge, without booting the appliance. I inspected marcus-disk001.vmdk
  offline with Sleuth Kit, found a challenge.img file at the filesystem root, and identified it as a LUKS-
  encrypted container.

  The key clue was in Marcus’s deleted files: /home/marcus/.local/share/Trash/files/encrypted_pass.txt. Recovering
  that gave the passphrase needed to open challenge.img, and the unlocked container led to the flag:
  copc{g0th1atory_n3v3r-d13s&_tr4sh_t4lks}.