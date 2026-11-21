class Elevator:
    def __init__(self, min_floor=1, max_floor=10, start_floor=1):
        self._min = min_floor
        self._max = max_floor
        self._floor = start_floor
        self._dir = 0
        self._pending = set()

    def request(self, floor: int) -> None:
        if not (self._min <= floor <= self._max):
            raise ValueError("oob")
        if floor != self._floor:
            self._pending.add(floor)

    def step(self) -> int:
        if not self._pending:
            self._dir = 0
            return self._floor
        if self._dir == 0:
            t = min(self._pending, key=lambda f: (abs(f - self._floor), f))
            self._dir = 1 if t > self._floor else -1
        self._floor += self._dir
        self._pending.discard(self._floor)
        if not self._pending:
            self._dir = 0
        elif self._dir == 1 and not any(f > self._floor for f in self._pending):
            self._dir = -1
        elif self._dir == -1 and not any(f < self._floor for f in self._pending):
            self._dir = 1
        return self._floor

    def run_until_idle(self) -> list[int]:
        out = []
        while self._pending:
            out.append(self.step())
        return out

    def status(self) -> dict:
        return {"floor": self._floor, "direction": self._dir, "pending": sorted(self._pending)}
