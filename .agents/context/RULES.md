# RULES

## Content integrity (highest priority)
1. Never invent facts, function names, parameters, package names, versions, config keys, or URLs. If unsure, write TODO_VERIFY and tell the user.
2. Every technical claim in a lesson must be traceable to a source in sources.json. Mark it with [src:id].
3. Separate fact from explanation. Analogies, mental models, and opinions start with "Explanation:" and are not presented as sourced facts.
4. Write all lesson text in original wording. Do not copy passages from books, docs, or courses. Short code examples may be adapted but must be re-written and tested.
5. Every code example in a lesson must be executed in the app's Pyodide runtime before it is considered done. Record the Python and library versions in the lesson footer.
6. Flag version sensitive content with a visible note: "Behavior may differ between versions. Check the official docs for your installed version."
7. Respect licenses. Link to books and courses; do not reproduce their text, exercises, or figures. Record the license of each source (UNKNOWN if not confirmed).
8. All sources start with verified: false. Only the user changes it to true after personally opening the source and confirming the claim.

## Source priority
1. Official documentation and standards (Python docs, library docs, PEPs).
2. Open textbooks by recognized authors or publishers.
3. University or recognized course material.
4. Reputable tutorials (secondary, never the only source for a claim).
No random blogs, forums, or AI generated pages as sources.

## Pedagogy
- Order: concept, example, guided practice, independent practice, review.
- Each lesson: 3 to 6 objectives max, 4 to 8 exercises mixing types, at least 1 predict or debug item, at least 2 flashcards.
- Difficulty ramps inside each lesson and across modules.
- Hints never reveal the full answer before level 3.
- Tests check behavior, not exact code style, except in style lessons.
- Include at least one real world IS flavored scenario per module (inventory, sales, enrollment, attendance, and so on) using synthetic or properly licensed data.

## Data and datasets
- Prefer small synthetic datasets generated for the app (document how they were generated).
- Real datasets only from credible open sources with a recorded license. Do not bundle data with unclear licensing.
- Never include personal or sensitive real data.

## Code quality
- Small components, clear names, comments on non obvious logic.
- Handle errors in the runtime layer; never crash the whole app on a learner code error.
- No dependencies without a stated reason. List all dependencies and versions after each phase.
- No secrets, no analytics, no external API calls at runtime except loading Pyodide and its packages (document how to run fully offline if feasible).

## Accessibility
Keyboard navigation for all exercise types (including a keyboard alternative for drag and drop), semantic HTML, ARIA labels on custom widgets.

## Style of text
No emojis. No em dashes or en dashes. Plain, direct language aimed at a beginner.

## Reporting
After each phase give: what was built, how to test it, known gaps, dependency list with versions, and anything marked TODO_VERIFY.