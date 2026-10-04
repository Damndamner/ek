import { useEffect, useRef, useState } from 'react';
import { useApp } from '../store.jsx';
import { DOW, MONTHS, fmt, iso, pad2, parseIso, todayIso } from '../lib/dates.js';
import { DAYBY, doneCount } from '../lib/plan.js';
import { isSession } from '../lib/life.js';
import { buildIcs, downloadFile } from '../lib/ics.js';
import PlanRow from '../components/PlanRow.jsx';
import { Band, Btn, Card, Chip, Field, H2, H3, Hint, Input, Mini, Panel, Row, Seg, Select, Textarea, cx } from '../components/ui.jsx';

const KINDS = ['Appointment', 'Work', 'Ryla', 'IELTS', 'Meeting', 'Reminder', 'Birthday', 'Anniversary', 'Bill', 'Goal', 'Health', 'Errand', 'Personal'];
const dayEvents = (plan, d) => plan.filter((e) => e.date === d).sort((a, b) => ((a.time || '99:99') < (b.time || '99:99') ? -1 : (a.time || '99:99') > (b.time || '99:99') ? 1 : 0));

function MonthCard({ month, setMonth }) {
  const { state, ui, setUi } = useApp();
  const y = month.getFullYear(), m = month.getMonth(), td = todayIso();
  const lead = new Date(y, m, 1).getDay(), n = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(<span key={'b' + i} />);
  for (let d = 1; d <= n; d++) {
    const s = `${y}-${pad2(m + 1)}-${pad2(d)}`;
    const hasEv = state.plan.some((e) => e.date === s), hasI = !!DAYBY[s], hasG = state.fit.some((f) => f.date === s) || !!state.logs[s];
    cells.push(
      <button key={s} type="button" aria-label={s} aria-pressed={s === ui.pnDate} onClick={() => setUi({ pnDate: s })}
        className={cx('flex aspect-square min-w-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border text-sm transition hover:border-accent',
          s === ui.pnDate ? 'border-accent bg-accent text-on-accent' : s === td ? 'border-accent bg-accent-soft text-fg' : 'border-transparent bg-transparent text-fg')}>
        <span>{d}</span>
        <span className="flex h-1.5 gap-0.5">
          {hasEv && <i className="h-1.5 w-1.5 rounded-full bg-signal" />}
          {hasI && <i className="h-1.5 w-1.5 rounded-full bg-[#22d3ee]" />}
          {hasG && <i className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />}
        </span>
      </button>
    );
  }
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <Btn sm variant="ghost" aria-label="Previous month" onClick={() => setMonth(new Date(y, m - 1, 1))}>◀</Btn>
        <H2>{MONTHS[m]} {y}</H2>
        <Btn sm variant="ghost" aria-label="Next month" onClick={() => setMonth(new Date(y, m + 1, 1))}>▶</Btn>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {DOW.map((d) => <div key={d} className="py-1 text-center text-[11px] uppercase text-muted">{d.slice(0, 2)}</div>)}
        {cells}
      </div>
      <div className="flex flex-wrap gap-3.5 text-xs text-muted">
        <span><span className="text-signal">●</span> your events</span>
        <span><span className="text-[#22d3ee]">●</span> IELTS day</span>
        <span><span className="text-[#34d399]">●</span> workout or log</span>
      </div>
    </Card>
  );
}

function AddEvent() {
  const { ui, setUi, mutate } = useApp();
  const [title, setTitle] = useState(''), [kind, setKind] = useState('Appointment'), [pri, setPri] = useState('normal');
  const [time, setTime] = useState(''), [rem, setRem] = useState('10'), [loc, setLoc] = useState(''), [notes, setNotes] = useState('');
  const add = () => {
    const t = title.trim(); if (!t) return;
    const ev = { id: 'p' + Date.now(), date: ui.pnDate, time, title: t, kind, pri, loc: loc.trim(), notes: notes.trim(), remind: +rem, done: false };
    mutate((s) => { s.plan.push(ev); });
    setTitle(''); setTime(''); setLoc(''); setNotes('');
  };
  const key = (e) => { if (e.key === 'Enter') add(); };
  return (
    <Card>
      <H2>Add event or reminder</H2>
      <Hint>Adds to the selected day. Reminders pop up while this page is open.</Hint>
      <Row><Input className="min-w-[150px] flex-[1_1_220px]" aria-label="Title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={key} /></Row>
      <Row>
        <Select aria-label="Kind" value={kind} onChange={(e) => setKind(e.target.value)}>{KINDS.map((k) => <option key={k}>{k}</option>)}</Select>
        <Select aria-label="Priority" value={pri} onChange={(e) => setPri(e.target.value)}><option value="normal">normal</option><option value="high">high priority</option></Select>
        <Input className="!w-auto" type="date" aria-label="Date" value={ui.pnDate} onChange={(e) => { if (e.target.value) setUi({ pnDate: e.target.value }); }} />
        <Input className="!w-auto" type="time" aria-label="Time" value={time} onChange={(e) => setTime(e.target.value)} />
        <Select aria-label="Reminder" value={rem} onChange={(e) => setRem(e.target.value)}>
          <option value="-1">No reminder</option><option value="0">At the time</option><option value="10">10 min before</option><option value="30">30 min before</option><option value="60">1 hour before</option><option value="1440">1 day before</option>
        </Select>
      </Row>
      <Row>
        <Input className="min-w-[140px] flex-[1_1_180px]" aria-label="Location" placeholder="Location (optional)" value={loc} onChange={(e) => setLoc(e.target.value)} onKeyDown={key} />
        <Input className="min-w-[140px] flex-[1_1_180px]" aria-label="Notes" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} onKeyDown={key} />
        <Btn onClick={add}>Add event</Btn>
      </Row>
    </Card>
  );
}

function DayCard() {
  const { state, ui, setUi, mutate, awardOnce, go } = useApp();
  const pd = ui.pnDate, td = todayIso();
  const day = DAYBY[pd], ev = dayEvents(state.plan, pd);
  const f = state.fit.filter((q) => q.date === pd);
  const steps = f.reduce((a, q) => a + (+q.steps || 0), 0);
  const md = state.well.filter((q) => q.date === pd).pop();
  const spent = state.exp.filter((q) => q.date === pd).reduce((a, b) => a + (+b.amt || 0), 0);
  const shift = (n) => { const d = parseIso(pd); d.setDate(d.getDate() + n); setUi({ pnDate: iso(d) }); };
  return (
    <Card>
      <H2>{fmt(parseIso(pd))}{pd === td ? ' (today)' : ''}</H2>
      <Row>
        <Btn sm variant="ghost" onClick={() => shift(-1)}>‹ Day</Btn>
        <Btn sm variant="ghost" onClick={() => setUi({ pnDate: td })}>Today</Btn>
        <Btn sm variant="ghost" onClick={() => shift(1)}>Day ›</Btn>
      </Row>
      <Row>
        <Band v={day ? `${doneCount(day, state.done)}/${day.tasks.length}` : '–'} k="IELTS tasks" />
        <Band v={String(f.filter(isSession).length)} k="Workouts" />
        <Band v={steps.toLocaleString()} k="Steps" />
        <Band v={md ? md.core || 'logged' : '–'} k="Mood" />
        <Band v={'₹' + spent.toLocaleString()} k="Spent" />
      </Row>
      {day && (
        <Mini tag="IELTS plan for the day">
          {day.tasks.map((t) => <div key={t.id}>{state.done[t.id] ? '✓ ' : '○ '}{t.sk}{t.m ? ' · ' + t.m + ' min' : ''}</div>)}
          <div><Btn sm variant="ghost" onClick={() => { setUi({ viewIso: day.s }); go('today'); }}>Open in Today</Btn></div>
        </Mini>
      )}
      <div className="flex flex-col">
        {!ev.length && <Hint>Nothing planned for this day yet.</Hint>}
        {ev.map((e) => <PlanRow key={e.id} e={e} link />)}
      </div>
      <Field label="Daily log: what I actually did today">
        <Textarea short placeholder="Work done, activities, wins, anything worth remembering." value={state.logs[pd] || ''}
          onChange={(e) => { const v = e.target.value; mutate((s) => { s.logs[pd] = v; }); }}
          onBlur={(e) => { if (e.target.value.trim().length >= 10) awardOnce('log' + pd, 5, 'Daily log written'); }} />
      </Field>
    </Card>
  );
}

function Upcoming() {
  const { state } = useApp();
  const [filter, setFilter] = useState('All');
  const td = todayIso();
  const up = state.plan.filter((e) => e.date >= td).sort((a, b) => { const ka = a.date + (a.time || '99:99'), kb = b.date + (b.time || '99:99'); return ka < kb ? -1 : ka > kb ? 1 : 0; });
  const kinds = ['All']; up.forEach((e) => { if (!kinds.includes(e.kind)) kinds.push(e.kind); });
  const cur = kinds.includes(filter) ? filter : 'All';
  const list = up.filter((e) => cur === 'All' || e.kind === cur).slice(0, 30);
  return (
    <Card>
      <H2>Upcoming events</H2>
      <Seg>{kinds.map((k) => <Chip key={k} on={k === cur} onClick={() => setFilter(k)}>{k}</Chip>)}</Seg>
      <div className="flex flex-col">
        {!list.length && <Hint>No upcoming events.</Hint>}
        {list.map((e) => <PlanRow key={e.id} e={e} link showDate />)}
      </div>
    </Card>
  );
}

function GCal() {
  const { state, ui } = useApp();
  const [msg, setMsg] = useState('');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const say = (m) => { setMsg(m); clearTimeout(timer.current); if (m) timer.current = setTimeout(() => setMsg(''), 6000); };
  const exp = (list, name) => {
    if (!list.length) { say('No events to export.'); return; }
    try { downloadFile(name, buildIcs(list), 'text/calendar'); say('Calendar file saved. Import it in Google Calendar: Settings, Import & export.'); } catch (e) { say('Saving is not available here.'); }
  };
  const notif = () => {
    try {
      if (!('Notification' in window)) { say('Notifications are not supported here. In-page reminders still work while this tab is open.'); return; }
      Notification.requestPermission().then((p) => say(p === 'granted' ? 'Notifications allowed.' : 'Notifications blocked. In-page reminders still work.'));
    } catch (e) { say('Notifications are not available here.'); }
  };
  return (
    <Card>
      <H3>Google Calendar</H3>
      <Hint>Each event has an "Add to Google Calendar" link that opens it prefilled. You can also export a calendar file (.ics) with reminders and import it into Google Calendar. Live two-way sync needs a Google Calendar connector, which is not attached to this page.</Hint>
      <Row>
        <Btn variant="ghost" onClick={() => exp(dayEvents(state.plan, ui.pnDate), 'planner-' + ui.pnDate + '.ics')}>Export this day (.ics)</Btn>
        <Btn variant="ghost" onClick={() => exp(state.plan.filter((e) => e.date >= todayIso()), 'planner-upcoming.ics')}>Export all upcoming (.ics)</Btn>
        <Btn variant="ghost" onClick={notif}>Allow notifications</Btn>
        <span className="text-[13px] text-muted" role="status">{msg}</span>
      </Row>
    </Card>
  );
}

export default function LifeCalendar() {
  const { ui } = useApp();
  const [month, setMonth] = useState(() => { const d = parseIso(ui.pnDate); return new Date(d.getFullYear(), d.getMonth(), 1); });
  useEffect(() => { const d = parseIso(ui.pnDate); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)); }, [ui.pnDate]);
  return (
    <Panel>
      <MonthCard month={month} setMonth={setMonth} />
      <AddEvent />
      <DayCard />
      <Upcoming />
      <GCal />
    </Panel>
  );
}
