import json


class GradeBook:
    def __init__(self):
        # TODO
        pass

    def add_score(self, student_id: str, assessment: str, score: float) -> None:
        pass

    def student_average(self, student_id: str) -> float:
        pass

    def top_students(self, k: int) -> list[tuple[str, float]]:
        pass

    def save_json(self, path: str) -> None:
        pass

    @classmethod
    def load_json(cls, path: str) -> "GradeBook":
        pass
