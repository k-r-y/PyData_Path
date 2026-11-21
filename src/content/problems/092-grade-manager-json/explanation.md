---
problemId: P092
solutions:
  - { file: solutions/reference.py, label: "Nested dict grade ledger with JSON serialization", time: "O(N log N) top_k, O(N) persistence", space: "O(N)" }
---
## Approach
Explanation: Nesting `_scores[student_id][assessment]` guarantees idempotent overwrites per assessment in `O(1)` time [src:python-stdtypes-docs]. Ranking with composite sort key `(-avg, student_id)` sorts descending by average while breaking ties alphabetically ascending, and `json.dump` / `@classmethod load_json` provide clean stateful persistence [src:python-tutorial].

## Common mistakes
- Storing scores in a plain list, causing re-graded submissions for the same assessment to count twice in averages.
- Using `sort(..., reverse=True)` on `(avg, student_id)`, which reverses alphabetical tie-breaking too.

## Takeaways
- Domain invariants (valid score bounds, idempotent overwrites, deterministic tie-breakers) belong cleanly inside class methods rather than scattered callers.

## Related
P085, P097, lesson B2
