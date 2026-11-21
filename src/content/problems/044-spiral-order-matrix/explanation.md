---
problemId: P044
solutions:
  - { file: solutions/reference.py, label: "Shrinking four-wall boundary loop", time: "O(R * C)", space: "O(R * C)" }
---
## Approach
Explanation: Imagine peeling layers off a rectangle using four inward-shrinking bounds `top`, `bottom`, `left`, `right` [src:python-tutorial]. Checking `if top <= bottom:` before walking bottom leftwards and `if left <= right:` before walking left upwards prevents re-reading the same strip on `1 x N` or `N x 1` center lines.

## Common mistakes
- Omitting the `top <= bottom` and `left <= right` guards on the bottom and left sweeps, causing duplicate items in non-square matrices.

## Takeaways
- Re-check opposing boundary inequalities whenever an inner loop shrinks a thin 1-row or 1-column strip mid-iteration.

## Related
P037, P024, lesson A4
