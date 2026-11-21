Implement a prefix tree (`Trie`) supporting fast word search and sorted autocomplete suggestions:
- `insert(word: str) -> None`
- `search(word: str) -> bool`: `True` only if exact `word` was inserted.
- `starts_with(prefix: str) -> bool`: `True` if any inserted word starts with `prefix`.
- `autocomplete(prefix: str) -> list[str]`: returns all inserted words starting with `prefix` sorted lexicographically.
