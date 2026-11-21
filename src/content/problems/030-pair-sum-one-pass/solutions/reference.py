def find_pair_indices(amounts: list[int], target: int) -> tuple[int, int] | None:
    seen: dict[int, int] = {}
    for idx, val in enumerate(amounts):
        need = target - val
        if need in seen:
            return (seen[need], idx)
        seen[val] = idx
    return None
