---
problemId: P065
solutions:
  - { file: solutions/reference.py, label: "Min/max lexicographical extremes scan", time: "O(N * L)", space: "O(L)" }
  - { file: solutions/alt-zip.py, label: "Column-wise zip(*words) check", time: "O(total chars)", space: "O(L)" }
---
## Approach
Explanation: In lexicographical order, every string in `words` sits between `min(words)` and `max(words)`, so any prefix shared by the two extremes must be shared by every string in between [src:python-tutorial]. Checking `if not words: return ""` up front avoids `IndexError` or `ValueError` cleanly [src:python-stdtypes-docs].

## Common mistakes
- Indexing `words[0]` without guarding `words == []`.
- Only checking the first two words without intersecting against the remaining strings.

## Takeaways
- `zip(*words)` cleanly transposes variable numbers of strings vertically character by character.

## Related
P029, P009, lesson A3
