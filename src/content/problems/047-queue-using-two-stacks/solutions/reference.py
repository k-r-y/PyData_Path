class TwoStackQueue:
    def __init__(self):
        self._in = []
        self._out = []

    def _shift(self) -> None:
        if not self._out:
            while self._in:
                self._out.append(self._in.pop())

    def enqueue(self, item) -> None:
        self._in.append(item)

    def dequeue(self):
        self._shift()
        if not self._out:
            raise IndexError("dequeue from empty queue")
        return self._out.pop()

    def peek(self):
        self._shift()
        if not self._out:
            raise IndexError("peek from empty queue")
        return self._out[-1]

    def is_empty(self) -> bool:
        return not self._in and not self._out
