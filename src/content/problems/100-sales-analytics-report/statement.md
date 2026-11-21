Build an end-to-end pure-Python analytics pipeline `build_sales_report(csv_path: str, top_n: int = 3) -> dict` reading CSV orders from `csv_path`.

### Pipeline Stages
1. **Read & Clean** columns `order_id, month, category, revenue, qty`: strip whitespace; strip `"$"` and `","` from `revenue`; drop rows with empty `order_id`/`month`/`category`, non-positive/invalid `revenue`, or non-positive/invalid `qty`; keep only the **first** valid row per `order_id`.
2. **Aggregate**:
   - `clean_orders`: int count of clean kept orders
   - `total_revenue`: `round(sum_revenue, 2)`
   - `top_categories`: up to `top_n` `(category, round(rev, 2))` sorted by revenue descending, then category ascending
   - `monthly_trend`: `(month, round(rev, 2))` sorted by `month` ascending (`YYYY-MM`)
3. **Format `report_text`** with exact lines:
```
Orders: <clean_orders>
Total Revenue: $<total_revenue:.2f>
Top Categories:
- <cat>: $<rev:.2f>
Monthly Trend:
- <month>: $<rev:.2f>
```
