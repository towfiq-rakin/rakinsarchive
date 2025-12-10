### Question 1
###### a. Consider a machine language instruction that moves a copy of the content of register `AX` in the CPU to a memory location. What happens during the fetch and execute cycle?<span style="float: right; ">05 </span>
**Ans:** 

###### b. A memory location has physical address `80FD2H`. In what segment does it have offset `BFD2H`? <span style="float: right; ">03 </span>
**Ans:** As we know,
$$
\begin{align}
\text{Physical Address}=\text{Segment Address} \times \text{10H }+ \text{Offset Address}
\end{align}
$$
Given, 
	$\text{Physical Address}=\text{80FD2H}$
	$\text{Offset Address}=\text{BFD2H}$

Thus,
$$
\begin{align} 
\text{Segment Address} &= \frac{\text{Physical Address}-\text{Offset Address}}{\text{10H}} \\ \\
&=\frac{\text{80FD2H}-\text{BFD2H}}{\text{10H}} \\ \\
&= \frac{\text{75000H}}{\text{10H}} \\ \\
\text{Segment Address} &= \text{7500H} 
\end{align} 
$$
So, segment address `7500H` have the offset address `BFD2H`.

###### c. In the microprocessor what is the function of the IP and the BIU?<span style="float: right; ">02 </span>
**Ans:** The Bus Interface unit (BIU) facilitates communication between the EU and the memory or I/O circuits. It is responsible for transmitting addresses, data, and control signals on the buses. Its registers are named `CS, DS, ES, SS` and `IP`; they hold addresses of memory locations. The `IP` (instruction pointer) contains the address of the next instruction to be executed by the EU.

---
### Question 2
###### a. Describe the `MOV` and `XCHG` instruction with necessary syntax and example.<span style="float: right; ">05 </span>
**Ans:** 
**`MOV`:** The `MOV` instruction is used to transfer data between registers, between a register and a memory location or to move directly into a register or memory location. The syntax is:
```asm
MOV destination, source
```
Here are some examples:
```asm
MOV AX, BFD2H
MOV AX, BX
MOV CX, 3
```

**`XCHG`:** The `XCHG` (exchange) operation is used to exchange the contents of two registers, or a register and a memory location. The syntax is:
```asm
XCHG destination, source
```
An example is:
```asm
XCHG AH, BL
```
This instruction swaps the contents of `AH` and `BL`, so that `AH` contains what was previously in `BL` and `BL` contains what was originally in `AH`.
###### b. What should be the status of flag registers after the execution of the following statement? Also write the result shown in the `AX` register after execution of the final instruction. <span style="float: right; ">03 </span>
```asm
MOV AX, 7102H
MOV BX, 1024H
SUB AX, BX
NOT AX
INC AX
```
**Ans:**
Execution of the instructions:
```asm
MOV AX, 7102H        ; 0111 0001 0000 0010
MOV BX, 1024H        ; 0001 0000 0010 0100
SUB AX, BX           ; 0110 0000 1101 1110 -> 60DE
NOT AX               ; 1001 1111 0010 0001 -> 9F21
INC AX               ; 1001 1111 0010 0010 -> 9F22
```

Status of the flag register:

| OF  | SF  | ZF  | AF  | PF  | CF  |
| --- | --- | --- | --- | --- | --- |
| 0   | 1   | 0   | 0   | 1   | 0   |
###### c. What are the differences between a register and a memory location?<span style="float: right; ">02 </span>
**Ans:**
Differences between register and a memory location in 8086:

| Register                                        | Memory Location                           |
| ----------------------------------------------- | ----------------------------------------- |
| Registers are 16-bit in size (`AX,BX,CX,DX`)    | 8-bit (1 Byte ) in size                   |
| Can be directly accessed by name (`MOV AX, BX`) | Requires Segment:Offset address to access |

### Question 3
###### a. Write a sequence of instruction to do the following series: <span style="float: right; ">05 </span>
$$
1+2+3+4+\dots+13
$$
**Ans:** 
```asm
MOV AX, 0                ; Counter for Series
MOV BX, 0               
MOV CX, 13               ; Defualt counter for LOOP

Continue:
	INC AX               ; Increment AX by 1
	ADD BX, AX           ; ADD BX with AX
	LOOP Continue        ; Continue LOOP untill CX=0

MOV AX, BX               ; Store the sum of Series in AX
```

###### b. Give a logic instruction to do each of the following:<span style="float: right; ">03</span>
1. Clear the even-number bits of `AX` while leaving other bits unchanged.
2. Clear the sign bit of `AL` while leaving the other bits unchanged.

**Ans:**
1. 
```asm
AND AX, 1010101010101010    ; AND 0 -> Clear
```
2. 
```asm
AND AL, 01111111            ; AND 0 -> Clear
```

###### c.  What are the flag conditions of `JG`, `JNZ` and `JC`?<span style="float: right; ">02</span>
**Ans:**

| Symbol | Description          | Condition              |
| ------ | -------------------- | ---------------------- |
| `JG`   | Jump if greater than | $\text{ZF=0 and SF=0}$ |
| `JNZ`  | Jump if not zero     | $\text{ZF=0}$          |
| `JC`   | Jump if carry        | $\text{CF=1}$          |

### Question 4
###### a. Write an assembly language to find out the factorial of a number and compare it to a random number. If the factorial is above the number, it will store in `CX` otherwise it will store in `DX` register.<span style="float: right; ">05</span>
**Ans:** 
```asm
MOV AL, 1                 
MOV CX, 7                 ; 7! and Counter for LOOP

factorial:
	MUL CX                ; AX = AL * CL
	LOOP factorial        ; Continue loop until CX = 0

CMP AX, 5D8FH             ; Compare Factorial with a random num
                          ; Update SF and ZF flag
JG above                  ; Jump if AX is greater
MOV DX, AX                ; Move to DX if AX is smaller
HLT

above:
	MOV CX, AX            ; Move to CX if AX is greater
	HLT
```

###### b. Write down the significance of the following instructions. <span style="float: right; ">03</span>
1. `IMUL BX`
2. `DIV BL`
3. `MOV AX, [BX][SI]`

**Ans:**
1. **`IMUL BX`:** Signed multiplication of `AX` with `BX`. The higher 16-bit of the result is stored in `DX` register and lower 16-bit is stored in `AX` register. `DX` register preserves the sign of the result.
2. **`DIV BL`:** Divide `AX` by `BL` . The quotient is stored in `AL` register while the reminder is stored in `AH` register.  
3. **`MOV AX, [BX][SI]`:** Base plus Index addressing mode. The effective address is formed by adding the base register `BX` and the index register `SI`. The content of final effective address (`BX+SI`) is moved to `AX` register.
###### c. How signed numbers are represented in microprocessor? Calculate the range of 4-bit number.<span style="float: right; ">02</span>
**Ans:** Signed numbers are represented by 2's compliment in microprocessor. The **MSB** acts as a sign bit.
$$
\begin{align}
0 &\to \text{Positive number} \\ \\
1 &\to \text{Negative number}
\end{align}
$$
The range of 4-bit positive number:
$$
0111_{b} \to 7_{d}  
$$
The range of 4-bit negative number (2's Compliment):
$$
(1000)_{b} \to -8_{d}
$$
Thus the range of 4-bit signed number is from $7\text{ to }-8$.

### Question 5
###### a. Explain `SHL` and `SHL` instructions mentioning the syntax with proper example.<span style="float: right; ">05</span>
**Ans:** 
**`SHL`** 
The `SHL` (shift left) instruction shifts the bits in the destination to the left. The format for a single shift is:
```asm
SHL destination, 1
```
For multiple shifts:
```asm
SHL destination, CL      ; CL contains the number of shifts
```
A 0 is shifted into the rightmost bit position and the MSB is shifted into `CF`.  Multiplies the value by 2 in each shift.
Example:
```asm
MOV AL, 10101001
MOV CL, 3
SHL AL, CL
```
![[SHL.png]]
**`SHR`** 
The `SHR` (shift right) instruction shifts the bits in the destination to the right. The format for a single shift is:
```asm
SHR destination, 1
```
For multiple shifts:
```asm
SHR destination, CL      ; CL contains the number of shifts
```
A 0 is shifted into the MSB position and the rightmost is shifted into `CF`. Divides the value by 2 in each shift.
Example:
```asm
MOV AL, 10101001
MOV CL, 3
SHR AL, CL
```
![[SHR.png]]
###### b. Suppose `DH` contains `8AH`, `CF=1` and `CL` contains 3. What are the values of `DH` and `CF` after the instruction is executed:<span style="float: right; ">03</span>
```asm
ROR DH, CL
```

**Ans:** The given instruction is rotate right (`ROR`). As `CL` contains 3, the `ROR` instruction will rotate the content of `DH = 8AH` along right side.
![[ROR.png]]
Thus, after the execution of the instruction, `DH` holds `51H = 01010001B` and `CF` holds `0`.
###### c. Distinguish between contents and address of a memory.<span style="float: right; ">02</span>
**Ans:** The address of a memory location is a **unique identification number** that is assigned to each memory cell where as content is the **actual data** that is stored in that memory cell.
![[memory.png]]
