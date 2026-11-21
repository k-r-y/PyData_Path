---
problemId: P100
solutions:
  - { file: solutions/reference.py, label: "Single-pass CSV ETL pipeline + deterministic ranking and formatting", time: "O(N + K log K)", space: "O(N)" }
---
## Approach
Explanation: Streaming rows through `csv.DictReader`, cleaning malformed entries, deduplicating `order_id`, and accumulating totals into `defaultdict` counters avoids needing heavy external dependencies while remaining easy to audit [src:python-tutorial]. Sorting categories by `(-revenue, category)` and months ascending yields deterministic analytics summaries and text reports [src:python-data-analysis].

## Common mistakes
- Skipping `seen_orders` tracking, letting duplicate exports inflate total revenue.
- Sorting categories descending with `reverse=True`, which flips tie-breaker ordering backwards (`Z` before `A`).

## Takeaways
- Separating extraction/cleaning, aggregation, and presentation yields clean, testable reporting pipelines.

## Related
P098, P099, lesson C14
