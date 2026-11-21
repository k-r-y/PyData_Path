An audit system generates human-readable verification phrases that contain spaces, hyphens, and punctuation. You need to verify whether the alphanumeric core reads identically forward and backward.

Write a function `is_smart_palindrome(text: str) -> bool` that returns `True` if `text` is a palindrome after keeping only alphanumeric characters and converting letters to lowercase, and `False` otherwise.

### Constraints
- Only ASCII letters and digits count (`str.isalnum()`).
- An empty or punctuation-only string has an empty alphanumeric sequence, which reads the same forward and backward (`True`).
