---
draft: true
---

## Valid Sequence Intersections

**Time Limit:** 1.0 Second
**Memory Limit:** 256 Megabytes

A valid domestic identification sequence is defined algebraically as an integer $V$ that satisfies the strict inequality bounds $8801300000000 \le V \le 8801999999999$.

You are tasked with evaluating a series of $Q$ independent range queries. For each query $i$, you are provided an inclusive interval $[L_i, R_i]$. You must compute the cardinality of the intersection between the provided interval and the domain of valid sequences.

**Input Specification:**

- The initial line contains a singular integer $Q$ ($1 \le Q \le 10^5$), representing the total number of queries.
- The subsequent $Q$ lines each contain two space-separated integers, $L_i$ and $R_i$ ($1 \le L_i \le R_i \le 10^{18}$), delineating the inclusive bounds for the $i$-th query.

**Output Specification:**
- For each query, output a singular integer representing the exact quantity of valid sequences contained within the specified interval $[L_i, R_i]$. Each output must be delineated by a standard newline character.

**Sample Input:**

```
3
1 1000000000000
8801300000005 8801300000010
8801999999990 8802000000000
```

**Sample Output:**

```
0
6
10
```

### Methodological Summary

- **Time Complexity Limit:** The constraint $Q = 10^5$ dictates that an $O(N)$ sequential traversal per query will result in a Time Limit Exceeded (TLE) verdict.
- **Algorithmic Resolution:** The optimal solution necessitates $O(1)$ scalar boundary evaluation per query. The intersection cardinality is computationally derived via $\max(0, \min(R_i, 8801999999999) - \max(L_i, 8801300000000) + 1)$.

### Solution
```cpp
#include <iostream>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    long long Q;
    if (cin >> Q) {
        while (Q--) {
            long long L, R;
            cin >> L >> R;
            
            long long start = max(L, 8801300000000LL);
            long long end = min(R, 8801999999999LL);
            long long count = max(0LL, end - start + 1);
            
            cout << count << "\n";
        }
    }
    return 0;
}
```



## Executive members

The President, Vice President, and General Secretary of the BUP CoPC club each guard one side of a triangular field. Inside this triangle, a Joint Secretary is running randomly, covering the entire area. Eager to apprehend him, the executive members plan to set a trap inside the triangle. Their strategy involves jumping from their respective sides to the trap simultaneously, covering an equal distance at the same speed. The challenge requires the President, Vice President, and General Secretary to determine the precise location of the trap and the shortest synchronized jump distance, utilizing only the lengths of the triangular field's sides.

You will help the executive members figure out the shortest possible distance of the jump needed, given the lengths of the sides of the triangular field.

### Input
The initial line contains a singular integer $T$ ($1 \le T \le 1000$), representing the total number of test cases. 
Each test case will have three integers $X$, $Y$, and $Z$ $(1 ≤ X, Y, Z ≤ 1000)$, denoting the lengths of three sides of the triangular field. It is guaranteed that the side lengths will make a valid triangle.

### Output
For each test case, print the shortest possible distance for each jump by the executive members. (Rounded to two decimal points)


| Sample Input               | Sample Output  |
| -------------------------- | -------------- |
| 2<br>60 53 98<br>97 76 118 | 13.03<br>25.24 |

### Solution
The geometric problem requires calculating the inradius of the specified triangle. The incenter represents the unique interior coordinate equidistant from all three boundaries, making the inradius the minimum synchronized orthogonal distance. The algorithm computes the semiperimeter, utilizes Heron's formula to ascertain the total area, and derives the inradius by dividing the area by the semiperimeter.

```cpp
#include <iostream>
#include <iomanip>
#include <cmath>

using namespace std;

void solve() {
    int T;
    if (!(cin >> T)) return;
    
    while (T--) {
        double x, y, z;
        cin >> x >> y >> z;
        
        double s = (x + y + z) / 2.0;
        double area = sqrt(s * (s - x) * (s - y) * (s - z));
        double r = area / s;
        
        cout << fixed << setprecision(2) << r << "\n";
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    solve();
    return 0;
}
```

