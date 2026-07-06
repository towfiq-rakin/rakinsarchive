> Switches are devices capable of creating temporary connections between two or more devices linked to the switch.

#### Taxonomy of switched networks

1. Circuit-switched networks
2. Packet-switched networks
   - Datagram networks
   - Virtual-circuit networks
1. Message-switched networks

### Circuit-switched networks
A circuit-switched network consists of a set of switches connected by physical links. A connection between two stations is a dedicated path made of one or more links. However, each connection uses only one dedicated channel on each link. Each link is normally divided into `n` channels by using FDM or TDM.  

When a system A needs to communicate with system M:
- **Setup phase:** System A needs to request a connection to M that must be accepted by all switches as well as by M itself.
- **Data transfer:** After the dedicated path made of connected channels is established, data transfer can take place.
- **Teardown phase:** After all data have been transferred, the circuits are torn down.  

> [!note]+
> In circuit switching, the resources need to be reserved during the setup phase; the resources remain dedicated for the entire duration of data transfer until the teardown phase.

**Efficiency**
- Circuit switched networks are not as efficient as the other two types of networks because resources are allocated during the entire duration of the connection.
- These resources are unavailable to other connections.  

**Delay**
- Although a circuit-switched network normally has low efficiency, the delay in this type of network is minimal.
- During data transfer the data are not delayed at each switch; the resources are allocated for the duration of the connection.  

> [!note]+
> Switching at the physical layer in the traditional telephone network uses the circuit-switching approach.

### Datagram networks
In data communications, we need to send messages from one end system to another. If the message is going to pass through a packet-switched network, it needs to be divided into packets of fixed or variable size. The size of the packet is determined by the network and the governing protocol.  

>[!note]+
>In a packet-switched network, there is no resource reservation; resources are allocated on demand.

In datagram network, each packet is treated independently of all others. Even if a packet is part of a multipacket transmission, the network treats it as though it existed alone.  

**Routing table**  
A switch in a datagram network uses a routing table that is based on the destination address.  

| Destination address | Output Port |
| ------------------- | ----------- |
| 1232                | 1           |
| 6194                | 2           |
| ...                 | ...         |
| 7292                | 3           |
The destination address in the header of a packet in a datagram network remains the same during the entire journey of the packet.  

>[!note]+
>The efficiency of a datagram network is better than that of a circuit-switched network; resources are allocated only when there are packets to be transferred.

**Delay**  
There maybe a greater delay in datagram networks than in a virtual-circuit network.  
$$
Total \space Delay = 3T+3\tau+w_1+w_2
$$
Where,  
$T$ = Transmission time  
$\tau$ = Propagation delay  
$w$ = Waiting time  

![[delay-in-datagram.png]]

>[!note]+
>Switching in the Internet is done by using the datagram approach to packet switching at the network layer.

### Virtual-circuit network
A virtual-circuit network is a cross between a circuit-switched network and a datagram network. It has some characteristics of both.  

Characteristics of virtual-circuit networks:  
- As in a circuit-switched network, there are setup and teardown phases in addition to the data transfer phase.
- Resources can be allocated during the setup phase, as in a circuit -switched network, or on demand, as in a datagram network.
- As in a datagram network, data are packetized and each packet carries an address (local jurisdiction) in the header.
- As in a circuit network, all packets follow the same path established during the connection. 
- A virtual-circuit network is normally implemented in the data link layer, while a circuit-switched network is implemented in the physical layer and a datagram network in the network layer.  

![[virtual-circuit-network.png]]
The virtual-circuit network has switches that allow traffic from sources to destinations. A source or destination can be a computer, packet switch, or other device that connects other network.  

**Global addressing**  
In virtual circuit networks,
- A global address that can be unique in the scope of the WAN or international network. 
- Global addressing in virtual circuit networks is used only to create a virtual circuit identifier.  

#### Virtual Circuit Identifier (VCI)
VCI is actually used data transfer.  
- VCI is a small number that only has a switch scope.
- It is used by a frame between two switches.  
Each switch can use its own sets of VCIs.

![[vci.png]]

#### Three phases
To communicate, a source and destination must undergo three phases.  
1. Setup: The source and destination use their global addresses to help switches make table entries for the connection.
2. Data transfer
3. Teardown: The source and destination inform the switches to erase the corresponding entry.

**Setup phase**  
Switched Virtual Circuit (SVC): Creating temporary and short connection that exists only when data are being transferred between source and destination.  

**Data transfer phase**  
To transfer a frame from a source to its destination, all switches need to have a table entry for this virtual circuit. 
![[data-transfer-phase.png]]

**Teardown phase** 
- In this phase, source A, after sending all frames to B, sends a special frame called a teardown request.  
- Destination B responds with a teardown confirmation frame. 
- All switches erase the corresponding entry from their tables.  

>[!note]+
>In virtual-circuit switching, all packets belonging to the same source and destination travel the same path; but the packets may arrive at the destination with different delays if resource allocation is on demand.

**Delay in Virtual-circuit networks**  
- There is a one-time delay for setup and one-time delay for teardown.
- If resources are allocated during the setup phase, there is no wait time for individual packets.  
- Total delay time = $3T+3\tau+setup\space delay+teardown\space time$ 
![[delay-in-virtual-circuit.png]]

>[!note]+
>Switching at the data link layer in a switched WAN is normally implemented by using virtual-circuit techniques.

### Summary
1. A switched network consists of a series of interlinked nodes, called switches; circuit switching, packet switching, and message switching.
2. We can divide today’s networks into three broad categories: circuit- switched networks, packet-switched networks, and messaged-switched. Packet-switched networks can also be divided into two subcategories: **virtual-circuit networks and datagram networks**.
3. A circuit-switched network is made of a set of switches connected by physical links. In circuit switching, the resources need to be **reserved during the setup phase**; the resources remain dedicated for the entire duration of data transfer phase until the teardown phase.
4. In packet switching, there is **no resource allocation** for a packet. This means that there is no reserved bandwidth on the links, and there is no scheduled processing time for each packet. Resourced are allocated **on demand**.