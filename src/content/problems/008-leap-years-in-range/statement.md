When scheduling annual financial rollover calendars, you need to list every leap year in an inclusive window `[start_year, end_year]`.

Write `leap_years_in_range(start_year: int, end_year: int) -> list[int]` returning all Gregorian leap years `y` with `start_year <= y <= end_year` in ascending order.

### Rule
A year `y` is a leap year if and only if:
- `y` is divisible by `400`, OR
- `y` is divisible by `4` AND NOT divisible by `100`.
