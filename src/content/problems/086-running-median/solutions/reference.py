import heapq


class MedianTracker:
    def __init__(self):
        self._low: list[float] = []
        self._high: list[float] = []

    def add(self, num) -> None:
        heapq.heappush(self._low, -num)
        heapq.heappush(self._high, -heapq.heappop(self._low))
        if len(self._high) > len(self._low):
            heapq.heappush(self._low, -heapq.heappop(self._high))

    def median(self) -> float:
        if not self._low:
            raise ValueError("No values in MedianTracker")
        if len(self._low) > len(self._high):
            return float(-self._low[0])
        return (-self._low[0] + self._high[0]) / 2.0
