# Contributing to PyData Path

Thank you for your interest in contributing to PyData Path.

## Development Setup

```bash
npm install
npm run dev
```

Before opening a pull request, verify both the TypeScript/Vite build and the problem/lesson test suite:

```bash
npm run verify:problems
npm run build
```

## Adding or Editing Problems

Problems live under `src/content/problems/<3digit>-<slug>/` with:
- `problem.json` — metadata, tags, `entry`, `tests.visible`, `tests.hidden`, `hints`, and `sources`
- `statement.md` — problem statement in Markdown
- `starter.py` — starter code template
- `solutions/reference.py` — canonical reference solution (and optional alternatives)
- `wrong/` — intentionally buggy or slow solutions that must fail verification (never bundled in production builds)
- `explanation.md` — frontmatter (`problemId`, `solutions` with `time`/`space`) + `## Approach` starting with `Explanation:`

### Content & Quality Rules
- No emojis, em dashes, or en dashes in problem content or UI copy.
- Cite only source IDs declared in `src/content/sources.json` using `[src:<id>]`.
- Every `wrong/` file must fail at least one test; files named with `brute`, `slow`, or `tle` must fail via `Time Limit Exceeded`.
- Run `node scripts/verify-problems.mjs <id>` to verify an individual problem quickly, or `npm run verify:problems` for the full suite.

## Pull Request Checklist
- `npm run verify:problems` passes with 0 errors.
- `npm run build` completes cleanly.
- New UI controls follow keyboard navigation and accessibility standards (`aria-label`, focus states, `role="status"` live regions).
