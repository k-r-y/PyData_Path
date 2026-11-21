def is_valid_ipv4(ip: str) -> bool:
    parts = ip.split(".")
    if len(parts) != 4:
        return False
    for p in parts:
        try:
            v = int(p)
            if not (0 <= v <= 255):
                return False
        except ValueError:
            return False
    return True
