import json


class GradeBook:
    def __init__(self):
        self.scores: dict[str, dict[str, float]] = {}

    def add_score(self, student_id: str, assessment: str, score: float) -> None:
        if score < 0 or score > 100:
            raise ValueError("bad score")
        self.scores.setdefault(student_id, {})[assessment] = float(score)

    def student_average(self, student_id: str) -> float:
        if student_id not in self.scores:
            raise KeyError(student_id)
        vals = self.scores[student_id].values()
        return sum(vals) / len(vals)

    def top_students(self, k: int) -> list[tuple[str, float]]:
        ranked = [(s, self.student_average(s)) for s in self.scores]
        ranked.sort(key=lambda x: (x[1], x[0]), reverse=True)
        return ranked[:k]

    def save_json(self, path: str) -> None:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.scores, f)

    @classmethod
    def load_json(cls, path: str) -> "GradeBook":
        with open(path, "r", encoding="utf-8") as f:
            d = json.load(f)
        gb = cls()
        gb.scores = d
        return gb
