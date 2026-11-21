---
problemId: P048
solutions:
  - { file: solutions/reference.py, label: "Character-level state machine", time: "O(n)", space: "O(n)" }
---
## Approach
Explanation: Splitting by lines or commas fails whenever a quoted cell hides commas, escaped quotes `""`, or literal newlines [src:python-tutorial]. Walking with an index loop and toggling an `in_quotes` boolean cleanly handles lookahead for `""` escapes, normalizes `\r\n`, and flushes any final partial cell when no trailing newline is present [src:python-stdtypes-docs].

## Common mistakes
- Splitting on `splitlines()` first, which breaks valid multi-line cells wrapped in quotes.
- Treating every `"` identically instead of peeking at `text[i + 1] == '"'` to decode `""` -> `"`.

## Takeaways
- Small character-level state machines handle escaping and nesting cleanly in linear `O(n)` time.

## Related
P049, P069, lessons A3 and A9
