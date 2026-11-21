---
problemId: P052
solutions:
  - { file: solutions/reference.py, label: "Greedy line accumulator tracking space count", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Separating the empty-line case (`not cur`) from appending onto a partially filled line avoids adding a phantom space cost to the very first word on the line [src:python-tutorial]. Only subsequent words add `1 + len(word)`, so exact-fit lines like `"abc def"` at `width == 7` stay together cleanly [src:python-stdtypes-docs].

## Common mistakes
- Adding `+ 1` for a leading space even when `cur` is empty, which breaks exact-width single words.
- Slicing long tokens mid-word instead of giving oversized tokens their own line.

## Takeaways
- Track `cur_len` explicitly so greedy wrapping checks stay `O(1)` per word.

## Related
P029, P009, lesson A3
