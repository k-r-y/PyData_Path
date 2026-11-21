Implement a FIFO queue `TwoStackQueue` backed strictly by two Python lists used as LIFO stacks (`.append()` and `.pop()` only, no `.pop(0)` or `deque`).

Implement:
- `enqueue(item)`
- `dequeue()`: raises `IndexError` if empty
- `peek()`: raises `IndexError` if empty
- `is_empty() -> bool`
