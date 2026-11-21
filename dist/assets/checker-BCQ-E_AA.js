var e=`def check(args, actual, expected):
    amounts, target = args
    if expected is None:
        if actual is not None:
            return False, f"Expected None when no pair exists, got {actual!r}"
        return True
    if not isinstance(actual, (tuple, list)) or len(actual) != 2:
        return False, f"Expected a 2-element tuple (i, j), got {actual!r}"
    i, j = actual
    if isinstance(i, bool) or isinstance(j, bool) or not isinstance(i, int) or not isinstance(j, int):
        return False, f"Indices must be integers, got {actual!r}"
    if not (0 <= i < j < len(amounts)):
        return False, f"Indices must satisfy 0 <= i < j < {len(amounts)}, got {actual!r}"
    if amounts[i] + amounts[j] != target:
        return False, f"amounts[{i}] + amounts[{j}] = {amounts[i] + amounts[j]} != {target}"
    return True
`;export{e as default};