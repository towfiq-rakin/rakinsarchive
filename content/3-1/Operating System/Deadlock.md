In a multiprogramming environment, several threads may compete for a finite number of resources. A thread requests resources; if the resources are not available at that time, the thread enters a waiting state. Sometimes, a waiting thread can never again change state, because the resources it has requested are held by other waiting threads. This situation is called a **deadlock**.
### System Model
A system consists of a finite number of resources to be distributed among a number of competing threads. **CPU cycles, files,** and **I/O** devices (such as network interfaces and DVD drives) are examples of resource types.  
A thread must request a resource before using it and must release the resource after using it. A thread may request as many resources as it requires to carry out its designated task. Obviously, the number of resources requested may not exceed the total number of resources available in the system. In other words, a thread cannot request two network interfaces if the system has only one.  
Under the normal mode of operation, a thread may utilize a resource in only the following sequence:
1. **Request:** The thread requests the resource. If the request cannot be granted immediately, then the requesting thread must wait until it can acquire the resource.
2. **Use:** The thread can operate on the resource.
3. **Release:** The thread releases the resource.

A system table records whether each resource is free or allocated. For each resource that is allocated, the table also records the thread to which it is allocated. If a thread requests a resource that is currently allocated to another thread, it can be added to a queue of threads waiting for this resource.  
>*A set of threads is in a deadlocked state when every thread in the set is waiting for an event that can be caused only by another thread in the set.*

### Deadlock Characterization
A deadlock situation can arise if the following four conditions hold simultaneously in a system:
1. **Mutual exclusion.** At least one resource must be held in a nonsharable mode; that is, only one thread at a time can use the resource.
2. **Hold and wait.** A thread must be holding at least one resource and waiting to acquire additional resources that are currently being held by other threads.
3. **No preemption.** Resources cannot be preempted; that is, a resource can be released only voluntarily by the thread holding it, after that thread has completed its task.
4. **Circular wait.** A set $\{T_{0}, T_{1}, ..., T_{n}\}$ of waiting threads must exist such that $T_{0}$ is waiting for a resource held by $T_{1}$, $T_{1}$ is waiting for a resource held by $T_{2}, ..., T_{n}−1$ is waiting for a resource held by $T_{n}$, and $T_{n}$ is waiting for a resource held by $T_{0}$.

###### Resource Allocation Graph
Deadlocks can be described more precisely in terms of a directed graph called a **system resource-allocation graph**. This graph consists of a set of vertices V and a set of edges E. The set of vertices V is partitioned into two different types of nodes:
-  $T = \{T_{1}, T_{2}, ..., T_{n}\},$ the set consisting of all the active threads in the system.
- $R = \{R_{1}, R_{2}, ..., R_{m}\},$ the set consisting of all resource types in the system.

A directed edge from thread $T_{i}$ to resource type $R_{j}$ is denoted by $T_{i} \to R_{j}$;
- A directed edge $T_{i} \to R_{j}$ is called a **request edge**;
- A directed edge $R_{j} \to T_{i}$ is called an **assignment edge**.

![[Fig8.4.png]]  
It can be shown that, if the graph contains **no cycles**, then no thread in the system is deadlocked. If the graph does contain a **cycle**, then a deadlock may exist.  
If each resource type has several instances, then a cycle does not necessarily imply that a deadlock has occurred. In this case, a cycle in the graph is a necessary but not a sufficient condition for the existence of deadlock.  
![[Fig8.5.png]]  
At this point, two minimal cycles exist in the system:
$$
\begin{aligned}
&T_{1} \to R_{1} \to T_{2} \to R_{3} \to T_{3} \to R_{2} \to T_{1}\\
&T_{2} \to R_{3} \to T_{3} \to R_{2} \to T_{2}
\end{aligned}
$$
Threads $T_{1}$, $T_{2}$, and $T_{3}$ are deadlocked. Thread $T_{2}$ is waiting for the resource $R_{3}$, which is held by thread $T_{3}$. Thread $T_{3}$ is waiting for either thread $T_{1}$ or thread $T_{2}$ to release resource $R_{2}$. In addition, thread $T_{1}$ is waiting for thread $T_{2}$ to release resource $R_{1}$.  

Now consider the resource-allocation graph in Figure 8.6. In this example, we also have a cycle:  
$$T_{1} \to R_{1} \to T_{3} \to R_{2} \to T_{1}$$
![[Fig8.6.png]]  
However, there is no deadlock. Observe that thread $T_{4}$ may release its instance of resource type $R_{2}$. That resource can then be allocated to $T_{3}$, breaking the cycle.
> [!summary]-
> In summary, if a resource-allocation graph does not have a cycle, then the system is **not** in a deadlocked state. If there is a cycle, then the system **may** or **may not** be in a deadlocked state. This observation is important when we deal with the deadlock problem.

### Methods for Handling Deadlocks
we can deal with the deadlock problem in one of three ways:
- We can ignore the problem altogether and pretend that deadlocks never occur in the system.
- We can use a protocol to prevent or avoid deadlocks, ensuring that the system will ***never*** enter a deadlocked state.
  1. Deadlock prevention
  2. Deadlock avoidance
- We can allow the system to enter a deadlocked state, detect it, and recover.

The first solution is the one used by most operating systems, including Linux and Windows. It is then up to kernel and application developers to write programs that handle deadlocks, typically using approaches outlined in the second solution. Some systems, such as databases adopt the third solution, allowing deadlocks to occur and then managing the recovery.
 
**Deadlock prevention** provides a set of methods to ensure that at least one of the necessary conditions cannot hold.  
**Deadlock avoidance** requires that the operating system be given additional information in advance concerning which resources a thread will request and use during its lifetime.

### Deadlock Prevention
For a deadlock to occur, each of the four necessary conditions must hold. By ensuring that at least one of these conditions cannot hold, we can prevent the occurrence of a deadlock.  

**Mutual Exclusion**  
The mutual-exclusion condition must hold. That is, at least one resource must be non shareable. Shareable resources do not require mutually exclusive access and thus cannot be involved in a deadlock. Read-only files are a good example of a shareable resource.  

**Hold and Wait**  
To ensure that the hold-and-wait condition never occurs in the system, we must guarantee that, whenever a thread requests a resource, it does not hold any other resources. One protocol that we can use requires each thread to request and be allocated all its resources before it begins execution.  
An alternative protocol allows a thread to request resources only when it has none.  

**No Preemption**  
If a thread is holding some resources and requests another resource that cannot be immediately allocated to it (that is, the thread must wait), then all resources the thread is currently holding are preempted. In other words, these resources are implicitly released.  
Alternatively, if a thread requests some resources, we first check whether they are available. If they are, we allocate them. If they are not, we check whether they are allocated to some other thread that is waiting for additional resources. If so, we preempt the desired resources from the waiting thread and allocate them to the requesting thread.  
This protocol is often applied to resources whose state can be easily saved and restored later, such as CPU registers and database transactions.  

**Circular Wait**   
Impose a total ordering of all resource types, and require that each thread requests resources in an increasing order of enumeration.

### Deadlock Avoidance
The various algorithms that use this approach differ in the amount and type of information required. The simplest and most useful model requires that each thread declare the maximum number of resources of each type that it may need. Given this a priori information, it is possible to construct an algorithm that ensures that the system will never enter a deadlocked state.  

###### 1. Safe State
A state is safe if the system can allocate resources to each thread (up to its maximum) in some order and still avoid a deadlock. Formally, a state is safe only if there exists a **safe sequence** of threads $\langle T_1, T_2, \dots, T_n \rangle$.
###### 2. Resource-Allocation Graph Scheme
This deadlock avoidance algorithm is typically used when a system has only a **single instance** of each resource type. It extends the standard resource-allocation graph by introducing a new type of edge called a **claim edge**.
1. A claim edge $T_i \rightarrow R_j$ indicates that thread $T_i$ may request resource $R_j$ at some time in the future. This edge resembles a request edge but is represented by a dashed line.
2. When a thread $T_i$ requests resource $R_j$, the claim edge $T_i \rightarrow R_j$ is converted to a request edge. Similarly, when a resource $R_j$ is released by $T_i$, the assignment edge $R_j \rightarrow T_i$ reconverts to a claim edge $T_i \rightarrow R_j$.
3. The system checks for safety by attempting to convert the request edge into an assignment edge. The request can be granted only if doing so does not result in the formation of a cycle in the resource-allocation graph. If no cycle exists, the allocation leaves the system in a safe state; if a cycle is found, the allocation would put the system in an unsafe state.  

![[Fig8.9.png]]  
###### 3. Banker's Algorithm
The Banker's Algorithm is a deadlock avoidance algorithm designed for systems with **multiple instances** of each resource type. It is less efficient than the resource-allocation graph scheme but necessary when resources have multiple instances. The name is derived from its use in banking systems to ensure the bank never allocates its available cash in a way that prevents it from satisfying the needs of all its customers.  
- **Available**: A vector of length $m$ indicating the number of available instances of each resource type.
- **Max**: An $n \times m$ matrix defining the maximum demand of each thread. $Max[i][j] = k$ means thread $T_i$ may request at most $k$ instances of resource type $R_j$.
- **Allocation**: An $n \times m$ matrix defining the number of resources of each type currently allocated to each thread.
- **Need**: An $n \times m$ matrix indicating the remaining resource need of each thread. $Need[i][j] = Max[i][j] - Allocation[i][j]$.

**Algorithm Logic**: When a request is made, the system pretends to allocate the resources and then runs a **safety algorithm** to determine if the resulting state is safe. The safety algorithm checks if there is a sequence of all threads such that the available resources (plus those released by threads finishing earlier in the sequence) are sufficient to satisfy the `Need` of the next thread. If such a sequence exists, the request is granted; otherwise, the thread must wait.  
![[BankerTable.png]]  

We claim that the system is currently in a safe state. Indeed, the sequence $\langle T_{2},T_{4},T_{3},T_{5},T_{1}\rangle$ satisfies the safety criteria.
