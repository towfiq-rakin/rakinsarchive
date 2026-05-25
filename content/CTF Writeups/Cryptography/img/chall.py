from Crypto.Util.number import bytes_to_long, getPrime
import os

flag = open("flag.txt", "r").read().strip()

secret = os.urandom(128)
m = bytes_to_long(secret)

p, q, r = getPrime(1024), getPrime(1024), getPrime(1024)

N = p * q * r
s = p + q + r
ss = p * p + q * q + r * r

e = 65537

ct1 = pow(m, e, N)
ct2 = pow(m, s, N)
ct3 = pow(m, s ** 2, N)
ct4 = pow(m, ss, N)

print(f"N = {N}")
print(f"ct1 = {ct1}")
print(f"ct2 = {ct2}")
print(f"ct3 = {ct3}")
print(f"ct4 = {ct4}")

guess = int(input("Enter the secret number: "))

if guess == m:
    print(flag)
else:
    print("X")
