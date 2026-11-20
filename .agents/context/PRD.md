# PRD: PyData Path

## Purpose
A localhost web app for one learner (an IS student) to learn Python from beginner to advanced, then apply it to data analytics, through theory lessons and heavy hands on practice.

## Target user
- 3rd year Information Systems student, beginner in Python, some Java, PHP, HTML, CSS, basic JS.
- Goal: use Python for data analytics and build a portfolio.

## Goals
1. Teach concepts accurately with credible, cited sources.
2. Make practice the main activity: every lesson has runnable, auto checked exercises.
3. Support deliberate learning habits (try first, hint ladder, spaced review, no AI mode).
4. Run fully offline after first load where possible, on localhost.

## Non goals
- No user accounts, no cloud sync, no payments, no multi user features.
- No server side execution of user code.
- Not a replacement for the official docs; it links to them.

## Learning tracks
- Track A: Python Foundations (beginner)
- Track B: Python Intermediate and Advanced
- Track C: Data Analytics with Python
(Full module list in CURRICULUM.md.)

## Core features
### Lesson experience
- Theory page with sections: Concept, Why it matters, Worked example, Common mistakes, Sources.
- Every factual claim section has a source reference.
- Estimated time, prerequisites, learning objectives per lesson.

### Interactive practice types
1. Code exercise: editor, Run button, visible tests, hidden tests, output panel.
2. Predict the output: learner types expected output before running; app then runs and compares.
3. Fill in the blanks: code with gaps.
4. Parsons problem: drag and reorder shuffled code lines (and fix indentation).
5. Debug the bug: broken code, learner fixes it, tests verify.
6. Multiple choice and multi select quizzes with explanations.
7. Flashcards with spaced repetition (SM-2 algorithm).
8. Step through visualizer: shows variables line by line (built with Python tracing in the worker).
9. SQL playground: SQLite in browser with sample databases and graded queries.
10. DataFrame lab: upload a CSV or choose a sample dataset, view and filter a table, run pandas code against it.
11. Chart lab: build charts from a dataset, compare code output to a target chart.
12. Statistics simulators: sampling distribution and central limit theorem, confidence interval coverage, p value and hypothesis test visualizer, correlation vs outliers, regression line fitting.
13. Mini projects with rubrics (checklist self assessment plus automated checks).
14. Capstone: guided end to end analysis with a written findings section.

### Learning habit tools
- Try first timer: hints unlock after a set time or number of attempts.
- Hint ladder: 3 levels (nudge, approach, near solution). Full solution unlocks last and is logged.
- No AI mode toggle: marks an exercise as completed unaided; tracked in stats.
- Notes panel per lesson (Markdown, own words).
- Bookmarks and a "stuck list" for items to revisit.
- Reflection prompt at lesson end: "Explain this in your own words."

### Progress and motivation
- Dashboard: completion by track, streak, time spent, accuracy, weak topics.
- Mastery levels per skill (not started, practicing, comfortable, mastered) based on attempts and review results.
- Export and import progress as a JSON file.

### Reference tools
- Searchable cheat sheet per module.
- Glossary with term links.
- Sources page listing every source used with its verified status.

## Build phases
- Phase 1 (MVP): app shell, routing, lesson renderer, Pyodide worker, code exercise with tests, progress storage, Track A modules A1 to A3 content.
- Phase 2: quizzes, predict the output, fill in the blanks, Parsons, debug exercises, notes, hint ladder, flashcards with SM-2.
- Phase 3: step through visualizer, dashboard, cheat sheets, glossary, finish Tracks A and B content.
- Phase 4: DataFrame lab, SQL playground, chart lab, Track C modules C1 to C8.
- Phase 5: statistics simulators, EDA project flow, Track C modules C9 to C14, capstone.
- Phase 6: polish, accessibility pass, performance, export and import.

## Acceptance criteria (MVP)
- npm run dev opens the app on localhost.
- A learner can open a lesson, write Python, run it, see output or errors, and see tests pass or fail.
- An infinite loop does not freeze the page (worker timeout and restart).
- Progress persists after a browser refresh.
- Every lesson shows its sources with verified status.