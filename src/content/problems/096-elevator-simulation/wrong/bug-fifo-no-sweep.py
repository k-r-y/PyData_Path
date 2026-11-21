from collections import deque


class Elevator:
    def __init__(self, min_floor=1, max_floor=10, start_floor=1):
        self.min_f = min_floor
        self.max_f = max_floor
        self.floor = start_floor
        self.dir = 0
        self.q = deque()

    def request(self, floor: int) -> None:
        if not (self.min_f <= floor <= self.max_f):
            raise ValueError("oob")
        if floor != self.floor and floor not in self.q:
            self.q.append(floor)

    def step(self) -> int:
        if not self.q:
            self.dir = 0
            return self.floor
        target = self.q[0]
        self.dir = 1 if target > self.floor else -1
        self.floor += self.dir
        if self.floor == target:
            self.q.popleft()
        if not self.q:
            self.dir = 0
        return self.floor

    def run_until_idle(self) -> list[int]:
        out = []
        while self.q:
            out.append(self.step())
        return out

    def status(self) -> dict:
        return {"floor": self.floor, "direction": self.dir, "pending": list(self.q)}
