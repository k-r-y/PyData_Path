---
problemId: P038
solutions:
  - { file: solutions/reference.py, label: "Greedy 13-token table and lookahead subtraction", time: "O(n)", space: "O(1)" }
---
## Approach
Explanation: Placing the 6 subtractive pairs (`900: CM`, `400: CD`, `90: XC`, `40: XL`, `9: IX`, `4: IV`) straight into the descending lookup table turns integer encoding into a clean `divmod` greedy loop [src:python-tutorial]. Decoding compares each character to its neighbor on the right: if smaller (like `I` before `V` or `X`), subtract instead of adding [src:think-python].

## Common mistakes
- Omitting subtractive entries from `int_to_roman`, outputting `"IIII"` instead of `"IV"`.
- Summing symbols blindly without subtracting when a smaller numeral precedes a larger one.

## Takeaways
- Encoding compound domain tokens directly into the table eliminates special-case `if` branches.

## Related
P033, P018, lesson A6
