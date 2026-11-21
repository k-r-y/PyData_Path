---
problemId: P074
solutions:
  - { file: solutions/reference.py, label: "Bottom-up 1D unbounded DP", time: "O(len(coins) * amount)", space: "O(amount)" }
---
## Approach
Explanation: Greedy coin selection breaks whenever non-canonical denominations appear (`[1, 3, 4]` reaching `6`) [src:python-tutorial]. Bottom-up dynamic programming records the smallest coin count `dp[x]` for every sub-amount `0..amount` once, running in `O(k * amount)` time instead of exponential backtracking [src:python-wiki-timecomplexity].

## Common mistakes
- Sorting coins descending and dividing greedily.
- Failing to handle `amount == 0 -> 0` cleanly when `coins` is empty.

## Takeaways
- Check canonical vs arbitrary coin denominations before assuming greedy change works.

## Related
P077, P040, lesson B8
