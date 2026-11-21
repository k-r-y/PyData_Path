---
problemId: P068
solutions:
  - { file: solutions/reference.py, label: "Recursive flatten + setdefault tree builder", time: "O(keys * depth)", space: "O(keys * depth)" }
---
## Approach
Explanation: Recursive traversal accumulates the dotted key path until hitting any non-dict leaf [src:python-tutorial]. When rebuilding in `unflatten_dict`, `node.setdefault(part, {})` retrieves existing branch dicts if siblings already created them or allocates a fresh empty dict otherwise, ensuring `"db.host"` and `"db.port"` merge under `root["db"]` instead of overwriting one another [src:python-stdtypes-docs].

## Common mistakes
- Writing `root[parent] = {child: val}`, overwriting earlier sibling keys under the same parent.
- Hardcoding only depth 2 loops instead of supporting arbitrary nesting depth.

## Takeaways
- `dict.setdefault(key, {})` concisely constructs shared nested sub-dictionaries without overwriting sibling branches.

## Related
P035, P050, lesson A6
