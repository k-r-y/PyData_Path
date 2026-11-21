class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word: str) -> None:
        cur = self.root
        for c in word:
            cur = cur.setdefault(c, {})
        cur["_end"] = True

    def search(self, word: str) -> bool:
        return self.starts_with(word)

    def starts_with(self, prefix: str) -> bool:
        cur = self.root
        for c in prefix:
            if c not in cur:
                return False
            cur = cur[c]
        return True

    def autocomplete(self, prefix: str) -> list[str]:
        return []
