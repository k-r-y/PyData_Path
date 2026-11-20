/**
 * SuperMemo SM-2 spaced repetition algorithm.
 * Reference: Piotr Wozniak, SuperMemo SM-2 (1987/1990).
 * Quality ratings:
 *   0 = Complete blackout
 *   1 = Incorrect, remembered on reveal
 *   2 = Incorrect, seemed easy to recall
 *   3 = Correct with serious difficulty
 *   4 = Correct after hesitation
 *   5 = Perfect response
 */
export interface Sm2State {
  ease: number;
  intervalDays: number;
  repetitions: number;
}

export interface Sm2Result extends Sm2State {
  dueDate: string;
}

export function calculateSm2(prev: Sm2State, quality: 0 | 1 | 2 | 3 | 4 | 5): Sm2Result {
  let { ease, intervalDays, repetitions } = prev;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * ease);
    }
    repetitions += 1;
  }

  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease < 1.3) ease = 1.3;

  const due = new Date();
  due.setDate(due.getDate() + intervalDays);

  return {
    ease: Number(ease.toFixed(2)),
    intervalDays,
    repetitions,
    dueDate: due.toISOString().slice(0, 10),
  };
}
