import functools

_SHARED = {}


def memoize(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        key = (args, tuple(sorted(kwargs.items())))
        if key not in _SHARED:
            _SHARED[key] = fn(*args, **kwargs)
        return _SHARED[key]
    return wrapper
