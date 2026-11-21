---
problemId: P072
solutions:
  - { file: solutions/reference.py, label: "OrderedDict move_to_end and popitem", time: "O(1) average per op", space: "O(capacity)" }
  - { file: solutions/alt-linked-list.py, label: "Dict plus doubly linked list", time: "O(1) average per op", space: "O(capacity)" }
---
## Approach
Explanation: Think of the cache like a bookshelf with a fixed number of slots: looking up a book or updating it moves that book to the "most recently touched" end, and when a new book arrives for a full shelf, the book sitting untouched at the opposite end is removed.

`collections.OrderedDict` exposes `move_to_end(key)` and `popitem(last=False)` to reorder and evict endpoints in constant time [src:python-tutorial]. Equivalently, pairing a `dict` (for `O(1)` average key lookup [src:python-wiki-timecomplexity]) with a doubly linked list of sentinel `head`/`tail` nodes supports `O(1)` removal and re-insertion without shifting elements.

## Common mistakes
- Using a plain `list` with `.remove(key)` and `.pop(0)` to maintain recency order; both list operations scan or shift elements in `O(n)` time [src:python-wiki-timecomplexity], failing the performance test.
- Updating `self._store[key] = value` on an existing key without moving `key` to the most-recently-used position.
- Treating `get(key)` as read-only instead of refreshing recency (FIFO eviction instead of LRU).
- Forgetting `capacity == 0` guard before evicting or inserting.

## Takeaways
- Combining a hash map with an ordered sequence (`OrderedDict` or doubly linked list) achieves `O(1)` average access, update, and eviction [src:python-stdtypes-docs].
- Sentinel `head` and `tail` nodes eliminate `None` boundary checks when relinking doubly linked list pointers.

## Related
P046, P047, lessons B2 and B8
