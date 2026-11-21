import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '../components/ThemeProvider';
import { Layout } from './Layout';
import { HomePage } from './HomePage';
import { getLessonById } from '../content/loader';
import { getProblemMetaBySlug } from '../content/problemLoader';

const LessonPage = lazy(() => import('./LessonPage').then((m) => ({ default: m.LessonPage })));
const ProblemListPage = lazy(() =>
  import('../features/problems/ProblemListPage').then((m) => ({ default: m.ProblemListPage }))
);
const ProblemWorkspacePage = lazy(() =>
  import('../features/problems/ProblemWorkspacePage').then((m) => ({
    default: m.ProblemWorkspacePage,
  }))
);
const SourcesPage = lazy(() => import('./SourcesPage').then((m) => ({ default: m.SourcesPage })));
const GlossaryPage = lazy(() => import('./GlossaryPage').then((m) => ({ default: m.GlossaryPage })));
const CheatSheetsPage = lazy(() =>
  import('./CheatSheetsPage').then((m) => ({ default: m.CheatSheetsPage }))
);
const FlashcardsPage = lazy(() =>
  import('../features/flashcards/FlashcardsPage').then((m) => ({ default: m.FlashcardsPage }))
);
const StepVisualizer = lazy(() =>
  import('../features/visualizer/StepVisualizer').then((m) => ({ default: m.StepVisualizer }))
);
const DashboardPage = lazy(() =>
  import('../features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const DataFrameLabPage = lazy(() =>
  import('../features/dataframe-lab/DataFrameLabPage').then((m) => ({
    default: m.DataFrameLabPage,
  }))
);
const SqlLabPage = lazy(() =>
  import('../features/sql-lab/SqlLabPage').then((m) => ({ default: m.SqlLabPage }))
);
const ChartLabPage = lazy(() =>
  import('../features/chart-lab/ChartLabPage').then((m) => ({ default: m.ChartLabPage }))
);
const SimulatorsPage = lazy(() =>
  import('../features/simulators/SimulatorsPage').then((m) => ({ default: m.SimulatorsPage }))
);
const ProjectsPage = lazy(() =>
  import('../features/projects/ProjectsPage').then((m) => ({ default: m.ProjectsPage }))
);
const ExportImportPage = lazy(() =>
  import('../features/settings/ExportImportPage').then((m) => ({ default: m.ExportImportPage }))
);

const ROUTE_META: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'PyData Path — Learn Python & Data Analytics in Your Browser',
    description:
      'An offline-first, hands-on Python and data analytics learning workspace powered by Pyodide WebAssembly.',
  },
  '/dashboard': {
    title: 'Learning Dashboard | PyData Path',
    description: 'Track completed lessons, exercise accuracy, active days, and skill mastery locally.',
  },
  '/problems': {
    title: 'Problem Solver | PyData Path',
    description: 'Practice Python and IS data problem solving in your browser with instant automated grading.',
  },
  '/dataframe-lab': {
    title: 'DataFrame Lab | PyData Path',
    description: 'Inspect CSV datasets and run pandas and NumPy code directly in your browser.',
  },
  '/sql-lab': {
    title: 'SQL Playground | PyData Path',
    description: 'Practice SQL queries against local datasets in your browser.',
  },
  '/chart-lab': {
    title: 'Chart Lab | PyData Path',
    description: 'Explore data visualizations and plotting workflows in Python.',
  },
  '/simulators': {
    title: 'Stats Simulators | PyData Path',
    description: 'Interactive probability and statistics simulators.',
  },
  '/visualizer': {
    title: 'Step Visualizer | PyData Path',
    description: 'Trace Python code execution line by line.',
  },
  '/flashcards': {
    title: 'Flashcards (SM-2) | PyData Path',
    description: 'Spaced-repetition flashcards for Python and data analytics concepts.',
  },
  '/projects': {
    title: 'EDA & Capstone Projects | PyData Path',
    description: 'Guided exploratory data analysis and capstone project checklists.',
  },
  '/cheatsheets': {
    title: 'Cheat Sheets | PyData Path',
    description: 'Quick-reference syntax guides for Python, pandas, NumPy, and SQL.',
  },
  '/glossary': {
    title: 'Glossary | PyData Path',
    description: 'Definitions for key Python and data analytics terminology.',
  },
  '/sources': {
    title: 'Cited Sources | PyData Path',
    description: 'Official documentation and references cited across PyData Path lessons.',
  },
  '/settings': {
    title: 'Settings & Backup | PyData Path',
    description: 'Export or import your local PyData Path progress and notes.',
  },
};

function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    let title = ROUTE_META['/'].title;
    let description = ROUTE_META['/'].description;

    const lessonMatch = pathname.match(/^\/lesson\/([^/]+)/);
    const problemMatch = pathname.match(/^\/problems\/([^/]+)/);
    if (lessonMatch) {
      const lesson = getLessonById(lessonMatch[1]);
      if (lesson) {
        title = `${lesson.frontmatter.title} | PyData Path`;
        description = `Interactive Python lesson: ${lesson.frontmatter.title} (${lesson.frontmatter.estimatedMinutes} min, ${lesson.frontmatter.difficulty}).`;
      }
    } else if (problemMatch) {
      const prob = getProblemMetaBySlug(problemMatch[1]);
      if (prob) {
        title = `${prob.id}: ${prob.title} | PyData Path`;
        description = `Solve ${prob.title} (${prob.difficulty}, ${prob.estimatedMinutes} min) in Python.`;
      }
    } else if (ROUTE_META[pathname]) {
      title = ROUTE_META[pathname].title;
      description = ROUTE_META[pathname].description;
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }, [pathname]);

  return null;
}

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh] font-mono text-xs uppercase tracking-[0.14em] text-neutral-400">
      Loading workspace…
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <RouteMeta />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/lesson/:lessonId" element={<LessonPage />} />
              <Route path="/problems" element={<ProblemListPage />} />
              <Route path="/problems/:slug" element={<ProblemWorkspacePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/visualizer" element={<StepVisualizer />} />
              <Route path="/dataframe-lab" element={<DataFrameLabPage />} />
              <Route path="/sql-lab" element={<SqlLabPage />} />
              <Route path="/chart-lab" element={<ChartLabPage />} />
              <Route path="/simulators" element={<SimulatorsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/cheatsheets" element={<CheatSheetsPage />} />
              <Route path="/glossary" element={<GlossaryPage />} />
              <Route path="/sources" element={<SourcesPage />} />
              <Route path="/settings" element={<ExportImportPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
