---
problemId: P029
solutions:
  - { file: solutions/reference.py, label: "str.split() + word.capitalize() per token", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: `str.title()` treats apostrophes as word separators, turning `"don't"` into `"Don'T"` [src:python-stdtypes-docs]. Splitting on whitespace with `text.split()` removes outer spaces and collapses consecutive spaces/tabs/newlines simultaneously, and calling `word.capitalize()` only uppercases index 0 of each token [src:python-tutorial].

## Common mistakes
- Calling `str.title()` instead of token-level `word.capitalize()`, breaking contractions like `"Don't"`.
- Calling `text.split(" ")` instead of `text.split()`, leaving extra spaces when runs exist.

## Takeaways
- Prefer `" ".join(w.capitalize() for w in s.split())` over `s.title()` for clean human-facing English titles.

## Related
P009, P020, lesson A3
