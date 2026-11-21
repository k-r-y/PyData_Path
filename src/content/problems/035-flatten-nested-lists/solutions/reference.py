def flatten_list(nested: list) -> list:
    out = []
    for item in nested:
        if isinstance(item, list):
            out.extend(flatten_list(item))
        else:
            out.append(item)
    return out
