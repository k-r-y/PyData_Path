---
problemId: P019
solutions:
  - { file: solutions/reference.py, label: "Repeated divmod(n, 2) reversed at end", time: "O(log n)", space: "O(log n)" }
---
## Approach
Explanation: Repeatedly dividing by 2 with `divmod(n, 2)` produces remainders from least significant bit up to most significant bit [src:python-tutorial]. Collecting bits in a list and reversing once at the end avoids `O(log^2 n)` string prepending [src:think-python]. Handling `n == 0` upfront guarantees `"0"` rather than `""`.

## Common mistakes
- Forgetting the `n == 0` base case and returning `""`.
- Forgetting to reverse the remainders collected from `n % 2`.

## Takeaways
- Append remainders to a list and reverse once at the end cleanly.

## Related
P018, P001, lesson A4
