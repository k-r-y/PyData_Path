---
problemId: P046
solutions:
  - { file: solutions/reference.py, label: "Paired (value, prefix_min) entries on stack", time: "O(1) per op", space: "O(n)" }
---
## Approach
Explanation: Think of carrying each stack frame's "lowest score seen so far" right inside the stack slot itself: storing `(val, running_min)` guarantees popping top restores the exact earlier minimum immediately in `O(1)` [src:python-tutorial]. Scanning `min(self.s)` on every query costs `O(n)` and degrades quadratically on 15,000 sequential minimums [src:python-wiki-timecomplexity].

## Common mistakes
- In parallel-stack designs, using `val < mins[-1]` instead of `<=` and popping `mins` when only one duplicate minimum was pushed (popping the last min prematurely!).
- Calling `min(self.s)` inside `get_min()`, breaking the `O(1)` contract.

## Takeaways
- Storing monotonic summary state inside each stack frame handles LIFO pops cleanly including duplicates.

## Related
P034, P047, lessons B2 and B8
