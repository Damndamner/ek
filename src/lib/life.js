export const LV = [[0, 'Sprouting'], [150, 'Rooting'], [400, 'Growing'], [800, 'Blooming'], [1400, 'Thriving'], [2200, 'Unstoppable']];
export const lvl = (t) => { let i = 0; for (let k = 0; k < LV.length; k++) if (t >= LV[k][0]) i = k; return { n: i + 1, name: LV[i][1], from: LV[i][0], to: i + 1 < LV.length ? LV[i + 1][0] : null }; };
export const LINES = ['That is the hard part done: starting.', 'Proof you can do hard things in small pieces.', 'Deposit made into the band 8 account.', 'Future you says thank you.', 'You did not need to feel ready. You started.', 'One more brick in the wall. Keep going.', 'Your nervous system just learned: tasks are survivable.', 'That was not nothing. That is how 7.5 gets built.'];
export const BADGES = [
  ['p50','⭐','First 50 points'],['p250','🌟','250 points'],['p900','🏆','900 points'],
  ['i1','🎧','First IELTS task'],['i25','📘','25 IELTS tasks'],['i100','📚','100 IELTS tasks'],['day1','✅','First full day'],['day7','🗓️','7 full days'],
  ['w1','✍️','First writing saved'],['s1','🎤','First speaking saved'],['k100','🔤','100 words learned'],['m1','📝','First mock logged'],['m7','🎯','A mock at band 7+'],['m8','🥇','A mock at band 8'],
  ['g1','🏋️','First workout'],['sp10','👟','10,000 steps in a day'],['gr7','🙏','7 gratitudes'],['mf1','✨','First thing manifested'],['g10','💪','10 workouts'],['c1','🧘','First check-in'],['st3','🔥','3-day streak'],['st7','🔥🔥','7-day streak'],
];
export const CATCOL = { Food: '#d97706', Transport: '#3b82f6', IELTS: '#0f9b83', Health: '#f43f5e', 'Self-care': '#ec4899', Online: '#a855f7', Errands: '#84cc16', Bills: '#06b6d4', Other: '#9ca3af' };
export const EXP_CATS = ['Food', 'Transport', 'IELTS', 'Self-care', 'Health', 'Online', 'Errands', 'Bills', 'Other'];
export const MUS_BASE = ['Chest','Core','Cardio','Arms','Triceps','Biceps','Legs','Shoulders','Back','Glutes','Calves','Forearms','Traps','Full body','HIIT','Stretching'];
export const EMO = {
  Happy: { c: '#eab308', s: { Optimistic: ['Hopeful', 'Inspired'], Peaceful: ['Loved', 'Thankful'], Proud: ['Successful', 'Confident'], Excited: ['Eager', 'Energetic'], Powerful: ['Courageous', 'Creative'] } },
  Sad: { c: '#3b82f6', s: { Hurt: ['Disappointed', 'Wounded'], Guilty: ['Ashamed', 'Remorseful'], Despair: ['Powerless', 'Grief'], Vulnerable: ['Fragile', 'Victimised'], Lonely: ['Abandoned', 'Isolated'] } },
  Angry: { c: '#ef4444', s: { Distant: ['Numb', 'Withdrawn'], Critical: ['Dismissive', 'Sceptical'], Frustrated: ['Annoyed', 'Infuriated'], Bitter: ['Violated', 'Indignant'], Humiliated: ['Ridiculed', 'Disrespected'] } },
  Fearful: { c: '#a855f7', s: { Anxious: ['Overwhelmed', 'Worried'], Insecure: ['Inadequate', 'Inferior'], Weak: ['Worthless', 'Insignificant'], Rejected: ['Excluded', 'Persecuted'], Threatened: ['Nervous', 'Exposed'] } },
  Disgusted: { c: '#22c55e', s: { Repelled: ['Horrified', 'Hesitant'], Awful: ['Nauseated', 'Detestable'], Disenchanted: ['Appalled', 'Revolted'], Disapproving: ['Judgemental', 'Embarrassed'], Startled: ['Shocked', 'Dismayed'] } },
};
export const emoPath = (w) => [w.core, w.sec, w.ter].filter(Boolean).join(' › ');
export const RF = [
  ['win', 'Daily win', 'One win a day, however small. Up to 3 a day, +5 points each.', 'Today I won by...', null],
  ['happy', 'What makes me happy', 'People, places and small things that lift me.', 'Something that makes me happy', null],
  ['angry', 'What makes me angry', 'Triggers worth knowing. Naming them is the first step.', 'Something that makes me angry', null],
  ['grat', 'Gratitude', 'Three a day is a strong habit. +3 points each.', 'I am grateful for...', null],
  ['askSorry', 'Say sorry to', 'People I need to apologise to, and for what. Tick when done (+10).', 'Name: what for', 'Said sorry'],
  ['sorryFrom', 'Sorry I am owed', 'People who hurt me. An apology I would like, or one I am letting go of. Tick when received or released (+10).', 'Name: what happened', 'Received or let go'],
  ['manifest', 'Manifesting', 'Write it as if it is already true. Tick when it arrives (+10).', 'I am...', 'Manifested'],
];
export const PALS = [['midnight', 'Midnight', '#8b5cf6'], ['aurora', 'Aurora', '#6d28d9'], ['sunset', 'Sunset', '#be123c'], ['ocean', 'Ocean', '#0369a1'], ['forest', 'Forest', '#0a6b5b'], ['berry', 'Berry', '#be185d'], ['citrus', 'Citrus', '#4d7c0f']];
export const isRest = (f) => String(f.type).indexOf('Rest') >= 0;
export const isSession = (f) => !isRest(f) && String(f.type).indexOf('Steps') < 0;
