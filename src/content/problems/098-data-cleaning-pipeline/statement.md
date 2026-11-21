Implement `clean_sales_csv(csv_text: str) -> dict` in pure Python using the standard library `csv` module.

### Cleaning Rules
Each input row has columns `tx_id, region, amount, status`:
1. Strip whitespace on every value. Normalize `region` to uppercase and `status` to lowercase (if `status` is empty after stripping, set `"unknown"`).
2. Strip `"$"` and `","` from `amount`, parse `float`, and round valid amounts with `round(val, 2)`.
3. Drop any row (incrementing `dropped_count`) if `tx_id` is empty, `region` is empty, `status == "cancelled"`, or `amount` cannot parse as a float `> 0`.
4. Among remaining valid rows, keep only the **first** occurrence per `tx_id` (increment `duplicate_count` for later repeats of an already-kept `tx_id`).

Return `{"rows": clean_rows, "valid_count": len(clean_rows), "dropped_count": dropped, "duplicate_count": dups}` preserving first-seen row order.
