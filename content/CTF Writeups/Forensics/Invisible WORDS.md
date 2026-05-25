---
draft: true
---

# Invisible WORDS - picoCTF
[picoCTF](https://play.picoctf.org/practice/challenge/354?category=4&difficulty=3&page=1)

## Challenge Information
**File:** `output.bmp`
**Description:** A cyberpunk baddie image with a hint about "trafficking in classics" and "something doesn't quite add up".

## Initial Investigation

We started by analyzing the file type and basic metadata.

```bash
file output.bmp
# output.bmp: PC bitmap, Windows 98/2000 and newer format, 960 x 540 x 32, cbSize 2073738, bits offset 138
```

The file is a 32-bit BMP image. Standard BMPs usually use 24 bits (RGB), so the extra 8 bits (or in this case, the specific bitmasks) suggest potential space for steganography.

We used `exiftool` to check details:
```bash
exiftool output.bmp
```
This confirmed it is a 32-bit BMP.

## Analysis & Solver

We suspected the data might be hidden in the unused or high-order bytes of the pixel data. A 32-bit BMP pixel is often 4 bytes: `B G R A` or just `B G R Padding`.

We wrote a Python script `solve.py` to extract the upper 2 bytes of every 4-byte pixel block.

### `solve.py`

```python
import struct

def solve():
    with open('output.bmp', 'rb') as f:
        # Read header to confirm offset
        f.seek(10)
        offset = struct.unpack('<I', f.read(4))[0]
        f.seek(offset)
        
        data = f.read()
        
        extracted_data = bytearray()
        
        # Iterate over pixels (4 bytes each)
        # We extract the 3rd and 4th bytes (high 16 bits)
        for i in range(0, len(data), 4):
            if i + 4 > len(data):
                break
            b2 = data[i+2]
            b3 = data[i+3]
            extracted_data.append(b2)
            extracted_data.append(b3)
            
        # Find ZIP End of Central Directory (EOCD) signature: 50 4B 05 06
        eocd = b'\x50\x4B\x05\x06'
        index = extracted_data.rfind(eocd)
        
        if index != -1:
            print(f"Found EOCD at index {index}")
            # EOCD is 22 bytes long (minimum) + comment length
            # The comment length is at offset 20 (2 bytes) within the EOCD
            if index + 22 <= len(extracted_data):
                comment_len = struct.unpack('<H', extracted_data[index+20:index+22])[0]
                total_len = index + 22 + comment_len
                print(f"Truncating to {total_len} bytes")
                final_data = extracted_data[:total_len]
            else:
                final_data = extracted_data
        else:
            print("EOCD not found")
            final_data = extracted_data
            
        with open('flag_fixed.zip', 'wb') as out:
            out.write(final_data)
        
        print("Extracted data to flag_fixed.zip")

solve()
```

## Extraction

Running the script produced a ZIP file.

```bash
python3 solve.py
# Found EOCD at index 169575
# Truncating to 169597 bytes
# Extracted data to flag_fixed.zip
```

We verified and unzipped the file:

```bash
file flag_fixed.zip
# flag_fixed.zip: Zip archive data, at least v2.0 to extract, compression method=deflate

unzip flag_fixed.zip
# Archive:  flag_fixed.zip
#   inflating: ZnJhbmtlbnN0ZWluLXRlc3QudHh0
```

The extracted file name `ZnJhbmtlbnN0ZWluLXRlc3QudHh0` is Base64 encoded. Decoding it gives `frankenstein-test.txt`.

## Finding the Flag

The extracted text file appears to be "The Project Gutenberg eBook of Frankenstein". We searched for the flag format "picoCTF":

```bash
grep "picoCTF" ZnJhbmtlbnN0ZWluLXRlc3QudHh0
```

**Output:**
```
At that age I became acquainted with the celebrated picoCTF{w0rd_d4wg_y0u_f0und_5h3113ys_m4573rp13c3_b48ea7de}
```

## Flag
`picoCTF{w0rd_d4wg_y0u_f0und_5h3113ys_m4573rp13c3_b48ea7de}`
