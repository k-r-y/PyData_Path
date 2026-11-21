import csv
import io


def clean_sales_csv(csv_text: str) -> dict:
    rows = []
    dropped = 0
    dups = 0
    seen = set()
    for raw in csv.DictReader(io.StringIO(csv_text)):
        amt = float(raw["amount"].strip())
        if amt <= 0:
            dropped += 1
            continue
        tx_id = raw["tx_id"].strip()
        if tx_id in seen:
            dups += 1
            continue
        seen.add(tx_id)
        rows.append({"tx_id": tx_id, "region": raw["region"].strip().upper(), "amount": round(amt, 2), "status": raw["status"].strip().lower()})
    return {"rows": rows, "valid_count": len(rows), "dropped_count": dropped, "duplicate_count": dups}
