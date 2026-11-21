Implement `class GradeBook` managing assessment scores per student with JSON persistence.

### Required Interface
- `add_score(student_id: str, assessment: str, score: float) -> None`: raises `ValueError` if `score < 0 or score > 100`. Overwrites any previous score for the same `(student_id, assessment)`.
- `student_average(student_id: str) -> float`: returns arithmetic mean across assessments, or raises `KeyError` if `student_id` has no scores.
- `top_students(k: int) -> list[tuple[str, float]]`: returns up to `k` `(student_id, average)` tuples sorted by highest average descending, breaking ties by `student_id` ascending.
- `save_json(path: str) -> None` & `@classmethod load_json(cls, path: str) -> GradeBook`: persists to and restores from UTF-8 JSON (letting `FileNotFoundError` propagate naturally on missing files).
