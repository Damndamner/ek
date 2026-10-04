import { useEffect } from 'react';
import { useApp } from '../store.jsx';
import { useNow } from '../lib/hooks.js';
import { DOW, MON, pad2, parseIso } from '../lib/dates.js';
import { EXAM_DEFAULT } from '../lib/plan.js';
import { PALS, lvl } from '../lib/life.js';
import { ptsToday, ieltsStreak } from '../lib/derived.js';
import { lBand, rBand, overall } from '../lib/plan.js';
import { confetti } from '../lib/audio.js';
import { b1 } from '../lib/dates.js';
import { cx } from './ui.jsx';

const TAB_ORDER = ['today', 'planner', 'ielts', 'work', 'money', 'body', 'reflect', 'cycle', 'rewards'];

export default function Header() {
  const { state, mutate } = useApp();
  const now = useNow(1000);
  const exam = /^\d{4}-\d{2}-\d{2}$/.test(state.exam || '') ? state.exam : EXAM_DEFAULT;
  const ed = parseIso(exam), diff = ed - now;
  let days = '0', cd = '00:00:00';
  if (diff > 0) { let s = Math.floor(diff / 1000); days = String(Math.floor(s / 86400)); s %= 86400; cd = `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`; }
  const hr = now.getHours(), greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const pts = ptsToday(state), l = lvl(state.pts.total);
  const pal = PALS.some((p) => p[0] === state.pal) ? state.pal : 'midnight';
  const last = [...state.mocks].sort((a, b) => (a.date < b.date ? -1 : 1)).pop();
  const mock = last ? b1(overall(lBand(last.l), rBand(last.r), last.w, last.s)) : '–';

  useEffect(() => { document.documentElement.setAttribute('data-pal', pal); }, [pal]);
  useEffect(() => {
    const grp = state.tab && ['words', 'grammar', 'writing', 'speaking', 'readlisten', 'timers', 'calendar', 'topics'].includes(state.tab) ? 'ielts' : state.tab;
    let i = TAB_ORDER.indexOf(grp); if (i < 0) i = 0;
    const r = document.documentElement.style;
    r.setProperty('--gx', Math.round(8 + (84 * i) / (TAB_ORDER.length - 1)) + '%');
    r.setProperty('--glow', String(Math.round(10 + Math.min(1, pts / 60) * 20)));
  }, [state.tab, pts]);

  return (
    <>
      <header className="flex flex-wrap items-center gap-3.5 rounded-[22px] border border-line bg-gradient-to-br from-surface to-[color-mix(in_srgb,var(--accent)_9%,var(--surface))] px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,.2)]">
        <div className="grid h-[50px] w-[50px] flex-none place-items-center rounded-2xl border border-accent bg-accent-soft text-2xl" aria-hidden="true">🎯</div>
        <div className="min-w-0 flex-[1_1_180px]">
          <div className="bg-gradient-to-r from-accent to-signal bg-clip-text font-display text-[22px] font-bold leading-tight text-transparent">IELTS + Life Quest</div>
          <div className="text-sm text-muted">{greet}, Vishwa</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill><b>{days}</b> days to {ed.getDate()} {MON[ed.getMonth()]} · <b className="font-mono">{cd}</b></Pill>
          <Pill mono aria-label="Current time">{DOW[now.getDay()]} {now.getDate()} {MON[now.getMonth()]} · {pad2(now.getHours())}:{pad2(now.getMinutes())}:{pad2(now.getSeconds())}</Pill>
          <Pill>🔥 streak <b>{ieltsStreak(state)}</b></Pill>
          <Pill mono>{state.pts.total} pts · Lv {l.n}</Pill>
          <Pill>latest mock <b>{mock}</b></Pill>
        </div>
        <div className="flex flex-[1_0_100%] items-center gap-2" role="group" aria-label="Colour theme">
          <span className="text-xs text-muted">Theme</span>
          {PALS.map((p) => (
            <button key={p[0]} type="button" title={p[1]} aria-label={`${p[1]} theme`} aria-pressed={p[0] === pal}
              onClick={() => { mutate((s) => { s.pal = p[0]; }); confetti(); }}
              style={{ background: p[2] }}
              className={cx('h-[26px] w-[26px] cursor-pointer rounded-full border-2 border-surface p-0 transition active:scale-90', p[0] === pal ? 'shadow-[0_0_0_2px_var(--fg)]' : 'shadow-[0_0_0_1px_var(--line)]')} />
          ))}
          <button type="button" aria-pressed={!!state.mute} onClick={() => mutate((s) => { s.mute = !s.mute; })}
            className="ml-auto cursor-pointer rounded-lg border border-line bg-transparent px-2.5 py-0.5 text-xs font-medium text-fg">{state.mute ? '🔕 Sound off' : '🔔 Sound on'}</button>
        </div>
      </header>
      <div className="-mt-2 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-label="Today's points toward 60" aria-valuemin={0} aria-valuemax={60} aria-valuenow={Math.min(60, pts)}>
        <i className="block h-full rounded-full bg-gradient-to-r from-accent to-cyan-400 transition-[width] duration-500" style={{ width: Math.min(100, Math.round((100 * pts) / 60)) + '%' }} />
      </div>
    </>
  );
}
function Pill({ mono, className, ...p }) {
  return <span className={cx('rounded-full border border-line bg-[color-mix(in_srgb,var(--bg)_55%,var(--surface))] px-3.5 py-1 text-[13px]', mono && 'font-mono', className)} {...p} />;
}
