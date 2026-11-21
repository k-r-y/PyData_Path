import json


class GradeBook:
    def __init__(self):
        self.records: dict[str, list[float]] = {}

    def add_score(self, student_id: str, assessment: str, score: float) -> None:
        if score < 0 or score > 100:
            raise ValueError("Invalid score")
        self.records.setdefault(student_id, []).append(float(score))

    def student_average(self, student_id: str) -> float:
        vals = self.records[student_id]
        return sum(vals) / len(vals)

    def top_students(self, k: int) -> list[tuple[str, float]]:
        ranked = [(s, self.student_average(s)) for s in self.records]
        ranked.sort(key=lambda x: (-x[1], x[0]))
        return ranked[:k]

    def save_json(self, path: str) -> None:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.records, f)

    @classmethod
    def load_json(cls, path: str) -> "GradeBook":
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        gb = cls()
        gb.records = data
        return gb
