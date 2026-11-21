---
problemId: P005
solutions:
  - { file: solutions/reference.py, label: "Modular ASCII offset mapping", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Map each letter to its 0..25 position within its alphabet (`ord(ch) - base`), add `shift`, take modulo 26 so `z` wraps back to `a`, and shift back to an ASCII code point with `chr(...)` [src:python-tutorial].

In Python, `% 26` always returns a non-negative remainder in `0..25` even for negative shifts, so negative decoding works automatically without special-casing [src:python-stdtypes-docs]. Collecting characters in a list and calling `''.join(out)` avoids quadratic string concatenation.

## Common mistakes
- Adding `shift` directly to `ord(ch)` without wrapping modulo 26, turning `Z` into `[` or `]`.
- Lowercasing the whole string first instead of keeping uppercase/lowercase offsets separate.
- Mutating digits or punctuation instead of limiting shifts to ASCII letters.

## Takeaways
- Check `'a' <= ch <= 'z'` and `'A' <= ch <= 'Z'` when restricting specifically to ASCII letters.
- Build strings via a list accumulator + `''.join(...)` in O(n) time.

## Related
P002, P033, lesson A3
