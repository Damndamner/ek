import { T1, T2, S1, S2, S3 } from '../data/content.js';
export const writingList = (kind) => (kind === 't2' ? T2 : T1);
export const speakingList = (part) => (part === 'p2' ? S2 : part === 'p1' ? S1 : S3);
export function writingPromptText(kind, i) {
  const x = writingList(kind)[i]; if (!x) return '';
  return (kind === 't1' ? `[${x[0]}] ` : '') + x[1] + (kind === 't1' ? '\n\nData / description of the visual: (paste here)' : '');
}
export function speakingPromptText(part, i) {
  const q = speakingList(part)[i]; if (!q) return '';
  return part === 'p2' ? q + '\n\nYou should say:\n- what / who / where it was\n- when it happened\n- how you felt about it\nand explain why it was important to you.' : q;
}
// state mutators (call inside mutate)
export const loadWriting = (s, kind, i) => { s.wip.wType = kind; if (i != null) s.wip.wPrompt = writingPromptText(kind, i); };
export const loadSpeaking = (s, part, i) => { s.wip.sPart = part; if (i != null) s.wip.sPrompt = speakingPromptText(part, i); };
