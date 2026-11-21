Implement round-trip flattening and unflattening of nested dictionaries containing non-empty leaf values:
- `flatten_dict(data: dict, sep: str = ".") -> dict`: flattens nested non-empty `dict` values into compound keys joined by `sep`.
- `unflatten_dict(flat: dict, sep: str = ".") -> dict`: expands compound keys split by `sep` back into nested dictionaries.
