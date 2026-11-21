class TrieNode:
    def __init__(self):
        self.children: dict[str, "TrieNode"] = {}
        self.is_end = False


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        # TODO
        pass

    def search(self, word: str) -> bool:
        # TODO
        pass

    def starts_with(self, prefix: str) -> bool:
        # TODO
        pass

    def autocomplete(self, prefix: str) -> list[str]:
        # TODO
        pass
