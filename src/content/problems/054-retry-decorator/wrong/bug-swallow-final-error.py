import functools


def retry(max_attempts: int = 3, exceptions=(Exception,)):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for _ in range(max_attempts):
                try:
                    return fn(*args, **kwargs)
                except exceptions:
                    pass
            return None
        return wrapper
    return decorator
