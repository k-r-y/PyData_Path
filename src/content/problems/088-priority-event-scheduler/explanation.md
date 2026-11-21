---
problemId: P088
solutions:
  - { file: solutions/reference.py, label: "Min-heap keyed by (priority, monotonic_sequence)", time: "O(log n) push/pop, O(1) peek", space: "O(n)" }
---
## Approach
Explanation: Pushing `(priority, task_id)` breaks ties lexicographically by `task_id` rather than submission order (and crashes if payloads ever aren't comparable) [src:python-lang-ref]. Inserting a monotonically increasing `self._seq` counter as the middle tuple slot guarantees strict FIFO ordering across tied priorities in `O(log n)` heap time [src:python-tutorial].

## Common mistakes
- Omitting a tie-breaker sequence counter, letting `"alpha"` jump ahead of earlier `"zeta"` at equal priority.

## Takeaways
- `(priority, seq, payload)` is the canonical pattern for stable Python priority queues.

## Related
P086, P083, lesson B2
