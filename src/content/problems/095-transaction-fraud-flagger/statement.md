Given chronologically sorted transactions `events` where each dict has `tx_id`, `account`, `ts` (int seconds), `amount` (float), and `country` (str), return a list of `{"tx_id": str, "reasons": list[str]}` for every flagged transaction, sorting `reasons` alphabetically.

### Fraud Rules (evaluated independently per account)
1. `"HIGH_AMOUNT"`: `amount > 5000.0`
2. `"VELOCITY"`: including this transaction, the account has strictly more than 3 transactions inside the closed window `[ts - 60, ts]`.
3. `"GEO_IMPOSSIBLE"`: `country` differs from the account's immediately preceding transaction AND `ts - prev_ts <= 300`.

Run in `O(n)` time using per-account deques.
