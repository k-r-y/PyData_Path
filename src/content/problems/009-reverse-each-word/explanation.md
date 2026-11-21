---
problemId: P009
solutions:
  - { file: solutions/reference.py, label: "Explicit space split and slice reversal", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Calling `text.split(" ")` splits at every individual ASCII space character without collapsing consecutive, leading, or trailing spaces [src:python-stdtypes-docs]. Reversing each chunk via `word[::-1]` and joining with `" ".join(...)` keeps word ordering and space alignment exact [src:python-tutorial].

## Common mistakes
- Calling `text[::-1]`, which reverses the order of the words as well as their letters.
- Calling `text.split()` with no argument, which drops double spaces and leading/trailing spaces.

## Takeaways
- Know the behavioral difference between `s.split()` (arbitrary whitespace runs) and `s.split(" ")` (exact delimiter splitting).

## Related
P002, P029, lesson A3
