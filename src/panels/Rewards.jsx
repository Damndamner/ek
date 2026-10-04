import { useRef, useState } from 'react';
import { useApp } from '../store.jsx';
import { BADGES, lvl } from '../lib/life.js';
import { lfStreaks } from '../lib/derived.js';
import { downloadFile } from '../lib/ics.js';
import { todayIso } from '../lib/dates.js';
import { Band, Btn, Card, H2, H3, Hint, Mini, Panel, Row, Scroll, Table, Td, cx } from '../components/ui.jsx';

const REWARDS = [
  ['Daily win', '60 pts a day', 'Favourite show episode, guilt-free'],
  ['Weekly win', '400 pts a week', 'Favourite food or bubble tea'],
  ['Monthly win', '1500 pts a month', 'A treat you have been wanting'],
  ['Mock milestone', '2 mocks logged', 'A whole cosy day, zero guilt'],
];

function convertOld(p, state) {
  return {
    ...state,
    work: (p.work || []).map((w) => ({ id: String(w.id), text: String(w.text || ''), tag: w.tag === 'uit' ? 'uit' : 'work', done: !!w.done })),
    exp: (p.expenses || []).map((x) => ({ id: String(x.id), date: String(x.date), label: String(x.label || ''), cat: String(x.cat || 'Other'), amt: +x.amt || 0 })),
    fit: (p.fitness || []).map((x) => ({ id: String(x.id), date: String(x.date), type: String(x.type) })),
    well: (p.wellness || []).map((x) => ({ id: String(x.id), date: String(x.date), mood: +x.mood || 3, note: String(x.note || '') })),
    per: (p.period || []).map((x) => ({ id: String(x.id), date: String(x.date), flow: String(x.flow || 'Medium') })),
    pts: { total: +p.points.total || 0, log: (p.points.log || []).map((l) => ({ n: +l.n || 0, r: String(l.reason || ''), ts: String(l.ts || todayIso()) })) },
  };
}

export default function Rewards() {
  const { state, replaceState } = useApp();
  const [msg, setMsg] = useState('');
  const fileRef = useRef(null);
  const timer = useRef(null);
  const say = (m) => { setMsg(m); clearTimeout(timer.current); if (m) timer.current = setTimeout(() => setMsg(''), 6000); };

  const l = lvl(state.pts.total);
  const into = state.pts.total - l.from, span = l.to ? l.to - l.from : 1;
  const st = lfStreaks(state);

  const save = () => {
    try { downloadFile('ielts-tracker-progress-' + todayIso() + '.json', JSON.stringify(state, null, 2), 'application/json'); say('Progress file saved.'); }
    catch (e) { say('Saving is not available here.'); }
  };
  const load = (e) => {
    const input = e.target, f = input.files && input.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = (ev) => {
      try {
        const p = JSON.parse(ev.target.result);
        if (!p || typeof p !== 'object') throw new Error('bad');
        if (p.known || p.wHist || p.pointed) replaceState({ ...state, ...p });
        else if (p.points) replaceState(convertOld(p, state));
        else throw new Error('bad');
        say('Progress loaded.');
      } catch (err) { say('Could not read that file. Pick a progress file saved from this tracker or the old Daily Quest.'); }
      input.value = '';
    };
    rd.onerror = () => { say('Could not read that file. Pick a progress file saved from this tracker or the old Daily Quest.'); input.value = ''; };
    rd.readAsText(f);
  };

  return (
    <Panel>
      <Card>
        <H2>{'Level ' + l.n + ' · ' + l.name}</H2>
        <div className="h-3 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={l.to ? Math.round(100 * into / span) : 100}>
          <i className="block h-full rounded-full bg-accent transition-[width]" style={{ width: (l.to ? Math.round(100 * into / span) : 100) + '%' }} />
        </div>
        <Row className="justify-between">
          <span className="font-mono text-[13px] text-muted">{l.to ? into + ' / ' + span + ' pts to next level' : 'Top level'}</span>
          <span className="font-mono text-[13px] text-muted">{state.pts.total + ' total pts'}</span>
        </Row>
      </Card>
      <Card>
        <H3>Streaks</H3>
        <Row><Band v={String(st.d)} k="Daily" /><Band v={String(st.w)} k="Weekly" /><Band v={String(st.m)} k="Monthly" /></Row>
        <Hint>A missed day pauses the streak, it does not punish you. Rest is allowed.</Hint>
      </Card>
      <Card>
        <H3>Badges</H3>
        <div className="flex flex-wrap gap-1.5">
          {BADGES.map((b) => (
            <span key={b[0]} className={cx('rounded-full border border-line bg-surface px-3 py-1 text-[13px]', state.badges.indexOf(b[0]) < 0 && 'opacity-35')}>{b[1] + ' ' + b[2]}</span>
          ))}
        </div>
      </Card>
      <Card>
        <H3>Reward menu</H3>
        <Hint>Edit the real reward to whatever excites you.</Hint>
        <Scroll>
          <Table className="min-w-0"><tbody>
            {REWARDS.map((r) => <tr key={r[0]}><Td>{r[0]}</Td><Td className="font-mono">{r[1]}</Td><Td>{r[2]}</Td></tr>)}
          </tbody></Table>
        </Scroll>
      </Card>
      <Card>
        <H3>Recent compliments</H3>
        <div className="flex flex-col gap-2">
          {!state.comps.length && <Hint>Tick a task anywhere and your first compliment lands here.</Hint>}
          {state.comps.map((q, i) => (
            <Mini key={i}><b>{'+' + q.n + ' pts · ' + q.r}</b><span className="text-[13px] text-muted">{q.l}</span></Mini>
          ))}
        </div>
      </Card>
      <Card>
        <H3>Backup</H3>
        <Hint>Progress lives in this browser. Save a file now and then. Loading also accepts a file from the old Ek's Daily Quest.</Hint>
        <Row>
          <Btn variant="ghost" onClick={save}>Save progress file</Btn>
          <Btn variant="ghost" onClick={() => fileRef.current && fileRef.current.click()}>Load progress file</Btn>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden aria-label="Progress file" onChange={load} />
          <span className="text-[13px] text-muted" role="status">{msg}</span>
        </Row>
      </Card>
    </Panel>
  );
}
