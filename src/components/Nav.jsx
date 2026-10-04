import { useApp, IELTS_SUB } from '../store.jsx';
import { cx } from './ui.jsx';

const MAIN = [['today', '🎯 Today'], ['planner', '📅 Life Calendar'], ['ielts', '🎓 IELTS'], ['work', '💼 Work'], ['money', '💰 Expenses'], ['body', '🏋️ Body'], ['reflect', '🪞 Reflect'], ['cycle', '🌸 Cycle'], ['rewards', '🏆 Rewards']];
const SUB = [['words', '🔤 Words'], ['grammar', '📝 Grammar'], ['writing', '✍️ Writing'], ['speaking', '🎤 Speaking'], ['readlisten', '🎧 Listen + Read'], ['timers', '⏱️ Timers'], ['calendar', '🗓️ Calendar'], ['topics', '💡 Topics']];

export default function Nav() {
  const { state, go } = useApp();
  const inI = IELTS_SUB.includes(state.tab), grp = inI ? 'ielts' : state.tab;
  return (
    <>
      <nav className="sticky top-0 z-10 -mx-4 flex gap-2 overflow-x-auto bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] px-4 pb-2 pt-1.5 backdrop-blur-md" role="tablist">
        {MAIN.map(([k, l]) => (
          <button key={k} role="tab" type="button" aria-selected={grp === k} onClick={() => go(k)}
            className={cx('cursor-pointer whitespace-nowrap rounded-2xl border px-3.5 py-[9px] font-semibold transition', grp === k ? 'border-accent bg-accent-soft text-fg shadow-[0_0_0_1px_var(--accent),0_6px_20px_color-mix(in_srgb,var(--accent)_35%,transparent)]' : 'border-line bg-surface text-muted hover:border-accent hover:text-fg')}>{l}</button>
        ))}
      </nav>
      {inI && (
        <nav className="-mt-2.5 flex gap-2 overflow-x-auto" role="tablist" aria-label="IELTS sections">
          {SUB.map(([k, l]) => (
            <button key={k} role="tab" type="button" aria-selected={state.tab === k} onClick={() => go(k)}
              className={cx('cursor-pointer whitespace-nowrap rounded-xl border px-3 py-1.5 text-sm font-semibold transition', state.tab === k ? 'border-accent bg-accent text-on-accent' : 'border-line bg-surface text-muted hover:border-accent hover:text-fg')}>{l}</button>
          ))}
        </nav>
      )}
    </>
  );
}
