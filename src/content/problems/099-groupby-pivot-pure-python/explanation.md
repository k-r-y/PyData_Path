---
problemId: P099
solutions:
  - { file: solutions/reference.py, label: "Grouped bucket dict + dense Cartesian matrix fill", time: "O(N + R*C)", space: "O(N + R*C)" }
---
## Approach
Explanation: Collecting values per `(row_key, col_key)` key alongside the full sets of outer and inner axis labels ensures sparse combinations receive `fill_value` uniformly across every row [src:python-tutorial]. Supporting `sum`, `mean`, `count`, `min`, and `max` cleanly mirrors relational `GROUP BY` / `pivot_table` mechanics in pure Python [src:python-data-analysis].

## Common mistakes
- Leaving sparse combinations absent from inner dicts instead of populating `fill_value`.
- Dividing cell `mean` by total dataset length instead of the cell's own observation count.

## Takeaways
- Gathering full row and column key sets before building the output ensures rectangular alignment across sparse matrices.

## Related
P093, P098, lesson C6
