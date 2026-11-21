A campus point-of-sale scanner logs product IDs in the exact order items are scanned, and some items get scanned more than once.

Write a function `unique_in_order(items)` that returns a **new** list containing each distinct item from `items`, keeping only its first appearance in original order. Do not mutate the input list `items`.

### Constraints
- `0 <= len(items) <= 50,000`
- Every item in `items` is hashable (such as `int` or `str`).

### Examples

**Example 1**
```text
Input: items = ["SKU-B", "SKU-A", "SKU-B", "SKU-C", "SKU-A"]
Output: ["SKU-B", "SKU-A", "SKU-C"]
Explanation: "SKU-B" appears first at index 0, "SKU-A" at index 1, and "SKU-C" at index 3.
```

**Example 2**
```text
Input: items = []
Output: []
Explanation: An empty scan stream produces an empty list.
```
