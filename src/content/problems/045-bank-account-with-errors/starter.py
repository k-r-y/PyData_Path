class InsufficientFundsError(Exception):
    """Raised when a withdrawal exceeds available account balance."""
    pass


class Account:
    def __init__(self, owner: str, balance: float = 0):
        # TODO
        pass

    def deposit(self, amount: float) -> float:
        # TODO
        pass

    def withdraw(self, amount: float) -> float:
        # TODO
        pass
