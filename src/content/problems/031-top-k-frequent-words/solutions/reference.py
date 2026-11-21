from collections import Counter


def top_k_frequent(words: list[str], k: int) -> list[str]:
    if k <= 0 or not words:
        return []
    counts = Counter(words)
    ranked = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))
    return [word for word, _ in ranked[:k]]
