def check(args, actual, expected):
    (words,) = args
    if not isinstance(actual, list):
        return False, f"Expected a list of groups, got {type(actual).__name__}"
    from collections import defaultdict
    expected_groups = defaultdict(list)
    for w in words:
        expected_groups["".join(sorted(w))].append(w)
    norm_exp = sorted(sorted(g) for g in expected_groups.values())
    norm_act = []
    for g in actual:
        if not isinstance(g, list):
            return False, f"Each group must be a list, got {type(g).__name__}"
        norm_act.append(sorted(g))
    norm_act.sort()
    if norm_act != norm_exp:
        return False, "Anagram groups do not match expected partition or multiplicity"
    return True
