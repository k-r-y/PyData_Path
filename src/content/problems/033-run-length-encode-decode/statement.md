Telemetry sensor flags often repeat the same status letter thousands of times in a row. Implement a lossless run-length codec supporting multi-digit run counts.

Write two functions:
- `rle_encode(text: str) -> str`: compresses runs of non-digit letters using `<char><count>` format (e.g., `"AAABBC"` -> `"A3B2C1"`, `""` -> `""`).
- `rle_decode(encoded: str) -> str`: expands an encoded string back to the original text (handling counts with 2 or more digits like `"W12X1"` -> `"WWWWWWWWWWWWX"`).
