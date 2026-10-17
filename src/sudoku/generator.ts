export type Grid = number[];
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export const DIFFICULTIES: { id: Difficulty; label: string; clues: number }[] = [
  { id: 'easy', label: 'Легко', clues: 40 },
  { id: 'medium', label: 'Средне', clues: 34 },
  { id: 'hard', label: 'Сложно', clues: 29 },
  { id: 'expert', label: 'Эксперт', clues: 25 },
];

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const peersOf = (i: number): number[] => {
  const r = Math.floor(i / 9);
  const c = i % 9;
  const br = r - (r % 3);
  const bc = c - (c % 3);
  const set = new Set<number>();
  for (let k = 0; k < 9; k++) {
    set.add(r * 9 + k);
    set.add(k * 9 + c);
  }
  for (let rr = 0; rr < 3; rr++) {
    for (let cc = 0; cc < 3; cc++) set.add((br + rr) * 9 + bc + cc);
  }
  set.delete(i);
  return [...set];
};

const PEERS: number[][] = Array.from({ length: 81 }, (_, i) => peersOf(i));

const canPlace = (g: Grid, i: number, n: number) => PEERS[i].every((p) => g[p] !== n);

const candidates = (g: Grid, i: number): number[] => {
  const res: number[] = [];
  for (let n = 1; n <= 9; n++) if (canPlace(g, i, n)) res.push(n);
  return res;
};

/** Полностью заполненное валидное поле (рандомный бэктрекинг). */
const fill = (g: Grid): boolean => {
  const i = g.indexOf(0);
  if (i === -1) return true;
  for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (canPlace(g, i, n)) {
      g[i] = n;
      if (fill(g)) return true;
      g[i] = 0;
    }
  }
  return false;
};

/** Считает решения, но не больше limit. Выбирает клетку с минимумом кандидатов. */
const countSolutions = (g: Grid, limit: number): number => {
  let best = -1;
  let bestC: number[] | null = null;
  for (let i = 0; i < 81; i++) {
    if (g[i] !== 0) continue;
    const c = candidates(g, i);
    if (c.length === 0) return 0;
    if (!bestC || c.length < bestC.length) {
      best = i;
      bestC = c;
      if (c.length === 1) break;
    }
  }
  if (!bestC) return 1;
  let total = 0;
  for (const n of bestC) {
    g[best] = n;
    total += countSolutions(g, limit - total);
    g[best] = 0;
    if (total >= limit) break;
  }
  return total;
};

export const generate = (difficulty: Difficulty): { puzzle: Grid; solution: Grid } => {
  const solution: Grid = Array(81).fill(0);
  fill(solution);

  const target = DIFFICULTIES.find((d) => d.id === difficulty)!.clues;
  const puzzle = [...solution];
  let clues = 81;

  for (const pos of shuffle(Array.from({ length: 81 }, (_, i) => i))) {
    if (clues <= target) break;
    const backup = puzzle[pos];
    puzzle[pos] = 0;
    // убираем клетку, только если решение остаётся единственным
    if (countSolutions([...puzzle], 2) !== 1) puzzle[pos] = backup;
    else clues--;
  }

  return { puzzle, solution };
};
