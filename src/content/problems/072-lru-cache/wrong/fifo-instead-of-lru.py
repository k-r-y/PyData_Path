class LRUCache:
    def __init__(self, capacity: int) -> None:
        self.capacity = capacity
        self._store: dict[int, int] = {}
        self._order: list[int] = []

    def get(self, key: int) -> int:
        return self._store.get(key, -1)

    def put(self, key: int, value: int) -> None:
        if self.capacity <= 0:
            return
        if key not in self._store:
            if len(self._order) >= self.capacity:
                oldest = self._order.pop(0)
                del self._store[oldest]
            self._order.append(key)
        self._store[key] = value
