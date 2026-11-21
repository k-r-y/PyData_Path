When rotating support engineer shifts forward by `k` slots each sprint, items at the end wrap cleanly to the front.

Write `rotate_right(items: list, k: int) -> list` that returns a **new** list rotated right by `k` positions without mutating `items`.

### Rules
- Support `k == 0`, `k > len(items)`, and negative `k` (rotating left).
- An empty list always returns `[]`.
