import { useEffect, useState } from 'react';
import { RotateCw, Layers, CheckCircle2 } from 'lucide-react';
import { db, type FlashcardRecord } from '../../db/database';
import { calculateSm2 } from './sm2';
import { getAllModules, getLessonsForModule, getExercisesForLesson } from '../../content/loader';
import type { FlashcardExercise } from '../../types/content';

export function FlashcardsPage() {
  const [cards, setCards] = useState<FlashcardExercise[]>([]);
  const [records, setRecords] = useState<Map<string, FlashcardRecord>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const allCards: FlashcardExercise[] = [];
    for (const mod of getAllModules()) {
      for (const lesson of getLessonsForModule(mod.id)) {
        for (const ex of getExercisesForLesson(lesson.frontmatter.id)) {
          if (ex.type === 'flashcard') {
            allCards.push(ex);
          }
        }
      }
    }
    setCards(allCards);

    db.flashcards.toArray().then((rows) => {
      const map = new Map<string, FlashcardRecord>();
      for (const r of rows) map.set(r.cardId, r);
      setRecords(map);
    }).catch(() => {});
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const dueCards = cards.filter((c) => {
    const rec = records.get(c.id);
    return !rec || rec.dueDate <= today;
  });

  const current = dueCards[currentIndex];

  const handleRate = async (quality: 1 | 3 | 4 | 5) => {
    if (!current) return;
    const prev = records.get(current.id) ?? {
      cardId: current.id,
      deckId: current.deckId,
      ease: 2.5,
      intervalDays: 0,
      repetitions: 0,
      dueDate: today,
      lastReviewed: null,
    };

    const next = calculateSm2(prev, quality);
    const updated: FlashcardRecord = {
      cardId: current.id,
      deckId: current.deckId,
      ease: next.ease,
      intervalDays: next.intervalDays,
      repetitions: next.repetitions,
      dueDate: next.dueDate,
      lastReviewed: today,
    };

    await db.flashcards.put(updated);
    setRecords((m) => new Map(m).set(current.id, updated));
    setFlipped(false);
    setCurrentIndex(0);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      <header className="space-y-1 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          Spaced Repetition Flashcards (SM-2)
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Scheduled using the SuperMemo SM-2 algorithm. Due today: {dueCards.length} of {cards.length} cards.
        </p>
      </header>

      {!current ? (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 p-8 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">
            {cards.length === 0 ? 'No flashcards authored yet.' : 'All due flashcards reviewed for today!'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0e] p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Deck: {current.deckId}</span>
            <span>Card {currentIndex + 1} of {dueCards.length}</span>
          </div>

          <div className="min-h-[140px] flex flex-col justify-center items-center text-center p-4 rounded-lg bg-neutral-50 dark:bg-[#09090b] border border-neutral-100 dark:border-neutral-800">
            <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">
              {flipped ? current.back : current.front}
            </p>
          </div>

          {!flipped ? (
            <button
              type="button"
              onClick={() => setFlipped(true)}
              className="w-full py-2.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-sm font-medium flex items-center justify-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Show Answer
            </button>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleRate(1)}
                className="py-2 rounded-md border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs font-medium hover:bg-rose-100"
              >
                Again (1d)
              </button>
              <button
                type="button"
                onClick={() => handleRate(3)}
                className="py-2 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs font-medium hover:bg-amber-100"
              >
                Hard
              </button>
              <button
                type="button"
                onClick={() => handleRate(4)}
                className="py-2 rounded-md border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 text-xs font-medium hover:bg-sky-100"
              >
                Good
              </button>
              <button
                type="button"
                onClick={() => handleRate(5)}
                className="py-2 rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-medium hover:bg-emerald-100"
              >
                Easy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
