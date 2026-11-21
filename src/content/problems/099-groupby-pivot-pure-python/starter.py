from collections import defaultdict


def pivot_table(
    rows: list[dict],
    index_col: str,
    pivot_col: str,
    value_col: str,
    agg: str = "sum",
    fill_value: float = 0.0,
) -> dict[str, dict[str, float]]:
    """Aggregate and pivot record dicts into nested row -> col -> float matrix."""
    # TODO
    pass
