Wrap whitespace-normalized text greedily into lines of at most `width` characters without splitting any word.

Write `wrap_text(text: str, width: int) -> str`:
- Split words using `text.split()`; separate words on the same line with a single `' '`.
- Pack as many words onto each line as fit within `width`.
- If a single word alone exceeds `width`, place that complete word on its own line without cutting it.
- Return `""` if there are no words.
