Implement a Disjoint Set Union (`UnionFind`) data structure managing `n` nodes `0..n-1` with path compression and union by rank.

Implement `class UnionFind(n: int)`:
- Attribute `count: int`: current number of disjoint components.
- `find(x: int) -> int`: returns canonical root of `x`.
- `union(a: int, b: int) -> bool`: merges components of `a` and `b`; returns `True` if they were previously separate, else `False`.
- `connected(a: int, b: int) -> bool`: returns `find(a) == find(b)`.
