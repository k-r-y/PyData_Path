---
problemId: P051
solutions:
  - { file: solutions/reference.py, label: "Standard datetime.date iteration with weekday() and set filter", time: "O(days)", space: "O(h)" }
---
## Approach
Explanation: Converting ISO dates via `date.fromisoformat` handles leap years and month rollovers automatically [src:python-lang-ref]. Because `date.weekday()` returns `0..4` for Monday..Friday and `5, 6` for weekends, checking `cur.weekday() < 5 and cur not in holiday_set` ensures holidays falling on Saturday/Sunday are never subtracted twice [src:python-tutorial].

## Common mistakes
- Subtracting `len(holidays)` blindly even when a holiday falls on Saturday or Sunday.
- Using `while cur < end:` instead of `<=`, dropping `end_date` from the inclusive range.

## Takeaways
- Let `datetime.date` and `timedelta` manage calendar math instead of manual month-length tables.

## Related
P008, P050, lesson B9
