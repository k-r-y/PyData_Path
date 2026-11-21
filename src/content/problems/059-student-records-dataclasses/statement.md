Implement a `@dataclass` `StudentRecord` with fields `name: str`, `student_id: str`, and `scores: list[float]` (defaulting safely to an empty list per instance).

Requirements:
- Method `average(self) -> float`: returns `round(sum(self.scores) / len(self.scores), 2)`, or `0.0` when empty.
- Function `rank_students(records: list[StudentRecord]) -> list[StudentRecord]`: returns a new list sorted by highest `average()` first, breaking ties ascending by `student_id`.
