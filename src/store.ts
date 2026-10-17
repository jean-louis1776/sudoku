import { create } from 'zustand';
import { generate, peersOf, type Difficulty, type Grid } from './sudoku/generator';

type Status = 'playing' | 'won';

interface GameState {
  difficulty: Difficulty;
  puzzle: Grid;
  solution: Grid;
  values: Grid;
  notes: number[]; // битовая маска на клетку: бит n = заметка n
  selected: number | null;
  notesMode: boolean;
  mistakes: number;
  seconds: number;
  status: Status;

  newGame: (difficulty?: Difficulty) => void;
  select: (i: number | null) => void;
  move: (dr: number, dc: number) => void;
  input: (n: number) => void;
  erase: () => void;
  toggleNotes: () => void;
  hint: () => void;
  tick: () => void;
}

const fresh = (difficulty: Difficulty) => {
  const { puzzle, solution } = generate(difficulty);
  return {
    difficulty,
    puzzle,
    solution,
    values: [...puzzle],
    notes: Array<number>(81).fill(0),
    selected: null as number | null,
    mistakes: 0,
    seconds: 0,
    status: 'playing' as Status,
  };
};

const isSolved = (values: Grid, solution: Grid) => values.every((v, i) => v === solution[i]);

export const useGame = create<GameState>((set, get) => ({
  ...fresh('medium'),
  notesMode: false,

  newGame: (difficulty) => set(fresh(difficulty ?? get().difficulty)),

  select: (i) => set({ selected: i }),

  move: (dr, dc) => {
    const { selected } = get();
    if (selected === null) return set({ selected: 40 });
    const r = Math.min(8, Math.max(0, Math.floor(selected / 9) + dr));
    const c = Math.min(8, Math.max(0, (selected % 9) + dc));
    set({ selected: r * 9 + c });
  },

  input: (n) => {
    const s = get();
    const i = s.selected;
    if (i === null || s.status !== 'playing' || s.puzzle[i] !== 0) return;

    if (s.notesMode) {
      if (s.values[i] !== 0) return;
      const notes = [...s.notes];
      notes[i] ^= 1 << n;
      return set({ notes });
    }

    if (s.values[i] === n) return;
    const values = [...s.values];
    values[i] = n;
    const notes = [...s.notes];
    notes[i] = 0;

    const correct = n === s.solution[i];
    if (correct) for (const p of peersOf(i)) notes[p] &= ~(1 << n);

    set({
      values,
      notes,
      mistakes: s.mistakes + (correct ? 0 : 1),
      status: isSolved(values, s.solution) ? 'won' : 'playing',
    });
  },

  erase: () => {
    const s = get();
    const i = s.selected;
    if (i === null || s.status !== 'playing' || s.puzzle[i] !== 0) return;
    const values = [...s.values];
    const notes = [...s.notes];
    values[i] = 0;
    notes[i] = 0;
    set({ values, notes });
  },

  toggleNotes: () => set((s) => ({ notesMode: !s.notesMode })),

  hint: () => {
    const s = get();
    if (s.status !== 'playing') return;

    const needsFix = (i: number) => s.puzzle[i] === 0 && s.values[i] !== s.solution[i];
    let target = s.selected !== null && needsFix(s.selected) ? s.selected : -1;
    if (target === -1) {
      const open = s.values.map((_, i) => i).filter(needsFix);
      if (open.length === 0) return;
      target = open[Math.floor(Math.random() * open.length)];
    }

    const values = [...s.values];
    const notes = [...s.notes];
    values[target] = s.solution[target];
    notes[target] = 0;
    for (const p of peersOf(target)) notes[p] &= ~(1 << s.solution[target]);

    set({
      values,
      notes,
      selected: target,
      status: isSolved(values, s.solution) ? 'won' : 'playing',
    });
  },

  tick: () => {
    if (get().status === 'playing') set((s) => ({ seconds: s.seconds + 1 }));
  },
}));
