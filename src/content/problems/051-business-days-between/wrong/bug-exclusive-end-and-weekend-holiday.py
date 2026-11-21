from datetime import date, timedelta


def count_business_days(start_date: str, end_date: str, holidays: list[str] | None = None) -> int:
    cur = date.fromisoformat(start_date)
    end = date.fromisoformat(end_date)
    if cur > end:
        return 0
    hset = {date.fromisoformat(h) for h in (holidays or [])}
    count = 0
    while cur < end:
        if cur.weekday() < 5:
            count += 1
        cur += timedelta(days=1)
    return max(0, count - len([h for h in hset if date.fromisoformat(start_date) <= h <= end]))
