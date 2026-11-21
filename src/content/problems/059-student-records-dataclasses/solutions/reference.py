from dataclasses import dataclass, field


@dataclass
class StudentRecord:
    name: str
    student_id: str
    scores: list[float] = field(default_factory=list)

    def average(self) -> float:
        if not self.scores:
            return 0.0
        return round(sum(self.scores) / len(self.scores), 2)


def rank_students(records: list[StudentRecord]) -> list[StudentRecord]:
    return sorted(records, key=lambda r: (-r.average(), r.student_id))
