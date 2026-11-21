class LRUCache:
    def __init__(self, capacity: int) -> None:
        self.capacity = capacity
        self._store: dict[int, int] = {}
        self._order: list[int] = []

    def get(self, key: int) -> int:
        if key not in self._store:
            return -1
        self._order.remove(key)
        self._order.append(key)
        return self._store[key]

    def put(self, key: int, value: int) -> None:
        if self.capacity <= 0:
            return
        if key in self._store:
            self._order.remove(key)
        elif len(self._store) >= self.capacity:
            lru_key = self._order.pop(0)
            del self._store[lru_key]
        self._store[key] = value
        self._order.append(key)
