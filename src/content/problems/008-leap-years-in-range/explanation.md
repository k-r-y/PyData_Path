---
problemId: P008
solutions:
  - { file: solutions/reference.py, label: "Range comprehension with Gregorian condition", time: "O(end - start)", space: "O(k)" }
---
## Approach
Explanation: Think of the leap-year rule as a three-tier filter: `400` overrides `100`, and `100` overrides `4` [src:python-tutorial]. Checking `(y % 4 == 0 and y % 100 != 0) or (y % 400 == 0)` ensures `2000` stays a leap year while `1900` and `2100` are excluded.

## Common mistakes
- Checking only `y % 4 == 0`, which wrongly marks `1900` and `2100` as leap years.
- Using `range(start_year, end_year)` and forgetting `+ 1` so `end_year` itself is skipped.

## Takeaways
- Always verify century boundaries (`1900`, `2000`, `2100`) when writing calendar logic.

## Related
P051, lesson A4
