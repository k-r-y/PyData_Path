import functools


def retry(max_attempts: int = 3, exceptions=(Exception,)):
    """Decorator factory retrying fn up to max_attempts times on specified exceptions."""
    # TODO
    pass
