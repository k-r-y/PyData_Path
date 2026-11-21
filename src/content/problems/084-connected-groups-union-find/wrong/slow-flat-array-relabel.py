class UnionFind:
    def __init__(self, n: int):
        self.comp = list(range(n))
        self.count = n

    def find(self, x: int) -> int:
        return self.comp[x]

    def union(self, a: int, b: int) -> bool:
        ca, cb = self.comp[a], self.comp[b]
        if ca == cb:
            return False
        for i in range(len(self.comp)):
            if self.comp[i] == cb:
                self.comp[i] = ca
        self.count -= 1
        return True

    def connected(self, a: int, b: int) -> bool:
        return self.comp[a] == self.comp[b]
