class LibraryError(Exception): pass
class BookNotFoundError(LibraryError): pass
class NoCopiesAvailableError(LibraryError): pass
class LoanLimitExceededError(LibraryError): pass


class Library:
    def __init__(self, max_loans_per_member: int = 3):
        self.max_loans = max_loans_per_member
        self.copies = {}
        self.loans = {}

    def add_book(self, isbn: str, title: str, copies: int = 1) -> None:
        if copies <= 0:
            raise ValueError("copies")
        self.copies[isbn] = self.copies.get(isbn, 0) + copies

    def checkout(self, member_id: str, isbn: str) -> None:
        if isbn not in self.copies:
            raise BookNotFoundError(isbn)
        if self.copies[isbn] <= 0:
            raise NoCopiesAvailableError(isbn)
        m = self.loans.setdefault(member_id, [])
        if len(m) >= self.max_loans:
            raise LoanLimitExceededError(member_id)
        self.copies[isbn] -= 1
        m.append(isbn)

    def return_book(self, member_id: str, isbn: str) -> None:
        m = self.loans.get(member_id, [])
        if isbn not in m:
            raise LibraryError("no loan")
        m.remove(isbn)
        self.copies[isbn] += 1

    def available_copies(self, isbn: str) -> int:
        if isbn not in self.copies:
            raise BookNotFoundError(isbn)
        return self.copies[isbn]

    def member_loans(self, member_id: str) -> list[str]:
        return sorted(self.loans.get(member_id, []))
