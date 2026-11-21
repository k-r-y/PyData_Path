Implement `class PriorityScheduler` supporting urgent-first task scheduling with stable FIFO ordering on ties:
- `push(priority: int, task_id: str) -> None`: lower `priority` integer means higher urgency; equal priority ties MUST preserve insertion order (FIFO), NOT alphabetical `task_id` order.
- `pop() -> str`: removes and returns most urgent `task_id` (raises `IndexError` if empty).
- `peek() -> str`: returns next `task_id` without removing (raises `IndexError` if empty).
- `__len__() -> int`: returns remaining task count.
