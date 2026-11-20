# ARCHITECTURE

## Stack (decisions, not facts about the libraries)
- React with Vite, TypeScript preferred (plain JS acceptable if simpler for the learner).
- Tailwind CSS v4 for styling.
- React Router for routing.
- Dexie (IndexedDB wrapper) for progress storage.
- Code editor: Monaco Editor or CodeMirror 6 (pick one, justify in the phase 1 report).
- Python runtime: Pyodide in a dedicated Web Worker.
- Markdown rendering: react-markdown with remark-gfm (or similar), plus syntax highlighting.
- Drag and drop for Parsons problems: dnd-kit or similar.
- Charts for simulators: Plotly.js or Chart.js on the JS side. Matplotlib output inside Pyodide is shown as an image.
- No backend. Content is static files in the repo.

## Folder structure
src/
  app/            routes, layout
  components/     shared UI
  features/
    lessons/      lesson renderer
    exercises/    one folder per exercise type
    visualizer/   step through tracer UI
    dataframe-lab/
    sql-lab/
    chart-lab/
    simulators/
    flashcards/
    dashboard/
    notes/
  runtime/
    pyodide.worker.ts   loads Pyodide, runs code, returns stdout, stderr, results, images
    runner.ts           main thread API: run(code, options), reset(), loadPackages()
    tracer.py           Python source used by the visualizer
    grader.ts           runs tests against learner code
  db/             Dexie schema and queries
  content/
    tracks/ a-foundations/, b-advanced/, c-analytics/
      <module-id>/
        module.json
        <lesson-id>.md        theory with frontmatter
        <lesson-id>.exercises.json
    datasets/     small CSV and SQLite files bundled with the app
    sources.json
    glossary.json
  styles/

## Python runtime design
- One Web Worker owns the Pyodide instance.
- Each run: reset the user namespace, execute the code, capture stdout and stderr, return a result object.
- Timeout (default 10 seconds): the main thread terminates the worker and creates a new one. Show a friendly message about possible infinite loops.
- Grading: learner code runs first, then test code runs in the same namespace. Hidden tests are never shown in the UI until the learner passes or unlocks the solution.
- Packages (numpy, pandas, matplotlib, scipy, scikit-learn, statsmodels) load on demand when a lesson declares them in frontmatter. Show a loading indicator because first load is large.
- Virtual file system: datasets are written into the Pyodide in memory file system before the run.
- input(): provide a modal prompt or a pre supplied inputs list per exercise.
- Network calls (for example the requests library) may not work in the browser runtime. Lessons on APIs must use bundled sample JSON responses and explain the difference.

## Matplotlib in the browser
Use a non interactive backend and return figures as PNG data URLs to display in the output panel. VERIFY the exact backend configuration in the Pyodide docs.

## Security notes
- User code only runs inside the worker (browser sandbox).
- Do not use eval or dangerouslySetInnerHTML on learner input. Sanitize rendered Markdown.

## Dev server
- Vite dev server. If a feature needs cross origin isolation headers, configure them in vite.config and document why.