---
problemId: P098
solutions:
  - { file: solutions/reference.py, label: "Single-pass DictReader validator + first-seen deduplicator", time: "O(N)", space: "O(N)" }
---
## Approach
Explanation: Using `csv.DictReader(io.StringIO(csv_text))` handles quoted commas inside currency fields like `"$1,250.50"` accurately [src:python-tutorial]. Checking validity rules before deduplication ensures cancelled or malformed duplicates increment `dropped_count` cleanly without masking real pipeline errors [src:python-data-analysis].

## Common mistakes
- Calling `.split(",")` on CSV lines manually, breaking currency strings containing thousands commas.
- Overwriting `by_id[tx_id]` instead of ignoring duplicate IDs after keeping the first valid entry.

## Takeaways
- Always separate malformed-row rejection from key deduplication so audit counts stay accurate.

## Related
P066, P100, lesson A9
