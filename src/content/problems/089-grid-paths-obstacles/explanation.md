---
problemId: P089
solutions:
  - { file: solutions/reference.py, label: "In-place 1D row rolling DP", time: "O(R * C)", space: "O(C)" }
---
## Approach
Explanation: Updating `dp` left-to-right per row combines the value already in `dp[c]` (the count directly above) with `dp[c - 1]` (the count directly to the left) [src:python-tutorial]. When `row[c] == 1`, zeroing `dp[c]` ensures downstream cells beyond any top-row or left-column blocker stay unreachable cleanly in `O(C)` space [src:python-wiki-timecomplexity].

## Common mistakes
- Initializing the entire first row or first column to `1` blindly when an obstacle sits midway along that edge (cells past the obstacle must become `0`, not remain `1`).

## Takeaways
- Check first-row and first-column blockers explicitly by letting the rolling recurrence handle edge zeroing naturally.

## Related
P027, P075, lesson B8
