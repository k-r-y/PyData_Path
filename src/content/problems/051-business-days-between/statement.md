Calculate SLA business days between two ISO calendar dates inclusive (`start_date <= d <= end_date`).

Write `count_business_days(start_date: str, end_date: str, holidays: list[str] | None = None) -> int`:
- Parse `"YYYY-MM-DD"` strings with `datetime.date.fromisoformat`.
- Count Monday through Friday dates that do NOT appear in `holidays`.
- If `start_date > end_date`, return `0`.
