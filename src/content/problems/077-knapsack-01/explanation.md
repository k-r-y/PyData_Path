---
problemId: P077
solutions:
  - { file: solutions/reference.py, label: "1D reverse-capacity DP for 0/1 constraint", time: "O(n * C)", space: "O(C)" }
---
## Approach
Explanation: Iterating capacity backward from `capacity` down to `w` reads `dp[cap - w]` from *before* item `(w, v)` was considered, preventing the same item from being picked twice [src:python-tutorial]. Iterating forward instead implements *unbounded* knapsack, wrongly reusing a single item multiple times [src:python-wiki-timecomplexity].

## Common mistakes
- Looping `for cap in range(w, capacity + 1):` forward, which silently allows picking the same item multiple times.

## Takeaways
- Reverse capacity loop = 0/1 knapsack; forward capacity loop = unbounded knapsack.

## Related
P074, P040, lesson B8
