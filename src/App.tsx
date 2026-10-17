import { useEffect } from 'react';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { DIFFICULTIES } from './sudoku/generator';
import { useGame } from './store';
import { formatTime } from './utils';
import s from './App.module.scss';

function Stats() {
  const seconds = useGame((st) => st.seconds);
  const mistakes = useGame((st) => st.mistakes);
  return (
    <div className={s.stats}>
      <span className={s.time}>{formatTime(seconds)}</span>
      <span className={mistakes > 0 ? s.mistakesActive : undefined}>Ошибки: {mistakes}</span>
    </div>
  );
}

function Difficulty() {
  const difficulty = useGame((st) => st.difficulty);
  const newGame = useGame((st) => st.newGame);
  return (
    <div className={s.segmented} role="radiogroup" aria-label="Сложность">
      {DIFFICULTIES.map((d) => (
        <button
          key={d.id}
          role="radio"
          aria-checked={difficulty === d.id}
          className={difficulty === d.id ? s.segActive : s.seg}
          onClick={() => newGame(d.id)}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const id = setInterval(() => useGame.getState().tick(), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const g = useGame.getState();
      const k = e.key;
      if (k >= '1' && k <= '9') g.input(Number(k));
      else if (k === 'Backspace' || k === 'Delete' || k === '0') g.erase();
      else if (k === 'ArrowUp') g.move(-1, 0);
      else if (k === 'ArrowDown') g.move(1, 0);
      else if (k === 'ArrowLeft') g.move(0, -1);
      else if (k === 'ArrowRight') g.move(0, 1);
      else if (k.toLowerCase() === 'n' || k.toLowerCase() === 'т') g.toggleNotes();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main className={s.app}>
      <div className={s.shell}>
        <header className={s.header}>
          <h1 className={s.title}>Sudoku</h1>
          <Stats />
        </header>
        <Difficulty />
        <Board />
        <Controls />
      </div>
    </main>
  );
}
