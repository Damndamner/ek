import { useEffect, useRef, useState } from 'react';
import { useApp } from '../store.jsx';
import { useTimer } from '../timer.jsx';
import { makePresets } from '../lib/presets.js';
import { b1, todayIso, words } from '../lib/dates.js';
import { speakingList, speakingPromptText } from '../lib/prompts.js';
import { Btn, Field, Hint, Input, Note, Panel, Row, Scroll, Section, H2, H3, Select, Table, Td, Textarea, Th } from '../components/ui.jsx';
import { copyTo } from './Writing.jsx';

function buildPrompt(part, prompt, mine) {
  const partName = part === 'p2' ? 'Part 2 (long turn, about 2 minutes)' : part === 'p1' ? 'Part 1 (short answers)' : 'Part 3 (abstract discussion)';
  return 'You are a strict, experienced IELTS Speaking examiner and coach. Be realistic and do not inflate bands. The candidate currently scores about band 6.5 and wants 7.5 to 8.\nTest section: ' + partName + '\nQuestion:\n"""\n' + (prompt || '(not provided)') + '\n"""\nTranscript of the spoken answer (' + words(mine) + ' words):\n"""\n' + mine + '\n"""\n\n'
    + 'Reply in plain, readable text (no JSON) with these sections:\n'
    + '1. Improved answer: keep my ideas and story, but make it sound like natural spoken English at about band 8 (contractions and natural discourse markers are fine); for Part 2 it should be about 250 to 300 words.\n'
    + '2. Estimated bands (half-bands): Fluency and coherence, Lexical resource, Grammatical range and accuracy, and Overall of these three. Do not score pronunciation, it cannot be judged from text.\n'
    + '3. Key errors: the 5 to 8 most costly mistakes, quoting my exact words, with the fix and a short reason.\n'
    + '4. Phrases to use next time: up to 6 natural phrases, idioms or collocations.\n'
    + '5. Next steps: exactly 3 specific actions.\n'
    + '6. Length note: one sentence comparing my answer with what is expected (Part 1 about 20 to 40 words per answer, Part 2 about 250 words for two minutes, Part 3 about 40 to 70 words per answer).';
}

export default function Speaking() {
  const { state, mutate, award } = useApp();
  const { load, chkEvery } = useTimer();
  const w = state.wip;
  const part = ['p1', 'p2', 'p3'].includes(w.sPart) ? w.sPart : 'p2';
  const [msg, setMsg] = useState('');
  const [pick, setPick] = useState('');
  const [est, setEst] = useState('');
  const [dict, setDict] = useState(false);
  const rec = useRef(null);
  const list = speakingList(part);
  const set = (k, v) => mutate((s) => { s.wip[k] = v; });
  useEffect(() => () => { if (rec.current) { try { rec.current.stop(); } catch (e) { /* ignore */ } rec.current = null; } }, []);

  const setPrompt = (i) => { if (list[i] == null) return; set('sPrompt', speakingPromptText(part, i)); };
  const dictate = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (rec.current) { try { rec.current.stop(); } catch (e) { /* ignore */ } rec.current = null; setDict(false); return; }
    if (!SR) { setMsg('Dictation is not available in this browser view. Use your phone keyboard voice typing, then paste.'); return; }
    try {
      const r = new SR(); rec.current = r;
      r.lang = 'en-GB'; r.continuous = true; r.interimResults = false;
      r.onresult = (ev) => {
        let add = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) if (ev.results[i].isFinal) add += ev.results[i][0].transcript + ' ';
        if (add) mutate((s) => { s.wip.sMine = (s.wip.sMine + ' ' + add).replace(/\s+/g, ' ').trim(); });
      };
      r.onerror = (ev) => {
        setMsg(ev.error === 'not-allowed' || ev.error === 'service-not-allowed' ? 'Microphone is blocked in this page. Use phone voice typing or the Claude app voice mode, then paste the text.' : 'Dictation stopped (' + ev.error + ').');
        rec.current = null; setDict(false);
      };
      r.onend = () => { if (rec.current) { rec.current = null; setDict(false); } };
      r.start(); setDict(true); setMsg('Listening... speak your answer.');
    } catch (e) { setMsg('Could not start dictation here. Use phone voice typing and paste.'); rec.current = null; setDict(false); }
  };
  const copyPrompt = () => {
    const mine = w.sMine.trim();
    if (words(mine) < 15) { setMsg('Add your answer first.'); return; }
    copyTo(buildPrompt(part, w.sPrompt.trim(), mine), setMsg);
  };
  const save = () => {
    if (!w.sMine.trim()) { setMsg('Nothing to save yet.'); return; }
    const ov = parseFloat(est);
    const fb = Number.isFinite(ov) ? { bands: { overall: Math.max(0, Math.min(9, ov)) } } : null;
    award(10, 'Speaking answer saved', (s) => {
      s.sHist.push({ id: String(Date.now()), t: todayIso(), part, label: part.toUpperCase().replace('P', 'Part '), prompt: s.wip.sPrompt, mine: s.wip.sMine, fixed: s.wip.sFixed, fb });
      if (s.sHist.length > 40) s.sHist.shift();
    });
    setMsg('Saved.');
  };
  const clear = () => { mutate((s) => { s.wip.sMine = ''; s.wip.sFixed = ''; }); setEst(''); setMsg(''); };
  const open = (h) => {
    mutate((s) => { s.wip.sPart = h.part; s.wip.sPrompt = h.prompt; s.wip.sMine = h.mine; s.wip.sFixed = h.fixed; });
    setPick(''); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const del = (id) => mutate((s) => { s.sHist = s.sHist.filter((x) => x.id !== id); });
  const presets = makePresets(chkEvery).speaking;

  return (
    <Panel>
      <Section>
        <H2>Speaking lab</H2>
        <div className="flex flex-wrap gap-2">
          {presets.map((x) => <Btn key={x.t} sm variant="ghost" onClick={() => load(x.p())}>{x.t}</Btn>)}
        </div>
        <div className="flex flex-wrap items-end gap-2.5">
          <Field label="Part">
            <Select value={part} onChange={(e) => { set('sPart', e.target.value); setPick(''); }}>
              <option value="p2">Part 2 (cue card)</option><option value="p1">Part 1 (short answers)</option><option value="p3">Part 3 (discussion)</option>
            </Select>
          </Field>
          <Field label="Choose my own question" className="min-w-[200px] flex-1 basis-[260px]">
            <Select value={pick} onChange={(e) => { setPick(e.target.value); if (e.target.value !== '') setPrompt(+e.target.value); }}>
              <option value="">Choose a question...</option>
              {list.map((x, i) => <option key={i} value={i}>{x.length > 80 ? x.slice(0, 78) + '...' : x}</option>)}
            </Select>
          </Field>
          <Btn variant="ghost" onClick={() => { const i = Math.floor(Math.random() * list.length); setPick(String(i)); setPrompt(i); }}>Random</Btn>
        </div>
        <Field label="Question">
          <Textarea short value={w.sPrompt} onChange={(e) => set('sPrompt', e.target.value)} placeholder="Pick a cue card or question, or use today's." />
        </Field>
        <Note><b>Microphone:</b> published pages usually cannot open the mic. Try Dictate; if it says blocked, use your phone keyboard's voice typing or Claude's voice mode, speak the answer, and paste the text. Pronunciation cannot be scored from text, so record yourself on your phone and listen back.</Note>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label={<span>My answer (transcript) <span className="font-mono">{words(w.sMine)} words{part === 'p2' ? ' (aim for 250+ in 2 min)' : ''}</span></span>}>
            <Textarea value={w.sMine} onChange={(e) => set('sMine', e.target.value)} placeholder="Paste or dictate your spoken answer." />
          </Field>
          <Field label={<span>Improved answer <span className="font-mono">{words(w.sFixed)} words</span></span>}>
            <Textarea value={w.sFixed} onChange={(e) => set('sFixed', e.target.value)} placeholder="Paste Claude's improved version here." />
          </Field>
        </div>
        <Row>
          <Btn variant="ghost" onClick={dictate}>{dict ? 'Stop dictation' : 'Dictate'}</Btn>
          <Btn onClick={copyPrompt}>Copy prompt for Claude</Btn>
          <Field label="Estimated overall band (optional)" className="w-44">
            <Input type="number" min="0" max="9" step="0.5" value={est} onChange={(e) => setEst(e.target.value)} aria-label="Estimated overall band" />
          </Field>
          <Btn variant="ghost" onClick={save}>Save</Btn>
          <Btn variant="ghost" onClick={() => copyTo(w.sFixed, setMsg)}>Copy improved</Btn>
          <Btn variant="ghost" onClick={clear}>Clear</Btn>
          <Hint role="status">{msg}</Hint>
        </Row>
        <Hint>Paste the prompt into Claude, then paste its improved answer back into the right-hand box. Pronunciation is not scored from text, and voice typing removes hesitations, so judge fluency from your own recording.</Hint>
      </Section>
      <Section>
        <H3>Saved answers</H3>
        <Scroll>
          <Table>
            <thead><tr><Th>Date</Th><Th>Part</Th><Th>Est. overall</Th><Th>Question</Th><Th /></tr></thead>
            <tbody>
              {!state.sHist.length && <tr><Td colSpan={5} className="text-muted">No saved answers yet.</Td></tr>}
              {state.sHist.slice().reverse().map((h) => (
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
