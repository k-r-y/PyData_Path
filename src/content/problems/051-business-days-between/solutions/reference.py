from datetime import date, timedelta


def count_business_days(start_date: str, end_date: str, holidays: list[str] | None = None) -> int:
    cur = date.fromisoformat(start_date)
    end = date.fromisoformat(end_date)
    if cur > end:
        return 0
    holiday_set = {date.fromisoformat(h) for h in (holidays or [])}
    one_day = timedelta(days=1)
    count = 0
    while cur <= end:
        if cur.weekday() < 5 and cur not in holiday_set:
            count += 1
        cur += one_day
    return count
