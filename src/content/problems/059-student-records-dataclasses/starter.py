from dataclasses import dataclass, field


@dataclass
class StudentRecord:
    name: str
    student_id: str
    scores: list[float] = field(default_factory=list)

    def average(self) -> float:
        # TODO
        pass


def rank_students(records: list[StudentRecord]) -> list[StudentRecord]:
    # TODO
    pass
