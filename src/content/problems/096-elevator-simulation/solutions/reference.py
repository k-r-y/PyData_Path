class Elevator:
    def __init__(self, min_floor: int = 1, max_floor: int = 10, start_floor: int = 1):
        if min_floor > max_floor or not (min_floor <= start_floor <= max_floor):
            raise ValueError("Invalid floor bounds or start_floor")
        self._min = min_floor
        self._max = max_floor
        self._floor = start_floor
        self._dir = 0
        self._pending: set[int] = set()

    def request(self, floor: int) -> None:
        if not (self._min <= floor <= self._max):
            raise ValueError(f"Floor {floor} out of range [{self._min}, {self._max}]")
        if floor != self._floor:
            self._pending.add(floor)

    def _choose_direction(self) -> None:
        if not self._pending:
            self._dir = 0
            return
        if self._dir == 1:
            if any(f > self._floor for f in self._pending):
                return
            self._dir = -1 if any(f < self._floor for f in self._pending) else 0
            return
        if self._dir == -1:
            if any(f < self._floor for f in self._pending):
                return
            self._dir = 1 if any(f > self._floor for f in self._pending) else 0
            return
        target = min(self._pending, key=lambda f: (abs(f - self._floor), -f))
        self._dir = 1 if target > self._floor else -1

    def step(self) -> int:
        if not self._pending:
            self._dir = 0
            return self._floor
        self._choose_direction()
        if self._dir == 0:
            return self._floor
        self._floor += self._dir
        self._pending.discard(self._floor)
        self._choose_direction()
        return self._floor

    def run_until_idle(self) -> list[int]:
        trace: list[int] = []
        while self._pending:
            trace.append(self.step())
        return trace

    def status(self) -> dict:
        return {
            "floor": self._floor,
            "direction": self._dir,
            "pending": sorted(self._pending),
        }
