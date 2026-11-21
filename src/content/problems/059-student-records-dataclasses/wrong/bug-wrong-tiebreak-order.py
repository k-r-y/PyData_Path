from dataclasses import dataclass, field


@dataclass
class StudentRecord:
    name: str
    student_id: str
    scores: list[float] = field(default_factory=list)

    def average(self) -> float:
        return round(sum(self.scores) / len(self.scores), 2) if self.scores else 0.0


def rank_students(records: list[StudentRecord]) -> list[StudentRecord]:
    return sorted(records, key=lambda r: (r.average(), r.student_id), reverse=True)
