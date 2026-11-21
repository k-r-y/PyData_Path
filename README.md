# PyData Path

An offline-first, hands-on **Python and Data Analytics** learning workspace that runs real Python directly in your browser via WebAssembly (Pyodide). Combines a structured 3-track curriculum, a 100-problem LeetCode-style Problem Solver, a multi-file Playground, and a Timed Exam mode with 100% local-first persistence.

---

## Key Features

### 1. Problem Solver (`/problems`, `/problems/:slug`)
- **100 Original Problems (`P001`–`P100`)** spanning Easy (30), Medium (40), Hard (20), and Challenge (10) tiers, plus **5 Curated Study Plans** (`src/content/plans.json`).
- **Resizable Split-Pane Workspace**:
  - **Left Pane**: `Description`, `Hints` (3-level progressive unlock), `Explanation` (gated until solved or revealed, with time/space complexity), `Notes` (Markdown + bookmark/stuck toggles), and `Submissions` (restore/diff previous attempts).
  - **Right Top (CodeMirror 6 IDE)**: Python syntax highlighting, auto-indent, bracket matching, find/replace, keyword/builtin/in-file autocompletion, traceback error-line highlighting, light/dark themes, font size & ligatures settings, and autosaved drafts.
    - `Mod+Enter`: **Run** (visible tests + optional custom input).
    - `Mod+Shift+Enter`: **Submit** (visible + hidden tests, saves submission, triggers SM-2 review prompt).
  - **Right Bottom**: `Tests` (with plain-language `errorHints.ts` explanations), `Output`, and a dedicated **Terminal** tab.
- **Step-Through Execution Visualizer**: Traces up to 200 execution steps (`tracer.py`) with live variable inspection.
- **SM-2 Spaced Repetition Queue**: Rate solved problems (`Hard`, `Good`, `Easy`) to schedule review reminders in the navigation badge.

### 2. Free-Use Terminal & Multi-File Playground (`/playground`)
- **Dedicated Terminal Web Worker** (`xterm.js` + `pyodide.console.PyodideConsole`): Lazy-loaded on first open so infinite loops never block grading.
- **Simulated Shell & Virtual Filesystem (`/workspace`)**: Toggle between Python REPL and simulated shell (`ls`, `cd`, `cat`, `mkdir`, `touch`, `rm`, `echo`, `python file.py`, `python -c`, `pip list`, `pip install` via `micropip`).
- **Cross-Origin Isolation (`COOP`/`COEP`)**: Uses `SharedArrayBuffer` for blocking `input()` and `Ctrl+C` interrupts when `crossOriginIsolated` is active, with an automatic queued-stdin fallback.
- **Multi-File Playground (`/playground`)**: Edit multiple Python/data files backed by `/workspace` with optional IndexedDB persistence and JSON export.

### 3. Timed Exam Mode (`/exam`)
- Configure custom or preset timed problem sets with a live countdown timer, problem switcher, and lockdown mode (hides hints, explanations, visualizer, and terminal until submission).

### 4. Structured Curriculum & Interactive Labs
- **3 Curriculum Tracks**:
  - **Track A (`a-foundations`)**: Python syntax, variables, control flow, functions, data structures, comprehensions, exceptions, and file I/O.
  - **Track B (`b-advanced`)**: Modules, OOP, iterators/generators, decorators, context managers, type hints, testing, algorithms, and stdlib.
  - **Track C (`c-analytics`)**: Analytics process, SQLite, NumPy, pandas, data cleaning, and exploratory workflows.
- **Labs & Tools**: DataFrame Lab (`/dataframe-lab`), SQL Playground (`/sql-lab`), Chart Lab (`/chart-lab`), Step Visualizer (`/visualizer`), Stats Simulators (`/simulators`), Flashcards (`/flashcards`), Projects (`/projects`), Cheat Sheets (`/cheatsheets`), Glossary (`/glossary`), and Cited Sources (`/sources`).

### 5. Local-First Persistence
- **IndexedDB via Dexie** (`src/db/database.ts`): Stores progress, submissions, drafts, notes, bookmarks, flashcards, playground files, exam sessions, and settings locally, with v2 JSON export/import on `/settings`.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | React, TypeScript, Vite |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) |
| **Routing** | `react-router-dom` (`BrowserRouter`) |
| **Python Runtime** | `pyodide` (Web Workers + local `/pyodide/` assets + jsDelivr for `numpy`/`pandas`) |
| **Code Editor** | `@uiw/react-codemirror`, `@codemirror/lang-python`, `@codemirror/autocomplete`, `@codemirror/search` |
| **Terminal** | `@xterm/xterm`, `@xterm/addon-fit` |
| **Local Database** | `dexie` (IndexedDB) |
| **Markdown & Icons** | `react-markdown`, `remark-gfm`, `lucide-react` |

---

## Getting Started

### Prerequisites
- Node.js 18+ and `npm`

### Install & Run Locally

```bash
npm install
npm run dev
```

### Verify Problems & Build

```bash
npm run verify:problems
npm run build
npm run preview
```

During `npm run build`, `vite.config.ts` copies core Pyodide assets into `dist/pyodide/` so Python runs locally without external runtime requests.

---

## Project Structure

```text
├── index.html                  # Document shell & color-scheme meta
├── vite.config.ts              # Vite config, COOP/COEP headers, virtual:problems-meta
├── vercel.json                 # SPA rewrites & COOP/COEP/CORP headers
├── scripts/
│   ├── verify-problems.mjs     # Verifies all 100 problems + lesson exercises in Pyodide
│   └── verify-worker.mjs       # Node worker_threads Pyodide runner
└── src/
    ├── app/                    # Route shell, Layout, HomePage, LessonPage, reference pages
    ├── components/             # Shared UI (CommandPalette, ParticleKnot, ProgressRing, ThemeProvider)
    ├── content/                # Curriculum tracks, 100 problems, plans.json, glossary, sources
    ├── db/                     # Dexie IndexedDB schema & progress helpers
    ├── features/               # problems, playground, exam, exercises, labs, dashboard, settings
    ├── runtime/                # Pyodide workers, runner, terminalSession, grader, errorHints, tracer
    ├── styles/                 # Tailwind v4 & CSS tokens
    └── types/                  # TypeScript definitions
```

---

## Contributing & License

- Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
- Licensed under the [MIT License](LICENSE).
