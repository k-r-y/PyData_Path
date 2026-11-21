---
problemId: P039
solutions:
  - { file: solutions/reference.py, label: "Sliding window with last-seen dict", time: "O(n) average", space: "O(min(n, k))" }
  - { file: solutions/alt-set-window.py, label: "Two-pointer sliding window with set", time: "O(n) average", space: "O(min(n, k))" }
---
## Approach
Explanation: Imagine dragging an elastic window `[left, right]` across the stream. As `right` expands one character at a time, if `events[right]` already appeared at an index `>= left`, you jump `left` directly past that previous occurrence (`last_seen[ch] + 1`) so the window stays duplicate-free. Every character enters the dictionary once and lookups take `O(1)` average time [src:python-wiki-timecomplexity], yielding `O(n)` total runtime where `k` is the distinct character count.

## Common mistakes
- Clearing the entire `seen` set whenever a repeat occurs (`"dvdf"` gives `2` instead of `3` for `"vdf"`).
- Updating `left = last_seen[ch] + 1` without checking `last_seen[ch] >= left`, which lets `left` jump backward on `"abba"`.
- Trying every starting index `i` with an inner scan `j` (`O(n^2)`), which times out on long distinct streams.

## Takeaways
- Sliding windows convert nested subarray scans into linear time when validity is monotonic as you shrink from the left.
- Storing last-seen positions in a `dict` lets `left` jump in `O(1)` without shrinking step by step [src:python-wiki-timecomplexity].

## Related
P011, P095, lessons A6 and B8
