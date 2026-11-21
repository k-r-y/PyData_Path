Implement a defensive ledger account model with explicit domain exceptions.

Define:
1. `InsufficientFundsError` inheriting from `Exception` (or `ValueError`).
2. `Account(owner: str, balance: float = 0)`:
   - Stores `self.owner` and `self.balance`. Raises `ValueError` if initial `balance < 0`.
   - `deposit(amount)`: raises `ValueError` if `amount <= 0`; otherwise adds `amount` and returns new `self.balance`.
   - `withdraw(amount)`: raises `ValueError` if `amount <= 0`; raises `InsufficientFundsError` if `amount > self.balance`; otherwise subtracts `amount` and returns new `self.balance`.
