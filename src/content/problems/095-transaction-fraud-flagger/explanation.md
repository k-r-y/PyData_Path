---
problemId: P095
solutions:
  - { file: solutions/reference.py, label: "Per-account deque sliding window + last-geo map", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Isolation per `account` is maintained with `defaultdict(deque)` for the 60-second velocity window and a separate dictionary for the immediately preceding `(ts, country)` [src:python-stdtypes-docs]. Popping expired entries before counting ensures amortized `O(1)` processing per event even on 12,000-event streams [src:python-wiki-timecomplexity].

## Common mistakes
- Rescanning full account history for each transaction (`O(n^2)` timeout).
- Evicting `<= ts - 60` instead of `< ts - 60`, missing closed-boundary `[ts - 60, ts]` bursts.

## Takeaways
- Amortized `deque` expiration scales streaming rule engines smoothly without per-event scans.

## Related
P087, P041, lesson B8
