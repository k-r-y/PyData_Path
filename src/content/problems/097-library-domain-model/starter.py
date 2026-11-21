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
        # TODO
        pass

    def add_book(self, isbn: str, title: str, copies: int = 1) -> None:
        pass

    def checkout(self, member_id: str, isbn: str) -> None:
        pass

    def return_book(self, member_id: str, isbn: str) -> None:
        pass

    def available_copies(self, isbn: str) -> int:
        pass

    def member_loans(self, member_id: str) -> list[str]:
        pass
