Given a list of structured log lines formatted as `"<timestamp> <LEVEL> <service> <message>"`, summarize log volume and isolate failing services.

Write `analyze_logs(lines: list[str]) -> dict` returning:
```python
{
    "total": int,                  # count of non-empty log lines
    "by_level": dict[str, int],    # e.g. {"INFO": 1, "ERROR": 2}
    "by_service": dict[str, int],  # total events per service
    "error_services": list[str],   # sorted unique services that logged "ERROR"
}
```

Skip blank or whitespace-only lines cleanly.
