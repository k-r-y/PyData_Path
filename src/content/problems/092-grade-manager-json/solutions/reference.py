import json


class GradeBook:
    def __init__(self):
        self._scores: dict[str, dict[str, float]] = {}

    def add_score(self, student_id: str, assessment: str, score: float) -> None:
        val = float(score)
        if val < 0.0 or val > 100.0:
            raise ValueError(f"Score out of range [0, 100]: {score}")
        if student_id not in self._scores:
            self._scores[student_id] = {}
        self._scores[student_id][assessment] = val

    def student_average(self, student_id: str) -> float:
        if student_id not in self._scores or not self._scores[student_id]:
            raise KeyError(student_id)
        vals = self._scores[student_id].values()
        return sum(vals) / len(vals)

    def top_students(self, k: int) -> list[tuple[str, float]]:
        if k <= 0:
            return []
        ranked = [(sid, sum(a.values()) / len(a)) for sid, a in self._scores.items() if a]
        ranked.sort(key=lambda item: (-item[1], item[0]))
        return ranked[:k]

    def save_json(self, path: str) -> None:
        with open(path, "w", encoding="utf-8") as fp:
            json.dump({"scores": self._scores}, fp, indent=2)

    @classmethod
    def load_json(cls, path: str) -> "GradeBook":
        with open(path, "r", encoding="utf-8") as fp:
            payload = json.load(fp)
        gb = cls()
        raw = payload.get("scores", {})
        for sid, assessments in raw.items():
            for assessment, score in assessments.items():
                gb.add_score(str(sid), str(assessment), float(score))
        return gb
