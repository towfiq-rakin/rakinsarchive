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

###### d. A *slotted ALOHA* network transmits $400\space bit$ frames using a shared channel with a $400\space Kbps$ bandwidth. Under this circumstances, deduce the throughput for the following cases:<span style="float: right; ">5</span>  
1. **1200 frames/second**
2. **600 frames/second**
3. **300 frames/second**

**Ans:**  The frame transmission time $(T_{fr})$ is,  
$$
\begin{aligned}
T_{fr}=\frac{\text{Frame Size}}{\text{Bandwidth}}=\frac{\text{400 bits}}{\text{400 Kbps}}=0.001s=1ms
\end{aligned}
$$ 
1. 1200 frames/second
   $$
   \begin{aligned}
   G&=1200 \times 0.001=1.2\\
   \\
   S&=G \times e^{-G}\\
   &=1.2 \times e^{-1.2}\\
   &=0.3614\\
   \\
   \text{Throughput}&=1200\times 0.3614 \\
   &= 433.68\text{ frames}
   \end{aligned}
   $$  
2. 600 frames/second     
   $$
   \begin{aligned}
   G&=600 \times 0.001=0.6\\
   \\
   S&=G \times e^{-G}\\
   &=0.6 \times e^{-0.6}\\
   &=0.3293\\
   \\
   \text{Throughput}&=600\times 0.3293 \\
   &= 197.57\text{ frames}
   \end{aligned}
   $$  
3. 300 frames/second
   $$
   \begin{aligned}
   G&=300 \times 0.001=0.3\\
   \\
   S&=G \times e^{-G}\\
   &=0.3 \times e^{-0.3}\\
   &=0.2222\\
   \\
   \text{Throughput}&=1200\times 0.2222 \\
   &= 66.67\text{ frames}
   \end{aligned}
   $$
### Question 3
###### a. Briefly describe the operation of Data Encapsulation using a diagram. <span style="float: right; ">5</span>  
**Ans:**  

###### b. Find the digital encoding for the following digital data: <span style="float: right; ">6</span>  
$$
1100000000110000010
$$
1. Bipolar-AMI (most recent preceding 1 bit has negative edge).
2. B8ZS
   ![[Encoding.png]]
###### c. <span style="float: right; ">4</span>  
1. **Short note on: Pulse code modulation.**  
   Pulse code modulation (PCM) is based on the **sampling theorem:** If a signal $f(t)$ is sampled at regular intervals of time and at a rate higher than twice the highest signal frequency, then the samples contain all the information of the original signal. The function $f(t)$ may be reconstructed from these samples by the use of a lowpass filter.  
   
2. **Fill the table:**
   
| Type             | Frequency Range                                         |
| ---------------- | ------------------------------------------------------- |
| Microwave        | $\text{1 GHZ to 40 GHz}$                                |
| Omni-directional | $\text{30 MHz to 1 GHz}$                                |
| Infrared         | $3 \times 10^{11}\text{ to }2 \times 10^{14}\text{ Hz}$ |
###### d. <span style="float: right; ">5</span>  
1. **What is Data Encoding? List out the techniques of digital data to analog signal.**  
   **Data encoding** is the process of converting data from one form into another format using a specific set of rules or schemes. Both analog and digital information can be encoded as either analog or digital signals. The particular encoding that is chosen depends on the specific requirements to be met and the media and communications facilities available.  
	1. Amplitude Shift Keying (ASK)
	2. Frequency Shift Keying (FSK)
	3. Phase Shift keying (PSK)
2. **Explain the difference between NRZ-L and NRZI.**  

| **NRZ-L (Level)**                                                                                | **NRZ-I (Invert)**                                                                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| The **level** of the voltage determines the bit value.                                           | The **transition** (or lack of it) at the beginning of the bit interval determines the bit value.       |
| A **positive** voltage represents `0` and a **negative** voltage represents `1` (or vice versa). | A **transition** (change in voltage) represents `1`. No change represents `0`.                          |
| Loses synchronization during long strings of **0s** or **1s** (voltage stays constant).          | Loses synchronization only during long strings of **0s** (no transitions occur).                        |
| **Sensitive:** If the wires are swapped (polarity reversed), all 0s become 1s and vice versa.    | **Robust:** Swapping wires has no effect because the receiver looks for _changes_, not absolute levels. |

### Question 4
###### a. As a network administrator, you are responsible to design a network according to given IP Address. For example, The given IP address is: <span style="float: right; ">14</span>  
$$
181.193.223.201
$$
**You are asked to design:**  
1. **Create 16 sub-networks  and list out those networks.**  
IP Address = $181.193.223.201$    
Default CIDR = $/16 \text{ (Class B)}$     
Sub-Networks = 16
Increment per network = $\frac{256}{16}=16$
$$
\begin{aligned}
&181.193.223.201\\
&255.255.0.0\\
1^{st}\text{ Network} \to &\overline{181.193.0.0}\\
\\
2^{nd}\text{ Network} \to &\text{ 181.193.16.0}\\
3^{rd}\text{ Network} \to &\text{ 181.193.32.0}\\
4^{th}\text{ Network} \to &\text{ 181.193.48.0}\\
5^{th}\text{ Network} \to &\text{ 181.193.64.0}\\
6^{th}\text{ Network} \to &\text{ 181.193.80.0}\\
7^{th}\text{ Network} \to &\text{ 181.193.96.0}\\
8^{th}\text{ Network} \to &\text{ 181.193.112.0}\\
9^{th}\text{ Network} \to &\text{ 181.193.128.0}\\
10^{th}\text{ Network} \to &\text{ 181.193.144.0}\\
11^{th}\text{ Network} \to &\text{ 181.193.160.0}\\
12^{th}\text{ Network} \to &\text{ 181.193.176.0}\\
13^{th}\text{ Network} \to &\text{ 181.193.192.0}\\
14^{th}\text{ Network} \to &\text{ 181.193.208.0}\\
15^{th}\text{ Network} \to &\text{ 181.193.224.0}\\
16^{th}\text{ Network} \to &\text{ 181.193.240.0}\\
\end{aligned}
$$  
2. **Find the total usable IP Addresses for the hosts under those networks**  
$$

\begin{aligned}
1^{st}\text{ Network} \to &\text{181.193.0.1} - \text{181.193.15.254}\\
2^{nd}\text{ Network} \to &\text{181.193.16.1} - \text{181.193.31.254}\\
3^{rd}\text{ Network} \to &\text{181.193.32.1} - \text{181.193.47.254}\\
4^{th}\text{ Network} \to &\text{181.193.48.1} - \text{181.193.63.254}\\
5^{th}\text{ Network} \to &\text{181.193.64.1} - \text{181.193.79.254}\\
6^{th}\text{ Network} \to &\text{181.193.80.1} - \text{181.193.95.254}\\
7^{th}\text{ Network} \to &\text{181.193.96.1} - \text{181.193.111.254}\\
8^{th}\text{ Network} \to &\text{181.193.112.1} - \text{181.193.127.254}\\
9^{th}\text{ Network} \to &\text{181.193.128.1} - \text{181.193.143.254}\\
10^{th}\text{ Network} \to &\text{181.193.144.1} - \text{181.193.159.254}\\
11^{th}\text{ Network} \to &\text{181.193.160.1} - \text{181.193.175.254}\\
12^{th}\text{ Network} \to &\text{181.193.176.1} - \text{181.193.191.254}\\
13^{th}\text{ Network} \to &\text{181.193.192.1} - \text{181.193.207.254}\\
14^{th}\text{ Network} \to &\text{181.193.208.1} - \text{181.193.223.254}\\
15^{th}\text{ Network} \to &\text{181.193.224.1} - \text{181.193.239.254}\\
16^{th}\text{ Network} \to &\text{181.193.240.1} - \text{181.193.255.254}\\
\end{aligned}
$$
3. **Find the network address of the $7^{th}$ network.**  
   $$
   \begin{aligned}
   &(7-1) \times 16=96\\
   &7^{th}\text{ Network} \to \text{ 181.193.96.0}\\
   \end{aligned}
   $$
4. **Find the broadcast address of the $12^{th}$ network.**  
   $$
   \begin{aligned}
   12^{th}\text{ Network} &\to \text{ 181.193.176.0}\\
   \text{Broadcast Address} &\to \text{ 181.193.191.255}
   \end{aligned}
   $$
5. **Find the $1^{st}$ host address of $9^{th}$ network.**  
   $$
   \begin{aligned}
   9^{th}\text{ Network} \to &\text{ 181.193.128.0}\\
   1^{st}\text{ Host} \to &\text{ 181.193.128.1}
   \end{aligned}
   $$
6. **Find the last host address of $13^{th}$ network.**  
   $$
   \begin{aligned}
   13^{th}\text{ Network} \to &\text{ 181.193.192.0}\\
   \text{Last Host} \to &\text{ 181.193.207.254}
   \end{aligned}
   $$
7. **Find the $32^{nd}$ host address of $15^{th}$ network.**  
   $$
   \begin{aligned}
   15^{th}\text{ Network} \to &\text{ 181.193.224.0}\\
   1^{st}\text{ Host} \to &\text{ 181.193.224.1}\\
   32^{nd}\text{ Host} \to &\text{ 181.193.224.32}
   \end{aligned}
   $$
[^1]: Data and Computer Communication, Stallings, 8th Edition

[^2]: Data Communications and Networking, Forouzan, 5th Edition
