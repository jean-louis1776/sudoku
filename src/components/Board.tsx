import { useMemo } from 'react';
import { peersOf } from '../sudoku/generator';
import { useGame } from '../store';
import { formatTime } from '../utils';
import s from './Board.module.scss';

function Win() {
  const seconds = useGame((st) => st.seconds);
  const mistakes = useGame((st) => st.mistakes);
  const newGame = useGame((st) => st.newGame);
  return (
    <div className={s.win} role="dialog" aria-label="Партия решена">
      <p className={s.winTitle}>Готово</p>
      <p className={s.winMeta}>
        {formatTime(seconds)} · ошибок: {mistakes}
      </p>
      <button className={s.winBtn} onClick={() => newGame()} autoFocus>
        Новая игра
      </button>
    </div>
  );
}

export function Board() {
  const puzzle = useGame((st) => st.puzzle);
  const solution = useGame((st) => st.solution);
  const values = useGame((st) => st.values);
  const notes = useGame((st) => st.notes);
  const selected = useGame((st) => st.selected);
  const status = useGame((st) => st.status);
  const select = useGame((st) => st.select);

  const peers = useMemo(() => new Set(selected === null ? [] : peersOf(selected)), [selected]);
  const selectedValue = selected !== null ? values[selected] : 0;

  return (
    <div className={s.wrap}>
      <div className={s.board} role="grid" aria-label="Игровое поле">
        {values.map((v, i) => {
          const r = Math.floor(i / 9);
          const c = i % 9;
          const given = puzzle[i] !== 0;
          const wrong = !given && v !== 0 && v !== solution[i];

          const cls = [
            s.cell,
            c % 3 === 2 && c !== 8 && s.boxRight,
            r % 3 === 2 && r !== 8 && s.boxBottom,
            c === 8 && s.lastCol,
            r === 8 && s.lastRow,
            given && s.given,
            !given && v !== 0 && s.entered,
            selected !== null && peers.has(i) && s.peer,
            selectedValue !== 0 && v === selectedValue && s.same,
            wrong && s.wrong,
            selected === i && s.selected,
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={i}
              className={cls}
              onClick={() => select(i)}
              role="gridcell"
              aria-selected={selected === i}
              aria-label={`Строка ${r + 1}, столбец ${c + 1}${v ? `, ${v}` : ', пусто'}`}
            >
              {v !== 0 ? (
                v
              ) : notes[i] !== 0 ? (
                <span className={s.notes}>
                  {Array.from({ length: 9 }, (_, k) => (
                    <span key={k}>{notes[i] & (1 << (k + 1)) ? k + 1 : ''}</span>
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {status === 'won' && <Win />}
    </div>
  );
}
