---
problemId: P096
solutions:
  - { file: solutions/reference.py, label: "Directional SCAN/LOOK state machine", time: "O(P) per step", space: "O(P)" }
---
## Approach
Explanation: Modeling the elevator controller explicitly around `(floor, direction, pending)` separates scheduling decisions (`_choose_direction`) from single-tick movement [src:python-tutorial]. Sweeping all ahead stops in one pass before reversing matches classical disk-head LOOK scheduling and prevents FIFO oscillation [src:pep8].

## Common mistakes
- Serving requests strictly in FIFO insertion order, bouncing unnecessarily up and down.
- Breaking equal-distance ties arbitrarily instead of honoring upward priority `(-f)`.

## Takeaways
- Centralizing direction transitions inside one helper makes both tick-by-tick simulation and mid-run dynamic requests deterministic.

## Related
P087, P097, lesson B2
