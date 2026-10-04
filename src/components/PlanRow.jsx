import { useApp } from '../store.jsx';
import { gcalUrl } from '../lib/ics.js';
import { Check, cx } from './ui.jsx';

export default function PlanRow({ e, link, showDate }) {
  const { mutate, awardOnce } = useApp();
  const tick = (on) => {
    if (on) awardOnce('pn' + e.id, 5, 'Planner: ' + e.title, (s) => { const x = s.plan.find((q) => q.id === e.id); if (x) x.done = true; });
    else mutate((s) => { const x = s.plan.find((q) => q.id === e.id); if (x) x.done = false; });
  };
  const det = [e.loc ? '📍 ' + e.loc : '', e.notes ? '📝 ' + e.notes : ''].filter(Boolean).join('   ');
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-0.5 py-2 last:border-b-0">
      <Check checked={!!e.done} aria-label="Done" onChange={(ev) => tick(ev.target.checked)} />
      {showDate && <span className="min-w-[54px] font-mono text-xs text-accent">{e.date.slice(5)}</span>}
      <span className="min-w-[48px] font-mono text-[13px] text-muted">{e.time || 'all day'}</span>
      <span className={cx('min-w-0 flex-[1_1_160px] break-words', e.done && 'text-muted line-through')}>{e.pri === 'high' ? '❗ ' : ''}{e.title}</span>
      <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-accent">{e.kind}</span>
      {link && <a className="text-xs text-accent underline" href={gcalUrl(e)} target="_blank" rel="noopener noreferrer">Add to Google Calendar</a>}
      {link && <button type="button" aria-label="Delete" className="cursor-pointer border-0 bg-transparent px-1.5 text-muted hover:text-bad" onClick={() => mutate((s) => { s.plan = s.plan.filter((q) => q.id !== e.id); })}>✕</button>}
      {det && <span className="flex-[1_1_100%] pl-[30px] text-xs text-muted">{det}</span>}
    </div>
  );
}
