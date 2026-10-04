import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AppProvider, useApp, IELTS_SUB } from './store.jsx';
import { TimerProvider } from './timer.jsx';
import Header from './components/Header.jsx';
import Nav from './components/Nav.jsx';
import Pops from './components/Pops.jsx';
import Dock from './components/Dock.jsx';
import Today from './panels/Today.jsx';
import { parseIso } from './lib/dates.js';
import { beep } from './lib/audio.js';

// every panel is its own file; they mount on first visit and stay mounted (keeps typed text and quiz progress)
const PANELS = {
  today: Today,
  planner: lazy(() => import('./panels/LifeCalendar.jsx')),
  words: lazy(() => import('./panels/Words.jsx')),
  grammar: lazy(() => import('./panels/Grammar.jsx')),
  writing: lazy(() => import('./panels/Writing.jsx')),
  speaking: lazy(() => import('./panels/Speaking.jsx')),
  readlisten: lazy(() => import('./panels/ReadListen.jsx')),
  timers: lazy(() => import('./panels/Timers.jsx')),
  calendar: lazy(() => import('./panels/StudyCalendar.jsx')),
  topics: lazy(() => import('./panels/Topics.jsx')),
  work: lazy(() => import('./panels/Work.jsx')),
  money: lazy(() => import('./panels/Expenses.jsx')),
  body: lazy(() => import('./panels/Body.jsx')),
  reflect: lazy(() => import('./panels/Reflect.jsx')),
  cycle: lazy(() => import('./panels/Cycle.jsx')),
  rewards: lazy(() => import('./panels/Rewards.jsx')),
};

function Reminders() {
  const { state, mutate, pop, awardOnce } = useApp();
  const ref = useRef(state); ref.current = state;
  useEffect(() => {
    const check = () => {
      const now = Date.now();
      ref.current.plan.forEach((e) => {
        if (e.done || e.remind < 0 || !e.time || ref.current.pnNote[e.id]) return;
        const p = e.time.split(':'), d = parseIso(e.date); d.setHours(+p[0], +p[1], 0, 0);
        const at = d.getTime(), trig = e.snz || at - e.remind * 60000;
        if (now >= trig && now < at + 2 * 3600000) {
          mutate((s) => { s.pnNote[e.id] = 1; });
          if (!ref.current.mute) beep(1, 880);
          pop({ kind: 'remind', icon: '⏰', title: e.title, msg: `${e.kind || ''} at ${e.time}${e.snz ? ' (snoozed)' : ''}`, ms: 0, sys: true, actions: [
            { label: 'Done', fn: () => awardOnce('pn' + e.id, 5, 'Planner: ' + e.title, (s) => { const x = s.plan.find((q) => q.id === e.id); if (x) x.done = true; }) },
            { label: 'Snooze 10 min', ghost: true, fn: () => mutate((s) => { const x = s.plan.find((q) => q.id === e.id); if (x) { x.snz = Date.now() + 600000; delete s.pnNote[e.id]; } }) },
          ] });
        }
      });
    };
    check();
    const id = setInterval(check, 20000);
    return () => clearInterval(id);
  }, [mutate, pop, awardOnce]);
  return null;
}

function Shell() {
  const { state } = useApp();
  const tab = state.tab, grp = IELTS_SUB.includes(tab) ? tab : tab === 'ielts' ? state.sub : tab;
  const [seen, setSeen] = useState(() => new Set([grp]));
  useEffect(() => { setSeen((s) => (s.has(grp) ? s : new Set(s).add(grp))); }, [grp]);
  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-[18px]">
      <Header />
      <Nav />
      {Object.keys(PANELS).filter((k) => seen.has(k) || k === grp).map((k) => {
        const C = PANELS[k];
        return <div key={k} hidden={k !== grp}><Suspense fallback={null}><C /></Suspense></div>;
      })}
      <Reminders />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <TimerProvider>
        <Shell />
        <Dock />
        <Pops />
      </TimerProvider>
    </AppProvider>
  );
}
