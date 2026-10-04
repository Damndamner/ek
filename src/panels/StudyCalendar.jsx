import { useState } from 'react';
import { useApp } from '../store.jsx';
import { DAYS, EXAM_DEFAULT, doneCount, lBand, rBand, overall } from '../lib/plan.js';
import { MON, b1, fmt, todayIso } from '../lib/dates.js';
import { Btn, Card, Field, H2, H3, Hint, Input, Panel, Scroll, Section, Table, Td, Th, cx } from '../components/ui.jsx';

const Cell = ({ v, children }) => <Td className={cx('font-mono', v >= 8 && 'font-semibold text-ok')}>{children}</Td>;

export default function StudyCalendar() {
  const { state, mutate, award, go, setUi } = useApp();
  const exam = state.exam || EXAM_DEFAULT, today = todayIso();
  const lead = (DAYS[0].date.getDay() + 6) % 7;
  const [f, setF] = useState({ date: today, l: '', r: '', w: '', s: '' });
  const sorted = state.mocks.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  const upd = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const m = { id: String(Date.now()), date: f.date, l: parseFloat(f.l), r: parseFloat(f.r), w: parseFloat(f.w), s: parseFloat(f.s) };
    if ([m.l, m.r, m.w, m.s].some(isNaN) || m.l > 40 || m.r > 40 || m.w > 9 || m.s > 9) return;
    award(30, 'Mock test logged', (s) => { s.mocks.push(m); });
    setF((x) => ({ ...x, l: '', r: '', w: '', s: '' }));
  };

  return (
    <Panel>
      <Section>
        <H2>Calendar</H2>
        <Hint>Tap a day to open it. Solid green means all tasks done; orange outline is a mock day. Weeks 7 to 9 (15 Nov to 5 Dec) are an optional extension in case your exam is later.</Hint>
        <div className="flex flex-wrap gap-3.5 text-xs text-muted"><span>Solid = all done</span><span>Tint = some done</span><span>Orange = mock</span><span>Faded = after your exam date</span></div>
        <div className="grid grid-cols-7 gap-1.5">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((n) => <div key={n} className="text-center text-[11px] uppercase tracking-[.06em] text-muted">{n}</div>)}
          {Array.from({ length: lead }, (_, i) => <span key={'b' + i} aria-hidden="true" />)}
          {DAYS.map((day) => {
            const dn = doneCount(day, state.done), full = dn === day.tasks.length, after = day.s >= exam && day.s > '2026-11-14';
            return (
              <button key={day.s} type="button" title={fmt(day.date) + ' · ' + dn + '/' + day.tasks.length}
                onClick={() => { setUi({ viewIso: day.s }); go('today'); }}
                className={cx('flex cursor-pointer flex-col items-center gap-0.5 rounded-lg border px-0 py-1.5 font-medium leading-[1.1] focus-visible:outline-2 focus-visible:outline-signal',
                  full ? 'border-accent bg-accent text-on-accent' : dn > 0 ? 'border-line bg-accent-soft text-fg' : 'border-line bg-surface text-fg',
                  day.mock && '!border-2 !border-signal', day.s === today && 'shadow-[0_0_0_2px_var(--signal)]', after && 'opacity-40')}>
                {day.date.getDate()}
                <small className={cx('font-mono text-[10px]', full ? 'text-inherit' : 'text-muted')}>{MON[day.date.getMonth()]}</small>
              </button>
            );
          })}
        </div>
      </Section>
      <Section>
        <div className="flex flex-wrap items-end gap-2.5">
          <Field label="Exam date (once confirmed)">
            <Input type="date" min="2026-11-15" max="2026-12-06" value={exam} onChange={(e) => { const v = e.target.value; if (v) mutate((s) => { s.exam = v; }); }} />
          </Field>
          <Hint className="max-w-[48ch]">Not sure until a week before? Leave it on 15 Nov.</Hint>
        </div>
      </Section>
      <Card>
        <H3>What 8 needs</H3>
        <p>Overall 8.0 means the four sections average 8: about 35/40 in Listening and Reading, and 7.5 to 8 in Writing and Speaking. Last test: Listening 6, Reading 6, Writing 6, Speaking 6.5. A realistic result is 7 to 7.5 overall with 8 as the stretch. Push Listening and Reading first and give Writing the most hours.</p>
      </Card>
      <Section>
        <H2>Mock score log</H2>
        <form className="flex flex-wrap items-end gap-2.5" onSubmit={submit}>
          <Field label="Date"><Input type="date" required value={f.date} onChange={upd('date')} /></Field>
          <Field label="Listening /40" className="w-28"><Input type="number" min="0" max="40" step="1" required value={f.l} onChange={upd('l')} /></Field>
          <Field label="Reading /40" className="w-28"><Input type="number" min="0" max="40" step="1" required value={f.r} onChange={upd('r')} /></Field>
          <Field label="Writing band" className="w-28"><Input type="number" min="0" max="9" step="0.5" required value={f.w} onChange={upd('w')} /></Field>
          <Field label="Speaking band" className="w-28"><Input type="number" min="0" max="9" step="0.5" required value={f.s} onChange={upd('s')} /></Field>
          <Btn type="submit">Add mock</Btn>
        </form>
        <Scroll>
          <Table>
            <thead><tr><Th>Date</Th><Th>Listening</Th><Th>Reading</Th><Th>Writing</Th><Th>Speaking</Th><Th>Overall</Th><Th /></tr></thead>
            <tbody>
              {!sorted.length && <tr><Td colSpan={7} className="text-muted">No mocks logged yet. Last test: L 6.0 · R 6.0 · W 6.0 · S 6.5 · Overall 6.0. First mock is the diagnostic on Mon 5 Oct.</Td></tr>}
              {sorted.map((m) => {
                const lb = lBand(m.l), rb = rBand(m.r), ov = overall(lb, rb, m.w, m.s);
                return (
                  <tr key={m.id}>
                    <Td className="font-mono">{m.date}</Td>
                    <Cell v={lb}>{m.l}/40 = {b1(lb)}</Cell><Cell v={rb}>{m.r}/40 = {b1(rb)}</Cell>
                    <Cell v={m.w}>{b1(m.w)}</Cell><Cell v={m.s}>{b1(m.s)}</Cell>
                    <Cell v={ov}><b>{b1(ov)}</b></Cell>
                    <Td><Btn sm variant="ghost" onClick={() => mutate((s) => { s.mocks = s.mocks.filter((x) => x.id !== m.id); })}>Remove</Btn></Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Scroll>
      </Section>
    </Panel>
  );
}
