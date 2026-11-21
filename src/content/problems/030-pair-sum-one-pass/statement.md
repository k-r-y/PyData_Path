An accounting reconciliation script searches a list of integer ledger amounts `amounts` for two distinct entries whose sum equals a target discrepancy `target`.

Write a function `find_pair_indices(amounts, target)` that returns a tuple `(i, j)` of two indices with `0 <= i < j < len(amounts)` such that `amounts[i] + amounts[j] == target`. If multiple valid pairs exist, return any one valid pair. If no such pair exists, return `None`.

### Constraints
- `0 <= len(amounts) <= 20,000`
- Each amount and `target` is an integer (`-10**9 <= x <= 10**9`).

### Examples

**Example 1**
```text
Input: amounts = [120, 45, 75, 30], target = 105
Output: (2, 3)
Explanation: amounts[2] + amounts[3] = 75 + 30 = 105. (Note: (1, 2) would also be invalid here because 45 + 75 = 120, while (2, 3) sums to 105.)
```

**Example 2**
```text
Input: amounts = [10, 20, 30], target = 100
Output: None
Explanation: No two distinct entries sum to 100.
```
