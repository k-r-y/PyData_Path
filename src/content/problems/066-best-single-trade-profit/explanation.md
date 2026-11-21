---
problemId: P066
solutions:
  - { file: solutions/reference.py, label: "Single-pass running minimum tracker", time: "O(n)", space: "O(1)" }
---
## Approach
Explanation: Buying must precede selling chronologically, so tracking only global `max(prices) - min(prices)` fails whenever prices fall from high to low [src:python-tutorial]. Tracking the lowest price seen *so far* as you walk forward guarantees every `price - min_price` difference corresponds to a valid earlier-buy / later-sell pair in `O(n)` time and `O(1)` space [src:python-wiki-timecomplexity].

## Common mistakes
- Returning `max(prices) - min(prices)` without enforcing chronological buy-before-sell order.
- Nested quadratic loops checking all `(i < j)` pairs.

## Takeaways
- Keep a running prefix minimum whenever best future gain depends on the cheapest preceding entry.

## Related
P040, P067, lesson B8
