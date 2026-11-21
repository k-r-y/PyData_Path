import { useEffect, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Indent,
  Outdent,
  GripVertical,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Shuffle,
  Loader2,
  EyeOff,
  Eye,
} from 'lucide-react';
import type { ParsonsExercise } from '../../types/content';
import { pyodideRunner } from '../../runtime/runner';

interface ParsonsItem {
  id: string;
  text: string;
  indent: number;
  excluded: boolean;
}

interface ParsonsExerciseViewProps {
  exercise: ParsonsExercise;
  onAttempt: (passed: boolean, submittedText: string) => void;
}

function buildShuffledItems(exercise: ParsonsExercise): ParsonsItem[] {
  const allLines = [...exercise.lines, ...(exercise.distractors ?? [])];
  const items: ParsonsItem[] = allLines.map((line, idx) => ({
    id: `line-${idx}`,
    text: line.trimStart(),
    indent: 0,
    excluded: false,
  }));
  for (let i = items.length - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

const STATE_EXPORT_SUFFIX = `
import json as _pdp_json
_pdp_export = {}
for _pdp_k, _pdp_v in list(globals().items()):
    if not _pdp_k.startswith("_") and not callable(_pdp_v) and _pdp_k != "json":
        try:
            _pdp_export[_pdp_k] = repr(_pdp_v)
        except Exception:
            pass
print("\\n__PDP_STATE__:" + _pdp_json.dumps(_pdp_export, sort_keys=True))
`;

function splitStateMarker(stdout: string): { cleanStdout: string; stateJson: string | null } {
  const marker = '\n__PDP_STATE__:';
  const idx = stdout.lastIndexOf(marker);
  if (idx === -1) return { cleanStdout: stdout.trimEnd(), stateJson: null };
  return {
    cleanStdout: stdout.slice(0, idx).trimEnd(),
    stateJson: stdout.slice(idx + marker.length).trim(),
  };
}

export function ParsonsExerciseView({ exercise, onAttempt }: ParsonsExerciseViewProps) {
  const [items, setItems] = useState<ParsonsItem[]>(() => buildShuffledItems(exercise));
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const hasDistractors = (exercise.distractors?.length ?? 0) > 0;

  useEffect(() => {
    setItems(buildShuffledItems(exercise));
    setPassed(null);
    setFeedbackError(null);
  }, [exercise]);

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    setPassed(null);
    setFeedbackError(null);
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const changeIndent = (idx: number, delta: number) => {
    setPassed(null);
    setFeedbackError(null);
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, indent: Math.max(0, Math.min(4, item.indent + delta)) } : item
      )
    );
  };

  const toggleExclude = (idx: number) => {
    setPassed(null);
    setFeedbackError(null);
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, excluded: !item.excluded } : item))
    );
  };

  const handleCheck = async () => {
    setChecking(true);
    setFeedbackError(null);
    try {
      const assembledLines = items
        .filter((it) => !it.excluded)
        .map((it) => `${'    '.repeat(it.indent)}${it.text}`);
      const assembledCode = assembledLines.join('\n');
      const referenceCode = exercise.lines.join('\n');

      // Fast path: exact match (when no distractors are present and user included all lines)
      const exactMatch =
        assembledLines.length === exercise.lines.length &&
        assembledLines.every((line, idx) => line === exercise.lines[idx]);

      if (exactMatch) {
        setPassed(true);
        onAttempt(true, assembledCode);
        return;
      }

      // Behavioral path: run reference and assembled code in Pyodide and compare stdout + final state
      const refRes = await pyodideRunner.run(`${referenceCode}\n${STATE_EXPORT_SUFFIX}`);
      if (!refRes.ok) {
        // Fallback when snippet cannot execute standalone (e.g. partial code fragment)
        setPassed(false);
        onAttempt(false, assembledCode);
        return;
      }

      const studentRes = await pyodideRunner.run(`${assembledCode}\n${STATE_EXPORT_SUFFIX}`);
      if (!studentRes.ok || studentRes.timedOut) {
        setPassed(false);
        setFeedbackError(studentRes.error ?? 'Code raised an error or timed out.');
        onAttempt(false, assembledCode);
        return;
      }

      const refParsed = splitStateMarker(refRes.stdout);
      const stuParsed = splitStateMarker(studentRes.stdout);

      const distractorSet = new Set((exercise.distractors ?? []).map((d) => d.trim()));
      const usedDistractor = items.some((it) => !it.excluded && distractorSet.has(it.text.trim()));

      const behaviorMatch =
        !usedDistractor &&
        refParsed.cleanStdout === stuParsed.cleanStdout &&
        refParsed.stateJson !== null &&
        refParsed.stateJson === stuParsed.stateJson;

      setPassed(behaviorMatch);
      if (!behaviorMatch && usedDistractor) {
        setFeedbackError('A distractor line is still included. Exclude unused distractor lines.');
      }
      onAttempt(behaviorMatch, assembledCode);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto flex-1">
      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>Drag lines or use keyboard buttons to reorder and indent (4 spaces per level). Any order that preserves dependencies and produces the same behavior is accepted.</span>
        <button
          type="button"
          onClick={() => {
            setItems(buildShuffledItems(exercise));
            setPassed(null);
            setFeedbackError(null);
          }}
          className="inline-flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 shrink-0 ml-2"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Reshuffle
        </button>
      </div>

      <ul className="space-y-1.5" aria-label="Code lines to reorder">
        {items.map((item, idx) => (
          <li
            key={item.id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIdx !== null && dragIdx !== idx) {
                moveItem(dragIdx, idx);
              }
              setDragIdx(null);
            }}
            className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 shadow-2xs transition-opacity ${
              item.excluded
                ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-[#111113] opacity-50'
                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#0c0c0e]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <GripVertical className="w-4 h-4 text-neutral-400 shrink-0 cursor-grab" aria-hidden="true" />
              <code
                className={`text-xs font-mono text-neutral-800 dark:text-neutral-200 truncate ${
                  item.excluded ? 'line-through' : ''
                }`}
                style={{ paddingLeft: `${item.indent * 1.25}rem` }}
              >
                {item.text}
              </code>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {hasDistractors && (
                <button
                  type="button"
                  aria-label={item.excluded ? `Include line ${idx + 1}` : `Exclude line ${idx + 1}`}
                  aria-pressed={item.excluded}
                  onClick={() => toggleExclude(idx)}
                  className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {item.excluded ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              )}
              <button
                type="button"
                aria-label={`Outdent line ${idx + 1}`}
                onClick={() => changeIndent(idx, -1)}
                disabled={item.indent === 0 || item.excluded}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
              >
                <Outdent className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Indent line ${idx + 1}`}
                onClick={() => changeIndent(idx, 1)}
                disabled={item.excluded}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
              >
                <Indent className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Move line ${idx + 1} up`}
                onClick={() => moveItem(idx, idx - 1)}
                disabled={idx === 0}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Move line ${idx + 1} down`}
                onClick={() => moveItem(idx, idx + 1)}
                disabled={idx === items.length - 1}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={checking}
        onClick={handleCheck}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-semibold"
      >
        {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FlaskConical className="w-3.5 h-3.5" />}
        Check Order &amp; Indentation
      </button>

      {passed !== null && (
        <div
          className={`rounded-lg border p-3 text-xs space-y-1.5 ${
            passed
              ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
              : 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            {passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {passed ? 'Correct order and behavior!' : 'Order, indentation, or output does not match yet.'}
          </div>
          {feedbackError && (
            <pre className="font-mono text-[11px] whitespace-pre-wrap opacity-90">{feedbackError}</pre>
          )}
          {passed && <p>{exercise.explanation}</p>}
        </div>
      )}
    </div>
  );
}
