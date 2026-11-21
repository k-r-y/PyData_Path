---
problemId: P059
solutions:
  - { file: solutions/reference.py, label: "Dataclass with field(default_factory=list) and negated tuple key", time: "O(n log n)", space: "O(n)" }
---
## Approach
Explanation: `dataclasses` raises a `ValueError` if you write `scores: list = []` directly; using `field(default_factory=list)` gives every instance its own isolated list [src:python-lang-ref]. Sorting with `(-r.average(), r.student_id)` places highest averages first while sorting ties ascending by ID [src:python-tutorial].

## Common mistakes
- Passing `reverse=True` globally, which flips tie-breaking into descending `student_id`.
- Dividing by `len(self.scores)` without checking empty lists.

## Takeaways
- Always use `field(default_factory=list)` for mutable defaults in dataclasses.

## Related
P014, P060, lesson B2
