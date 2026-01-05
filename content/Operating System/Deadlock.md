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