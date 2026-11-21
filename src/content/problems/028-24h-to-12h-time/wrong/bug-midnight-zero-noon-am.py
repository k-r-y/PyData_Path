def format_12h(time_str: str) -> str:
    h_str, m_str = time_str.split(":")
    h = int(h_str)
    suffix = "PM" if h > 12 else "AM"
    h12 = h % 12
    return f"{h12}:{m_str} {suffix}"
