import { useEffect, useId, useMemo, useRef, useState } from 'react';
import CodeMirror, { type ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { indentUnit } from '@codemirror/language';
import { toggleComment } from '@codemirror/commands';
import { openSearchPanel, search, searchKeymap } from '@codemirror/search';
import { oneDark } from '@codemirror/theme-one-dark';
import { StateEffect, StateField } from '@codemirror/state';
import { Decoration, type DecorationSet, EditorView, keymap } from '@codemirror/view';
import {
  Play,
  Send,
  RotateCcw,
  Eye,
  Search,
  Settings,
  Sun,
  Moon,
  Monitor,
  Loader2,
  Check,
} from 'lucide-react';
import { useTheme } from '../../components/ThemeProvider';

export type EditorThemeMode = 'system' | 'light' | 'dark';

export interface ProblemEditorProps {
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onSubmit: () => void;
  onResetConfirm: () => void;
  onVisualize?: () => void;
  running: boolean;
  runtimeStatus: 'idle' | 'loading' | 'running' | 'ready';
  errorLine?: number | null;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  editorTheme: EditorThemeMode;
  onEditorThemeChange: (mode: EditorThemeMode) => void;
  ligatures: boolean;
  onLigaturesChange: (enabled: boolean) => void;
  draftSavedAt?: string | null;
  examMode?: boolean;
}

const setErrorLineEffect = StateEffect.define<number | null>();

const errorLineDecoration = Decoration.line({
  attributes: { class: 'cm-error-line' },
});

const errorLineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    if (tr.docChanged) {
      decorations = decorations.map(tr.changes);
    }
    for (const effect of tr.effects) {
      if (effect.is(setErrorLineEffect)) {
        const lineNum = effect.value;
        if (!lineNum || lineNum < 1 || lineNum > tr.state.doc.lines) {
          return Decoration.none;
        }
        const line = tr.state.doc.line(lineNum);
        return Decoration.set([errorLineDecoration.range(line.from)]);
      }
    }
    return decorations;
  },
  provide: (field) => EditorView.decorations.from(field),
});

export function ProblemEditor({
  code,
  onChange,
  onRun,
  onSubmit,
  onResetConfirm,
  onVisualize,
  running,
  runtimeStatus,
  errorLine,
  fontSize,
  onFontSizeChange,
  editorTheme,
  onEditorThemeChange,
  ligatures,
  onLigaturesChange,
  draftSavedAt,
  examMode = false,
}: ProblemEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const resetDialogRef = useRef<HTMLDialogElement>(null);
  const runRef = useRef(onRun);
  const submitRef = useRef(onSubmit);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsPanelId = useId();
  const resetTitleId = useId();

  runRef.current = onRun;
  submitRef.current = onSubmit;

  const effectiveDark =
    editorTheme === 'system' ? resolvedTheme === 'dark' : editorTheme === 'dark';

  // Sync traceback error line decoration whenever errorLine changes
  useEffect(() => {
    const view = editorRef.current?.view;
    if (!view) return;
    const clamped =
      errorLine && errorLine >= 1 && errorLine <= view.state.doc.lines
        ? errorLine
        : null;
    view.dispatch({
      effects: setErrorLineEffect.of(clamped),
    });
  }, [errorLine, code]);

  const extensions = useMemo(
    () => [
      python(),
      indentUnit.of('    '),
      search({ top: true }),
      errorLineField,
      keymap.of([
        {
          key: 'Mod-Enter',
          run: () => {
            runRef.current();
            return true;
          },
        },
        {
          key: 'Mod-Shift-Enter',
          run: () => {
            submitRef.current();
            return true;
          },
        },
        {
          key: 'Mod-/',
          run: toggleComment,
        },
        ...searchKeymap,
      ]),
      EditorView.theme({
        '&': {
          backgroundColor: effectiveDark ? '#0d0d0f' : '#ffffff',
          fontSize: `${fontSize}px`,
          height: '100%',
        },
        '.cm-content': {
          fontFamily: 'var(--font-mono)',
          fontVariantLigatures: ligatures ? 'normal' : 'none',
        },
        '.cm-scroller': {
          fontFamily: 'var(--font-mono)',
        },
        '.cm-gutters': {
          backgroundColor: effectiveDark ? '#0d0d0f' : '#fafafa',
          borderRight: effectiveDark ? '1px solid #262626' : '1px solid #e5e5e5',
          color: effectiveDark ? '#525252' : '#a3a3a3',
        },
        '.cm-activeLineGutter': {
          backgroundColor: effectiveDark ? '#171717' : '#f5f5f5',
        },
      }),
    ],
    [effectiveDark, fontSize, ligatures]
  );

  const handleOpenFind = () => {
    const view = editorRef.current?.view;
    if (view) {
      openSearchPanel(view);
      view.focus();
    }
  };

  const openResetModal = () => {
    const dialog = resetDialogRef.current;
    if (dialog && !dialog.open) {
      dialog.returnValue = '';
      dialog.showModal();
    }
  };

  const handleResetDialogClose = () => {
    const dialog = resetDialogRef.current;
    if (!dialog) return;
    const choice = dialog.returnValue;
    dialog.returnValue = '';
    if (choice === 'confirm') {
      onResetConfirm();
    }
  };

  const cycleTheme = () => {
    const order: EditorThemeMode[] = ['system', 'light', 'dark'];
    const idx = order.indexOf(editorTheme);
    onEditorThemeChange(order[(idx + 1) % order.length]);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-[#0d0d0f]">
      {/* Editor Toolbar */}
      <div
        role="toolbar"
        aria-label="Problem code editor controls"
        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#131316]"
      >
        <div role="group" aria-label="Execution actions" className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onRun}
            disabled={running}
            className="tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#0d0d0f] hover:bg-neutral-100 dark:hover:bg-neutral-800/70 disabled:opacity-60 text-neutral-900 dark:text-neutral-100 text-xs font-medium min-h-7"
          >
            {running ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>Run</span>
            <kbd className="hidden sm:inline font-mono text-[10px] px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
              Ctrl+↵
            </kbd>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={running}
            className="tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold min-h-7"
          >
            {running ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>Submit</span>
            <kbd className="hidden sm:inline font-mono text-[10px] px-1 py-0.5 rounded bg-emerald-700/80 text-emerald-100">
              Ctrl+⇧+↵
            </kbd>
          </button>

          <span role="separator" aria-orientation="vertical" className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 mx-0.5" />

          <button
            type="button"
            onClick={openResetModal}
            disabled={running}
            title="Reset code to starter template"
            className="tactile inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {!examMode && (
            <button
              type="button"
              onClick={onVisualize}
              disabled={!onVisualize}
              title={onVisualize ? 'Step-through execution visualizer' : 'Step-through visualizer arrives in Phase 3'}
              className="tactile inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden md:inline">Visualize</span>
            </button>
          )}
        </div>

        <div role="group" aria-label="Editor preferences" className="flex items-center gap-1.5">
          {draftSavedAt && (
            <span
              className="hidden xl:inline-flex items-center gap-1 font-mono text-[10px] text-neutral-500 dark:text-neutral-400 mr-1"
              title={`Draft saved at ${new Date(draftSavedAt).toLocaleTimeString()}`}
            >
              <Check className="w-3 h-3 text-emerald-500" aria-hidden="true" />
              Draft saved
            </span>
          )}

          <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mr-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                runtimeStatus === 'loading' || runtimeStatus === 'running'
                  ? 'bg-amber-500 motion-safe:animate-pulse'
                  : 'bg-emerald-500'
              }`}
              aria-hidden="true"
            />
            {runtimeStatus === 'loading'
              ? 'Loading Python'
              : runtimeStatus === 'running'
                ? 'Running'
                : 'Ready'}
          </span>

          <button
            type="button"
            onClick={handleOpenFind}
            aria-label="Find and replace in editor"
            title="Find and replace (Ctrl+F)"
            className="tactile inline-flex items-center justify-center w-7 h-7 rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
          >
            <Search className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <label className="sr-only" htmlFor="problem-editor-fontsize">
            Editor font size
          </label>
          <select
            id="problem-editor-fontsize"
            aria-label="Editor font size"
            value={fontSize}
            onChange={(e) => onFontSizeChange(Number(e.target.value))}
            className="h-7 px-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#0d0d0f] font-mono text-[11px] text-neutral-700 dark:text-neutral-300"
          >
            {[12, 13, 14, 15, 16, 18].map((sz) => (
              <option key={sz} value={sz}>
                {sz}px
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={cycleTheme}
            aria-label={`Editor theme: ${editorTheme}. Click to cycle.`}
            title={`Editor theme: ${editorTheme}`}
            className="tactile inline-flex items-center justify-center w-7 h-7 rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
          >
            {editorTheme === 'dark' ? (
              <Moon className="w-3.5 h-3.5" aria-hidden="true" />
            ) : editorTheme === 'light' ? (
              <Sun className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            aria-expanded={settingsOpen}
            aria-controls={settingsPanelId}
            aria-label="Editor settings"
            onClick={() => setSettingsOpen((v) => !v)}
            className={`tactile inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
              settingsOpen
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Collapsible Settings Bar */}
      {settingsOpen && (
        <div
          id={settingsPanelId}
          className="flex flex-wrap items-center justify-between gap-4 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-[#101014] text-xs"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 dark:text-neutral-400">Theme:</span>
              {(['system', 'light', 'dark'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={editorTheme === mode}
                  onClick={() => onEditorThemeChange(mode)}
                  className={`px-2 py-0.5 rounded capitalize border text-[11px] ${
                    editorTheme === mode
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white'
                      : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              type="button"
              aria-pressed={ligatures}
              onClick={() => onLigaturesChange(!ligatures)}
              className={`px-2.5 py-0.5 rounded border text-[11px] ${
                ligatures
                  ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white'
                  : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              Font Ligatures: {ligatures ? 'On' : 'Off'}
            </button>
          </div>

          <span className="font-mono text-[10px] text-neutral-400">
            Shortcuts: Ctrl+Enter Run · Ctrl+Shift+Enter Submit · Ctrl+/ Comment · Tab/Shift+Tab Indent · Ctrl+F Find
          </span>
        </div>
      )}

      {/* CodeMirror 6 Editor Surface */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeMirror
          ref={editorRef}
          value={code}
          height="100%"
          className="h-full"
          extensions={extensions}
          theme={effectiveDark ? oneDark : 'light'}
          onChange={onChange}
          indentWithTab={true}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            foldGutter: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            searchKeymap: true,
            indentOnInput: true,
            tabSize: 4,
          }}
        />
      </div>

      {/* Native Reset Confirmation Modal */}
      <dialog
        ref={resetDialogRef}
        aria-labelledby={resetTitleId}
        onClose={handleResetDialogClose}
        className="m-auto w-[min(92vw,26rem)] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111113] text-neutral-950 dark:text-neutral-50 shadow-2xl p-5"
      >
        <h2 id={resetTitleId} className="text-base font-semibold">
          Reset to starter code?
        </h2>
        <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          This replaces your current draft in the editor with the original starter template. Your previous submissions remain saved in Submissions.
        </p>
        <form method="dialog" className="mt-5 flex justify-end gap-2">
          <button
            type="submit"
            value="cancel"
            autoFocus
            className="px-3.5 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            value="confirm"
            className="px-3.5 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
          >
            Reset Code
          </button>
        </form>
      </dialog>
    </div>
  );
}
