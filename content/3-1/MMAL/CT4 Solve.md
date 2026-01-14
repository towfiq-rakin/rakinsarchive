###### The memory banks of a microcontroller is given below. What will be the final values of the registers `A` & `R1`, after the execution of the codes?
 ```asm
 MOV A, #07H
 MOV 04H, 08H
 MOV R1, #03H
 ADDC A, R1
 SWAP R1
 CLR C
 ORL A, 0AH
 XCH A, 0EH
 SETB C
 ADD A, R1
 ```
 ![[CT4.png]]  
 
 **Solution:** 
 State of Flag register (i.e. PSW),

| CY  | AC  | FO  | RS1 | RS0 | OV  |  -  |  P  |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
|  1  |  0  |  0  |  1  |  0  |  0  |  X  |  1  |

Thus, current value of 
- Carry Flag = 1 <span style="float: right; ">[CY]</span>
- Memory Bank = $B_{2}$<span style="float: right; ">[RS1 AND RS0]</span>
> [!note]-
> Memory bank is selected using RS1 and RS0 bit. For details, see Question 6.a from [[MMAL Final Solve]].

Memory addresses of:
- $B_{0}\to 00H-07H$  
- $B_{1}\to 08H-0FH$
- $B_{2}\to 10H-17H$
- $B_{3}\to 18H-1FH$  

We need those addresses during the execution of code.

1. **`MOV A, #07H`**  $\to$ Load $07H$ in register `A`.  
   `A` = $07H$
2. **`MOV 04H, 08H`** $\to$ Copy the value of memory bank address `08H` to address `04H`. Currently `08H` $(B_{1})$ holds value $05H$, which will be copied into address `04H` $(B_{0})$.   
3. **`MOV R1, #03H`** $\to$ Load $03H$ in `R1` register of current selected bank $B_{2}$. The address of `R1` is `10H`.   
   `R1` = $03H$
4. **`ADDC A, R1`**  $\to$ Add `A` with `R1` and carry `CY`.  
   `A` = `A+R1+CY`  
   `A`= $07H+03H+1$  
   `A` = $0BH$
5. **`SWAP R1`** $\to$ Swap the lower nibble with higher nibble of `R1`. The value of `R1` becomes $30H$ from $03H$.  
   `R1` = $30H$  
6. **`CLR C`** $\to$ Clear the value of carry bit.  
   `CY` = $0$  
7. **`ORL A, 0AH`** $\to$ Logical OR between register `A` and memory bank address`0AH`. Currently `A`= $0BH$ and `0AH` = $01H$.  
   `A` = $0BH \lor 01H$  
   `A` = $0BH$  
8. **`XCH A, 0EH`** $\to$ Exchange the value between register `A` and memory bank address `0EH`. Currently `A`= $0BH$ and `0EH` = $01H$.  
   `A` = $01H$  
   `0EH` = $0BH$ 
9. **`SETB C`** $\to$ Set bit of carry flag.  
   `CY` = $1$  
10.  **`ADD A, R1`** $\to$ Add `A` with `R1`.  
   `A` = $01H+30H$  
   `A` = $31H$  

Thus the final values, `A` = $31H$, `R1` = $30H$
