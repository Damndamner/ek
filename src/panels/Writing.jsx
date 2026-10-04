import { useState } from 'react';
import { useApp } from '../store.jsx';
import { useTimer } from '../timer.jsx';
import { makePresets } from '../lib/presets.js';
import { T2NAME } from '../data/content.js';
import { b1, todayIso, words } from '../lib/dates.js';
import { writingList, writingPromptText } from '../lib/prompts.js';
import { Btn, Field, Hint, Input, Panel, Row, Scroll, Section, H2, H3, Select, Table, Td, Textarea, Th } from '../components/ui.jsx';

const COPY_FAIL = 'Copy blocked: select the text and copy it manually.';
export async function copyTo(text, setMsg) {
  try { await navigator.clipboard.writeText(text); setMsg('Copied.'); } catch (e) { setMsg(COPY_FAIL); }
}

function buildExaminerPrompt(t, prompt, mine) {
  return 'You are a strict, experienced IELTS Academic Writing examiner and coach. Be realistic and do not inflate bands. The candidate currently scores about band 6 and wants 7.5 to 8.\n'
    + 'Task: ' + (t === 't1' ? 'Academic Writing Task 1 (report on a chart, table, map or process; minimum 150 words; 20 minutes)' : 'Academic Writing Task 2 (essay; minimum 250 words; 40 minutes)') + '\n'
    + 'Task prompt and any data given to the candidate:\n"""\n' + (prompt || '(not provided)') + '\n"""\n'
    + 'Candidate response (' + words(mine) + ' words):\n"""\n' + mine + '\n"""\n\n'
    + 'Reply in plain, readable text (no JSON) with these sections:\n'
    + '1. Corrected script: keep my ideas, structure and paragraph breaks, fix every error and lift the wording to about band 8. Do not write a different essay.\n'
    + '2. Estimated bands (half-bands): ' + (t === 't1' ? 'Task achievement' : 'Task response') + ', Coherence and cohesion, Lexical resource, Grammatical range and accuracy, and Overall.\n'
    + '3. Key errors: the 6 to 8 mistakes that cost the most marks, quoting my exact words, with the fix and a short reason.\n'
    + '4. Phrases to learn: up to 6.\n'
    + '5. Next steps: exactly 3 specific actions.\n'
    + (t === 't1' ? 'Check that every figure matches the data supplied and that there is a clear overview; say so in the next steps if not.' : 'Check that my position is clear and every paragraph develops one idea.');
}

export default function Writing() {
  const { state, mutate, award } = useApp();
  const { load, chkEvery } = useTimer();
  const w = state.wip;
  const t = w.wType === 't1' ? 't1' : 't2';
  const [msg, setMsg] = useState('');
  const [pick, setPick] = useState('');
  const [est, setEst] = useState('');
  const list = writingList(t);
  const min = t === 't1' ? 150 : 250;
  const set = (k, v) => mutate((s) => { s.wip[k] = v; });

  const setPrompt = (i) => { const list2 = writingList(t); if (!list2[i]) return; set('wPrompt', writingPromptText(t, i)); };
  const copyPrompt = () => {
    const mine = w.wMine.trim();
    if (words(mine) < 40) { setMsg('Write at least a short paragraph first.'); return; }
    copyTo(buildExaminerPrompt(t, w.wPrompt.trim(), mine), setMsg);
  };
  const copyData = () => {
    const cur = w.wPrompt.trim() || 'a line graph about a realistic topic';
    copyTo('Create realistic practice data for an IELTS Academic Writing Task 1 question based on this prompt:\n' + cur + '\nReply with plain text only, in this layout: first the task sentence (Summarise the information by selecting and reporting the main features, and make comparisons where relevant), then a compact data table in plain text with a title, units, and 4 to 7 time points or categories. No commentary.', (m) => setMsg(m === 'Copied.' ? 'Copied. Paste the reply into the prompt box.' : m));
  };
  const save = () => {
    if (!w.wMine.trim()) { setMsg('Nothing to save yet.'); return; }
    const ov = parseFloat(est);
    const fb = Number.isFinite(ov) ? { bands: { overall: Math.max(0, Math.min(9, ov)) } } : null;
    award(10, 'Writing draft saved', (s) => {
      s.wHist.push({ id: String(Date.now()), t: todayIso(), type: t, label: t === 't1' ? 'Task 1' : 'Task 2', prompt: s.wip.wPrompt, mine: s.wip.wMine, fixed: s.wip.wFixed, fb });
      if (s.wHist.length > 40) s.wHist.shift();
    });
    setMsg('Saved.');
  };
  const clear = () => { mutate((s) => { s.wip.wMine = ''; s.wip.wFixed = ''; }); setEst(''); setMsg(''); };
  const open = (h) => {
    mutate((s) => { s.wip.wType = h.type; s.wip.wPrompt = h.prompt; s.wip.wMine = h.mine; s.wip.wFixed = h.fixed; });
    setPick(''); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const del = (id) => mutate((s) => { s.wHist = s.wHist.filter((x) => x.id !== id); });
  const presets = makePresets(chkEvery).writing;

  return (
    <Panel>
      <Section>
        <H2>Writing lab</H2>
        <div className="flex flex-wrap gap-2">
          {presets.map((x) => <Btn key={x.t} sm variant="ghost" onClick={() => load(x.p())}>{x.t}</Btn>)}
        </div>
        <div className="flex flex-wrap items-end gap-2.5">
          <Field label="Task">
            <Select value={t} onChange={(e) => { set('wType', e.target.value); setPick(''); }}>
              <option value="t2">Task 2 (essay)</option><option value="t1">Task 1 (report)</option>
            </Select>
          </Field>
          <Field label="Choose my own prompt" className="min-w-[200px] flex-1 basis-[260px]">
            <Select value={pick} onChange={(e) => { setPick(e.target.value); if (e.target.value !== '') setPrompt(+e.target.value); }}>
              <option value="">Choose a prompt...</option>
              {list.map((x, i) => <option key={i} value={i}>{(t === 't2' ? T2NAME[x[0]] : x[0]) + ': ' + x[1].slice(0, 70) + '...'}</option>)}
            </Select>
          </Field>
          <Btn variant="ghost" onClick={() => { const i = Math.floor(Math.random() * list.length); setPick(String(i)); setPrompt(i); }}>Random</Btn>
          {t === 't1' && <Btn variant="ghost" onClick={copyData}>Make practice data</Btn>}
        </div>
        <Field label="Task prompt">
          <Textarea short value={w.wPrompt} onChange={(e) => set('wPrompt', e.target.value)} placeholder="Pick a prompt, use today's, or paste your own. For Task 1, add the chart data or description so Claude can check your figures." />
        </Field>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label={<span>My script <span className="font-mono">{words(w.wMine)} words (min {min})</span></span>}>
            <Textarea value={w.wMine} onChange={(e) => set('wMine', e.target.value)} placeholder="Write or paste your response. Start the timer first for exam practice." />
          </Field>
          <Field label={<span>Corrected script <span className="font-mono">{words(w.wFixed)} words</span></span>}>
            <Textarea value={w.wFixed} onChange={(e) => set('wFixed', e.target.value)} placeholder="Paste Claude's corrected version here, keeping your ideas and structure." />
          </Field>
        </div>
        <Row>
          <Btn onClick={copyPrompt}>Copy prompt for Claude</Btn>
          <Field label="Estimated overall band (optional)" className="w-44">
            <Input type="number" min="0" max="9" step="0.5" value={est} onChange={(e) => setEst(e.target.value)} aria-label="Estimated overall band" />
          </Field>
          <Btn variant="ghost" onClick={save}>Save draft</Btn>
          <Btn variant="ghost" onClick={() => copyTo(w.wFixed, setMsg)}>Copy corrected</Btn>
          <Btn variant="ghost" onClick={clear}>Clear</Btn>
          <Hint role="status">{msg}</Hint>
        </Row>
        <Hint>Paste the prompt into Claude, then paste its corrected script back into the right-hand box.</Hint>
      </Section>
      <Section>
        <H3>Saved drafts</H3>
        <Scroll>
          <Table>
            <thead><tr><Th>Date</Th><Th>Task</Th><Th>Est. overall</Th><Th>Prompt</Th><Th /></tr></thead>
            <tbody>
              {!state.wHist.length && <tr><Td colSpan={5} className="text-muted">No saved drafts yet.</Td></tr>}
              {state.wHist.slice().reverse().map((h) => (
                <tr key={h.id}>
                  <Td>{h.t}</Td><Td>{h.label}</Td>
                  <Td className="font-mono">{h.fb && h.fb.bands && Number.isFinite(+h.fb.bands.overall) ? b1(h.fb.bands.overall) : '–'}</Td>
                  <Td>{(h.prompt || '').slice(0, 60)}</Td>
                  <Td className="whitespace-nowrap"><Btn sm variant="ghost" onClick={() => open(h)}>Open</Btn> <Btn sm variant="ghost" onClick={() => del(h.id)}>Delete</Btn></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Scroll>
      </Section>
    </Panel>
  );
}
