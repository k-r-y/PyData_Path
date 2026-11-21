def sort_inventory(rows: list[dict]) -> list[dict]:
    return sorted(rows, key=lambda r: (r["category"], r["stock"], r["sku"]))
