import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { clampView, EXAM_DEFAULT } from './lib/plan.js';
import { todayIso } from './lib/dates.js';
import { BADGES, LINES } from './lib/life.js';
import { badgeSet } from './lib/derived.js';
import { chime, confetti } from './lib/audio.js';

export const KEY = 'ielts-tracker-v1';
export const TABS = ['today', 'planner', 'ielts', 'work', 'money', 'body', 'reflect', 'cycle', 'rewards'];
export const IELTS_SUB = ['words', 'grammar', 'writing', 'speaking', 'readlisten', 'timers', 'calendar', 'topics'];
const OBJ = ['done', 'known', 'checks', 'wip', 'gram', 'gmore', 'pointed', 'opener', 'pnNote', 'logs'];
const ARR = ['mocks', 'wHist', 'sHist', 'custom', 'badges', 'comps', 'work', 'exp', 'fit', 'well', 'per', 'plan', 'muscles'];
const REF = ['win', 'happy', 'angry', 'grat', 'askSorry', 'sorryFrom', 'manifest'];

export function normalize(p) {
  const s = { exam: EXAM_DEFAULT, tab: 'today', sub: 'words', pal: 'midnight', mute: false, ...p };
  OBJ.forEach((k) => { if (!s[k] || typeof s[k] !== 'object' || Array.isArray(s[k])) s[k] = {}; });
  ARR.forEach((k) => { if (!Array.isArray(s[k])) s[k] = []; });
  if (!s.pts || !Array.isArray(s.pts.log)) s.pts = { total: 0, log: [] };
  if (!s.ref || typeof s.ref !== 'object' || Array.isArray(s.ref)) s.ref = {};
  REF.forEach((k) => { if (!Array.isArray(s.ref[k])) s.ref[k] = []; });
  if (TABS.indexOf(s.tab) < 0 && IELTS_SUB.indexOf(s.tab) < 0) s.tab = 'today';
  return s;
}
function load() { try { const raw = localStorage.getItem(KEY); if (raw) return normalize(JSON.parse(raw)); } catch (e) { /* ignore */ } return normalize({}); }

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [state, setState] = useState(load);
  const [pops, setPops] = useState([]);
  const [ui, setUiState] = useState(() => ({ viewIso: clampView(todayIso()), fcIdx: null, wSeg: 'today', gIdx: 0, pnDate: todayIso() }));
  const ref = useRef(state); ref.current = state;
  const ready = useRef(false);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }, [state]);
  const setUi = useCallback((patch) => setUiState((u) => ({ ...u, ...(typeof patch === 'function' ? patch(u) : patch) })), []);
  const mutate = useCallback((fn) => setState((s) => { const n = structuredClone(s); fn(n); return n; }), []);
  const replaceState = useCallback((p) => setState(normalize(p)), []);

  const closePop = useCallback((id) => {
    setPops((a) => a.map((p) => (p.id === id ? { ...p, out: true } : p)));
    setTimeout(() => setPops((a) => a.filter((p) => p.id !== id)), 220);
  }, []);
  const pop = useCallback((o) => {
    const id = Math.random().toString(36).slice(2);
    setPops((a) => [...a.slice(-2), { ...o, id }]);
    if (o.ms !== 0) setTimeout(() => closePop(id), o.ms || 3600);
    try { if (o.sys && 'Notification' in window && Notification.permission === 'granted' && document.hidden) new Notification(o.title, { body: o.msg || '' }); } catch (e) { /* ignore */ }
    return id;
  }, [closePop]);
  const toast = useCallback((msg, ms) => pop({ title: msg, ms, icon: 'ℹ️' }), [pop]);

  const fx = useCallback(() => { confetti(); if (!ref.current.mute) chime(); }, []);
  // award points; optional fn mutates state in the same update
  const award = useCallback((n, reason, fn) => {
    mutate((s) => {
      if (fn) fn(s);
      s.pts.total += n; s.pts.log.push({ n, r: reason, ts: todayIso() });
      if (s.pts.log.length > 700) s.pts.log = s.pts.log.slice(-700);
      s.comps.unshift({ n, r: reason, l: LINES[Math.floor(Math.random() * LINES.length)] });
      if (s.comps.length > 12) s.comps.pop();
    });
    fx(); pop({ title: `+${n} pts`, msg: reason, icon: '🎉' });
  }, [mutate, fx, pop]);
  // award once per key; fn runs only the first time
  const awardOnce = useCallback((key, n, reason, fn) => {
    if (ref.current.pointed[key]) { if (fn) mutate(fn); return false; }
    award(n, reason, (s) => { s.pointed[key] = 1; if (fn) fn(s); });
    return true;
  }, [award, mutate]);

  // badges
  useEffect(() => {
    const have = new Set(state.badges), now = badgeSet(state), fresh = BADGES.filter((b) => now[b[0]] && !have.has(b[0]));
    if (!fresh.length) { ready.current = true; return; }
    mutate((s) => { fresh.forEach((b) => { if (s.badges.indexOf(b[0]) < 0) s.badges.push(b[0]); }); });
    if (ready.current) { pop({ kind: 'badge', icon: fresh[0][1], title: 'New badge', msg: fresh[0][2], ms: 5000 }); confetti(); }
    ready.current = true;
  }, [state, mutate, pop]);

  // navigation
  const go = useCallback((n) => {
    const sub = IELTS_SUB.indexOf(ref.current.sub) >= 0 ? ref.current.sub : 'words';
    if (n === 'ielts') n = sub;
    if (TABS.indexOf(n) < 0 && IELTS_SUB.indexOf(n) < 0) n = 'today';
    mutate((s) => { s.tab = n; if (IELTS_SUB.indexOf(n) >= 0) s.sub = n; });
    window.scrollTo({ top: 0 });
  }, [mutate]);

  const value = useMemo(() => ({ state, mutate, replaceState, award, awardOnce, pop, toast, pops, closePop, ui, setUi, go }), [state, mutate, replaceState, award, awardOnce, pop, toast, pops, closePop, ui, setUi, go]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
