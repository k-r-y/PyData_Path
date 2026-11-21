Given course reservations `[course_id, start_min, end_min]` representing half-open time windows `[start_min, end_min)`, identify every pair of conflicting courses. Two courses conflict iff they strictly share positive time overlap (touching `end_1 == start_2` does NOT conflict).

Write `find_conflicts(sessions: list[tuple[str, int, int]]) -> list[tuple[str, str]]` returning sorted `(id_low, id_high)` conflict pairs (`id_low < id_high`), ordered lexicographically.
