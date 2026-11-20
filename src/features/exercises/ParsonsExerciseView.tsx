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
} from 'lucide-react';
import type { ParsonsExercise } from '../../types/content';

interface ParsonsItem {
  id: string;
  text: string;
  indent: number;
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
  }));
  // Deterministic-feeling shuffle that avoids matching exact solution order when length > 1
  for (let i = items.length - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function ParsonsExerciseView({ exercise, onAttempt }: ParsonsExerciseViewProps) {
  const [items, setItems] = useState<ParsonsItem[]>(() => buildShuffledItems(exercise));
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);

  useEffect(() => {
    setItems(buildShuffledItems(exercise));
    setPassed(null);
  }, [exercise]);

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    setPassed(null);
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const changeIndent = (idx: number, delta: number) => {
    setPassed(null);
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, indent: Math.max(0, Math.min(4, item.indent + delta)) } : item
      )
    );
  };

  const handleCheck = () => {
    const distractorSet = new Set((exercise.distractors ?? []).map((d) => d.trim()));
    const assembled = items
      .filter((it) => !distractorSet.has(it.text.trim()) || items.length === exercise.lines.length)
      .map((it) => `${'    '.repeat(it.indent)}${it.text}`);

    const isMatch =
      assembled.length === exercise.lines.length &&
      assembled.every((line, idx) => line === exercise.lines[idx]);

    setPassed(isMatch);
    onAttempt(isMatch, assembled.join('\n'));
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto flex-1">
      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>Drag lines or use keyboard buttons to reorder and indent (4 spaces per level).</span>
        <button
          type="button"
          onClick={() => {
            setItems(buildShuffledItems(exercise));
            setPassed(null);
          }}
          className="inline-flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200"
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
            className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#0c0c0e] px-2.5 py-2 shadow-2xs"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <GripVertical className="w-4 h-4 text-neutral-400 shrink-0 cursor-grab" aria-hidden="true" />
              <code
                className="text-xs font-mono text-neutral-800 dark:text-neutral-200 truncate"
                style={{ paddingLeft: `${item.indent * 1.25}rem` }}
              >
                {item.text}
              </code>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                aria-label={`Outdent line ${idx + 1}`}
                onClick={() => changeIndent(idx, -1)}
                disabled={item.indent === 0}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
              >
                <Outdent className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Indent line ${idx + 1}`}
                onClick={() => changeIndent(idx, 1)}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
        onClick={handleCheck}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
      >
        <FlaskConical className="w-3.5 h-3.5" />
        Check Order &amp; Indentation
      </button>

      {passed !== null && (
        <div
          className={`rounded-lg border p-3 text-xs space-y-1 ${
            passed
              ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
              : 'border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-semibold">
            {passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {passed ? 'Correct order and indentation!' : 'Order or indentation does not match yet.'}
          </div>
          {passed && <p>{exercise.explanation}</p>}
        </div>
      )}
    </div>
  );
}
