---
problemId: P085
solutions:
  - { file: solutions/reference.py, label: "Dictionary Trie with sorted DFS subtree collection", time: "O(L) insert/search", space: "O(total chars)" }
---
## Approach
Explanation: Storing one node per character depth shares common prefixes across thousands of words so `search` and `starts_with` inspect only `len(word)` steps [src:python-tutorial]. Marking terminal nodes with `is_end` prevents partial prefixes (`"mem"` when only `"memo"` was inserted) from posing as full words, while walking `sorted(cur.children.keys())` during DFS emits matches directly in alphabetical order [src:python-wiki-timecomplexity].

## Common mistakes
- Letting `search("app")` return `True` merely because `"apple"` exists along that path without verifying `node.is_end`.
- Walking all words in the whole trie when `prefix` has no matching subtree.

## Takeaways
- Tries trade modest tree memory for `O(len(prefix))` prefix pruning.

## Related
P065, P078, lesson B2
