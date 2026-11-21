import csv
import io


def clean_sales_csv(csv_text: str) -> dict:
    by_id = {}
    dropped = 0
    dups = 0
    for raw in csv.DictReader(io.StringIO(csv_text)):
        tx_id = (raw.get("tx_id") or "").strip()
        region = (raw.get("region") or "").strip().upper()
        status = ((raw.get("status") or "").strip().lower()) or "unknown"
        amt_s = (raw.get("amount") or "").replace("$", "").replace(",", "").strip()
        try:
            amt = round(float(amt_s), 2)
        except ValueError:
            dropped += 1
            continue
        if not tx_id or not region or status == "cancelled" or amt <= 0:
            dropped += 1
            continue
        if tx_id in by_id:
            dups += 1
        by_id[tx_id] = {"tx_id": tx_id, "region": region, "amount": amt, "status": status}
    rows = list(by_id.values())
    return {"rows": rows, "valid_count": len(rows), "dropped_count": dropped, "duplicate_count": dups}
