import heapq


class PriorityScheduler:
    def __init__(self):
        self._heap: list[tuple[int, int, str]] = []
        self._seq = 0

    def push(self, priority: int, task_id: str) -> None:
        self._seq += 1
        heapq.heappush(self._heap, (priority, self._seq, task_id))

    def pop(self) -> str:
        if not self._heap:
            raise IndexError("pop from empty PriorityScheduler")
        return heapq.heappop(self._heap)[2]

    def peek(self) -> str:
        if not self._heap:
            raise IndexError("peek from empty PriorityScheduler")
        return self._heap[0][2]

    def __len__(self) -> int:
        return len(self._heap)
