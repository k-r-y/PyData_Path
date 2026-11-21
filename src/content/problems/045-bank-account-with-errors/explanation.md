---
problemId: P045
solutions:
  - { file: solutions/reference.py, label: "Custom exception with strict invariant guards", time: "O(1)", space: "O(1)" }
---
## Approach
Explanation: Validate inputs at the door before changing object state [src:python-tutorial]. Checking `amount <= 0` before `amount > self.balance` ensures nonsensical negative withdrawals trigger `ValueError` rather than failing mysteriously or adding money to the account. Subclassing `Exception` or `ValueError` lets callers catch either the specific `InsufficientFundsError` or broader error handlers cleanly [src:python-lang-ref].

## Common mistakes
- Raising generic `ValueError` on overdraft instead of `InsufficientFundsError`.
- Checking `amount <= 0` only on `deposit`, forgetting negative initial `balance` or `withdraw(-10)` (which would secretly add money!).

## Takeaways
- Validate every public boundary invariant before mutating object fields so failed operations leave state untouched.

## Related
P087, P092, lessons A8 and B2
