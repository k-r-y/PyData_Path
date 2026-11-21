def retry(max_attempts: int = 3, exceptions=(Exception,)):
    def decorator(fn):
        def wrapper(*args, **kwargs):
            for i in range(max_attempts + 1):
                try:
                    return fn(*args, **kwargs)
                except Exception:
                    if i == max_attempts:
                        raise
        return wrapper
    return decorator
