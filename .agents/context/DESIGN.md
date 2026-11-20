# DESIGN

## Principles
- Clean, calm, focused. Content first, minimal chrome.
- Clear hierarchy, generous spacing, readable code.
- Light and dark mode, following system preference with a manual toggle.
- Fully keyboard accessible, visible focus states, WCAG AA contrast, respects reduced motion.

## Layout
- Left sidebar: tracks and modules, progress rings. Collapsible on small screens.
- Lesson page: two panes on desktop. Left pane is theory (readable column, max about 70 characters wide). Right pane is the practice workspace (editor, run controls, output, tests). Stacked on mobile with tabs.
- Top bar: search, streak, theme toggle, settings.

## Typography
- UI: a clean system sans stack or Inter.
- Code: JetBrains Mono or Fira Code with optional ligatures toggle.

## Components to define
Lesson card, module card, progress ring, exercise container (shared header with type badge, hint ladder, attempts counter), test result list (pass, fail, with diff), output panel (tabs: Output, Errors, Plot, Table), source chip (shows verified or unverified), flashcard, Parsons block, simulator control panel (sliders, play, reset).

## Feedback style
- Errors: show the raw Python error, then a plain language hint on what to check. Do not give the fix directly.
- Success: concise, specific praise tied to the concept. No confetti overload.
- Status colors must not rely on color alone (add icons or text).

## Empty and loading states
Skeletons for lesson load, progress bar for Pyodide and package load, clear message when offline.