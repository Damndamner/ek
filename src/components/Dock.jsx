import { useEffect, useState } from 'react';
import { useTimer } from '../timer.jsx';
import { mmss } from '../lib/dates.js';
import { Btn, Input, Row, cx } from './ui.jsx';

export default function Dock() {
  const { t, checkin, flash, start, stop, resume, reset, answerCheckin } = useTimer();
  const [ans, setAns] = useState('');
  const [glow, setGlow] = useState(false);
  useEffect(() => { if (!flash) return; setGlow(true); const id = setTimeout(() => setGlow(false), 900); return () => clearTimeout(id); }, [flash]);
  useEffect(() => { if (checkin) setAns(''); }, [checkin]);
  const s = t.stages[t.i], has = !!s, rem = t.rem;
  const isBreak = has && s.kind === 'break';
  const rd = /Reading|Review|Vocab|Study/i.test(t.label);
  const timeCls = t.status === 'done' ? 'text-bad' : has && rem <= 60000 && t.status !== 'idle' ? 'text-signal' : '';
  let label;
  if (!has) label = 'No timer loaded. Press Start on a task, or open Timers.';
  else if (t.status === 'done') label = <><b>Time's up.</b> {t.mock ? 'Pens down.' : 'Block finished.'} {t.label}</>;
  else label = <><b className="text-fg">{t.label}</b> · {s.name}{t.stages.length > 1 ? ` (${t.i + 1}/${t.stages.length})` : ''}{t.status === 'stopped' ? ' · stopped' : ''}{t.mock ? ' · exam conditions' : ''}</>;
  const pct = has ? Math.min(100, Math.round((1 - rem / (s.sec * 1000)) * 100)) : 0;
  return (
    <div className={cx('fixed inset-x-0 bottom-0 z-30 border-t border-line bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] backdrop-blur-md', glow && 'outline outline-2 outline-signal')}>
      <div className="mx-auto flex max-w-[820px] flex-col gap-1.5">
        {checkin && (
          <div className="flex flex-col gap-2 rounded-[14px] bg-accent-soft px-3 py-2.5">
            <b>Check-in: are you actually {rd ? 'reading' : 'on task'}?</b>
            <Input value={ans} onChange={(e) => setAns(e.target.value)} placeholder={rd ? 'One line: what was the last paragraph about?' : 'One line: what are you working on right now?'} />
            <Row><Btn onClick={() => answerCheckin(true)}>Yes, on task</Btn><Btn variant="ghost" onClick={() => answerCheckin(false)}>I drifted, going back</Btn></Row>
          </div>
        )}
        {has && isBreak && t.tip && t.status !== 'done' && <div className="rounded-lg bg-signal-soft px-2.5 py-1.5 text-[13px]">Break: {t.tip}</div>}
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
          <div className="min-w-0 flex-[1_1_200px] text-[13px] text-muted">{label}</div>
          <div className={cx('font-mono text-[34px] font-medium leading-none', timeCls)}>{has ? mmss(rem) : '--:--'}</div>
          <div className="flex flex-wrap gap-2">
            {t.status === 'idle' && <Btn disabled={!has} onClick={start}>Start</Btn>}
            {t.status === 'running' && <Btn variant="ghost" onClick={stop}>Stop</Btn>}
            {t.status === 'stopped' && <Btn onClick={resume}>Resume</Btn>}
            {(t.status === 'stopped' || t.status === 'done') && <Btn variant="ghost" onClick={reset}>Reset</Btn>}
          </div>
        </div>
        <div className="h-1 overflow-hidden rounded-sm bg-line"><i className={cx('block h-full', isBreak ? 'bg-signal' : 'bg-accent')} style={{ width: pct + '%' }} /></div>
      </div>
    </div>
  );
}
