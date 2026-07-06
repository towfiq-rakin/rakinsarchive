In this document, I will provide a step-by-step configuration guide for a LAN and WAN network topology. The configuration covers the fundamentals of router setup, classful IP addressing, dynamic routing, DHCP, VLAN creation, trunking, and inter-VLAN communication.

The topology used in this guide consists of 8 VLANs, with 2 PCs assigned to each VLAN. Two routers are connected through a WAN link, allowing communication between the VLANs on both sides of the network.

![[config.png]]

## Device specifications

Devices used in the config with their models are listed below:

| Device | Model | Count |
| :----: | :---: | :---: |
| Router | 1941  |   2   |
| Switch | 2960  |   4   |
|  Host  |  PC   |  16   |

## Sequence of steps

To successfully complete our lab without any dependencies or conflicts, we must follow a specific sequence.

1. Plan the VLANs and IP addressing
2. Create VLANs on switches
3. Assign access ports to VLANs
4. Configure trunk ports between switches
5. Configure trunk ports to routers
6. Configure router subinterfaces
7. Configure router-to-router IP link
8. Configure DHCP pools
9. Set PCs to DHCP
10. Configure RIP v2
11. Verify VLANs, trunks, DHCP, routing, and pings

## IP Addressing

The topology will follow this table, one subnet per VLAN.

| Name  | Network        | Default Gateway |
| ----- | -------------- | --------------- |
| VLAN1 | 192.168.1.0/24 | 192.168.1.1     |
| VLAN2 | 192.168.2.0/24 | 192.168.2.1     |
| VLAN3 | 192.168.3.0/24 | 192.168.3.1     |
| VLAN4 | 192.168.4.0/24 | 192.168.4.1     |
| VLAN5 | 192.168.5.0/24 | 192.168.5.1     |
| VLAN6 | 192.168.6.0/24 | 192.168.6.1     |
| VLAN7 | 192.168.7.0/24 | 192.168.7.1     |
| VLAN8 | 192.168.8.0/24 | 192.168.8.1     |
| WAN   | 10.0.0.0/24    | --              |

## VLANs

#### Creating VLANs on all switches

Now, our first step is to configure VLANs in switches. The following commands are for `Switch 1`. Do follow similar commands for all the Switches.

```
Switch>en
Switch#config t

Switch(config)#vlan 1
Switch(config-vlan)#name VLAN1
Switch(config-vlan)#exit

Switch(config)#vlan 2
Switch(config-vlan)#name VLAN2
Switch(config-vlan)#exit
```

> [!warning]+
> If a VLAN must pass through a switch, create that VLAN on that switch. Meaning you have to create `VLAN 1 & 2` on `Switch 2` also.

#### Assign PC Switch ports to access VLANs

Each PC port must be configured as an **access port** in the correct VLAN.  
Example for `Switch 1` with `VLAN1`:

```
Switch(config)#int range fa0/4-5
Switch(config-if-range)#switch
Switch(config-if-range)#switchport mode access
Switch(config-if-range)#switchport access vlan 1
Switch(config-if-range)#exit
```

Here, 2 PCs of `VLAN1` are connected through `Fa0/4` & `Fa0/5` of `Switch 1`, thus we assigned ports `Fa0/4-5` for `VLAN1`.  
Similarly for `VLAN2`:

```
Switch(config)#int range fa0/2-3
Switch(config-if-range)#switchport mode access
Switch(config-if-range)#switchport access vlan 2
Switch(config-if-range)#exit
```

Like above, every other switch should be configured to assign VLAN ports.

> [!tip]-
> You can run `do show vlan` command in Switch terminal config mode to see the switch's current VLAN status.

#### Configure trunk links between switches and routers

Any link that connects two switches should be a trunk. For example, `Switch 1` is connected with `Switch 2` via port `Fa0/1---Fa0/2`.  
Thus, for `Switch 1`:

```
Switch(config)#int fa0/1
Switch(config-if)#switch
Switch(config-if)#switchport mode trunk
Switch(config-if)#

%LINEPROTO-5-UPDOWN: Line protocol on Interface FastEthernet0/1, changed state to down

%LINEPROTO-5-UPDOWN: Line protocol on Interface FastEthernet0/1, changed state to up

Switch(config-if)#exit
```

This should automatically enable `trunk` in `Switch 2` on port `Fa0/2`.

The switch port connected to the router must also be a trunk. Port `Fa0/1` of `Switch 2` is connected to `Router 1`. Thus:

```
Switch(config)#int fa0/1
Switch(config-if)#switchport mode trunk
Switch(config-if)#exit
```

Now that should be followed on the other side of topology, with `Router 2` and `Switch 3 & 4`.

## Router Configuration

`Router 1` connects to the switch via `Gig0/1` port. First enable the port:

```
Router>en
Router#config t
Router(config)#int gig0/1
Router(config-if)#no shut
```

Then create subinterfaces for each `VLAN 1-4` connected to the `Router 1`:

```
Router(config)#int gig0/1.1
Router(config-subif)#encapsulation dot1Q 1
Router(config-subif)#ip add 192.168.1.1 255.255.255.0
Router(config-subif)#exit

Router(config)#int gig0/1.2
Router(config-subif)#encapsulation dot1Q 2
Router(config-subif)#ip add 192.168.2.1 255.255.255.0
Router(config-subif)#exit

Router(config)#int gig0/1.3
Router(config-subif)#encapsulation dot1Q 3
Router(config-subif)#ip add 192.168.3.1 255.255.255.0
Router(config-subif)#exit

Router(config)#int gig0/1.4
Router(config-subif)#encapsulation dot1Q 4
Router(config-subif)#ip add 192.168.4.1 255.255.255.0
Router(config-subif)#exit
```

Similarly, configure `Router 2` for `VLAN 5-8`.

## WAN

`Router 1` and `Router 2` are connected to a `WAN` via port `Gig0/0`.  
IP Configuration on `Router 1`:

```
Router(config)#int gig0/0
Router(config-if)#ip add 10.0.0.1 255.255.255.0
Router(config-if)#no shut
Router(config-if)#exit
```

On `Router 2` :

```
Router(config)#int gig0/0
Router(config-if)#ip add 10.0.0.2 255.255.255.0
Router(config-if)#no shut
Router(config-if)#exit
```

## DHCP

On both routers, DHCP should be configured for each `VLAN`.  
But first, default addresses should be excluded.

```
Router(config)#ip dhcp excluded-address 192.168.1.1
Router(config)#ip dhcp excluded-address 192.168.2.1
Router(config)#ip dhcp excluded-address 192.168.3.1
Router(config)#ip dhcp excluded-address 192.168.4.1
```

Then:

```
Router(config)#ip dhcp pool vlan1
Router(dhcp-config)#network 192.168.1.0 255.255.255.0
Router(dhcp-config)#default-router 192.168.1.1
Router(dhcp-config)#exit
```

At this point, the PC's IP configuration menu should show a successful DHCP request.  
![[dhcp.png]]

Configure DHCP for other VLANs on `Router 1` and `Router 2` respectively.

> [!tip]-
>
> If you encounter any DHCP error, run `do show ip dhcp conflict` to verify and see them.

By this time, you should be able to share packets between VLANs. To share packets from one LAN to another LAN through a WAN, we must configure a routing protocol.

## RIP Routing

On `Router 1`:

```
Router>en
Router#config t
Router(config)#router rip
Router(config-router)#ver 2
Router(config-router)#network 10.0.0.0
Router(config-router)#network 192.168.1.0
Router(config-router)#network 192.168.2.0
Router(config-router)#network 192.168.3.0
Router(config-router)#network 192.168.4.0
Router(config-router)#no auto-summary
Router(config-router)#exit
```

That is, we must let the router know all the networks directly connected to it.  
For `Router 2`:

```
Router>en

Router#conf t
Router(config)#router rip
Router(config-router)#ver 2
Router(config-router)#network 10.0.0.0
Router(config-router)#network 192.168.5.0
Router(config-router)#network 192.168.6.0
Router(config-router)#network 192.168.7.0
Router(config-router)#network 192.168.8.0
Router(config-router)#no auto-summary
Router(config-router)#exit
```

Now verify the routing table with `do show ip route`. It should show something like this:

```
Router(config)#do show ip route
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
	D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
	N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
	E1 - OSPF external type 1, E2 - OSPF external type 2, E - EGP
	i - IS-IS, L1 - IS-IS level-1, L2 - IS-IS level-2, ia - IS-IS inter area
	* - candidate default, U - per-user static route, o - ODR
	P - periodic downloaded static route

Gateway of last resort is not set

10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C 10.0.0.0/24 is directly connected, GigabitEthernet0/0
L 10.0.0.2/32 is directly connected, GigabitEthernet0/0

R 192.168.1.0/24 [120/1] via 10.0.0.1, 00:00:23, GigabitEthernet0/0
R 192.168.2.0/24 [120/1] via 10.0.0.1, 00:00:23, GigabitEthernet0/0
R 192.168.3.0/24 [120/1] via 10.0.0.1, 00:00:23, GigabitEthernet0/0
R 192.168.4.0/24 [120/1] via 10.0.0.1, 00:00:23, GigabitEthernet0/0

192.168.5.0/24 is variably subnetted, 2 subnets, 2 masks
C 192.168.5.0/24 is directly connected, GigabitEthernet0/1.5

--more--
```

Which confirms `Router 2` has a valid routing path for networks `192.168.1.0 - 4.0` using `RIP`.
![[ping.png]]

**And Voilà! Now we can successfully ping `192.168.8.2` from `192.168.2.2`**

---

Upcoming - **ACL**

