For text indexing diagnostics, summarize the letter breakdown of each whitespace-separated token in a line of text.

Write `analyze_words(text: str) -> list[tuple[str, int, int]]` that returns a list of `(token, vowel_count, consonant_count)` tuples for every whitespace token in `text`.

### Rules
- Split tokens using `text.split()`.
- Vowels are ASCII `a, e, i, o, u` (either case).
- Consonants are all remaining ASCII letters `a-z` / `A-Z`.
- Digits and punctuation inside a token do not count as vowels or consonants, though the original token string is preserved as the first element of the tuple.
