def parse_csv(text: str) -> list[list[str]]:
    if not text:
        return []
    return [line.split(",") for line in text.strip().splitlines()]
