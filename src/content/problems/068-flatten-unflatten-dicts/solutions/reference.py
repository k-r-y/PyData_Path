def flatten_dict(data: dict, sep: str = ".") -> dict:
    out = {}

    def walk(prefix: str, node: dict) -> None:
        for k, v in node.items():
            full_key = f"{prefix}{sep}{k}" if prefix else str(k)
            if isinstance(v, dict) and v:
                walk(full_key, v)
            else:
                out[full_key] = v

    walk("", data)
    return out


def unflatten_dict(flat: dict, sep: str = ".") -> dict:
    root: dict = {}
    for compound_key, value in flat.items():
        parts = compound_key.split(sep)
        node = root
        for part in parts[:-1]:
            node = node.setdefault(part, {})
        node[parts[-1]] = value
    return root
