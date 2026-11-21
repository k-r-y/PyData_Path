class _Node:
    def __init__(self, key: int = 0, val: int = 0) -> None:
        self.key = key
        self.val = val
        self.prev: _Node | None = None
        self.next: _Node | None = None


class LRUCache:
    def __init__(self, capacity: int) -> None:
        self.capacity = capacity
        self._map: dict[int, _Node] = {}
        self._head = _Node()
        self._tail = _Node()
        self._head.next = self._tail
        self._tail.prev = self._head

    def _remove(self, node: _Node) -> None:
        prev_node = node.prev
        next_node = node.next
        if prev_node is not None:
            prev_node.next = next_node
        if next_node is not None:
            next_node.prev = prev_node

    def _append_mru(self, node: _Node) -> None:
        prev_tail = self._tail.prev
        if prev_tail is not None:
            prev_tail.next = node
        node.prev = prev_tail
        node.next = self._tail
        self._tail.prev = node

    def get(self, key: int) -> int:
        node = self._map.get(key)
        if node is None:
            return -1
        self._remove(node)
        self._append_mru(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if self.capacity <= 0:
            return
        if key in self._map:
            node = self._map[key]
            node.val = value
            self._remove(node)
            self._append_mru(node)
            return
        if len(self._map) >= self.capacity:
            lru = self._head.next
            if lru is not None and lru is not self._tail:
                self._remove(lru)
                del self._map[lru.key]
        fresh = _Node(key, value)
        self._map[key] = fresh
        self._append_mru(fresh)
