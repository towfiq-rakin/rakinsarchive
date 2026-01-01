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
4. **`SWAP R1`**
5. **`RLC R1`** 
   
**Ans:**  
1. **`RR R1`**  
   The `RR` instruction rotates the bits of the register to the right. The Least Significant Bit (LSB) moves to the Most Significant Bit (MSB) position.  
   ![[RR.png]]  
   After `RR R1`,  
   `R1` = $32H$  
   `CY`= $1$ (Unchanged)   
   .
2. **`RRC R1`**  
   The `RRC` instruction rotates the bits to the right through the Carry Flag. The LSB moves into the Carry Flag, and the previous value of the Carry Flag moves into the MSB.  
   ![[RRC.png]]After `RRC R1`,  
   `R1` = $99H$  
   `CY` = $0$   
   .

3. **`INC R1`**  
   The `INC` instruction adds 1 to the current value of the register.  
   `R1` = $99H+1H=9AH$   
   `CY` = $0$   
   .
4. **`SWAP R1`**
   The `SWAP` instruction swaps the lower $4\space bit$ with higher $4\space bit$ .
   `R1` = $A9H$   
   `CY` = $0$   (Doesn't effect carry flag)  
   .
5. **`RLC R1`**  
   The `RLC` instruction rotates the bits to the left through the Carry Flag. The MSB moves into the Carry Flag, and the previous value of the Carry Flag moves into the LSB.   
   ![[RLC.png]]
   After `RLC R1`
   `R1` = $52H$   
   `CY` = $1$     
###### b. Show that the maximum external ROM size of 8051 microcontroller is $60KB$ and $64KB$ in different cases.<span style="float: right; ">08</span>  
**Ans:**  The 8051 microcontroller architecture supports external memory expansion through a 16-bit address bus, allowing it to address external program memory (ROM) and external data memory (RAM). The maximum addressable external RAM size varies depending on the configuration and addressing mode used.
1. **Maximum External RAM = 64KB**  
   This maximum is achieved when using external data memory access only, without any internal ROM utilization for program storage. A 16-bit address bus allows the processor to access $2^{16}$ unique memory locations ($65,536\text{ bytes}\text{ or 64KB}$). Using the instruction `MOVX A, @DPTR` or `MOVX @DPTR, A`, the controller can interface with the full range of external RAM from $0000\text{H}$ to $FFFF\text{H}$.  
   ```
   Address bus width = 16 bits 
   Maximum addressable locations = 2^16 = 65,536 locations 
   Each location = 1 byte 
   Maximum external RAM = 65,536 bytes = 64KB
   ```
   
2. **Maximum External RAM = 60KB**  
   This constraint applies when the microcontroller uses on-chip program memory and certain address space is reserved for internal operations. Standard 8051 variants contain $4\text{ KB}$ of internal ROM ($0000\text{H}$ to $0FFF\text{H}$). When the **External Access (EA)** pin is held high ($V_{CC}$), the processor executes instructions from the $4\text{ KB}$ internal ROM first. Internal ROM occupies $0000H$ to $0FFFH$ $(4KB)$ from $64KB$ RAM. This configuration affects the practical external RAM usage$(64\text{ KB} - 4\text{ KB} = \mathbf{60\text{ KB}})$.  
   ```
   Total addressable external RAM space = 64KB
   Reserved/Internal space = 4KB 
   Available external RAM = 64KB - 4KB = 60KB
   ```

With **$\overline{EA}= HIGH$** (Internal ROM enabled):  
![[60KB.png]]
With **$\overline{EA}= LOW$** (External ROM only):
![[64KB.png]]
###### c. Distinguish between Microprocessor and Microcontroller. <span style="float: right; ">02</span>  
**Ans:** 

| Microprocessor                                  | Microcontroller                          |
| ----------------------------------------------- | ---------------------------------------- |
| CPU is stand-alone. RAM, ROM, I/O are separate. | CPU, RAM, ROM, I/O are on a single chip. |
| Generally  large in size.                       | Small and compact                        |
| More expensive                                  | Cheaper than Microprocessor              |
| Higher power consumption                        | Lower power consumption                  |
### Question 5
###### a. Demonstrate how memory is interfaced in 8051 micrcontroller with diagram.<span style="float: right; ">10</span>  
