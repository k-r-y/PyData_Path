def leap_years_in_range(start_year: int, end_year: int) -> list[int]:
    return [y for y in range(start_year, end_year + 1) if y % 4 == 0]
