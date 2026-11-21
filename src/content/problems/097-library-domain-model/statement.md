Implement domain exceptions and `class Library(max_loans_per_member: int = 3)`.

### Custom Exceptions
- `LibraryError(Exception)`
- `BookNotFoundError(LibraryError)`
- `NoCopiesAvailableError(LibraryError)`
- `LoanLimitExceededError(LibraryError)`

### Methods
- `add_book(isbn: str, title: str, copies: int = 1) -> None`: raises `ValueError` if `copies <= 0`; adds `copies` if `isbn` exists.
- `checkout(member_id: str, isbn: str) -> None`: raises `BookNotFoundError`, `NoCopiesAvailableError`, `LibraryError` (duplicate active loan of same ISBN by member), or `LoanLimitExceededError`.
- `return_book(member_id: str, isbn: str) -> None`: raises `LibraryError` if member does not hold `isbn`; otherwise returns copy cleanly.
- `available_copies(isbn: str) -> int` (raises `BookNotFoundError` if missing) and `member_loans(member_id: str) -> list[str]` (sorted ISBNs).
