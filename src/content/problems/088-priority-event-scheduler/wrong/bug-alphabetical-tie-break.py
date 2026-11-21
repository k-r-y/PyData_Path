import heapq


class PriorityScheduler:
    def __init__(self):
        self._heap = []

    def push(self, priority: int, task_id: str) -> None:
        heapq.heappush(self._heap, (priority, task_id))

    def pop(self) -> str:
        return heapq.heappop(self._heap)[1]

    def peek(self) -> str:
        return self._heap[0][1]

    def __len__(self) -> int:
        return len(self._heap)
