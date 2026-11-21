from collections import defaultdict, deque


def shortest_word_ladder(begin_word: str, end_word: str, word_list: list[str]) -> int:
    word_set = set(word_list)
    if end_word not in word_set:
        return -1
    buckets = defaultdict(list)
    for w in word_set:
        for i in range(len(w)):
            buckets[w[:i] + "*" + w[i+1:]].append(w)
    q = deque([(begin_word, 1)])
    seen = {begin_word}
    while q:
        w, d = q.popleft()
        if w == end_word:
            return d
        for i in range(len(w)):
            for nxt in buckets[w[:i] + "*" + w[i+1:]]:
                if nxt not in seen:
                    seen.add(nxt)
                    q.append((nxt, d + 1))
    return -1
