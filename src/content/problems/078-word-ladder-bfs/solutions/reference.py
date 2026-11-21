from collections import defaultdict, deque


def shortest_word_ladder(begin_word: str, end_word: str, word_list: list[str]) -> int:
    if begin_word == end_word:
        return 0
    word_set = set(word_list)
    if end_word not in word_set:
        return -1

    buckets: dict[str, list[str]] = defaultdict(list)
    length = len(begin_word)
    for w in word_set:
        if len(w) == length:
            for i in range(length):
                buckets[f"{w[:i]}*{w[i+1:]}"].append(w)

    queue = deque([(begin_word, 0)])
    visited = {begin_word}
    while queue:
        word, dist = queue.popleft()
        for i in range(length):
            pat = f"{word[:i]}*{word[i+1:]}"
            for nxt in buckets.get(pat, ()):
                if nxt == end_word:
                    return dist + 1
                if nxt not in visited:
                    visited.add(nxt)
                    queue.append((nxt, dist + 1))
            buckets[pat] = []
    return -1
