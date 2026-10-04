import { useState } from 'react';
import { useApp } from '../store.jsx';
import { MON, parseIso, todayIso } from '../lib/dates.js';
import { Band, Btn, Card, Hint, Input, Panel, Row, Scroll, Select, Table, Td, Th } from '../components/ui.jsx';

const DAY = 86400000;

export default function Cycle() {
  const { state, mutate, award } = useApp();
  const [date, setDate] = useState(todayIso());
  const [flow, setFlow] = useState('Light');
  const add = () => {
    if (!date) return;
    const row = { id: String(Date.now()), date, flow };
    award(5, 'Logged cycle data', (s) => { s.per.push(row); });
  };
  const s = state.per.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  const t0 = parseIso(todayIso());
  let avg = '–', next = '–', cday = '–';
  if (s.length >= 2) {
    const g = [];
    for (let i = 1; i < s.length; i++) g.push(Math.round((parseIso(s[i].date) - parseIso(s[i - 1].date)) / DAY));
    const av = Math.round(g.reduce((a, b) => a + b, 0) / g.length);
    const last = parseIso(s[s.length - 1].date), nx = new Date(last); nx.setDate(nx.getDate() + av);
    avg = av + ' d'; next = nx.getDate() + ' ' + MON[nx.getMonth()]; cday = String(Math.round((t0 - last) / DAY) + 1);
  } else if (s.length === 1) {
    avg = '1 more log'; cday = String(Math.round((t0 - parseIso(s[0].date)) / DAY) + 1);
  }
  return (
    <Panel>
      <Card>
        <h2 className="font-display text-[22px] font-bold tracking-tight">Cycle</h2>
        <Hint>Private. Stays in this browser (and in a progress file only if you save one). Rough estimates from your own log, not medical advice.</Hint>
        <Row>
          <Input className="!w-auto" type="date" aria-label="Period start date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Select aria-label="Flow" value={flow} onChange={(e) => setFlow(e.target.value)}>
            <option>Light</option><option>Medium</option><option>Heavy</option><option>Spotting</option>
          </Select>
          <Btn onClick={add}>Log period start</Btn>
        </Row>
        <Row>
          <Band v={avg} k="Avg cycle" /><Band v={next} k="Next (est.)" /><Band v={cday} k="Cycle day" />
        </Row>
        <Scroll>
          <Table className="min-w-0">
            <thead><tr><Th>Start</Th><Th>Flow</Th><Th /></tr></thead>
            <tbody>
              {s.slice().reverse().map((p) => (
                <tr key={p.id}>
                  <Td className="font-mono">{p.date}</Td><Td>{p.flow}</Td>
                  <Td><button type="button" aria-label="Delete" className="cursor-pointer border-0 bg-transparent px-1.5 text-muted hover:text-bad" onClick={() => mutate((x) => { x.per = x.per.filter((q) => q.id !== p.id); })}>✕</button></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Scroll>
      </Card>
    </Panel>
  );
}
