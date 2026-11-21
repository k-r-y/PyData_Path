---
problemId: P049
solutions:
  - { file: solutions/reference.py, label: "csv.DictReader over io.StringIO", time: "O(n)", space: "O(k)" }
---
## Approach
Explanation: Naive `,` splitting fails as soon as a field like `"Office, Supplies"` contains an escaped comma or header columns appear in a different order [src:python-tutorial]. Wrapping the text in `io.StringIO` and passing it to `csv.DictReader` handles RFC-style quotes and resolves columns by name rather than fragile positional offsets [src:python-lang-ref]. Rounding once after accumulating reduces intermediate floating-point drift.

## Common mistakes
- Calling `line.split(',')`, which splits quoted fields in half and crashes on rearranged header columns.
- Forgetting to handle blank lines or empty input strings.

## Takeaways
- Never hand-parse CSV with `.split(',')` when Python includes `csv.DictReader` in the standard library.

## Related
P048, P098, lessons A9 and B9
