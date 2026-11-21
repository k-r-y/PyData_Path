---
problemId: P022
solutions:
  - { file: solutions/reference.py, label: "Two-pass Counter scan", time: "O(n)", space: "O(k)" }
---
## Approach
Explanation: Count character occurrences in one linear sweep using `Counter(text)`, then find the earliest index whose count is `1` [src:python-tutorial]. Avoiding per-iteration `text.count(ch)` eliminates `O(n^2)` quadratic work [src:python-wiki-timecomplexity].

## Common mistakes
- Calling `text.count(ch)` inside a loop over `text`, which times out on large strings.
- Returning the character itself instead of its 0-based index.

## Takeaways
- Pre-aggregating frequencies turns repeated string searches into O(1) dictionary lookups.

## Related
P011, P039, lesson B8
