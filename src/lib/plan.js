// Builds the 62-day IELTS plan (5 Oct to 5 Dec 2026). Pure and deterministic.
import { L, R, W, S, V, T1, T2, S1, S2, S3, VOC } from '../data/content.js';
import { iso, fmt } from './dates.js';

export const START = new Date(2026, 9, 5);
export const END = new Date(2026, 11, 5);
export const EXAM_DEFAULT = '2026-11-15';
export const PHASES = [
  { n: 'Foundation', a: '2026-10-05', b: '2026-10-11' }, { n: 'Build', a: '2026-10-12', b: '2026-10-25' },
  { n: 'Timed practice', a: '2026-10-26', b: '2026-11-08' }, { n: 'Final stretch', a: '2026-11-09', b: '2026-11-14' },
  { n: 'Extension', a: '2026-11-15', b: '2026-12-05' },
];
const phaseOf = (s) => { for (let i = 0; i < PHASES.length; i++) if (s >= PHASES[i].a && s <= PHASES[i].b) return i; return 0; };
const MOCKS = new Set(['2026-10-17','2026-10-24','2026-10-31','2026-11-07','2026-11-11','2026-11-18','2026-11-24','2026-11-28','2026-12-02']);
const LIGHT = new Set(['2026-10-11','2026-10-18','2026-10-25','2026-11-01','2026-11-08','2026-11-15','2026-11-22','2026-11-29']);
const REST = new Set(['2026-11-14','2026-12-05']);
const T = (sk, tx, m, pre) => ({ sk, tx, m, pre: pre || null });

export function buildPlan() {
  const TASKS = {};
  const byType = {};
  T2.forEach((x, i) => { (byType[x[0]] = byType[x[0]] || []).push(i); });
  byType.op = (byType.op || []).concat(byType.cmp || []);
  const cnt = { t2: 0, t1: 0, s2: 0, s3: 0, s1: 0 }, tc = {};
  const nextT2 = (hint) => {
    if (hint && byType[hint] && byType[hint].length) { tc[hint] = tc[hint] || 0; const l = byType[hint]; return l[tc[hint]++ % l.length]; }
    return (cnt.t2++) % T2.length;
  };
  const nextT1 = (hint) => {
    const l = []; T1.forEach((x, i) => { if (!hint || x[0] === hint) l.push(i); });
    if (!l.length) return (cnt.t1++) % T1.length;
    const k = '1' + (hint || ''); tc[k] = tc[k] || 0; return l[tc[k]++ % l.length];
  };
  const hint2 = (tx) => /opinion/i.test(tx) ? 'op' : /discussion/i.test(tx) ? 'disc' : /problem and solution/i.test(tx) ? 'ps' : /advantages and disadvantages/i.test(tx) ? 'ad' : /two-part/i.test(tx) ? 'two' : null;
  const hint1 = (tx) => /line graph/i.test(tx) ? 'Line' : /process/i.test(tx) ? 'Process' : /mixed/i.test(tx) ? 'Mixed' : /bar chart/i.test(tx) ? 'Bar' : /table/i.test(tx) ? 'Table' : /map/i.test(tx) ? 'Map' : null;
  const assignWriting = (t, mock) => {
    const w = { t1: [], t2: [] };
    if (/^Rewrite|Rewrite the weakest/i.test(t.tx) && !mock) return w;
    const n1 = /Task 1/.test(t.tx) || mock, n2 = /Task 2|essay/i.test(t.tx) || mock;
    if (/two essays/i.test(t.tx)) w.t2.push(nextT2(hint2(t.tx)), nextT2(null));
    else if (/intro and conclusion for 5 prompts/i.test(t.tx)) { for (let i = 0; i < 5; i++) w.t2.push(nextT2(null)); }
    else { if (n1) w.t1.push(nextT1(hint1(t.tx))); if (n2) w.t2.push(nextT2(hint2(t.tx))); }
    return w;
  };
  const assignSpeaking = () => {
    const sp = { card: (cnt.s2++) % S2.length, card2: (cnt.s2++) % S2.length, p3: [], p1: [] };
    for (let i = 0; i < 3; i++) { sp.p3.push((cnt.s3++) % S3.length); sp.p1.push((cnt.s1++) % S1.length); }
    return sp;
  };
  const days = [], c = [0, 0, 0, 0, 0], d = new Date(START);
  while (d <= END) {
    const s = iso(d), ph = phaseOf(s); let tasks, tag, mock = false;
    if (s === '2026-10-05') {
      tag = 'Diagnostic mock'; mock = true;
      tasks = [T('Listening + Reading', 'Full diagnostic under exam conditions, single play. Record raw scores in the Calendar tab.', 100, 'mockLR'), T('Writing', 'Task 1 (20 min) and Task 2 (40 min) timed.', 60, 'mockW'), T('Speaking', 'Record a full 14 minute mock speaking test.', 14, 'mockS'), T('Review', 'Convert scores to bands, start your error log, and rank your weakest question types.', 90)];
    } else if (MOCKS.has(s)) {
      tag = 'Full mock'; mock = true;
      tasks = [T('Listening + Reading', 'Full mock under exam conditions: 30 min Listening, 10 min transfer, 60 min Reading.', 100, 'mockLR'), T('Writing', 'Task 1 (20 min) and Task 2 (40 min) timed.', 60, 'mockW'), T('Speaking', 'Record a full 14 minute mock speaking test.', 14, 'mockS'), T('Review', "Score everything, log it in the Calendar tab, and update the error log. Pick the next 2 days' focus from the weakest section.", 90)];
    } else if (REST.has(s)) {
      tag = 'Rest + light review';
      tasks = [T('Review', 'Read your error log and band 8 model answers once. No new material.', 45), T('Speaking', 'Say 5 Part 2 answers out loud, no recording.', 30), T('Admin', 'If your exam is tomorrow: check ID, test centre address and route, arrival time, and pack tonight.', 20), T('Rest', 'Stop by early evening and sleep well.', 0)];
    } else if (LIGHT.has(s)) {
      tag = 'Light day';
      tasks = [T('Review', 'Read the error log and fix every repeated mistake type.', 60), T('Vocabulary', "Revise this week's topic words and collocations.", 40), T('Speaking', 'Record two Part 2 answers on new cue cards.', 30), T('Writing', 'Rewrite the weakest paragraph from this week.', 40)];
    } else {
      const i1 = c[0]++, i2 = c[1]++, i3 = c[2]++, i4 = c[3]++, i5 = c[4]++, pi = Math.min(ph, 2);
      tag = ['Foundation', 'Build', 'Timed practice', 'Final stretch', 'Extension'][ph];
      tasks = [T('Listening', L[pi][i1 % 6], 60), T('Reading', R[pi][i2 % 6], 75), T('Writing', W[pi][i3 % 6], 105), T('Speaking', S[pi][i4 % 6], 45), T('Vocab + review', V[i5 % 7], 45)];
      if (ph >= 3) tasks[2].tx += ' Check it against the band descriptors for coherence and range.';
    }
    tasks.forEach((t, ti) => {
      t.id = `${s}-${ti}`;
      if (t.sk === 'Writing') t.w = assignWriting(t, mock);
      if (t.sk === 'Speaking') t.sp = assignSpeaking();
      TASKS[t.id] = t;
    });
    days.push({ date: new Date(d), s, tag, mock, tasks, ext: ph === 4, idx: days.length });
    d.setDate(d.getDate() + 1);
  }
  return { DAYS: days, TASKS };
}
export const { DAYS, TASKS } = buildPlan();
export const DAYBY = Object.fromEntries(DAYS.map((d) => [d.s, d]));
export const doneCount = (day, done) => day.tasks.filter((t) => done[t.id]).length;
export const clampView = (s) => (s < DAYS[0].s ? DAYS[0].s : s > DAYS[DAYS.length - 1].s ? DAYS[DAYS.length - 1].s : s);
export const dayLabel = (day) => fmt(day.date);

// vocabulary pool and daily sets
export function pool(custom) {
  const out = [];
  VOC.forEach((g) => g[1].forEach((r) => { const f = r.split('|'); out.push({ k: `${g[0]}|${f[0]}`, w: f[0], m: f[1], e: f[2], t: g[0] }); }));
  (custom || []).forEach((c) => out.push({ k: `My words|${c.w}`, w: c.w, m: c.m, e: c.e, t: 'My words' }));
  return out;
}
export function wordsFor(idx, custom) {
  const P = pool(custom), n = P.length, out = [];
  if (!n) return out;
  for (let i = 0; i < 6; i++) out.push(P[(idx * 6 + i) % n]);
  const rev = [];
  if (idx >= 1) rev.push(P[((idx - 1) * 6) % n], P[((idx - 1) * 6 + 1) % n]);
  if (idx >= 3) rev.push(P[((idx - 3) * 6 + 2) % n], P[((idx - 3) * 6 + 3) % n]);
  rev.forEach((r) => out.push({ ...r, rev: true }));
  return out;
}
// bands
export const lBand = (n) => n >= 39 ? 9 : n >= 37 ? 8.5 : n >= 35 ? 8 : n >= 32 ? 7.5 : n >= 30 ? 7 : n >= 26 ? 6.5 : n >= 23 ? 6 : n >= 18 ? 5.5 : n >= 16 ? 5 : n >= 13 ? 4.5 : n >= 10 ? 4 : 3.5;
export const rBand = (n) => n >= 39 ? 9 : n >= 37 ? 8.5 : n >= 35 ? 8 : n >= 33 ? 7.5 : n >= 30 ? 7 : n >= 27 ? 6.5 : n >= 23 ? 6 : n >= 19 ? 5.5 : n >= 15 ? 5 : n >= 13 ? 4.5 : n >= 10 ? 4 : 3.5;
export const overall = (a, b, c, d) => Math.round((a + b + c + d) / 4 * 2) / 2;
