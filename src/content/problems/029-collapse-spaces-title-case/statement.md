Standardize messy category titles before importing them into a reporting warehouse.

Write `normalize_heading(text: str) -> str` that:
1. Strips outer whitespace and collapses runs of spaces, tabs, and newlines into single spaces.
2. Capitalizes ONLY the first character of each whitespace word and lowercases the rest of that word (so `"don't"` becomes `"Don't"`, NOT `"Don'T"`).
