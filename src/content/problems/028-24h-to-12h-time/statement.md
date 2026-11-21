Convert a 24-hour clock string `"HH:MM"` (`"00:00"` to `"23:59"`) into human-readable 12-hour notation `"<h>:<MM> AM|PM"` (without a leading zero on the hour).

Write `format_12h(time_str: str) -> str`:
- `"00:15"` -> `"12:15 AM"`
- `"12:00"` -> `"12:00 PM"`
- `"09:07"` -> `"9:07 AM"`
- `"14:05"` -> `"2:05 PM"`
