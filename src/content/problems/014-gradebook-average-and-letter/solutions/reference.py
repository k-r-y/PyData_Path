def summarize_gradebook(gradebook: dict[str, list[float]]) -> dict[str, tuple[float, str]]:
    summary: dict[str, tuple[float, str]] = {}
    for student, scores in gradebook.items():
        avg = round(sum(scores) / len(scores), 2) if scores else 0.0
        if avg >= 90:
            letter = "A"
        elif avg >= 80:
            letter = "B"
        elif avg >= 70:
            letter = "C"
        elif avg >= 60:
            letter = "D"
        else:
            letter = "F"
        summary[student] = (avg, letter)
    return summary
