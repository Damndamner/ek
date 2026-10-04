import { useState } from 'react';
import { useApp } from '../store.jsx';
import { todayIso } from '../lib/dates.js';
import { RF } from '../lib/life.js';
import { Btn, Card, Check, Hint, Input, ListRow, Panel, Row, cx } from '../components/ui.jsx';

function RfCard({ cfg }) {
  const [key, title, hint, ph, tickLabel] = cfg;
  const { state, mutate, award, awardOnce } = useApp();
  const [text, setText] = useState('');
  const arr = state.ref[key];
  const add = () => {
    const v = text.trim(); if (!v) return;
    const td = todayIso();
    const item = { id: 'r' + Date.now(), text: v, date: td, done: false };
    const push = (s) => { s.ref[key].push(item); };
    if (key === 'grat') award(3, 'Gratitude', push);
    else if (key === 'win' && arr.filter((w) => w.date === td).length < 3) award(5, 'Daily win', push);
    else mutate(push);
    setText('');
  };
  const tick = (it, on) => {
    if (on) awardOnce('rf' + it.id, 10, title + ': ' + it.text.slice(0, 40), (s) => { const x = s.ref[key].find((q) => q.id === it.id); if (x) x.done = true; });
    else mutate((s) => { const x = s.ref[key].find((q) => q.id === it.id); if (x) x.done = false; });
  };
  return (
    <Card>
      <h3 className="font-display text-base font-bold tracking-tight">{title}</h3>
      <Hint>{hint}</Hint>
      <Row>
        <Input className="min-w-[160px] flex-1" aria-label={title} placeholder={ph} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
        <Btn onClick={add}>Add</Btn>
      </Row>
      <div className="flex flex-col">
        {!arr.length && <Hint>Nothing here yet.</Hint>}
        {arr.slice().reverse().map((it) => (
          <ListRow key={it.id}>
            {tickLabel && <Check aria-label={tickLabel} checked={!!it.done} onChange={(e) => tick(it, e.target.checked)} />}
            <label className={cx('min-w-0 flex-1 break-words', it.done && 'text-muted line-through')}>{it.text}</label>
            <span className="font-mono text-xs text-muted">{it.date.slice(5)}</span>
            <button type="button" aria-label="Delete" className="cursor-pointer border-0 bg-transparent px-1.5 text-muted hover:text-bad" onClick={() => mutate((s) => { s.ref[key] = s.ref[key].filter((q) => q.id !== it.id); })}>✕</button>
          </ListRow>
        ))}
      </div>
    </Card>
  );
}

export default function Reflect() {
  return (
    <Panel>
      <section className="flex flex-col gap-1">
        <h2 className="font-display text-[22px] font-bold tracking-tight">Reflect</h2>
        <Hint>Private, stays in this browser. Names and feelings are yours alone unless you save a progress file.</Hint>
      </section>
      {RF.map((c) => <RfCard key={c[0]} cfg={c} />)}
    </Panel>
  );
}
