### Question 1
###### a. Briefly describe the operation of Data Encapsulation using a diagram.<span style="float: right; ">4</span>  
**Ans:**   
###### b.  <span style="float: right; ">4</span>
1. **Differentiate between guided media and unguided media.**  
   For **guided media**, electromagnetic waves are guided along a solid medium, such as copper twisted pair, copper coaxial cable, and optical fiber. For **unguided media**, wireless transmission occurs through the atmosphere, outer space, or water[^1].
2. **Short notes on Baud Rate, Half-duplex, Bridge/Switch, BPSK.**
   -  **Baud rate** is the rate at which the number of signal elements or changes to the signal occurs per second when it passes through a transmission medium.
   - With **half-duplex** transmission, only one of two stations on a point-to-point link may transmit at a time.
   - **Switches/bridges** are Data Link Layer (Layer 2) devices that connect network segments or devices by filtering and forwarding data frames based on their physical (MAC) addresses.
   - In **BPSK** (Binary Phase Shift Keying), the phase of the carrier signal is shifted to represent data[^1].
###### c. <span style="float: right; ">4</span>
1. **What are the differences between thermal noise and cross-talk?**  
   **Thermal noise** is an internal disturbance caused by the random thermal motion of electrons within a conductor due to ageing, which exists in all electronic devices regardless of signal presence. **Cross-talk** is an external interference where a signal from one transmission line electromagnetically couples with and disrupts a signal in an adjacent line.
2. **Given a receiver with an effective noise temperature of $297K$ and a $10MHz$ bandwidth. Find out the thermal noise level at the receiver's output.**  
   Thermal noise in watts present in a bandwidth of $B\space Hz$ can be expressed as :
   $$
   \begin{aligned}
   N &= KTB\\
   &=10\log_{10}K+10\log_{10}T+10\log_{10}B\\
   &=-228.6dBW+10\log_{10}297+10\log_{10}10^7\\
   &=-228.6+24.7+70\\
   &=-133.9dBW\\
   \end{aligned}
   $$
###### d. Solve the following problems:<span style="float: right; ">6</span>  
1. **There is a channel with that has capacity $20Mbps$ and the bandwidth of the given channel is $3MHz$. What signal-to-noise ratio is required to achieve this capacity (assuming that white thermal noise exists)?**  
   Using Shannon's formula,
   $$
   \begin{aligned}
   C&=B\log_{2}(1+SNR)\\
   20\times 10^6&=3\times 10^6\times\log_{2}(1+SNR)\\
   \log_{2}(1+SNR)&=\frac{20}{3}\\
   1+SNR&=2^{\frac{20}{3}}\\
   SNR&=2^{\frac{20}{3}}-1\\
   SNR&=100.59
   \end{aligned}
   $$
   Thus, required signal-to-noise ratio, $SNR=100.59$.  

2. **A digital signaling system is required to operate at $9600bps$. If a signal element encodes a $4\space bit$  word, what is the minimum required bandwidth of that channel?**  
   Using Nyquist's formula,
   $$
   \begin{aligned}
   C&=2B\log_{2}(M)\\
   9600&=2B\times4\\
   B&=\frac{9600}{8}\\
   B&=1200
   \end{aligned}
   $$   
   Thus, required minimum bandwidth is $1200Hz$.
###### e. What is socket address? List out the application of socket addressing.<span style="float: right; ">2</span>  
**Ans:**  A transport-layer protocol in the TCP suite needs both the IP address and the port number, at each end, to make a connection. The combination of an IP address and a port number is called a ***socket address***[^2]. Applications of socket addressing includes:  
1. Process Identification
2. Client-server communication
3. Data Multiplexing
4. Connection Management

### Question 2
###### a. We assume there are 15 senders. These senders are to be multiplexed into a single communication line/channel. Each sender are bursty and each can generate data rate at $55\space Kbps$. Certain cases, Some are idle and some are active. Under-these circumstances, find out the minimum channel capacity for the following conditions:<span style="float: right; ">6</span>  
**Ans:**
1. **15 senders are active under Synchronous Time Division Multiplexing.**   
   Minimum channel capacity, $=15\times 55=825\space Kbps$
2. **Maximum 1=5 senders are active under Statistical Time Division Multiplexing.**  
   Minimum channel capacity, $=5\times 55=275\space Kbps$
3. **15 senders are active under Synchronous Time Division Multiplexing.**  
   Minimum channel capacity, $=15\times 55=825\space Kbps$

###### b. What is called controlled access? What are the differences between reservation and polling method? Using a diagram, explain the token parsing method. <span style="float: right; ">4</span>  
**Ans:** In **controlled access**, the stations consult one another to find which station has the right to send. A station cannot send unless it has been authorized by other stations.  
In **Reservation**, a station must book a specific time slot or channel resource in advance before transmitting data, treating the medium as a scheduled resource. Whereas, in **Polling**, a central controller functions as a master that sequentially invites each secondary station to transmit, allowing access only when a station is addressed[^2].

**Token Parsing**  
In the token-passing method, the stations in a network are organized in a logical ring. In other words, for each station, there is a predecessor and a successor. The predecessor is the station which is logically before the station in the ring; the successor is the station which is after the station in the ring. The current station is the one that is accessing the channel now. The right to this access has been passed from the predecessor to the current station. The right will be passed to the successor when the current station has no more data to send.
![[Token Parsing.png]]
*Figure: Logical ring and physical topology in token-passing access method*

###### c. For a wireless network, there are multiple senders and receivers. Under the $t_{5}$ slot, the sender $S_{3}$ tries to send a frame. Currently, the value of $K$ is $2$ (each slot carries $1ns$). Given, $IFS$ is $3ns$, and distance between sender and receiver is $500$ meter where velocity is $250mns^{-1}$. Find out the total time that is required to get positive acknowledgement from the receiver to sender. <span style="float: right; ">5</span>  
**Ans:** 



[^1]: Data and Computer Communication, Stallings, 8th Edition

[^2]: Data Communications and Networking, Forouzan, 5th Edition
