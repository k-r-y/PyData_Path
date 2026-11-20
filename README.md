# PyData Path

An offline-first, hands-on **Python and Data Analytics** learning workspace that runs real Python directly in your browser via WebAssembly (Pyodide). Every lesson pairs concise, source-cited theory with an interactive IDE, live test grading, and local-first progress tracking.

---

## Key Features

### Learning & Interactive IDE
- **3 Curriculum Tracks**:
  - **Track A (`a-foundations`)**: Python syntax, variables, types, control flow, functions, data structures, comprehensions, exceptions, and file I/O.
  - **Track B (`b-advanced`)**: Modules & packages, OOP, iterators & generators, closures & decorators, context managers, type hints, testing & debugging, algorithms, and standard library.
  - **Track C (`c-analytics`)**: Analytics process, SQL with SQLite, NumPy, pandas basics, data cleaning, and exploratory workflows.
- **Split-Pane Lesson Workspace (`/lesson/:lessonId`)**:
  - Independently scrollable **Theory** pane and **Interactive IDE** pane with a full-width IDE expand toggle.
  - **CodeMirror 6** Python editor with syntax highlighting, autocompletion, and keyboard shortcuts:
    - `⌘↵` (`Ctrl+Enter`): **Run & Check** (executes code + visible & hidden grading tests).
    - `⌘⇧↵` (`Ctrl+Shift+Enter`): **Run Only** (executes code without grading).
  - **Terminal Drawer** with `Output`, `Errors` (plain-language debugging hints via `errorHints.ts`), `Tests`, and `Stdin` (pre-supplied `input()` values, one per line), plus **Copy** and **Clear** actions.
  - **Copyable Code Blocks**: Every fenced code block in lessons includes a one-click **Copy** button.
  - **Markdown Notes**: Built-in *"Explain this in your own words"* reflection panel per lesson, saved locally.

### Practice Labs & Reference Tools
- **DataFrame Lab (`/dataframe-lab`)**: Inspect synthetic CSVs or upload local CSV files and run `pandas` / `numpy` code in Pyodide.
- **SQL Playground (`/sql-lab`)**: Interactive SQL practice environment.
- **Chart Lab (`/chart-lab`)**: Data visualization exploration.
- **Step Visualizer (`/visualizer`)**: Step-by-step Python execution tracing.
- **Stats Simulators (`/simulators`)**: Interactive statistics simulations.
- **Flashcards (`/flashcards`)**: Spaced-repetition (SM-2) review decks.
- **EDA & Capstone Projects (`/projects`)**: Guided project checklists and writeups.
- **Cheat Sheets (`/cheatsheets`)**, **Glossary (`/glossary`)**, and **Cited Sources (`/sources`)**.

### UI, UX & Local-First Storage
- **Swiss Technical-Editorial Design**: High-contrast monochrome palette (`#FFFFFF` / `#09090B`), `1px` structural hairlines, `tabular-nums` telemetry, interactive 3D stippled particle geometry (`ParticleKnot`), and light/dark mode support.
- **Command Palette (`⌘K` / `Ctrl+K`)**: Native `<dialog>` modal to jump to any lesson, lab, or theme toggle.
- **100% Local Persistence (IndexedDB via Dexie)**: Stores `progress`, `attempts`, `mastery`, `flashcards`, `notes`, `bookmarks`, `settings`, `streaks`, and `projects` in browser IndexedDB, with full JSON backup/restore on `/settings`.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | React, TypeScript, Vite |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) |
| **Routing** | `react-router-dom` (`BrowserRouter`) |
| **Python Runtime** | `pyodide` (Web Worker + local `/pyodide/` core assets + jsDelivr `packageBaseUrl` for `numpy`/`pandas`) |
| **Code Editor** | `@uiw/react-codemirror`, `@codemirror/lang-python`, `@codemirror/theme-one-dark`, `@codemirror/view` |
| **Local Database** | `dexie` (IndexedDB) |
| **Markdown & Icons** | `react-markdown`, `remark-gfm`, `lucide-react` |

---

## Project Structure

```text
├── index.html                  # Document shell & color-scheme meta
├── vite.config.ts              # Vite config + pyodideAssetsPlugin (/pyodide/ serving & bundling)
├── package.json
└── src/
    ├── app/                    # Route pages & layout shell
    │   ├── App.tsx             # Router configuration
    │   ├── Layout.tsx          # Sticky header, collapsible accordion sidebar, ⌘K palette
    │   ├── HomePage.tsx        # Split architectural hero & curriculum index
    │   ├── LessonPage.tsx      # Two-pane theory + IDE workspace
    │   ├── CheatSheetsPage.tsx
    │   ├── GlossaryPage.tsx
    │   └── SourcesPage.tsx
    ├── components/             # Shared UI primitives
    │   ├── CommandPalette.tsx  # Native <dialog> ⌘K quick-jump modal
    │   ├── ParticleKnot.tsx    # Interactive 3D stippled canvas (3 morphable forms)
    │   ├── ProgressRing.tsx
    │   ├── SourceChip.tsx
    │   └── ThemeProvider.tsx
    ├── content/                # Curriculum tracks, datasets, glossary, sources, loader
    ├── db/
    │   └── database.ts         # Dexie IndexedDB schema & progress helpers
    ├── features/               # Feature modules (exercises, lessons, labs, dashboard, settings)
    ├── runtime/                # Pyodide Web Worker, runner, grader, error hints, tracer
    ├── styles/
    │   └── index.css           # Tailwind v4, CSS tokens, spring easing, reduced-motion rules
    └── types/
        └── content.ts
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and `npm`

### Install & Run Locally

```bash
npm install
npm run dev
```

### Build & Preview Production Bundle

```bash
npm run build
npm run preview
```

During `npm run build`, `vite.config.ts` (`pyodideAssetsPlugin`) copies the core Pyodide runtime files from `node_modules/pyodide` into `dist/pyodide/` so core Python executes locally without external runtime requests. Optional scientific packages (`numpy`, `pandas`) are fetched on demand from the matching Pyodide CDN (`packageBaseUrl`).

---

## Deploying to Vercel & SEO Checklist

Because the app uses `BrowserRouter`, configure Vercel and SEO assets before publishing:

1. **Add `vercel.json`** at the project root so deep links (e.g., `/lesson/...`, `/dataframe-lab`) rewrite to `/index.html` without intercepting `/pyodide/*` or `/assets/*`:
   ```json
   {
     "rewrites": [
       { "source": "/((?!pyodide/|assets/|robots\\.txt|sitemap\\.xml).*)", "destination": "/index.html" }
     ],
     "headers": [
       {
         "source": "/(assets|pyodide)/(.*)",
         "headers": [
           { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
         ]
       }
     ]
   }
   ```
2. **Vercel Build Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **SEO & Social Previews**:
   - Add `<meta name="description">`, `<link rel="canonical">`, Open Graph (`og:*`), Twitter Card tags, and JSON-LD `Course` structured data in `index.html`.
   - Create `public/robots.txt`, `public/sitemap.xml`, `public/favicon.svg`, and an Open Graph preview image.
   - Update `document.title` and meta descriptions dynamically per route (e.g., in `LessonPage.tsx`).
   - Use `React.lazy()` + `<Suspense>` on heavy lab routes (`DataFrameLabPage`, `SqlLabPage`, `ChartLabPage`, `StepVisualizer`) to reduce initial bundle size and improve Core Web Vitals.
