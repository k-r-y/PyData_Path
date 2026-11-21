---
problemId: P041
solutions:
  - { file: solutions/reference.py, label: "Left prefix pass + right suffix pass in O(n)", time: "O(n)", space: "O(1) extra" }
---
## Approach
Explanation: Think of decomposing everything except index `i` into two halves: the prefix before `i` and the suffix after `i` [src:python-tutorial]. Sweeping forward writes left products into `out[i]`; sweeping backward multiplies right products directly into `out[i]`. Because no division occurs, single and multiple zeros work naturally in `O(n)` time [src:python-wiki-timecomplexity].

## Common mistakes
- Computing the full product and dividing by `nums[i]` (crashes with `ZeroDivisionError` whenever a `0` exists).

## Takeaways
- Two-pass prefix/suffix decomposition replaces excluded-element division cleanly.

## Related
P067, P016, lesson B8
