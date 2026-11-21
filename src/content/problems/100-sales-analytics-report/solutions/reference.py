from collections import defaultdict
import csv


def build_sales_report(csv_path: str, top_n: int = 3) -> dict:
    seen_orders: set[str] = set()
    cat_totals: dict[str, float] = defaultdict(float)
    month_totals: dict[str, float] = defaultdict(float)
    clean_orders = 0
    total_revenue = 0.0

    with open(csv_path, "r", encoding="utf-8", newline="") as fp:
        for raw in csv.DictReader(fp):
            oid = (raw.get("order_id") or "").strip()
            month = (raw.get("month") or "").strip()
            cat = (raw.get("category") or "").strip()
            rev_s = (raw.get("revenue") or "").replace("$", "").replace(",", "").strip()
            qty_s = (raw.get("qty") or "").strip()

            if not oid or not month or not cat or not rev_s or not qty_s:
                continue
            try:
                rev = float(rev_s)
                qty = int(qty_s)
            except ValueError:
                continue
            if rev <= 0 or qty <= 0:
                continue
            if oid in seen_orders:
                continue

            seen_orders.add(oid)
            clean_orders += 1
            total_revenue += rev
            cat_totals[cat] += rev
            month_totals[month] += rev

    ranked_cats = sorted(
        ((cat, round(val, 2)) for cat, val in cat_totals.items()),
        key=lambda item: (-item[1], item[0]),
    )[: max(0, top_n)]

    trend = sorted((m, round(val, 2)) for m, val in month_totals.items())
    rounded_total = round(total_revenue, 2)

    lines = [
        f"Orders: {clean_orders}",
        f"Total Revenue: ${rounded_total:.2f}",
        "Top Categories:",
        *[f"- {cat}: ${val:.2f}" for cat, val in ranked_cats],
        "Monthly Trend:",
        *[f"- {m}: ${val:.2f}" for m, val in trend],
    ]

    return {
        "clean_orders": clean_orders,
        "total_revenue": rounded_total,
        "top_categories": ranked_cats,
        "monthly_trend": trend,
        "report_text": "\n".join(lines),
    }
