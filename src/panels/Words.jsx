import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../store.jsx';
import { VOC } from '../data/content.js';
import { DAYBY, pool, wordsFor } from '../lib/plan.js';
import { words as wc } from '../lib/dates.js';
import { copyText } from '../lib/clipA.js';
import { Btn, Card, Chip, Field, Hint, Input, Note, Panel, Row, Section, H2, H3, Seg, Textarea, cx } from '../components/ui.jsx';

function Flashcards({ idx }) {
  const { state, mutate } = useApp();
  const list = useMemo(() => wordsFor(idx, state.custom), [idx, state.custom]);
  const [i, setI] = useState(0), [shown, setShown] = useState(false), [got, setGot] = useState(0);
  const [sent, setSent] = useState(''), [msg, setMsg] = useState('');
  useEffect(() => { setI(0); setShown(false); setGot(0); setSent(''); setMsg(''); }, [idx]);
  const next = () => { setI((n) => n + 1); setShown(false); setSent(''); setMsg(''); };
  const restart = () => { setI(0); setShown(false); setGot(0); setSent(''); setMsg(''); };
  if (!list.length) return <Card><p className="text-muted">No words yet.</p></Card>;
  if (i >= list.length) {
    return (
      <Section>
        <div className="font-mono text-[13px] text-muted">Set complete</div>
        <Card className="min-h-[210px] items-center justify-center gap-2.5 p-[22px] text-center">
          <div className="font-display text-[34px] font-bold leading-[1.1]">Set complete</div>
          <div className="text-[17px]">You knew {got} of {list.length} words.</div>
          <Btn variant="ghost" onClick={restart}>Go through them again</Btn>
        </Card>
      </Section>
    );
  }
  const w = list[i];
  const known = (k) => mutate((s) => { s.known[k] = 1; });
  const again = (k) => mutate((s) => { delete s.known[k]; });
  const copy = async () => {
    const s = sent.trim();
    if (wc(s) < 4) { setMsg('Write a full sentence.'); return; }
    const p = `The learner is studying the IELTS word or phrase "${w.w}" (meaning: ${w.m}). Their sentence: """${s}""". Tell me in plain, readable text: whether the word is used correctly and the sentence is grammatical, the best corrected or improved version of the sentence, and one short tip about usage, collocation or grammar.`;
    setMsg(await copyText(p));
  };
  return (
    <Section>
      <div className="font-mono text-[13px] text-muted">{i + 1} of {list.length} · {w.rev ? 'review' : 'new'} · {w.t} · day {idx + 1}</div>
      <Card className="min-h-[210px] items-center justify-center gap-2.5 p-[22px] text-center">
        <div className="break-words font-display text-[34px] font-bold leading-[1.1]">{w.w}</div>
        {shown
          ? <><div className="text-[17px]">{w.m}</div><div className="italic text-muted">"{w.e}"</div></>
          : <Hint>Say it in a sentence first, then flip.</Hint>}
      </Card>
      <Row>
        {!shown && <Btn variant="ghost" onClick={() => setShown(true)}>Show meaning</Btn>}
        {shown && <Btn onClick={() => { known(w.k); setGot((n) => n + 1); next(); }}>Got it</Btn>}
        {shown && <Btn variant="ghost" onClick={() => { again(w.k); next(); }}>Again</Btn>}
      </Row>
      {shown && (
        <Card>
          <b>Use it in your own sentence</b>
          <Input type="text" value={sent} onChange={(e) => setSent(e.target.value)} placeholder="Write one sentence with this word" aria-label="Your sentence" />
          <Row><Btn sm variant="ghost" onClick={copy}>Copy prompt for Claude</Btn><span className="text-[13px] text-muted" role="status">{msg}</span></Row>
        </Card>
      )}
    </Section>
  );
}

function Browse() {
  const { state, mutate } = useApp();
  const groups = VOC.map((x) => x[0]).concat(state.custom.length ? ['My words'] : []);
  const [topic, setTopic] = useState(VOC[0][0]), [q, setQ] = useState(''), [hide, setHide] = useState(false);
  const P = pool(state.custom), kn = P.filter((w) => state.known[w.k]).length, ql = q.trim().toLowerCase();
  const shown = P.filter((w) => {
    if (!ql && w.t !== topic) return false;
    if (ql && (w.w + ' ' + w.m + ' ' + w.e).toLowerCase().indexOf(ql) < 0) return false;
    if (hide && state.known[w.k]) return false;
    return true;
  });
  const toggle = (k) => mutate((s) => { if (s.known[k]) delete s.known[k]; else s.known[k] = 1; });
  return (
    <Section>
      <Seg>{groups.map((n) => <Chip key={n} on={n === topic} onClick={() => setTopic(n)}>{n}</Chip>)}</Seg>
      <Row>
        <Input type="text" className="flex-[1_1_220px]" placeholder="Search words" aria-label="Search words" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" className="accent-[var(--accent)]" checked={hide} onChange={(e) => setHide(e.target.checked)} /> Hide words I know</label>
        <span className="font-mono text-xs text-muted">{kn} of {P.length} words known</span>
      </Row>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
        {shown.map((w) => (
          <div key={w.k} className={cx('flex min-w-0 flex-col gap-1 rounded-[10px] border border-line bg-surface px-3 py-2.5', state.known[w.k] && 'opacity-55')}>
            <div className="break-words font-display text-[17px] font-semibold">{w.w}</div>
            <div>{w.m}</div>
            <div className="text-[13px] italic text-muted">"{w.e}"</div>
            <Btn sm variant="ghost" className="mt-1 self-start" onClick={() => toggle(w.k)}>{state.known[w.k] ? 'Learning again' : 'Got it'}</Btn>
          </div>
        ))}
      </div>
      {!shown.length && <p className="text-muted">Nothing to show here.</p>}
    </Section>
  );
}

function More() {
  const { state, mutate } = useApp();
  const [topic, setTopic] = useState(''), [msg, setMsg] = useState('');
  const [paste, setPaste] = useState(''), [pmsg, setPmsg] = useState('');
  const copy = async () => {
    const t = topic.trim();
    if (!t) { setMsg('Type a topic first.'); return; }
    const have = pool(state.custom).map((x) => x.w).join(', ').slice(0, 3000);
    const p = `Give 10 useful IELTS Academic vocabulary items (words, collocations or phrases) at band 7 to 8 level on the topic "${t}". Avoid these items the learner already has: ${have}. Reply as plain text with exactly one item per line in this format: word or phrase | short meaning | natural example sentence`;
    setMsg(await copyText(p));
  };
  const add = () => {
    const rows = paste.split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((f) => f[0] && f[1]);
    if (!rows.length) { setPmsg('No valid lines. Use: word | meaning | example'); return; }
    const have = new Set(state.custom.map((y) => y.w.toLowerCase()));
    const fresh = [];
    rows.forEach((f) => { const k = f[0].toLowerCase(); if (!have.has(k)) { have.add(k); fresh.push({ w: f[0], m: f[1], e: f[2] || '' }); } });
    mutate((s) => { fresh.forEach((x) => { if (!s.custom.some((y) => y.w.toLowerCase() === x.w.toLowerCase())) s.custom.push(x); }); });
    setPmsg(`${fresh.length} words added to your list.`);
    if (fresh.length) setPaste('');
  };
  return (
    <Section>
      <Hint>Ask Claude for 10 fresh words on any topic. They join your word list and your daily sets.</Hint>
      <Row className="items-end">
        <Field label="Topic" className="flex-[1_1_240px]"><Input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. crime and punishment, climate, tourism" /></Field>
        <Btn onClick={copy}>Copy prompt for Claude</Btn>
        <span className="text-[13px] text-muted" role="status">{msg}</span>
      </Row>
      <H3>Paste Claude's reply</H3>
      <Hint>One word per line: word | meaning | example</Hint>
      <Textarea short value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="surge | rise sharply and suddenly | sales surged in 2019" aria-label="Pasted words" />
      <Row><Btn onClick={add}>Add words</Btn><span className="text-[13px] text-muted" role="status">{pmsg}</span></Row>
      {state.custom.length > 0 && <Note>{state.custom.length} custom words in "My words" (see Browse all).</Note>}
    </Section>
  );
}

export default function Words() {
  const { ui, setUi } = useApp();
  const seg = ui.wSeg || 'today';
  const idx = ui.fcIdx ?? (DAYBY[ui.viewIso] || { idx: 0 }).idx;
  return (
    <Panel>
      <Section>
        <H2>Words</H2>
        <Hint>Six new words and four review words every day. Say each word aloud in a sentence of your own before you flip it.</Hint>
        <Seg>
          <Chip on={seg === 'today'} onClick={() => setUi({ wSeg: 'today' })}>Today's 10</Chip>
          <Chip on={seg === 'browse'} onClick={() => setUi({ wSeg: 'browse' })}>Browse all</Chip>
          <Chip on={seg === 'more'} onClick={() => setUi({ wSeg: 'more' })}>Get more with Claude</Chip>
        </Seg>
      </Section>
      {seg === 'today' && <Flashcards idx={idx} />}
      {seg === 'browse' && <Browse />}
      {seg === 'more' && <More />}
    </Panel>
  );
}
