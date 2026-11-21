---
problemId: P002
solutions:
  - { file: solutions/reference.py, label: "Two pointers in O(1) extra space", time: "O(n)", space: "O(1)" }
  - { file: solutions/alt-slice.py, label: "Filtered list reversal", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Imagine checking an embossed serial ribbon from both ends simultaneously: skip any decorative dashes or spaces, compare lowercase characters, and stop immediately on the first mismatch. Using two pointers achieves O(n) time with O(1) extra space.

The alternative comprehension approach builds a cleaned list using `str.isalnum()` and `str.lower()` [src:python-stdtypes-docs] and checks equality against its slice reverse `cleaned[::-1]` [src:python-tutorial].

## Common mistakes
- Forgetting `.lower()`, which fails on mixed-case palindromes like `"RaceCar"`.
- Filtering only spaces instead of all non-alphanumeric characters (failing on hyphens, commas, or colons).
- Using `str.isalpha()` instead of `str.isalnum()`, which accidentally drops numeric digits in SKUs like `"12-321"`.

## Takeaways
- Two-pointer scans avoid allocating filtered copies when memory matters.
- `str.isalnum()` handles letters and digits together cleanly in the Python standard library.

## Related
P009, P021, lessons A3 and B8
