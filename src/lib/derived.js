import { iso, pastDate, todayIso } from './dates.js';
import { DAYS, DAYBY, doneCount, lBand, rBand, overall } from './plan.js';

export const ptsToday = (s) => s.pts.log.filter((l) => l.ts === todayIso()).reduce((a, b) => a + b.n, 0);

export function lfStreaks(s) {
  const act = {}; s.pts.log.forEach((l) => { act[l.ts] = 1; });
  let d = 0, i = act[iso(pastDate(0))] ? 0 : 1;
  while (act[iso(pastDate(i))]) { d++; i++; }
  let w = 0, end = 0;
  for (let k = 0; k < 52; k++) { let has = false; for (let j = 0; j < 7; j++) if (act[iso(pastDate(end + j))]) { has = true; break; } if (has) { w++; end += 7; } else break; }
  let m = 0, cur = new Date(); cur = new Date(cur.getFullYear(), cur.getMonth(), 1);
  for (let q = 0; q < 24; q++) {
    const pre = cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0');
    if (Object.keys(act).some((x) => x.slice(0, 7) === pre)) { m++; cur = new Date(cur.getFullYear(), cur.getMonth() - 1, 1); } else break;
  }
  return { d, w, m };
}

// consecutive days with at least 3 IELTS tasks done
export function ieltsStreak(s) {
  let n = 0, d = new Date(); d = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const t = todayIso();
  for (let i = 0; i < 70; i++) {
    const k = iso(d), day = DAYBY[k];
    if (day) { if (doneCount(day, s.done) >= 3) n++; else if (k !== t) break; }
    else if (k < DAYS[0].s) break;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function fitStreak(s) {
  let n = 0;
  for (let i = 0; i < 60; i++) { const ds = iso(pastDate(i)); if (s.fit.some((f) => f.date === ds && String(f.type).indexOf('Rest') < 0)) n++; else if (i > 0) break; }
  return n;
}

export function badgeSet(s) {
  const o = {}, p = s.pts.total, ti = Object.keys(s.done).length;
  let full = 0; DAYS.forEach((d) => { if (doneCount(d, s.done) === d.tasks.length) full++; });
  const known = Object.keys(s.known).filter((k) => s.known[k]).length;
  let best = 0; s.mocks.forEach((m) => { const v = overall(lBand(m.l), rBand(m.r), m.w, m.s); if (v > best) best = v; });
  const gym = s.fit.filter((f) => String(f.type).indexOf('Rest') < 0).length, st = lfStreaks(s).d;
  let maxSt = 0; const stp = {};
  s.fit.forEach((f) => { stp[f.date] = (stp[f.date] || 0) + (+f.steps || 0); if (stp[f.date] > maxSt) maxSt = stp[f.date]; });
  if (maxSt >= 10000) o.sp10 = 1;
  if (s.ref.grat.length >= 7) o.gr7 = 1;
  if (s.ref.manifest.some((m) => m.done)) o.mf1 = 1;
  if (p >= 50) o.p50 = 1; if (p >= 250) o.p250 = 1; if (p >= 900) o.p900 = 1;
  if (ti >= 1) o.i1 = 1; if (ti >= 25) o.i25 = 1; if (ti >= 100) o.i100 = 1; if (full >= 1) o.day1 = 1; if (full >= 7) o.day7 = 1;
  if (s.wHist.length) o.w1 = 1; if (s.sHist.length) o.s1 = 1; if (known >= 100) o.k100 = 1;
  if (s.mocks.length) o.m1 = 1; if (best >= 7) o.m7 = 1; if (best >= 8) o.m8 = 1;
  if (gym >= 1) o.g1 = 1; if (gym >= 10) o.g10 = 1; if (s.well.length) o.c1 = 1; if (st >= 3) o.st3 = 1; if (st >= 7) o.st7 = 1;
  return o;
}
