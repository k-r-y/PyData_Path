A campus warehouse terminal prints numeric parcel tracking codes and computes a simple checksum by adding every decimal digit in the code.

Write a function `digit_sum(n)` that takes a non-negative integer `n` and returns the sum of its decimal digits.

### Constraints
- `n` is an integer with `0 <= n <= 10**250`.
- Python integers have arbitrary precision, so very large values should work without overflow.

### Examples

**Example 1**
```text
Input: n = 4085
Output: 17
Explanation: 4 + 0 + 8 + 5 = 17
```

**Example 2**
```text
Input: n = 0
Output: 0
Explanation: The single digit is 0.
```
