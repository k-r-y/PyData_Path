class TwoStackQueue:
    def __init__(self):
        self.s1 = []
        self.s2 = []

    def enqueue(self, item):
        while self.s1:
            self.s2.append(self.s1.pop())
        self.s1.append(item)
        while self.s2:
            self.s1.append(self.s2.pop())

    def dequeue(self):
        return self.s1.pop()

    def peek(self):
        return self.s1[-1]

    def is_empty(self):
        return not self.s1
