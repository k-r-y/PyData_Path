Your monitoring dashboard shows the `k` most frequent alert tags emitted during an incident window.

Write `top_k_frequent(words: list[str], k: int) -> list[str]` returning up to `k` distinct words sorted by:
1. Higher occurrence count first.
2. Alphabetical ascending order (`'a' < 'b'`) when counts tie.

If `k <= 0` or `words` is empty, return `[]`.
