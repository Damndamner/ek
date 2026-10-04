import { useApp } from '../store.jsx';
import { useTimer } from '../timer.jsx';
import { ACTS, GR, S1, S2, S3, T1, T2, T2NAME } from '../data/content.js';
import { DAYS, DAYBY, TASKS, doneCount, clampView, wordsFor } from '../lib/plan.js';
import { fmt, todayIso } from '../lib/dates.js';
import { loadSpeaking, loadWriting } from '../lib/prompts.js';
import { EMO, lvl } from '../lib/life.js';
import { lfStreaks, ptsToday } from '../lib/derived.js';
import PlanRow from '../components/PlanRow.jsx';
import { Btn, Card, Check, Hint, Mini, Panel, Row, cx } from '../components/ui.jsx';

function PromptCard({ kind, idx }) {
  const { mutate, go } = useApp();
  const x = (kind === 't2' ? T2 : T1)[idx]; if (!x) return null;
  return (
    <Mini tag={kind === 't2' ? `Today's Task 2 prompt · ${T2NAME[x[0]]}` : `Today's Task 1 prompt · ${x[0]}`}>
      <div>{x[1]}</div>
      <Row>
        <Btn sm onClick={() => { mutate((s) => loadWriting(s, kind, idx)); go('writing'); }}>Write it in the lab</Btn>
        <Btn sm variant="ghost" onClick={() => { mutate((s) => loadWriting(s, kind, null)); go('writing'); }}>Choose my own</Btn>
      </Row>
    </Mini>
  );
}
function SpeakCards({ t }) {
  const { mutate, go } = useApp();
  const { tx, sp } = t;
  const all = /Full mock|mock speaking|14 minute/i.test(tx);
  return (
    <Mini tag="Today's questions">
      {(all || /Part 1/i.test(tx)) && <div>Part 1: {sp.p1.map((i) => S1[i]).join('  ·  ')}</div>}
      {(all || /Part 2|cue card|Shadow|Idioms|Record two/i.test(tx) || !/Part 3|Part 1/i.test(tx)) && <div>Part 2: {S2[sp.card]}</div>}
      {/two Part 2|Record two|four cue|three cue/i.test(tx) && <div>Part 2 (second card): {S2[sp.card2]}</div>}
      {(all || /Part 3/i.test(tx)) && <div>Part 3: {sp.p3.map((i) => S3[i]).join('  ·  ')}</div>}
      <Row><Btn sm onClick={() => { mutate((s) => loadSpeaking(s, 'p2', sp.card)); go('speaking'); }}>Open in Speaking lab</Btn></Row>
    </Mini>
  );
}

function TaskRow({ t, day, nowId }) {
  const { state, mutate, awardOnce, go, setUi } = useApp();
  const { startTask } = useTimer();
  const on = !!state.done[t.id];
  const act = ACTS[day.idx] || '';
  const toggle = (checked) => {
    if (!checked) { mutate((s) => { delete s.done[t.id]; }); return; }
    mutate((s) => { s.done[t.id] = 1; });
    awardOnce(t.id, Math.max(5, Math.min(20, Math.round((t.m || 20) / 4))), 'IELTS · ' + t.sk);
    const n = doneCount(day, { ...state.done, [t.id]: 1 });
    if (n === day.tasks.length) awardOnce('day-' + day.s, 20, 'Full IELTS day complete');
  };
  return (
    <div className={cx('grid grid-cols-[28px_minmax(0,1fr)] items-start gap-2 rounded-2xl border bg-[color-mix(in_srgb,var(--bg)_40%,var(--surface))] px-3.5 py-3 transition', t.id === nowId ? 'border-accent shadow-[0_0_0_1px_var(--accent)]' : 'border-line', on && 'task-done')}>
      <Check className="mt-0.5 !h-[22px] !w-[22px]" checked={on} aria-label={`Mark ${t.sk} done`} onChange={(e) => toggle(e.target.checked)} />
      <details open={t.id === nowId}>
        <summary className="flex cursor-pointer list-none items-baseline justify-between gap-2.5">
          <span className={cx('font-display text-[17px] font-semibold', on && 'text-muted line-through')}>{t.sk}</span>
          <span className="font-mono text-xs text-muted">{t.m ? t.m + ' min' : ''}</span>
        </summary>
        <div className="flex flex-col gap-2.5 pt-2">
          <div>{t.tx}</div>
          {t.w && t.w.t1.map((i) => <PromptCard key={'a' + i} kind="t1" idx={i} />)}
          {t.w && t.w.t2.map((i) => <PromptCard key={'b' + i} kind="t2" idx={i} />)}
          {t.sp && <SpeakCards t={t} />}
          {/Vocab/i.test(t.sk) && (
            <Mini tag="Today's words">
              <div>{wordsFor(day.idx, state.custom).map((x) => x.w).join(' · ')}</div>
              <div><Btn sm onClick={() => { setUi({ fcIdx: day.idx, wSeg: 'today' }); go('words'); }}>Open flashcards</Btn></div>
            </Mini>
          )}
          {/Listening|Reading/.test(t.sk) && !t.pre && <div><Btn sm variant="ghost" onClick={() => go('readlisten')}>Practice sources</Btn></div>}
          {t.m > 0 && (
            <Row>
              <Btn big onClick={() => startTask(t, 'run', act)}>Start timer</Btn>
              {t.m >= 30 && !t.pre && <Btn variant="ghost" onClick={() => startTask(t, 'sprint', act)}>Start in short sprints</Btn>}
            </Row>
          )}
        </div>
      </details>
    </div>
  );
}

function LifeToday() {
  const { state, mutate, award, awardOnce, go } = useApp();
  const l = lvl(state.pts.total), td = todayIso();
  const pending = state.work.filter((w) => !w.done).slice(0, 2);
  const moved = state.fit.some((f) => f.date === td);
  const plans = state.plan.filter((e) => e.date === td && !e.done).sort((a, b) => ((a.time || '99') < (b.time || '99') ? -1 : 1)).slice(0, 3);
  const hasWin = state.ref.win.some((w) => w.date === td);
  const checked = state.well.some((w) => w.date === td);
  const happy = state.ref.happy.length ? state.ref.happy[(new Date().getDate() + state.ref.happy.length) % state.ref.happy.length] : null;
  const tagName = (t) => (t === 'uit' ? 'U&I Trust' : t === 'ryla' ? 'Ryla' : 'Company');
  const Row2 = (p) => <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-0.5 py-2 last:border-b-0" {...p} />;
  return (
    <Card>
      <b>Life today</b>
      <Hint>Today {ptsToday(state)} / 60 pts · Level {l.n} {l.name} · streak {lfStreaks(state).d}</Hint>
      <div className="flex flex-col">
        {pending.map((w) => (
          <Row2 key={w.id}>
            <Check aria-label="Done" checked={false} onChange={() => awardOnce('w' + w.id, 10, 'Work: ' + w.text, (s) => { const x = s.work.find((q) => q.id === w.id); if (x) x.done = true; })} />
            <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-signal">{tagName(w.tag)}</span>
            <label className="min-w-0 flex-1 break-words">{w.text}</label><span className="font-mono text-xs text-muted">+10</span>
          </Row2>
        ))}
        {!moved && <Row2><label className="min-w-0 flex-1">Move your body today. Even 20 minutes counts.</label><span className="font-mono text-xs text-muted">+15</span><Btn sm variant="ghost" onClick={() => go('body')}>Log it</Btn></Row2>}
        {plans.map((e) => <PlanRow key={e.id} e={e} />)}
        {!hasWin && <Row2><label className="min-w-0 flex-1">Log today's daily win</label><span className="font-mono text-xs text-muted">+5</span><Btn sm variant="ghost" onClick={() => go('reflect')}>Add</Btn></Row2>}
        {!checked && (
          <Row2>
            <label className="min-w-0 flex-[1_1_100px]">Mood check-in</label><span className="font-mono text-xs text-muted">+5</span>
            {Object.keys(EMO).map((n) => (
              <button key={n} type="button" style={{ borderLeft: `5px solid ${EMO[n].c}` }} className="cursor-pointer rounded-xl border border-line bg-transparent px-2.5 py-1 text-xs font-medium text-fg"
                onClick={() => award(5, 'Mood check-in: ' + n, (s) => { s.well.push({ id: 'q' + Date.now(), date: td, core: n, sec: '', ter: '', mood: n === 'Happy' ? 5 : 2, note: '' }); })}>{n}</button>
            ))}
          </Row2>
        )}
      </div>
      {happy && <Hint>Something that makes you happy: {happy.text}</Hint>}
      <Mini tag="Cannot start? 5-minute door-opener (once a day each)">
        <div className="flex flex-wrap gap-2">
          {[['i', '🎧 Play 1 listening clip'], ['w', '📧 Open 1 work email'], ['f', '🧦 Put gym clothes on'], ['b', '🌬️ 4-7-8 breathing']].map(([k, lab]) => (
            <Btn key={k} sm variant="ghost" disabled={!!state.opener[td + k]} onClick={() => award(5, 'Door-opener: ' + lab.replace(/^\S+\s/, ''), (s) => { s.opener[td + k] = 1; })}>{lab}</Btn>
          ))}
        </div>
        <Hint>Start the 5-minute version and you are allowed to stop at 5. Most days you will keep going.</Hint>
      </Mini>
    </Card>
  );
}

export default function Today() {
  const { state, ui, setUi, go } = useApp();
  const day = DAYBY[ui.viewIso], tasks = day.tasks, dn = doneCount(day, state.done);
  const nowId = (tasks.find((t) => !state.done[t.id]) || {}).id;
  const total = tasks.reduce((a, t) => a + (t.m || 0), 0);
  return (
    <Panel>
      <div className="flex flex-wrap items-center gap-[18px]">
        <div className="relative h-24 w-24 flex-none">
          <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" className="stroke-line" />
            <circle className="ring-pg stroke-accent" cx="50" cy="50" r="42" fill="none" strokeWidth="9" strokeLinecap="round" strokeDasharray="263.9" strokeDashoffset={263.9 * (1 - dn / tasks.length)} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center font-display text-[22px] font-bold leading-none">{dn}/{tasks.length}<small className="font-sans text-[11px] font-normal text-muted">done</small></div>
        </div>
        <div>
          <div className="font-mono text-[13px] text-muted">DAY {day.idx + 1} OF {DAYS.length}{day.ext ? ' · OPTIONAL EXTENSION' : ''}{ui.viewIso === todayIso() ? ' · TODAY' : ''}</div>
          <h2 className="font-display text-[28px] font-bold leading-[1.1]">{fmt(day.date)}</h2>
          <div className="text-[13px] text-muted">{day.tag} · {total} min planned</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Btn sm variant="ghost" disabled={day.idx === 0} onClick={() => setUi({ viewIso: DAYS[day.idx - 1].s })}>‹ Previous day</Btn>
        <Btn sm variant="ghost" onClick={() => setUi({ viewIso: clampView(todayIso()) })}>Today</Btn>
        <Btn sm variant="ghost" disabled={day.idx === DAYS.length - 1} onClick={() => setUi({ viewIso: DAYS[day.idx + 1].s })}>Next day ›</Btn>
      </div>
      {dn >= tasks.length && <div className="rounded-[14px] bg-accent-soft px-4 py-3 font-semibold">Day complete. Close the laptop, move your body, sleep well. Tomorrow is already planned.</div>}
      <div className="flex flex-col gap-2.5">{tasks.map((t) => <TaskRow key={t.id} t={t} day={day} nowId={nowId} />)}</div>
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-1 rounded-[14px] bg-signal-soft px-3.5 py-3">
          <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-signal">Reset activity of the day</span>
          <div>{ACTS[day.idx] || ACTS[0]}</div>
        </div>
        <Card><b>5-minute grammar check</b><Hint>Five questions on a mistake pattern that matters for IELTS. Optional bonus.</Hint>
          <div><Btn sm variant="ghost" onClick={() => { setUi({ gIdx: day.idx % GR.length }); go('grammar'); }}>Open Grammar</Btn></div></Card>
        <LifeToday />
      </div>
    </Panel>
  );
}
