import csv
import io


def summarize_inventory_csv(csv_text: str) -> dict[str, float]:
    if not csv_text or not csv_text.strip():
        return {}
    totals: dict[str, float] = {}
    reader = csv.DictReader(io.StringIO(csv_text))
    for row in reader:
        cat = row.get("category")
        if cat is None or not cat.strip():
            continue
        units = int(row["units"])
        price = float(row["unit_price"])
        totals[cat] = totals.get(cat, 0.0) + units * price
    return {k: round(v, 2) for k, v in totals.items()}
