def flatten_dict(data: dict, sep: str = ".") -> dict:
    out = {}
    for k, v in data.items():
        if isinstance(v, dict):
            for k2, v2 in v.items():
                out[f"{k}{sep}{k2}"] = v2
        else:
            out[k] = v
    return out


def unflatten_dict(flat: dict, sep: str = ".") -> dict:
    root = {}
    for key, val in flat.items():
        parts = key.split(sep)
        root[parts[0]] = val if len(parts) == 1 else {parts[1]: val}
    return root
