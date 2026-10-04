import { useState } from 'react';
import { useApp } from '../store.jsx';
import { Btn, Card, Check, Hint, Input, ListRow, Panel, Row, Select, cx } from '../components/ui.jsx';

const tagName = (t) => (t === 'uit' ? 'U&I Trust' : t === 'ryla' ? 'Ryla' : 'Company');

export default function Work() {
  const { state, mutate, awardOnce } = useApp();
  const [text, setText] = useState('');
  const [tag, setTag] = useState('work');
  const add = () => {
    const v = text.trim(); if (!v) return;
    mutate((s) => { s.work.push({ id: String(Date.now()), text: v, tag, done: false }); });
    setText('');
  };
  const tick = (w, on) => {
    if (on) awardOnce('w' + w.id, 10, 'Work: ' + w.text, (s) => { const x = s.work.find((q) => q.id === w.id); if (x) x.done = true; });
    else mutate((s) => { const x = s.work.find((q) => q.id === w.id); if (x) x.done = false; });
  };
  return (
    <Panel>
      <Card>
        <h2 className="font-display text-[22px] font-bold tracking-tight">Work</h2>
        <Hint>One list, two tags. Add anything tiny. Each tick is +10 points.</Hint>
        <Row>
          <Input className="min-w-[180px] flex-1" aria-label="New work task" placeholder="e.g. Edit newsletter intro" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} />
          <Select aria-label="Tag" value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="work">Company</option><option value="uit">U&amp;I Trust</option><option value="ryla">Ryla</option>
          </Select>
          <Btn onClick={add}>Add</Btn>
        </Row>
        <div className="flex flex-col">
          {!state.work.length && <Hint>Nothing here. Add a tiny task above.</Hint>}
          {state.work.map((w) => (
            <ListRow key={w.id} className="flex-wrap">
              <Check aria-label="Done" checked={!!w.done} onChange={(e) => tick(w, e.target.checked)} />
              <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-signal">{tagName(w.tag)}</span>
              <label className={cx('min-w-0 flex-1 break-words', w.done && 'text-muted line-through')}>{w.text}</label>
              <span className="font-mono text-xs text-muted">+10</span>
              <button type="button" aria-label="Delete" className="cursor-pointer border-0 bg-transparent px-1.5 text-muted hover:text-bad" onClick={() => mutate((s) => { s.work = s.work.filter((x) => x.id !== w.id); })}>✕</button>
            </ListRow>
          ))}
        </div>
      </Card>
    </Panel>
  );
}
