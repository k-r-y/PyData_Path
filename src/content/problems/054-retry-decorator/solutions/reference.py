import functools


def retry(max_attempts: int = 3, exceptions=(Exception,)):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return fn(*args, **kwargs)
                except exceptions:
                    if attempt + 1 >= max_attempts:
                        raise
        return wrapper
    return decorator
