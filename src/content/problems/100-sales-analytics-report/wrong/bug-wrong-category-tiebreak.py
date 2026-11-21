from collections import defaultdict
import csv


def build_sales_report(csv_path: str, top_n: int = 3) -> dict:
    seen = set()
    cats = defaultdict(float)
    months = defaultdict(float)
    total = 0.0
    with open(csv_path, "r", encoding="utf-8") as fp:
        for r in csv.DictReader(fp):
            oid = (r.get("order_id") or "").strip()
            m = (r.get("month") or "").strip()
            c = (r.get("category") or "").strip()
            try:
                rev = float((r.get("revenue") or "").replace("$", "").replace(",", ""))
                qty = int((r.get("qty") or "").strip())
            except ValueError:
                continue
            if not oid or not m or not c or rev <= 0 or qty <= 0 or oid in seen:
                continue
            seen.add(oid)
            total += rev
            cats[c] += rev
            months[m] += rev
    top_cats = sorted(((k, round(v, 2)) for k, v in cats.items()), key=lambda x: (x[1], x[0]), reverse=True)[:top_n]
    trend = sorted((k, round(v, 2)) for k, v in months.items())
    return {
        "clean_orders": len(seen),
        "total_revenue": round(total, 2),
        "top_categories": top_cats,
        "monthly_trend": trend,
        "report_text": f"Orders: {len(seen)}\nTotal Revenue: ${total:.2f}",
    }
