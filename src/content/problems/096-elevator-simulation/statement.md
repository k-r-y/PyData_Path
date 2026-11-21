Implement a deterministic single-car `Elevator(min_floor=1, max_floor=10, start_floor=1)` using the directional SCAN/LOOK policy.

### Rules & API
- `__init__`: validate `min_floor <= start_floor <= max_floor` (else raise `ValueError`). Starts with `direction = 0` (idle) and no pending requests.
- `request(floor: int) -> None`: validate `min_floor <= floor <= max_floor` (else `ValueError`). If already at `floor`, ignore as satisfied immediately; otherwise add to pending stops set.
- `step() -> int`: advance by 1 tick:
  - If no pending stops, remain idle (`direction = 0`) and return `floor`.
  - If idle (`direction == 0`), choose the nearest pending floor (breaking equal-distance ties **upward**), set `direction` toward it (`+1` or `-1`).
  - Move `floor += direction`, remove `floor` from pending if reached, and update `direction`: stay if stops remain ahead in current direction, reverse if only stops behind remain, or set `direction = 0` if none remain.
- `run_until_idle() -> list[int]`: call `step()` until pending stops is empty and return visited floor sequence.
- `status() -> dict`: return `{"floor": int, "direction": int, "pending": sorted_list}`.
