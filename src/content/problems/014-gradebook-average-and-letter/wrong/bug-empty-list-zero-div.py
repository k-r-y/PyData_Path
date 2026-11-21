def summarize_gradebook(gradebook: dict[str, list[float]]):
    out = {}
    for s, sc in gradebook.items():
        avg = sum(sc) // len(sc)
        letter = "A" if avg >= 90 else "B" if avg >= 80 else "C" if avg >= 70 else "D" if avg >= 60 else "F"
        out[s] = (avg, letter)
    return out
