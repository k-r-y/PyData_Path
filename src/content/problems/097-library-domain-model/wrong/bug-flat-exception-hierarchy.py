class LibraryError(Exception): pass
class BookNotFoundError(Exception): pass
class NoCopiesAvailableError(Exception): pass
class LoanLimitExceededError(Exception): pass


class Library:
    def __init__(self, max_loans_per_member=3): pass
    def add_book(self, isbn, title, copies=1): pass
    def checkout(self, member_id, isbn): pass
    def return_book(self, member_id, isbn): pass
    def available_copies(self, isbn): return 0
    def member_loans(self, member_id): return []
