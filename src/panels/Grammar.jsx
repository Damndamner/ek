import { useEffect, useState } from 'react';
import { useApp } from '../store.jsx';
import { GR } from '../data/content.js';
import { words as wc } from '../lib/dates.js';
import { copyText } from '../lib/clipA.js';
import { Btn, Card, Chip, Hint, Note, Panel, Row, Section, H2, H3, Seg, Textarea, cx } from '../components/ui.jsx';

const gQs = (name, gmore) => { const t = GR.find((x) => x.n === name); return t ? t.qs.concat(gmore[name] || []) : []; };

function Quiz({ name, list, redo, start }) {
  const { mutate } = useApp();
  const [i, setI] = useState(start || 0), [correct, setCorrect] = useState(0), [picked, setPicked] = useState(null);
  if (!list.length) return <p className="text-muted">Pick a topic above.</p>;
  if (i >= list.length) {
    return (
      <>
        <H3>{name}: finished</H3>
        <p>You got {correct} of {list.length} right.</p>
        <div><Btn onClick={() => { setI(0); setCorrect(0); setPicked(null); }}>Do it again</Btn></div>
      </>
    );
  }
  const q = list[i], answered = picked !== null;
  const answer = (oi) => {
    if (answered) return;
    const ok = oi === q.a;
    setPicked(oi); if (ok) setCorrect((n) => n + 1);
    mutate((s) => {
      const st = s.gram[q.topic] || (s.gram[q.topic] = { done: 0, correct: 0, wrong: [] });
      if (!st.wrong) st.wrong = [];
      if (!redo) { st.done++; if (ok) st.correct++; }
      if (ok) st.wrong = st.wrong.filter((x) => x !== q.q);
      else if (st.wrong.indexOf(q.q) < 0) st.wrong.push(q.q);
    });
  };
  return (
    <>
      <div className="font-mono text-[13px] text-muted">{name} · {i + 1} of {list.length}</div>
      <div className="text-[17px] font-semibold">{q.q}</div>
      <div className="flex flex-col gap-1.5">
        {q.o.map((o, oi) => (
          <button key={oi} type="button" disabled={answered} onClick={() => answer(oi)}
            className={cx('block w-full cursor-pointer rounded-xl border px-3.5 py-2.5 text-left font-medium text-fg transition disabled:cursor-default',
              answered && oi === q.a ? 'border-ok bg-accent-soft' : answered && oi === picked ? 'border-bad bg-bad-soft' : 'border-line bg-surface hover:border-accent')}>{o}</button>
        ))}
      </div>
      {answered && (
        <>
          <Note><b>{picked === q.a ? 'Correct.' : 'Not quite.'}</b>{picked === q.a ? '' : ` The answer is "${q.o[q.a]}".`} {q.e}</Note>
          <div><Btn onClick={() => { setI(i + 1); setPicked(null); }}>{i + 1 >= list.length ? 'Finish' : 'Next'}</Btn></div>
        </>
      )}
    </>
  );
}

export default function Grammar() {
  const { state, mutate, ui, setUi } = useApp();
  const [redo, setRedo] = useState(null);
  const [gen, setGen] = useState(0), [start, setStart] = useState(0);
  const [msg, setMsg] = useState(''), [free, setFree] = useState(''), [fmsg, setFmsg] = useState('');
  const [paste, setPaste] = useState(''), [pmsg, setPmsg] = useState('');
  const gi = ui.gIdx;
  const topic = GR[gi] && !redo ? GR[gi] : null;
  useEffect(() => { setRedo(null); setStart(0); }, [gi]);

  const wrongAll = () => {
    const out = [];
    GR.forEach((t) => { const st = state.gram[t.n]; if (!st || !st.wrong) return; gQs(t.n, state.gmore).forEach((q) => { if (st.wrong.indexOf(q.q) >= 0) out.push({ topic: t.n, ...q }); }); });
    return out;
  };
  const doRedo = () => {
    const l = wrongAll();
    if (!l.length) { setMsg('No saved mistakes yet. Nice.'); return; }
    setMsg(''); setRedo(l); setGen((n) => n + 1);
  };
  const list = redo || (topic ? gQs(topic.n, state.gmore).map((q) => ({ topic: topic.n, ...q })) : []);
  const name = redo ? 'My mistakes' : topic ? topic.n : '';

  const copyMore = async () => {
    if (!topic) { setMsg('Open a topic first, then ask for more.'); return; }
    const ex = gQs(topic.n, state.gmore).map((x) => x.q).join(' | ').slice(0, 3000);
    const p = `Write 6 new multiple-choice grammar questions for IELTS candidates (band 6 to 8) on this topic: "${topic.n}". Each must test a mistake that matters in IELTS Writing or Speaking, have exactly 4 options, one clearly correct answer, and a short explanation of the rule. Reply as plain text with one question per line in this format: question with ___ blank | option 1 | option 2 | option 3 | option 4 | number of the correct option (1 to 4) | short explanation. Do not repeat these existing questions: ${ex}`;
    setMsg(await copyText(p));
  };
  const addMore = () => {
    if (!topic) { setPmsg('Open a topic first.'); return; }
    const ok = paste.split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((f) => f.length >= 7 && f[0] && f.slice(1, 5).every(Boolean) && /^[1-4]$/.test(f[5]) && f[6])
      .map((f) => ({ q: f[0], o: f.slice(1, 5), a: +f[5] - 1, e: f.slice(6).join(' | ') }));
    if (!ok.length) { setPmsg('No valid lines. Use: question | option 1 | option 2 | option 3 | option 4 | correct number | explanation'); return; }
    const first = gQs(topic.n, state.gmore).length;
    mutate((s) => { s.gmore[topic.n] = (s.gmore[topic.n] || []).concat(ok); });
    setStart(first); setGen((n) => n + 1); setPaste(''); setPmsg(`${ok.length} new questions added.`);
  };
  const copyFree = async () => {
    const s = free.trim();
    if (wc(s) < 5) { setFmsg('Paste a sentence or two first.'); return; }
    const p = `You are an IELTS grammar coach. Correct this learner text (band 6 level, aiming for 7.5 to 8). Reply as plain readable text: first the full corrected text, then a short list of the most important errors (at most 8, most important first) showing the original words, the fix and the grammar rule in a short phrase, then one pattern to practise next.\n"""\n${s}\n"""`;
    setFmsg(await copyText(p));
  };

  return (
    <Panel>
      <Section>
        <H2>Grammar for IELTS</H2>
        <Hint>Short quizzes on the mistakes that cap Writing and Speaking at band 6. Every wrong answer shows the right one and why.</Hint>
        <Seg>
          {GR.map((t, i) => { const st = state.gram[t.n] || { done: 0, correct: 0 }; return (
            <Chip key={t.n} on={!redo && gi === i} onClick={() => { setRedo(null); setStart(0); setGen((n) => n + 1); setUi({ gIdx: i }); }}>{t.n + (st.done ? ` · ${st.correct}/${st.done}` : '')}</Chip>
          ); })}
        </Seg>
      </Section>
      <Card><Quiz key={`${name}-${gen}`} name={name} list={list} redo={!!redo} start={start} /></Card>
      <Row>
        <Btn variant="ghost" onClick={copyMore}>Copy prompt for more questions</Btn>
        <Btn variant="ghost" onClick={doRedo}>Redo my mistakes</Btn>
        <span className="text-[13px] text-muted" role="status">{msg}</span>
      </Row>
      <Section>
        <H3>Add questions from Claude</H3>
        <Hint>Paste Claude's reply to the prompt above, one question per line: question | option 1 | option 2 | option 3 | option 4 | correct number | explanation</Hint>
        <Textarea short value={paste} onChange={(e) => setPaste(e.target.value)} aria-label="Pasted questions" />
        <Row><Btn variant="ghost" onClick={addMore}>Add questions</Btn><span className="text-[13px] text-muted" role="status">{pmsg}</span></Row>
      </Section>
      <Section>
        <H3>Check my own sentences</H3>
        <Textarea short value={free} onChange={(e) => setFree(e.target.value)} placeholder="Paste a sentence or a paragraph from your writing or speaking." aria-label="Your sentences" />
        <Row><Btn onClick={copyFree}>Copy prompt for Claude</Btn><span className="text-[13px] text-muted" role="status">{fmsg}</span></Row>
      </Section>
    </Panel>
  );
}
