class LibraryError(Exception):
    pass


class BookNotFoundError(LibraryError):
    pass


class NoCopiesAvailableError(LibraryError):
    pass


class LoanLimitExceededError(LibraryError):
    pass


class Library:
    def __init__(self, max_loans_per_member: int = 3):
        if max_loans_per_member <= 0:
            raise ValueError("max_loans_per_member must be positive")
        self._max_loans = max_loans_per_member
        self._catalog: dict[str, dict] = {}
        self._loans: dict[str, set[str]] = {}

    def add_book(self, isbn: str, title: str, copies: int = 1) -> None:
        if copies <= 0:
            raise ValueError("copies must be positive")
        if isbn not in self._catalog:
            self._catalog[isbn] = {"title": title, "available": copies}
        else:
            self._catalog[isbn]["available"] += copies

    def checkout(self, member_id: str, isbn: str) -> None:
        if isbn not in self._catalog:
            raise BookNotFoundError(f"Unknown ISBN: {isbn}")
        member_set = self._loans.setdefault(member_id, set())
        if isbn in member_set:
            raise LibraryError(f"Member {member_id} already borrowed {isbn}")
        if len(member_set) >= self._max_loans:
            raise LoanLimitExceededError(f"Member {member_id} reached max loans")
        if self._catalog[isbn]["available"] <= 0:
            raise NoCopiesAvailableError(f"No copies left for {isbn}")
        self._catalog[isbn]["available"] -= 1
        member_set.add(isbn)

    def return_book(self, member_id: str, isbn: str) -> None:
        member_set = self._loans.get(member_id)
        if not member_set or isbn not in member_set:
            raise LibraryError(f"Active loan not found for ({member_id}, {isbn})")
        member_set.remove(isbn)
        self._catalog[isbn]["available"] += 1

    def available_copies(self, isbn: str) -> int:
        if isbn not in self._catalog:
            raise BookNotFoundError(f"Unknown ISBN: {isbn}")
        return self._catalog[isbn]["available"]

    def member_loans(self, member_id: str) -> list[str]:
        return sorted(self._loans.get(member_id, set()))
