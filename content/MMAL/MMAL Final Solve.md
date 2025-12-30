### Question 1<span style="float: right; ">Marks </span>
###### a. Using shift instructions, write the codes for 8086 microprocessor.<span style="float: right; ">08 </span>  
1. **Put the value `1234H` in `AX` and multiply the value by 8.**  
   ```asm
   MOV AX, 1234H
   MOV CL, 3
   SHL AX, CL
   ```
2. **Divide the number `2345H` by 8 and put the quotient in `AX`.**  
   ```asm
   MOV AX, 2345H
   MOV CL, 3
   SHR AX, CL
   ```

###### b. Write an assembly program to find the smallest number in the given array, $[A]=[23,21,10,12,14].$  <span style="float: right; ">10 </span>  
```asm
.MODEL SMALL
.STACK 100H

.DATA
    ARRAY DB 23, 21, 10, 12, 14
    LENGTH DW 5
    SMALLEST DB ?

.CODE
MAIN PROC
    MOV AX, @DATA
    MOV DS, AX
    
    LEA SI, ARRAY
    MOV CX, LENGTH
    MOV AL, [SI]
    MOV SMALLEST, AL
    INC SI
    DEC CX

FIND_MIN:
    CMP CX, 0
    JE DONE
    MOV AL, [SI]
    CMP AL, SMALLEST
    JGE SKIP
    MOV SMALLEST, AL

SKIP:
    INC SI
    DEC CX
    JMP FIND_MIN

DONE:
    MOV AH, 4CH
    INT 21H
    
MAIN ENDP
END MAIN
```
###### c. Give a logic instruction to do each of the following:<span style="float: right; ">02</span>  
1. **Set the MSB and LSB of `BL` register, leaving other bits unchanged.**  
   ```asm
   OR BL, 10000001b              ; OR 1 -> Set
   ```
2. **Clear the even numbered bits of register `AX`, leaving the other bits unchanged.**  
   ```asm
   AND AX, 1010101010101010b     ; AND 0 -> Clear
   ```
### Question 2
###### a. Write a 8086 assembly code to solve the summation of the given series: <span style="float: right; ">08</span>  
$$
1^2+2^2+3^2+4^2+\dots.+10^2
$$
```asm
MOV SI, 1                ; Counter for Series
MOV BX, 0               
MOV CX, 10               ; Defualt counter for LOOP
 
Continue:               
	MOV AX, SI
	MUL SI               ; AX = AX * SI
	ADD BX, AX           ; ADD BX with AX
	INC SI
	LOOP Continue        ; Continue LOOP untill CX=0
 
MOV AX, BX               ; Store the sum of Series in AX
HLT
```
###### b. Name the registers that are involved in the stack operation of 8086 microprocessor. Suppose, the initial value of `SP` is `0100:1120` and `FR=05H`. Complete  the table below for each instructions of the assembly language.<span style="float: right; ">10</span>  

| Instructions    | SP      |  Value  | AX      |   BX    |
| --------------- | ------- | :-----: | ------- | :-----: |
| `MOV AX, 1234H` | $1120H$ |    -    | $1234H$ |    -    |
| `MOV BX, 2345H` | $1120H$ |    -    | $1234H$ | $2345H$ |
| `PUSH AX`       | $111EH$ | $1234H$ | $1234H$ | $2345H$ |
| `POP BX`        | $1120H$ |    -    | $1234H$ | $1234H$ |
| `PUSHF`         | $111EH$ | $0005H$ | $1234H$ | $1234H$ |
| `POP BX`        | $1120H$ |    -    | $1234H$ | $0005H$ |
| `NOT BX`        | $1120H$ |    -    | $1234H$ | $FFFAH$ |
> [!tip]+
> - When a word (16 bits) is pushed, the **SP is decremented by 2**. Conversely, when a word is popped, the **SP is incremented by 2**.
> - `PUSHF` pushes the 16-bit FLAGS register onto the stack (decrementing the Stack Pointer by 2), and `POPF` pops a word from the stack into the FLAGS register
###### c. When the stack is completely filled the stack area, `SP=0`, if a data is pushed onto the stack, what would happen to `SP`?<span style="float: right; ">02</span>  
**Ans:**  When the stack is completely filled and `SP=0`, if a data is pushed onto the stack, `SP` would **wrap around to `FFFFH`**. This is a **stack overflow** condition and causes serious problems. The data overwrites memory outside the intended stack area. It can corrupt code, data, or other critical memory regions.

### Question 3
### Question 4
###### a. Suppose, `R1` contains `64H`, `CY=1`. What will be the value of `R1` and `CY` after each successive instruction is executed:<span style="float: right; ">10</span>  
1. **`RR R1`**
2. **`RRC R1`** 
3. **`INC R1`**   

**Ans:**  
1. **`RR R1`**  
   The `RR` instruction rotates the bits of the register to the right. The Least Significant Bit (LSB) moves to the Most Significant Bit (MSB) position.  
   ![[RR.png]]  
   After `RR R1`,  
   `R1` = $32H$  
   `CY`= $1$ (Unchanged)   
   .
2. **`RRC R1`**  
   
