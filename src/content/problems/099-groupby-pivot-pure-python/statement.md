Implement `pivot_table(rows, index_col, pivot_col, value_col, agg="sum", fill_value=0.0)` returning `dict[str, dict[str, float]]` in pure Python without `pandas`.

### Behavior
- Return `{}` when `rows` is empty.
- Collect sorted unique `str(r[index_col])` outer keys and sorted unique `str(r[pivot_col])` inner keys across all rows.
- Aggregate grouped numeric values in each `(row_key, col_key)` cell using `agg` (`"sum"`, `"mean"`, `"count"`, `"min"`, `"max"`), raising `ValueError` for unsupported aggregators.
- Every outer row must contain **all** sorted inner column keys; missing cells default to `fill_value`. Round numeric outputs via `round(float(val), 4)`.
