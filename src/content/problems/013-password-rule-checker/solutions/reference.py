def is_valid_password(password: str) -> bool:
    symbols = set("!@#$%^&*-_")
    if len(password) < 8:
        return False
    if any(ch.isspace() for ch in password):
        return False
    has_upper = any('A' <= ch <= 'Z' for ch in password)
    has_lower = any('a' <= ch <= 'z' for ch in password)
    has_digit = any('0' <= ch <= '9' for ch in password)
    has_sym = any(ch in symbols for ch in password)
    return has_upper and has_lower and has_digit and has_sym
