---
problemId: P094
solutions:
  - { file: solutions/reference.py, label: "Line-oriented block parser + token-split inline formatter", time: "O(N)", space: "O(N)" }
---
## Approach
Explanation: Separating block scanning from inline formatting keeps fenced code blocks and lists clean [src:python-tutorial]. Splitting text on inline code spans before escaping and substituting `**...**` and `*...*` ensures characters inside code fences and inline `code` never render as unintended HTML tags [src:python-stdtypes-docs].

## Common mistakes
- Running bold/italic regex globally across code fences or inside inline backticks.
- Forgetting to escape `&`, `<`, `>` first, creating injection vulnerabilities.

## Takeaways
- Tokenizing code spans with a capturing regex split separates raw code segments cleanly before applying nested inline transforms.

## Related
P024, P038, lesson A3
