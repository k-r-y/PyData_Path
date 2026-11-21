import functools


def memoize(fn):
    cache = {}

    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        key = args
        res = cache.get(key)
        if res is None:
            res = fn(*args, **kwargs)
            cache[key] = res
        return res
    return wrapper
