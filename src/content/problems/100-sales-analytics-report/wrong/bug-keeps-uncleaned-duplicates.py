from collections import defaultdict
import csv


def build_sales_report(csv_path: str, top_n: int = 3) -> dict:
    cats = defaultdict(float)
    months = defaultdict(float)
    total = 0.0
    n = 0
    with open(csv_path, "r", encoding="utf-8") as fp:
        for r in csv.DictReader(fp):
            rev = float(r["revenue"].replace("$", "").replace(",", ""))
            qty = int(r["qty"])
            if rev <= 0 or qty <= 0 or not r["category"].strip():
                continue
            n += 1
            total += rev
            cats[r["category"].strip()] += rev
            months[r["month"].strip()] += rev
    top_cats = sorted(((k, round(v, 2)) for k, v in cats.items()), key=lambda x: (-x[1], x[0]))[:top_n]
    trend = sorted((k, round(v, 2)) for k, v in months.items())
    return {
        "clean_orders": n,
        "total_revenue": round(total, 2),
        "top_categories": top_cats,
        "monthly_trend": trend,
        "report_text": f"Orders: {n}\nTotal Revenue: ${total:.2f}",
    }
