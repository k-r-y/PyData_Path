---
problemId: P083
solutions:
  - { file: solutions/reference.py, label: "Dijkstra min-heap shortest path", time: "O((V + E) log V)", space: "O(V + E)" }
---
## Approach
Explanation: Standard unweighted BFS returns the path with the fewest edges rather than lowest total weight [src:python-tutorial]. Dijkstra's algorithm pulls the closest unfinalized node from a `heapq` min-heap next, discarding stale heap entries with `if d > dist[u]: continue` [src:python-wiki-timecomplexity]. With non-negative costs, the first time `end` pops from the heap gives its guaranteed minimum cost.

## Common mistakes
- Stopping on the first edge-hop match via BFS instead of relaxing edge costs in priority order.
- Treating directed `[u, v, w]` edges as undirected bidirectional links.

## Takeaways
- Weighted shortest paths with non-negative weights call for Dijkstra's min-heap; unweighted shortest paths call for BFS.

## Related
P071, P088, lesson B8
