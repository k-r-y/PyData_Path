class MedianTracker:
    def __init__(self):
        self.vals = []

    def add(self, num):
        self.vals.append(num)

    def median(self):
        if not self.vals:
            raise ValueError("empty")
        s = sorted(self.vals)
        n = len(s)
        if n % 2 == 1:
            return float(s[n // 2])
        return (s[n // 2 - 1] + s[n // 2]) / 2.0
