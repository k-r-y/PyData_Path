def analyze_logs(lines: list[str]) -> dict:
    total = 0
    by_level: dict[str, int] = {}
    by_service: dict[str, int] = {}
    error_services: set[str] = set()

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        parts = stripped.split(None, 3)
        if len(parts) < 3:
            continue
        _ts, level, service = parts[0], parts[1], parts[2]
        total += 1
        by_level[level] = by_level.get(level, 0) + 1
        by_service[service] = by_service.get(service, 0) + 1
        if level == "ERROR":
            error_services.add(service)

    return {
        "total": total,
        "by_level": by_level,
        "by_service": by_service,
        "error_services": sorted(error_services),
    }
