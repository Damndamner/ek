import { useEffect, useRef, useState } from 'react';
import { useApp } from '../store.jsx';
import { EMO, MUS_BASE, emoPath, isRest, isSession } from '../lib/life.js';
import { fitStreak } from '../lib/derived.js';
import { addDays, iso, pastDate, todayIso } from '../lib/dates.js';
import { Band, Btn, Card, Chip, Field, H2, Hint, Input, Mini, Panel, Row, Select, cx } from '../components/ui.jsx';

const FIT_TYPES = ['Gym workout', 'Home workout', 'Walk', 'Steps / calories only', 'Rest / recovery'];
const EMOJI = { 1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };

function Fitness() {
  const { state, mutate, award } = useApp();
  const [date, setDate] = useState(todayIso());
  const [type, setType] = useState(FIT_TYPES[0]);
  const [sel, setSel] = useState({});
  const [newMus, setNewMus] = useState('');
  const [kc, setKc] = useState('');
  const [sp, setSp] = useState('');
  const kcRef = useRef(null);
  const td = todayIso();

  const base = MUS_BASE.map((x) => x.toLowerCase());
  const custom = state.muscles.filter((m) => base.indexOf(m.toLowerCase()) < 0);
  const allMus = MUS_BASE.concat(custom);

  let wk = 0;
  for (let i = 0; i < 7; i++) { const ds = iso(pastDate(i)); if (state.fit.some((f) => f.date === ds && isSession(f))) wk++; }
  let tsteps = 0, tk = 0;
  state.fit.forEach((f) => { if (f.date === td) { tsteps += +f.steps || 0; tk += +f.kcal || 0; } });

  const addGroup = () => {
    const v = newMus.trim();
    if (!v || v.length > 24) return;
    const all = MUS_BASE.concat(state.muscles).map((x) => x.toLowerCase());
    if (all.indexOf(v.toLowerCase()) < 0) mutate((s) => { s.muscles.push(v); });
    setSel((o) => ({ ...o, [v]: true }));
    setNewMus('');
  };

  const log = () => {
    const t = type;
    const kcal = Math.max(0, Math.round(parseFloat(kc) || 0)), steps = Math.max(0, Math.round(parseFloat(sp) || 0));
    const mus = /Gym|Home/.test(t) ? allMus.filter((m) => sel[m]) : [];
    const rest = t.indexOf('Rest') >= 0;
    if (!rest && !mus.length && !kcal && !steps && /Steps|Walk/.test(t)) { kcRef.current && kcRef.current.focus(); return; }
    const entry = { id: String(Date.now()), date: date || td, type: t, muscles: mus, kcal, steps };
    setSel({}); setKc(''); setSp('');
    if (rest) { mutate((s) => { s.fit.push(entry); }); return; }
    const pts = (isSession({ type: t }) ? 15 : 0) + Math.min(20, Math.floor(kcal / 50)) + Math.min(15, Math.floor(steps / 1000)) + (steps >= 8000 ? 5 : 0);
    const add = (s) => { s.fit.push(entry); };
    if (pts > 0) award(pts, 'Fitness: ' + t + (kcal ? ' · ' + kcal + ' kcal' : '') + (steps ? ' · ' + steps + ' steps' : ''), add);
    else mutate(add);
  };

  const heat = [];
  for (let j = 13; j >= 0; j--) {
    const d = iso(pastDate(j)), en = state.fit.find((f) => f.date === d);
    heat.push({ d, en });
  }
  const rows = state.fit.slice().reverse().slice(0, 6);

  return (
    <Card>
      <H2>Fitness</H2>
      <Hint>Tick the muscle groups, add calories and steps. Points: +15 per workout, +1 per 50 kcal (max 20), +1 per 1,000 steps (max 15), +5 bonus at 8,000 steps.</Hint>
      <Row>
        <Band v={wk + '/4'} k="Sessions this week" />
        <Band v={String(fitStreak(state))} k="Streak" />
        <Band v={tsteps.toLocaleString()} k="Steps today" />
        <Band v={tk.toLocaleString()} k="Kcal today" />
      </Row>
      <Row>
        <Input type="date" aria-label="Date" className="!w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
        <Select aria-label="Type" className="!w-auto" value={type} onChange={(e) => setType(e.target.value)}>
          {FIT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </Select>
      </Row>
      <Hint>Muscle groups (gym or home workout)</Hint>
      <div className="flex flex-wrap gap-1.5">
        {allMus.map((m) => <Chip key={m} on={!!sel[m]} onClick={() => setSel((o) => ({ ...o, [m]: !o[m] }))}>{m}</Chip>)}
      </div>
      <Row>
        <Input className="min-w-[150px] flex-1" placeholder="Add a group (e.g. shoulders)" aria-label="New muscle group" value={newMus} onChange={(e) => setNewMus(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addGroup(); }} />
        <Btn variant="ghost" onClick={addGroup}>Add group</Btn>
      </Row>
      <Row>
        <Input ref={kcRef} type="number" min="0" inputMode="numeric" placeholder="kcal burnt" aria-label="Kcal burnt" className="!w-32" value={kc} onChange={(e) => setKc(e.target.value)} />
        <Input type="number" min="0" inputMode="numeric" placeholder="steps" aria-label="Steps" className="!w-32" value={sp} onChange={(e) => setSp(e.target.value)} />
        <Btn onClick={log}>Log</Btn>
      </Row>
      <Hint>Last 14 days</Hint>
      <div className="grid grid-cols-[repeat(14,1fr)] gap-1">
        {heat.map(({ d, en }) => (
          <i key={d} title={d + (en ? ': ' + en.type : ': no log')} className={cx('block aspect-square rounded', !en && 'bg-line', en && isRest(en) && 'bg-accent-soft outline outline-1 outline-accent', en && !isRest(en) && 'bg-accent')} />
        ))}
      </div>
      <div className="flex flex-col">
        {rows.map((f) => {
          const parts = [f.date, f.type];
          if (f.muscles && f.muscles.length) parts.push(f.muscles.join(', '));
          if (f.kcal) parts.push(f.kcal + ' kcal');
          if (f.steps) parts.push((+f.steps).toLocaleString() + ' steps');
          return (
            <div key={f.id} className="flex items-center gap-2.5 border-b border-line px-0.5 py-2 last:border-b-0">
              <span className="min-w-0 flex-1 break-words">{parts.join('  ·  ')}</span>
              <Btn variant="x" aria-label="Delete" onClick={() => mutate((s) => { s.fit = s.fit.filter((q) => q.id !== f.id); })}>✕</Btn>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

const CORE_MOOD = { Happy: 5, Sad: 2, Angry: 2, Fearful: 2, Disgusted: 2 };

function Mood() {
  const { state, award } = useApp();
  const [emo, setEmo] = useState({ core: '', sec: '', ter: '' });
  const [good, setGood] = useState('');
  const [next, setNext] = useState('');
  const [msg, setMsg] = useState('');
  const [secs, setSecs] = useState(null); // null idle, number running, 0 done
  const [running, setRunning] = useState(false);
  const awardRef = useRef(award); awardRef.current = award;

  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => setSecs((n) => (n > 0 ? n - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [running]);
  useEffect(() => {
    if (running && secs === 0) { setRunning(false); awardRef.current(5, '1-minute breathing break'); }
  }, [running, secs]);

  const sec = emo.core ? Object.keys(EMO[emo.core].s) : [];
  const ter = emo.core && emo.sec ? EMO[emo.core].s[emo.sec] : [];
  const col = emo.core ? EMO[emo.core].c : '#999';

  const save = () => {
    if (!emo.core) { setMsg('Pick a core feeling first.'); return; }
    const g = good.trim(), nx = next.trim(), d = todayIso();
    const e = emo;
    setGood(''); setNext(''); setMsg(''); setEmo({ core: '', sec: '', ter: '' });
    award(5 + (g ? 3 : 0), 'Mood check-in', (s) => {
      const now = Date.now();
      s.well.push({ id: 'q' + now, date: d, core: e.core, sec: e.sec, ter: e.ter, mood: CORE_MOOD[e.core] || 3, note: g });
      if (g) s.ref.grat.push({ id: 'r' + now, text: g, date: d, done: false });
      if (nx) s.plan.push({ id: 'p' + now, date: iso(addDays(1)), time: '', title: nx, kind: 'Personal', remind: -1, done: false });
    });
  };

  const EmoBtn = ({ n, on, c, onClick }) => (
    <button type="button" aria-pressed={on} onClick={onClick} style={{ borderLeft: `5px solid ${c}` }}
      className={cx('cursor-pointer rounded-xl border px-3 py-1.5 text-[13px] font-medium transition', on ? 'border-accent bg-accent-soft text-fg' : 'border-line bg-transparent text-fg hover:border-accent')}>{n}</button>
  );

  return (
    <Card>
      <H2>Mood check-in</H2>
      <Hint>Follow the emotion wheel: pick the core feeling, then get more precise. +5 points (+3 with gratitude).</Hint>
      <div className="flex flex-wrap gap-1.5">
        {Object.keys(EMO).map((n) => <EmoBtn key={n} n={n} on={emo.core === n} c={EMO[n].c} onClick={() => setEmo({ core: n, sec: '', ter: '' })} />)}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sec.map((n) => <EmoBtn key={n} n={n} on={emo.sec === n} c={col} onClick={() => setEmo({ ...emo, sec: n, ter: '' })} />)}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ter.map((n) => <EmoBtn key={n} n={n} on={emo.ter === n} c={col} onClick={() => setEmo({ ...emo, ter: n })} />)}
      </div>
      <div className="font-display text-base font-semibold">{emo.core ? emoPath(emo) : 'Pick a core feeling'}</div>
      <Field label="Gratitude: one thing I am grateful for">
        <Input placeholder="Today I am grateful for..." value={good} onChange={(e) => setGood(e.target.value)} />
      </Field>
      <Field label="Next-day task: one thing for tomorrow">
        <Input placeholder="Goes into tomorrow's Planner" value={next} onChange={(e) => setNext(e.target.value)} />
      </Field>
      <Row>
        <Btn onClick={save}>Log check-in</Btn>
        <span className="text-[13px] text-muted" role="status">{msg}</span>
      </Row>
      <Mini tag="Box breathing">
        <div>In 4s, hold 4s, out 4s, hold 4s. Repeat four times.</div>
        <Row>
          <Btn sm variant="ghost" disabled={running} onClick={() => { setSecs(60); setRunning(true); }}>Start 1 min timer</Btn>
          <span className="font-mono tabular-nums" role="timer">{secs === null ? '' : secs === 0 ? 'done' : secs + 's'}</span>
        </Row>
      </Mini>
      <div className="flex flex-col">
        {state.well.slice().reverse().slice(0, 8).map((q) => (
          <div key={q.id} className="flex items-center gap-2.5 border-b border-line px-0.5 py-2 last:border-b-0">
            <span className="min-w-0 flex-1 break-words">{q.date + '  ' + (q.core ? emoPath(q) : EMOJI[q.mood] || '') + (q.note ? '  ·  ' + q.note : '')}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Body() {
  return (
    <Panel>
      <Fitness />
      <Mood />
    </Panel>
  );
}
