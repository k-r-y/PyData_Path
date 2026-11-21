def is_valid_password(password: str) -> bool:
    symbols = set("!@#$%^&*-_")
    return (
        len(password) >= 8
        and any(c.isupper() for c in password)
        and any(c.islower() for c in password)
        and any(c.isdigit() for c in password)
        and any(c in symbols for c in password)
    )
