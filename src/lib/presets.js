import { BREAKS } from '../data/content.js';
export { BREAKS };
export const mk = (name, sec, kind) => ({ name, sec, kind: kind || 'work' });
export function sprintStages(totalMin, f, b) {
  const st = []; let rem = totalMin, n = 0;
  while (rem > 0) { const w = Math.min(f, rem); st.push(mk('Focus ' + (++n), w * 60)); rem -= w; if (rem > 0) st.push(mk('Break', (n % 4 === 0 ? 12 : b) * 60, 'break')); }
  return st;
}
export function fixedSprints(f, b, cycles) {
  const st = [];
  for (let i = 1; i <= cycles; i++) { st.push(mk('Focus ' + i, f * 60)); st.push(mk('Break', (i % 4 === 0 ? 15 : b) * 60, 'break')); }
  st.pop(); return st;
}
export const PRE = {
  mockLR: () => ({ label: 'Mock: Listening + Reading', mock: true, stages: [mk('Listening', 1800), mk('Transfer answers', 600), mk('Reading', 3600)] }),
  mockW: () => ({ label: 'Mock: Writing', mock: true, stages: [mk('Task 1', 1200), mk('Task 2', 2400)] }),
  mockS: () => ({ label: 'Mock: Speaking', mock: true, stages: [mk('Part 1', 300), mk('Part 2 (prep + talk)', 240), mk('Part 3', 300)] }),
};
// chk = check-in interval in minutes
export function makePresets(chk) {
  const mock = [
    { t: 'Listening 30 + transfer 10', p: () => ({ label: 'Mock: Listening', mock: true, stages: [mk('Listening', 1800), mk('Transfer answers', 600)] }) },
    { t: 'Reading 60', p: () => ({ label: 'Mock: Reading', mock: true, stages: [mk('Reading', 3600)] }) },
    { t: 'Writing 60 (Task 1 then Task 2)', p: PRE.mockW },
    { t: 'Speaking about 14 min', p: PRE.mockS },
    { t: 'Full written mock (L, R, W)', p: () => ({ label: 'Full written mock', mock: true, stages: [mk('Listening', 1800), mk('Transfer answers', 600), mk('Reading', 3600), mk('Writing Task 1', 1200), mk('Writing Task 2', 2400)] }) },
    { t: 'Part 2: 1 min prep + 2 min talk', p: () => ({ label: 'Speaking Part 2', mock: true, stages: [mk('Prep', 60), mk('Talk', 120)] }) },
  ];
  const practice = [
    { t: 'Reading passage 20 min', p: () => ({ label: 'Reading practice', chk, stages: [mk('Reading', 1200)] }) },
    { t: 'Reading 2 passages 40 min', p: () => ({ label: 'Reading practice', chk, stages: [mk('Reading', 2400)] }) },
    { t: 'Reading full 60 min', p: () => ({ label: 'Reading practice', chk, stages: [mk('Reading', 3600)] }) },
    { t: 'Writing Task 1 20 min', p: () => ({ label: 'Writing Task 1', stages: [mk('Task 1', 1200)] }) },
    { t: 'Writing Task 2 40 min', p: () => ({ label: 'Writing Task 2', stages: [mk('Task 2', 2400)] }) },
    { t: 'Listening section 10 min', p: () => ({ label: 'Listening practice', stages: [mk('Listening', 600)] }) },
  ];
  const sprint = [
    { t: 'Gentle 15 / 3 x 4', p: () => ({ label: 'Focus sprints', chk, stages: fixedSprints(15, 3, 4) }) },
    { t: 'Standard 20 / 4 x 4', p: () => ({ label: 'Focus sprints', chk, stages: fixedSprints(20, 4, 4) }) },
    { t: 'Classic 25 / 5 x 4', p: () => ({ label: 'Focus sprints', chk, stages: fixedSprints(25, 5, 4) }) },
    { t: 'Long 35 / 7 x 3', p: () => ({ label: 'Focus sprints', chk, stages: fixedSprints(35, 7, 3) }) },
  ];
  return {
    mock, practice, sprint,
    writing: [practice[3], practice[4], mock[2]],
    speaking: [mock[5], { t: 'Part 1: 5 min', p: () => ({ label: 'Speaking Part 1', stages: [mk('Part 1', 300)] }) }, { t: 'Part 3: 5 min', p: () => ({ label: 'Speaking Part 3', stages: [mk('Part 3', 300)] }) }, mock[3]],
    reading: [{ t: 'Reading 20 min with check-ins', p: practice[0].p }, { t: 'Reading 20 / 4 sprints x 3', p: () => ({ label: 'Reading sprints', chk, stages: fixedSprints(20, 4, 3) }) }, mock[1]],
  };
}
export function taskTimer(t, mode, chkEvery) {
  if (t.pre) return PRE[t.pre]();
  const chk = /Reading|Review|Vocab/i.test(t.sk) ? chkEvery : 0;
  if (mode === 'sprint' && t.m >= 30) return { label: t.sk, chk, stages: sprintStages(t.m, 20, 4) };
  return { label: t.sk, chk, stages: [mk(t.sk, t.m * 60)] };
}
