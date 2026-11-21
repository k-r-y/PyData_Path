def analyze_logs(lines: list[str]) -> dict:
    total = 0
    by_level = {}
    by_service = {}
    err_list = []
    for line in lines:
        parts = line.split()
        if not parts:
            continue
        total += 1
        level, svc = parts[1], parts[2]
        by_level[level] = by_level.get(level, 0) + 1
        by_service[svc] = by_service.get(svc, 0) + 1
        if level == "ERROR":
            err_list.append(svc)
    return {
        "total": total,
        "by_level": by_level,
        "by_service": by_service,
        "error_services": err_list,
    }
