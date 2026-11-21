---
problemId: P097
solutions:
  - { file: solutions/reference.py, label: "Domain-exception hierarchy + invariant-checked inventory", time: "O(1) per checkout/return", space: "O(B + M)" }
---
## Approach
Explanation: Subclassing all domain errors from `LibraryError` lets callers handle either specific failure reasons (`BookNotFoundError`, `LoanLimitExceededError`) or catch `LibraryError` broadly [src:python-tutorial]. Checking every precondition before mutating `available` or `_loans` guarantees rollback-free transactional consistency [src:python-stdtypes-docs].

## Common mistakes
- Letting exceptions inherit directly from `Exception` instead of `LibraryError`.
- Using lists for per-member loans instead of sets, silently permitting duplicate checkouts of the same title.

## Takeaways
- Check preconditions completely before mutating state so rejected requests leave object invariants untouched.

## Related
P092, P096, lesson B2
