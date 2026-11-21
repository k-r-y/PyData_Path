---
problemId: P010
solutions:
  - { file: solutions/reference.py, label: "Arithmetic sum difference", time: "O(n)", space: "O(1)" }
  - { file: solutions/alt-xor.py, label: "Bitwise XOR cancellation", time: "O(n)", space: "O(1)" }
---
## Approach
Explanation: Since `nums` holds `n` out of the `n + 1` consecutive numbers `0..n`, subtracting `sum(nums)` from `n * (n + 1) // 2` immediately isolates the missing batch ID in a single pass and `O(1)` extra space [src:python-tutorial]. Bitwise XOR (`x ^ x == 0`) offers an identical complexity alternative.

Scanning `x not in nums` for every `x` inside a loop takes `O(n^2)` time and degrades sharply on tens of thousands of IDs [src:python-wiki-timecomplexity].

## Common mistakes
- Computing expected sum up to `n - 1` instead of `n` (forgetting that `len(nums)` equals `n` because one item from `0..n` is missing).
- Scanning membership repeatedly in the list (`x not in nums`) instead of a single arithmetic or hash pass.

## Takeaways
- Always compare `O(n^2)` repeated list scans against `O(n)` algebraic or set-based reductions.

## Related
P003, P030, lessons A4 and B8
