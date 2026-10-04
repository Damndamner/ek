import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useApp } from './store.jsx';
import { BREAKS, taskTimer } from './lib/presets.js';
import { beep, ensureAudio } from './lib/audio.js';
import { todayIso } from './lib/dates.js';

const Ctx = createContext(null);
export const useTimer = () => useContext(Ctx);

export function TimerProvider({ children }) {
  const { mutate } = useApp();
  const E = useRef({ stages: [], i: 0, status: 'idle', remain: 0, endAt: 0, label: '', chk: 0, nextChk: 0, breakN: 0, iv: null, mock: false, tip: '', act: '' });
  const [, force] = useState(0);
  const [checkin, setCheckin] = useState(false);
  const [chkEvery, setChkEvery] = useState(5);
  const [flash, setFlash] = useState(0);
  const checkinRef = useRef(false); checkinRef.current = checkin;
  const rerender = () => force((n) => n + 1);

  const breakTip = (s) => (s.sec >= 600 && E.current.act ? 'Longer reset: ' + E.current.act : BREAKS[E.current.breakN++ % BREAKS.length]);
  const tick = useCallback(() => {
    const e = E.current; if (e.status !== 'running') return;
    const rem = e.endAt - Date.now();
    if (rem <= 0) {
      if (e.i < e.stages.length - 1) {
        e.i++; beep(2, e.stages[e.i].kind === 'break' ? 520 : 880);
        const s = e.stages[e.i]; e.remain = s.sec * 1000; e.endAt = Date.now() + e.remain; e.tip = '';
        if (s.kind === 'break') { e.tip = breakTip(s); setCheckin(false); }
        if (e.chk) e.nextChk = Date.now() + e.chk * 60000;
      } else { e.remain = 0; e.status = 'done'; clearInterval(e.iv); e.iv = null; beep(4, 988); setCheckin(false); rerender(); return; }
    } else e.remain = rem;
    const s = e.stages[e.i];
    if (e.chk && s.kind !== 'break' && Date.now() >= e.nextChk && !checkinRef.current) { setCheckin(true); beep(1, 520); e.nextChk = Date.now() + e.chk * 60000; }
    rerender();
  }, []);

  const load = useCallback((p, act) => {
    const e = E.current; clearInterval(e.iv); e.iv = null;
    Object.assign(e, { stages: p.stages, i: 0, label: p.label, chk: p.chk || 0, mock: !!p.mock, status: 'idle', breakN: 0, tip: '', act: act || '' });
    e.remain = e.stages[0].sec * 1000; setCheckin(false); setFlash((n) => n + 1); rerender();
  }, []);
  const start = useCallback(() => {
    const e = E.current; if (!e.stages.length) return; ensureAudio();
    e.endAt = Date.now() + e.remain; if (e.chk) e.nextChk = Date.now() + e.chk * 60000;
    const s = e.stages[e.i]; if (s.kind === 'break' && !e.tip) e.tip = breakTip(s);
    e.status = 'running'; clearInterval(e.iv); e.iv = setInterval(tick, 250); beep(1, 660); rerender();
  }, [tick]);
  const stop = useCallback(() => { const e = E.current; if (e.status !== 'running') return; e.remain = Math.max(0, e.endAt - Date.now()); e.status = 'stopped'; clearInterval(e.iv); e.iv = null; rerender(); }, []);
  const resume = useCallback(() => {
    const e = E.current; if (e.status !== 'stopped') return; ensureAudio();
    e.endAt = Date.now() + e.remain; if (e.chk) e.nextChk = Date.now() + e.chk * 60000; e.status = 'running'; clearInterval(e.iv); e.iv = setInterval(tick, 250); rerender();
  }, [tick]);
  const reset = useCallback(() => {
    const e = E.current; if (!e.stages.length) return; clearInterval(e.iv); e.iv = null; e.i = 0; e.status = 'idle'; e.breakN = 0; e.tip = ''; e.remain = e.stages[0].sec * 1000; setCheckin(false); rerender();
  }, []);
  const startTask = useCallback((task, mode, act) => { load(taskTimer(task, mode, chkEvery), act); start(); }, [load, start, chkEvery]);
  const answerCheckin = useCallback((ok) => {
    mutate((s) => { const d = s.checks[todayIso()] || (s.checks[todayIso()] = { ok: 0, miss: 0 }); if (ok) d.ok++; else d.miss++; });
    setCheckin(false);
  }, [mutate]);
  useEffect(() => () => clearInterval(E.current.iv), []);

  const e = E.current;
  const value = { t: { ...e, rem: e.status === 'running' ? Math.max(0, e.endAt - Date.now()) : e.remain }, checkin, chkEvery, setChkEvery, flash, load, start, stop, resume, reset, startTask, answerCheckin };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
