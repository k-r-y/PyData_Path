class MinStack:
    def __init__(self):
        self._stack: list[tuple] = []

    def push(self, val) -> None:
        cur_min = val if not self._stack else min(val, self._stack[-1][1])
        self._stack.append((val, cur_min))

    def pop(self):
        if not self._stack:
            raise IndexError("pop from empty MinStack")
        return self._stack.pop()[0]

    def top(self):
        if not self._stack:
            raise IndexError("top from empty MinStack")
        return self._stack[-1][0]

    def get_min(self):
        if not self._stack:
            raise IndexError("get_min from empty MinStack")
        return self._stack[-1][1]
