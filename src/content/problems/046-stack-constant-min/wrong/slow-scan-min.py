class MinStack:
    def __init__(self):
        self.s = []

    def push(self, val):
        self.s.append(val)

    def pop(self):
        return self.s.pop()

    def top(self):
        return self.s[-1]

    def get_min(self):
        return min(self.s)
