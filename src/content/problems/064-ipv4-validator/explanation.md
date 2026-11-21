---
problemId: P064
solutions:
  - { file: solutions/reference.py, label: "Strict ASCII digit and zero-prefix octet check", time: "O(1)", space: "O(1)" }
---
## Approach
Explanation: Calling `int(p)` alone accepts `"+1"`, whitespace `" 1 "`, underscores `"1_0"`, and leading zeros `"01"` [src:python-stdtypes-docs]. Validating ASCII digit characters directly alongside `len(p) > 1 and p[0] == '0'` guarantees strict canonical IPv4 syntax [src:python-tutorial].

## Common mistakes
- Wrapping `int(p)` in `try/except` alone without rejecting leading zeros, `+` signs, spaces, or underscores.

## Takeaways
- Check lexical rules explicitly before passing strings to `int()`.

## Related
P013, P069, lesson A3
