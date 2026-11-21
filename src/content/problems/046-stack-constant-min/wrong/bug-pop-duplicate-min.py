class MinStack:
    def __init__(self):
        self.s = []
        self.mins = []

    def push(self, val):
        self.s.append(val)
        if not self.mins or val < self.mins[-1]:
            self.mins.append(val)

    def pop(self):
        v = self.s.pop()
        if v == self.mins[-1]:
            self.mins.pop()
        return v

    def top(self):
        return self.s[-1]

    def get_min(self):
        return self.mins[-1]
