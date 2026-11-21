A campus store inventory service caches up to `capacity` product records in memory so frequent SKU lookups avoid hitting disk. When the cache is full, it must discard the **Least Recently Used (LRU)** product entry before inserting a new one.

Implement a class `LRUCache` with:
- `__init__(self, capacity: int)`: initializes the cache with maximum `capacity` entries (`capacity >= 0`).
- `get(self, key: int) -> int`: returns the stored value for `key` if present, otherwise `-1`. Accessing an existing key marks it as most recently used.
- `put(self, key: int, value: int) -> None`: inserts or updates `key` with `value` and marks it as most recently used. If inserting a new key exceeds `capacity`, evict the least recently used key first. (If `capacity == 0`, store nothing.)

### Constraints
- `0 <= capacity <= 5,000`
- Both `get` and `put` should run in `O(1)` average time complexity.

### Examples

**Example 1**
```text
cache = LRUCache(2)
cache.put(101, 50)
cache.put(102, 75)
cache.get(101)       # returns 50 (101 is now most recently used; 102 is LRU)
cache.put(103, 90)   # evicts 102
cache.get(102)       # returns -1 (evicted)
cache.get(103)       # returns 90
```

**Example 2**
```text
cache = LRUCache(2)
cache.put(1, 10)
cache.put(2, 20)
cache.put(1, 15)     # updates key 1 and marks it most recently used
cache.put(3, 30)     # evicts key 2
cache.get(1)         # returns 15
cache.get(2)         # returns -1
```
