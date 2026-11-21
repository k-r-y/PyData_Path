---
problemId: P006
solutions:
  - { file: solutions/reference.py, label: "Single scan per token filtering ASCII letters", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Think of classifying each character through a two-stage sieve: first verify the character is an ASCII letter, then decide whether it sits in `"aeiouAEIOU"` [src:python-stdtypes-docs]. Characters outside `A-Z` / `a-z` (such as digits and punctuation in `"API-v2"`) fall out before the consonant counter ever increments.

## Common mistakes
- Counting `ch not in vowels` as a consonant without checking that `ch` is actually a letter (wrongly counting `-`, `!`, and digits as consonants).
- Calling `text.split(' ')` instead of `text.split()`, which produces empty `""` tokens on multiple spaces or leading/trailing whitespace [src:python-tutorial].

## Takeaways
- Always check letter membership explicitly before branching between vowels and consonants.

## Related
P009, P029, lesson A3
