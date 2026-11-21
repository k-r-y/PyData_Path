def summarize_inventory_csv(csv_text: str) -> dict[str, float]:
    lines = [l for l in csv_text.strip().splitlines() if l.strip()]
    if len(lines) <= 1:
        return {}
    totals = {}
    for line in lines[1:]:
        parts = line.split(",")
        cat = parts[1]
        totals[cat] = round(totals.get(cat, 0.0) + int(parts[2]) * float(parts[3]), 2)
    return totals
