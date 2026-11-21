To obfuscate staging labels in diagnostic exports without changing separators or ID digits, implement a classic rotational cipher.

Write `caesar_shift(text: str, shift: int) -> str` that rotates every ASCII letter (`a-z` and `A-Z`) forward by `shift` positions wrapping around the 26-letter alphabet.

### Rules
- Preserve uppercase vs lowercase for each letter.
- Support negative `shift` values and magnitudes larger than `26`.
- Digits, punctuation, spaces, and underscores remain untouched.
