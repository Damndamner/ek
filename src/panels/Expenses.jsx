import { useState } from 'react';
import { useApp } from '../store.jsx';
import { todayIso } from '../lib/dates.js';
import { CATCOL, EXP_CATS } from '../lib/life.js';
import { Band, Btn, Card, Hint, Input, Panel, Row, Scroll, Select, Table, Td, Th } from '../components/ui.jsx';

const inr = (n) => '₹' + (+n || 0).toLocaleString();

function Pie({ keys, by, tot }) {
  if (!keys.length) return <svg viewBox="-1.05 -1.05 2.1 2.1" role="img" aria-label="Expenses by category" className="h-40 w-40 flex-none"><circle r="1" fill="none" stroke="currentColor" strokeOpacity=".25" /></svg>;
  let a0 = -Math.PI / 2;
  const nodes = keys.map((k) => {
    const frac = by[k] / tot, col = CATCOL[k] || '#9ca3af';
    const title = <title>{`${k}: ${inr(by[k])} (${Math.round(frac * 100)}%)`}</title>;
    if (keys.length === 1) return <circle key={k} r="1" fill={col} stroke="var(--surface)" strokeWidth=".02">{title}</circle>;
    const a1 = a0 + frac * 2 * Math.PI;
    const d = `M0 0 L${Math.cos(a0).toFixed(4)} ${Math.sin(a0).toFixed(4)} A1 1 0 ${frac > 0.5 ? 1 : 0} 1 ${Math.cos(a1).toFixed(4)} ${Math.sin(a1).toFixed(4)} Z`;
    a0 = a1;
    return <path key={k} d={d} fill={col} stroke="var(--surface)" strokeWidth=".02">{title}</path>;
  });
  return <svg viewBox="-1.05 -1.05 2.1 2.1" role="img" aria-label="Expenses by category" className="h-40 w-40 flex-none">{nodes}</svg>;
}

export default function Expenses() {
  const { state, mutate, award } = useApp();
  const [date, setDate] = useState(todayIso());
  const [lbl, setLbl] = useState('');
  const [cat, setCat] = useState('Food');
  const [amt, setAmt] = useState('');
  const add = () => {
    const a = parseFloat(amt); if (!(a > 0)) return;
    const row = { id: String(Date.now()), date: date || todayIso(), label: lbl.trim(), cat, amt: a };
    award(3, 'Logged an expense', (s) => { s.exp.push(row); });
    setLbl(''); setAmt('');
  };
  const mk = todayIso().slice(0, 7);
  const mon = state.exp.filter((e) => String(e.date).slice(0, 7) === mk);
  const tot = mon.reduce((a, b) => a + (+b.amt || 0), 0);
  const by = {}; mon.forEach((e) => { by[e.cat] = (by[e.cat] || 0) + (+e.amt || 0); });
  const keys = Object.keys(by).sort((a, b) => by[b] - by[a]);
  const last = state.exp.slice().reverse().slice(0, 25);
  const onKey = (e) => { if (e.key === 'Enter') add(); };
  return (
    <Panel>
      <Card>
        <h2 className="font-display text-[22px] font-bold tracking-tight">Expenses</h2>
        <Hint>Log it when you spend. Ten seconds, +3 points.</Hint>
        <Row>
          <Input className="!w-auto" type="date" aria-label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input className="min-w-[140px] flex-1" aria-label="What was it?" placeholder="What was it?" value={lbl} onChange={(e) => setLbl(e.target.value)} onKeyDown={onKey} />
          <Select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}>{EXP_CATS.map((c) => <option key={c}>{c}</option>)}</Select>
          <Input className="!w-28" type="number" min="0" aria-label="Amount" placeholder="₹" value={amt} onChange={(e) => setAmt(e.target.value)} onKeyDown={onKey} />
          <Btn onClick={add}>Log</Btn>
        </Row>
        <Row>
          <Band v={inr(tot)} k="This month" />
          <Band v={String(mon.length)} k="Entries" />
        </Row>
        <div className="flex flex-wrap items-center gap-5">
          <Pie keys={keys} by={by} tot={tot} />
          <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
            {!keys.length && <Hint>No spending logged this month.</Hint>}
            {keys.map((k) => (
              <div key={k} className="flex items-center gap-2 text-sm">
                <span className="h-3 w-3 flex-none rounded-sm" style={{ background: CATCOL[k] || '#9ca3af' }} />
                <span className="min-w-0 flex-1">{k}</span>
                <span className="font-mono text-xs text-muted">{inr(by[k])} · {Math.round((by[k] / tot) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
        <Scroll>
          <Table>
            <thead><tr><Th>Date</Th><Th>What</Th><Th>Category</Th><Th>Amount</Th><Th /></tr></thead>
            <tbody>
              {!state.exp.length && <tr><Td colSpan={5} className="text-muted">No expenses logged yet.</Td></tr>}
              {last.map((e) => (
                <tr key={e.id}>
                  <Td className="font-mono">{e.date}</Td><Td>{e.label || ''}</Td><Td>{e.cat}</Td><Td className="font-mono">{inr(e.amt)}</Td>
                  <Td><button type="button" aria-label="Delete" className="cursor-pointer border-0 bg-transparent px-1.5 text-muted hover:text-bad" onClick={() => mutate((s) => { s.exp = s.exp.filter((x) => x.id !== e.id); })}>✕</button></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Scroll>
      </Card>
    </Panel>
  );
}
