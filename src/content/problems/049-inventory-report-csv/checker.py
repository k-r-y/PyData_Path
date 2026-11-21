def check(args, actual, expected):
    if not isinstance(actual, dict):
        return False, f"Expected a dict mapping category -> value, got {type(actual).__name__}"
    if set(actual.keys()) != set(expected.keys()):
        return False, f"Category keys differ: expected {sorted(expected.keys())}, got {sorted(actual.keys())}"
    for k, exp_v in expected.items():
        act_v = actual[k]
        if not isinstance(act_v, (int, float)) or abs(float(act_v) - float(exp_v)) > 1e-6:
            return False, f"Value mismatch for {k!r}: expected {exp_v}, got {act_v!r}"
    return True
