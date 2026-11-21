import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Download,
  FileCode2,
  Plus,
  Terminal as TerminalIcon,
  Trash2,
} from 'lucide-react';
import { db, getSetting, saveSetting } from '../../db/database';
import { extractErrorLine, getPlainLanguageErrorHint } from '../../runtime/errorHints';
import { pyodideRunner, type RunResult } from '../../runtime/runner';
import type { VirtualFileEntry } from '../../runtime/terminal.worker';
import { ProblemEditor, type EditorThemeMode } from '../problems/ProblemEditor';
import { TerminalPane } from '../terminal/TerminalPane';

const DEFAULT_PLAYGROUND_FILES: VirtualFileEntry[] = [
  {
    path: 'main.py',
    content: `# Free Python Playground (virtual filesystem: /workspace)
from helpers import summarize_numbers

samples = [14, 22, 19, 31, 28]
print("Summary:", summarize_numbers(samples))
`,
  },
  {
    path: 'helpers.py',
    content: `def summarize_numbers(values: list[float]) -> dict[str, float]:
    if not values:
        return {"count": 0, "total": 0.0, "mean": 0.0}
    total = sum(values)
    return {
        "count": len(values),
        "total": round(total, 4),
        "mean": round(total / len(values), 4),
    }
`,
  },
];

type PlaygroundBottomTab = 'output' | 'terminal';

export function PlaygroundPage() {
  const [files, setFiles] = useState<VirtualFileEntry[]>(DEFAULT_PLAYGROUND_FILES);
  const [activePath, setActivePath] = useState<string>('main.py');
  const [persistEnabled, setPersistEnabled] = useState<boolean>(true);
  const [bottomTab, setBottomTab] = useState<PlaygroundBottomTab>('terminal');
  const [terminalLoadSignal, setTerminalLoadSignal] = useState<number>(0);

  const [running, setRunning] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState<'idle' | 'loading' | 'running' | 'ready'>('idle');
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);

  const [fontSize, setFontSize] = useState(14);
  const [editorTheme, setEditorTheme] = useState<EditorThemeMode>('system');
  const [ligatures, setLigatures] = useState(false);

  const [newFileOpen, setNewFileOpen] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  const [newFileErr, setNewFileErr] = useState('');
  const [topHeightPct, setTopHeightPct] = useState(56);
  const splitRef = useRef<HTMLDivElement>(null);
  const newFileDialogRef = useRef<HTMLDialogElement>(null);
  const newFileTitleId = useId();
  const newFileInputId = useId();

  useEffect(() => {
    return pyodideRunner.subscribeStatus(setRuntimeStatus);
  }, []);

  // Load editor prefs and optional saved workspace files from IndexedDB
  useEffect(() => {
    let active = true;
    (async () => {
      const [sz, th, lig, persistPref, savedFiles] = await Promise.all([
        getSetting<number>('editorFontSize', 14),
        getSetting<EditorThemeMode>('editorTheme', 'system'),
        getSetting<boolean>('editorLigatures', false),
        getSetting<boolean>('playgroundPersist', true),
        db.playgroundFiles.toArray(),
      ]);
      if (!active) return;
      setFontSize(sz);
      setEditorTheme(th);
      setLigatures(lig);
      setPersistEnabled(persistPref);
      if (persistPref && savedFiles.length > 0) {
        const mapped = savedFiles
          .map((r) => ({ path: r.path, content: r.content }))
          .sort((a, b) => a.path.localeCompare(b.path));
        setFiles(mapped);
        setActivePath(mapped[0].path);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persistWorkspace = useCallback(
    async (nextFiles: VirtualFileEntry[]) => {
      if (!persistEnabled) return;
      const now = new Date().toISOString();
      await db.transaction('rw', db.playgroundFiles, async () => {
        await db.playgroundFiles.clear();
        await db.playgroundFiles.bulkPut(
          nextFiles.map((f) => ({ path: f.path, content: f.content, updatedAt: now }))
        );
      });
    },
    [persistEnabled]
  );

  const activeFile = useMemo(
    () => files.find((f) => f.path === activePath) ?? files[0] ?? DEFAULT_PLAYGROUND_FILES[0],
    [files, activePath]
  );

  const handleCodeChange = (nextCode: string) => {
    setErrorLine(null);
    setFiles((prev) => {
      const updated = prev.map((f) =>
        f.path === activeFile.path ? { ...f, content: nextCode } : f
      );
      persistWorkspace(updated).catch(() => {});
      return updated;
    });
  };

  const handleRunFile = async () => {
    if (running) return;
    setRunning(true);
    setErrorLine(null);
    setBottomTab('output');

    const datasetMap: Record<string, string> = {};
    for (const f of files) {
      if (!f.path.includes('/')) {
        datasetMap[f.path] = f.content;
      }
    }

    try {
      const res = await pyodideRunner.run(activeFile.content, {
        datasets: datasetMap,
        timeoutMs: 10000,
      });
      setRunResult(res);
      if (res.error) {
        setErrorLine(extractErrorLine(res.error));
      }
    } finally {
      setRunning(false);
    }
  };

  const handleLoadIntoTerminal = () => {
    setBottomTab('terminal');
    setTerminalLoadSignal((n) => n + 1);
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newFilename.trim().replace(/^\/+/, '');
    if (!cleaned || cleaned.includes('..')) {
      setNewFileErr('Enter a valid relative filename such as analysis.py');
      return;
    }
    if (files.some((f) => f.path === cleaned)) {
      setNewFileErr('A file with that name already exists.');
      return;
    }
    const created: VirtualFileEntry = {
      path: cleaned,
      content: cleaned.endsWith('.py') ? `# ${cleaned}\n` : '',
    };
    const next = [...files, created];
    setFiles(next);
    setActivePath(cleaned);
    persistWorkspace(next).catch(() => {});
    setNewFilename('');
    setNewFileErr('');
    setNewFileOpen(false);
    newFileDialogRef.current?.close();
  };

  const handleDeleteFile = (pathToDelete: string) => {
    if (files.length <= 1) return;
    const next = files.filter((f) => f.path !== pathToDelete);
    setFiles(next);
    if (activePath === pathToDelete) {
      setActivePath(next[0].path);
    }
    persistWorkspace(next).catch(() => {});
  };

  const handleExportWorkspace = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      files,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pydata-playground-files.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTogglePersist = async () => {
    const next = !persistEnabled;
    setPersistEnabled(next);
    await saveSetting('playgroundPersist', next);
    if (next) {
      await persistWorkspace(files);
    } else {
      await db.playgroundFiles.clear();
    }
  };

  const handleVfsSyncFromTerminal = useCallback(
    (vfsFiles: VirtualFileEntry[]) => {
      if (vfsFiles.length === 0) return;
      setFiles(vfsFiles);
      if (!vfsFiles.some((f) => f.path === activePath)) {
        setActivePath(vfsFiles[0].path);
      }
      persistWorkspace(vfsFiles).catch(() => {});
    },
    [activePath, persistWorkspace]
  );

  const handleDividerPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const container = splitRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const onMove = (ev: PointerEvent) => {
      const pct = ((ev.clientY - rect.top) / rect.height) * 100;
      setTopHeightPct(Math.min(78, Math.max(28, pct)));
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] min-h-[540px] bg-white dark:bg-[#09090b]">
      {/* Header Bar */}
      <header className="shrink-0 border-b border-neutral-200 dark:border-neutral-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 bg-neutral-50 dark:bg-[#0d0d0f]">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-neutral-950 dark:text-white tracking-tight">
            Python Playground
          </h1>
          <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
            Free multi-file sandbox &amp; REPL (not graded)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label className="inline-flex items-center gap-1.5 cursor-pointer text-neutral-600 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={persistEnabled}
              onChange={handleTogglePersist}
              className="rounded border-neutral-300 dark:border-neutral-700 accent-neutral-900 dark:accent-white"
            />
            <span>Save files locally</span>
          </label>

          <button
            type="button"
            onClick={handleExportWorkspace}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111113] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Export Files
          </button>
        </div>
      </header>

      {/* File Tabs Row */}
      <div className="shrink-0 flex items-center gap-1 px-3 py-1.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#111113] overflow-x-auto">
        {files.map((file) => {
          const isCurrent = file.path === activeFile.path;
          return (
            <div
              key={file.path}
              className={`inline-flex items-center gap-1 rounded-md border text-xs font-mono transition-colors ${
                isCurrent
                  ? 'border-neutral-900 dark:border-white bg-white dark:bg-[#09090b] text-neutral-950 dark:text-white font-semibold'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-[#16161a] text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              <button
                type="button"
                onClick={() => setActivePath(file.path)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1"
              >
                <FileCode2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{file.path}</span>
              </button>
              {files.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteFile(file.path)}
                  aria-label={`Delete ${file.path}`}
                  className="pr-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400"
                >
                  <Trash2 className="w-3 h-3" aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => {
            setNewFileErr('');
            setNewFileOpen(true);
            newFileDialogRef.current?.showModal();
          }}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 text-xs font-mono text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          New File
        </button>
      </div>

      {/* Main Vertical Split: Editor + Bottom Terminal/Output */}
      <div ref={splitRef} className="flex-1 min-h-0 flex flex-col">
        <div
          style={{ ['--pg-top-height' as string]: `${topHeightPct}%` }}
          className="h-[var(--pg-top-height)] min-h-[220px] flex flex-col"
        >
          <ProblemEditor
            code={activeFile.content}
            onChange={handleCodeChange}
            onRun={handleRunFile}
            onLoadIntoTerminal={handleLoadIntoTerminal}
            hideSubmit
            hideReset
            hideVisualize
            runLabel={`Run ${activeFile.path}`}
            running={running}
            runtimeStatus={runtimeStatus}
            errorLine={errorLine}
            fontSize={fontSize}
            onFontSizeChange={(sz) => {
              setFontSize(sz);
              saveSetting('editorFontSize', sz).catch(() => {});
            }}
            editorTheme={editorTheme}
            onEditorThemeChange={(m) => {
              setEditorTheme(m);
              saveSetting('editorTheme', m).catch(() => {});
            }}
            ligatures={ligatures}
            onLigaturesChange={(en) => {
              setLigatures(en);
              saveSetting('editorLigatures', en).catch(() => {});
            }}
          />
        </div>

        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize playground editor and terminal"
          aria-valuemin={28}
          aria-valuemax={78}
          aria-valuenow={Math.round(topHeightPct)}
          tabIndex={0}
          onPointerDown={handleDividerPointerDown}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              setTopHeightPct((v) => Math.max(28, v - 2));
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              setTopHeightPct((v) => Math.min(78, v + 2));
            }
          }}
          className="h-1.5 shrink-0 cursor-row-resize flex items-center justify-center bg-neutral-100 dark:bg-[#131316] hover:bg-neutral-300 dark:hover:bg-neutral-700 border-y border-neutral-200 dark:border-neutral-800"
        >
          <span className="h-0.5 w-8 rounded bg-neutral-400 dark:bg-neutral-600" aria-hidden="true" />
        </div>

        {/* Bottom Panel */}
        <div className="flex-1 min-h-[220px] flex flex-col bg-neutral-50 dark:bg-[#09090b]">
          <div className="flex items-center justify-between px-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f]">
            <div role="tablist" aria-label="Playground output and terminal" className="flex items-center gap-1">
              <button
                type="button"
                role="tab"
                id="pg-tab-terminal"
                aria-selected={bottomTab === 'terminal'}
                onClick={() => setBottomTab('terminal')}
                className={`px-3 py-2 font-mono text-[11px] font-medium border-b-2 flex items-center gap-1.5 ${
                  bottomTab === 'terminal'
                    ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <TerminalIcon className="w-3.5 h-3.5" aria-hidden="true" />
                Terminal (REPL &amp; Shell)
              </button>

              <button
                type="button"
                role="tab"
                id="pg-tab-output"
                aria-selected={bottomTab === 'output'}
                onClick={() => setBottomTab('output')}
                className={`px-3 py-2 font-mono text-[11px] font-medium border-b-2 flex items-center gap-1.5 ${
                  bottomTab === 'output'
                    ? 'border-neutral-950 dark:border-white text-neutral-950 dark:text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                Script Output
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 p-3 flex flex-col">
            <div
              role="tabpanel"
              aria-labelledby="pg-tab-terminal"
              hidden={bottomTab !== 'terminal'}
              className={bottomTab === 'terminal' ? 'flex-1 min-h-0 flex flex-col' : ''}
            >
              <TerminalPane
                active={bottomTab === 'terminal'}
                editorCode={activeFile.content}
                editorFilename={activeFile.path}
                vfsFiles={files}
                onVfsFilesChanged={handleVfsSyncFromTerminal}
                externalLoadSignal={terminalLoadSignal}
              />
            </div>

            <div
              role="tabpanel"
              aria-labelledby="pg-tab-output"
              hidden={bottomTab !== 'output'}
              className="flex-1 overflow-y-auto space-y-3"
            >
              {!runResult ? (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Press <strong>Run {activeFile.path}</strong> (Ctrl+Enter) to execute the active file, or use the <strong>Terminal</strong> tab for interactive Python REPL and simulated shell commands.
                </p>
              ) : (
                <>
                  {runResult.timedOut && (
                    <div className="rounded border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-2.5 text-xs text-amber-800 dark:text-amber-200">
                      Execution timed out after 10 s and the grading worker was reset.
                    </div>
                  )}
                  {runResult.error && (
                    <div className="space-y-2">
                      <pre className="font-mono text-[11px] whitespace-pre-wrap rounded border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 p-3 text-rose-800 dark:text-rose-200">
                        {runResult.error}
                      </pre>
                      <div className="rounded border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-2 text-xs text-amber-900 dark:text-amber-200">
                        <span className="font-semibold">What to check: </span>
                        {getPlainLanguageErrorHint(runResult.error)}
                      </div>
                    </div>
                  )}
                  <pre className="font-mono text-xs whitespace-pre-wrap rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0d0f] p-3 text-neutral-800 dark:text-neutral-200 min-h-24">
                    {runResult.stdout || '(No printed output.)'}
                  </pre>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New File Modal Dialog */}
      <dialog
        ref={newFileDialogRef}
        aria-labelledby={newFileTitleId}
        onClose={() => {
          if (newFileDialogRef.current) newFileDialogRef.current.returnValue = '';
          setNewFileOpen(false);
        }}
        className="m-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111113] p-5 w-[min(92vw,24rem)] shadow-xl text-neutral-900 dark:text-neutral-100"
      >
        {newFileOpen && (
          <form onSubmit={handleCreateFile} className="space-y-3">
            <h2 id={newFileTitleId} className="text-sm font-semibold">
              Create Virtual File
            </h2>
            <div className="space-y-1">
              <label htmlFor={newFileInputId} className="block text-xs text-neutral-600 dark:text-neutral-400">
                Filename (in /workspace)
              </label>
              <input
                id={newFileInputId}
                type="text"
                autoFocus
                value={newFilename}
                onChange={(e) => {
                  setNewFilename(e.target.value);
                  setNewFileErr('');
                }}
                placeholder="e.g. experiment.py or data.csv"
                className="w-full px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#09090b] font-mono text-xs"
              />
              {newFileErr && (
                <p role="alert" className="text-xs text-rose-600 dark:text-rose-400">
                  {newFileErr}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => newFileDialogRef.current?.close()}
                className="px-3 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-medium"
              >
                Create
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}
