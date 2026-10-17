import { useMemo } from 'react';
import { useGame } from '../store';
import s from './Controls.module.scss';

export function Controls() {
  const values = useGame((st) => st.values);
  const solution = useGame((st) => st.solution);
  const notesMode = useGame((st) => st.notesMode);
  const status = useGame((st) => st.status);
  const input = useGame((st) => st.input);
  const erase = useGame((st) => st.erase);
  const hint = useGame((st) => st.hint);
  const toggleNotes = useGame((st) => st.toggleNotes);

  // сколько раз цифра уже верно стоит на поле
  const done = useMemo(() => {
    const counts = Array<number>(10).fill(0);
    values.forEach((v, i) => {
      if (v !== 0 && v === solution[i]) counts[v]++;
    });
    return counts;
  }, [values, solution]);

  const locked = status !== 'playing';

  return (
    <div className={s.controls}>
      <div className={s.tools}>
        <button
          className={notesMode ? s.toolActive : s.tool}
          aria-pressed={notesMode}
          onClick={toggleNotes}
          disabled={locked}
        >
          Заметки
        </button>
        <button className={s.tool} onClick={erase} disabled={locked}>
          Стереть
        </button>
        <button className={s.tool} onClick={hint} disabled={locked}>
          Подсказка
        </button>
      </div>

      <div className={s.pad}>
        {Array.from({ length: 9 }, (_, k) => k + 1).map((n) => (
          <button key={n} className={s.num} onClick={() => input(n)} disabled={locked || done[n] === 9}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
