import { useState } from 'react';
import { useApp } from '../store.jsx';
import { useTimer } from '../timer.jsx';
import { BREAKS, makePresets, mk } from '../lib/presets.js';
import { todayIso } from '../lib/dates.js';
import { Btn, Card, Field, Hint, Input, Mono, Panel, Row, Section, H2, H3, Select, UL } from '../components/ui.jsx';

function Presets({ list, load }) {
  return <div className="flex flex-wrap gap-2">{list.map((x) => <Btn key={x.t} variant="ghost" onClick={() => load(x.p())}>{x.t}</Btn>)}</div>;
}

export default function Timers() {
  const { state } = useApp();
  const { load, chkEvery, setChkEvery } = useTimer();
  const P = makePresets(chkEvery);
  const [label, setLabel] = useState('Study block'), [min, setMin] = useState('20');
  const d = state.checks[todayIso()] || { ok: 0, miss: 0 };
  const loadCustom = () => {
    const m = Math.max(1, Math.min(180, parseInt(min, 10) || 20));
    load({ label: label || 'Study block', chk: chkEvery, stages: [mk('Focus', m * 60)] });
  };
  return (
    <Panel>
      <Section>
        <H2>Timers and focus</H2>
        <Hint>Pick a preset, then press Start in the bar at the bottom. Stop pauses; Resume carries on from the same second. At zero it sounds, cuts off and shows "Time's up".</Hint>
        <H3>Mock components (exam conditions, no check-ins)</H3><Presets list={P.mock} load={load} />
        <H3>Practice blocks (with self check-ins)</H3><Presets list={P.practice} load={load} />
        <H3>Focus sprints (short blocks with breaks)</H3><Presets list={P.sprint} load={load} />
      </Section>
      <Section>
        <H3>Custom timer and check-in</H3>
        <Row className="items-end">
          <Field label="Label"><Input type="text" className="!w-[150px]" value={label} onChange={(e) => setLabel(e.target.value)} /></Field>
          <Field label="Minutes"><Input type="number" min="1" max="180" className="!w-24" value={min} onChange={(e) => setMin(e.target.value)} /></Field>
          <Field label="Check-in every">
            <Select value={String(chkEvery)} onChange={(e) => setChkEvery(parseInt(e.target.value, 10) || 0)}>
              <option value="0">off</option><option value="3">3 min</option><option value="5">5 min</option><option value="10">10 min</option>
            </Select>
          </Field>
          <Btn onClick={loadCustom}>Load timer</Btn>
        </Row>
        <Hint>A check-in beeps and asks what the last paragraph was about. It never pauses the timer. Today: <Mono>{d.ok} on task, {d.miss} drifted</Mono></Hint>
      </Section>
      <Section>
        <H3>Quick breaks (rotate in sprints)</H3>
        <div className="flex flex-col gap-2">{BREAKS.map((b, i) => <Card key={i}>{i + 1}. {b}</Card>)}</div>
        <Hint>Keep breaks screen-free. Short, active breaks beat long, passive ones. Every fourth sprint ends with the longer reset activity of the day.</Hint>
      </Section>
      <Section>
        <H3>Staying on task</H3>
        <UL>
          <li>Write one line before each block: "In this block I will finish ___".</li>
          <li>Phone out of reach and silent; one tab or book open, not five.</li>
          <li>Start with the smallest next step and let the timer carry you in.</li>
          <li>Work near someone who is also working, or play a quiet study video with no talking.</li>
          <li>If you drift, do not restart the day. Note where you stopped and continue at the next check-in.</li>
        </UL>
      </Section>
    </Panel>
  );
}
