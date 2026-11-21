def format_12h(time_str: str) -> str:
    h_str, m_str = time_str.split(":")
    h = int(h_str)
    m = int(m_str)
    suffix = "AM" if h < 12 else "PM"
    h12 = h % 12 or 12
    return f"{h12}:{m:02d} {suffix}"
