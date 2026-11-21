import csv
import io


def clean_sales_csv(csv_text: str) -> dict:
    reader = csv.DictReader(io.StringIO(csv_text))
    rows: list[dict] = []
    seen: set[str] = set()
    dropped = 0
    dups = 0

    for raw in reader:
        tx_id = (raw.get("tx_id") or "").strip()
        region = (raw.get("region") or "").strip().upper()
        status = ((raw.get("status") or "").strip().lower()) or "unknown"
        amt_str = (raw.get("amount") or "").replace("$", "").replace(",", "").strip()

        if not tx_id or not region or status == "cancelled" or not amt_str:
            dropped += 1
            continue

        try:
            amt = round(float(amt_str), 2)
        except ValueError:
            dropped += 1
            continue

        if amt <= 0:
            dropped += 1
            continue

        if tx_id in seen:
            dups += 1
            continue

        seen.add(tx_id)
        rows.append({"tx_id": tx_id, "region": region, "amount": amt, "status": status})

    return {
        "rows": rows,
        "valid_count": len(rows),
        "dropped_count": dropped,
        "duplicate_count": dups,
    }
