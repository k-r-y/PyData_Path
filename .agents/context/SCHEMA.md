# SCHEMA

## Content files

### module.json
{
  "id": "c4-pandas-basics",
  "track": "c-analytics",
  "title": "pandas Basics",
  "order": 4,
  "summary": "string",
  "prerequisites": ["a6-data-structures", "c3-numpy"],
  "lessons": ["c4-l1-series-dataframe", "c4-l2-selecting-data"],
  "packages": ["numpy", "pandas"]
}

### Lesson markdown frontmatter
id, moduleId, title, order, estimatedMinutes, difficulty (beginner|intermediate|advanced),
objectives: string[], prerequisites: string[], packages: string[],
sources: string[] (ids from sources.json), tags: string[]

Lesson body uses these H2 sections in order: Concept, Why it matters, Worked example, Common mistakes, Check your understanding, Sources.
Claims that come from a source are followed by a source marker like [src:python-tutorial]. Analogies or opinions are marked with the label "Explanation:" at the start of the paragraph.

### Exercise file (<lesson-id>.exercises.json): array of exercises
Common fields: id, type, title, prompt, difficulty, concepts: string[], points, hints: [string, string, string], solution, explanation, sources: string[]

Types and extra fields:
- code: starterCode, visibleTests: string (Python assert code), hiddenTests: string, inputs?: string[], datasets?: string[], timeoutSeconds?
- predict: code, expectedOutput
- fillblank: codeWithBlanks (use {{1}}, {{2}}), answers: { "1": ["acceptable", "answers"] }
- parsons: lines: string[] (correct order, with indentation), distractors?: string[]
- debug: brokenCode, visibleTests, hiddenTests, bugDescription (hidden until solved)
- quiz: questions: [{ question, options: string[], correct: number[], explanation }]
- flashcard: front, back, deckId
- sql: schemaDataset, question, expectedResult (ordered or unordered flag), starterQuery
- dataframe: dataset, task, checkCode
- chart: dataset, targetDescription, checkCode
- simulator: simulatorId, parameters, guidedQuestions: string[]
- project: brief, steps: string[], rubric: [{ criterion, weight }], autoChecks?: string

### sources.json: array
{
  "id": "python-tutorial",
  "title": "The Python Tutorial",
  "author": "Python Software Foundation",
  "publisher": "docs.python.org",
  "url": "string",
  "type": "official-docs | book | course | dataset | standard",
  "license": "string or UNKNOWN",
  "versionOrEdition": "string",
  "accessedOn": "YYYY-MM-DD or null",
  "verified": false,
  "notes": "string"
}

### glossary.json: array
{ "term": "string", "definition": "string", "sourceIds": ["string"], "relatedLessons": ["string"] }

## IndexedDB (Dexie) tables
- progress: lessonId (pk), status (not_started|in_progress|completed), startedAt, completedAt, timeSpentSeconds
- attempts: ++id, exerciseId, lessonId, timestamp, passed, code, hintsUsed, solutionViewed, noAiMode, durationSeconds
- mastery: conceptTag (pk), level (0 to 3), correct, incorrect, lastPracticed
- flashcards: cardId (pk), deckId, ease, intervalDays, repetitions, dueDate, lastReviewed
- notes: lessonId (pk), markdown, updatedAt
- bookmarks: id, lessonId, exerciseId?, reason, createdAt
- settings: key (pk), value (theme, editorFontSize, timeoutSeconds, hintDelaySeconds, noAiDefault)
- streaks: date (pk), minutes, exercisesCompleted
- projects: projectId (pk), checklistState, writeup, updatedAt

## Export format
Single JSON file: { version, exportedAt, tables: { ... } }. Import validates version and merges or replaces on user choice.