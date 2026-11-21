---
problemId: P047
solutions:
  - { file: solutions/reference.py, label: "Lazy inbox-to-outbox reversal in amortized O(1)", time: "O(1) amortized", space: "O(n)" }
---
## Approach
Explanation: Picture two trays: incoming items stack onto `_in`, and only when `_out` runs dry do you flip `_in` once onto `_out`, reversing LIFO into FIFO order [src:python-tutorial]. Because each item moves from `_in` to `_out` at most once in its lifetime, `n` operations cost `O(n)` total rather than `O(n^2)` [src:python-wiki-timecomplexity].

## Common mistakes
- Moving every element back and forth across both stacks on *every* `enqueue`, turning 20,000 pushes into quadratic work.
- Shifting `_in` into `_out` even when `_out` still has unconsumed items, corrupting FIFO order.

## Takeaways
- Defer expensive transfers lazily until `_out` empties to achieve `O(1)` amortized cost.

## Related
P046, P034, lessons B2 and B8
