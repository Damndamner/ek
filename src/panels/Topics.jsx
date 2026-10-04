import { useApp } from '../store.jsx';
import { S2, T1, T2, T2NAME } from '../data/content.js';
import { loadSpeaking, loadWriting } from '../lib/prompts.js';
import { A, H2, H3, Hint, Note, Panel, Section, UL } from '../components/ui.jsx';

function PL({ tag, text, onClick }) {
  return (
    <button type="button" onClick={onClick} className="cursor-pointer rounded-xl border border-line bg-surface px-3.5 py-2.5 text-left font-normal text-fg transition hover:border-accent focus-visible:outline-2 focus-visible:outline-signal">
      <span className="mr-2 text-[11px] uppercase tracking-[.06em] text-accent">{tag}</span>{text}
    </button>
  );
}

export default function Topics() {
  const { mutate, go } = useApp();
  const w = (kind, i) => () => { mutate((s) => loadWriting(s, kind, i)); go('writing'); };
  const sp = (i) => () => { mutate((s) => loadSpeaking(s, 'p2', i)); go('speaking'); };
  return (
    <Panel>
      <Section>
        <H2>What IELTS keeps asking</H2>
        <Note>IELTS does not publish questions. These come from test-takers' recalled questions gathered by prep sites, so treat them as patterns: themes repeat, exact wording does not. Each day in Today also gives you a matching prompt. Tap anything below to load it into the lab.</Note>
      </Section>
      <Section>
        <H3>Task 2: most frequent themes</H3>
        <ol className="m-0 flex list-decimal flex-col gap-1.5 pl-[22px]">
          {['Education: access, curriculum, learning methods', 'Technology: effect on society, dependence', 'Environment: pollution, sustainability', 'Work: career choice, working hours, pay', 'Health and lifestyle', 'Social issues: crime, family, generations', 'Travel and transport', 'Government and economics', 'Culture and tradition', 'Sports and recreation'].map((x) => <li key={x}>{x}</li>)}
        </ol>
        <Hint>In a sample of 20 recalled prompts the essay types were nearly even: opinion, discussion and advantages vs disadvantages about 5 to 6 each, problem and solution 3, comparison 1. Have one template per type.</Hint>
      </Section>
      <Section><H3>Task 2 practice prompts</H3>
        <div className="flex flex-col gap-1.5">{T2.map((x, i) => <PL key={i} tag={T2NAME[x[0]]} text={x[1]} onClick={w('t2', i)} />)}</div></Section>
      <Section><H3>Task 1: what appears</H3>
        <p>Line graphs most often, then tables and mixed charts, then bar and pie, with processes and maps less often. Practise all types with official visuals from the British Council writing page.</p>
        <div className="flex flex-col gap-1.5">{T1.map((x, i) => <PL key={i} tag={x[0]} text={x[1]} onClick={w('t1', i)} />)}</div></Section>
      <Section><H3>Speaking Part 2: cue cards recalled for Sep to Dec 2026</H3>
        <Hint>Cue cards rotate every four months. Prepare a two-minute story for each type: person, place, event, object, decision.</Hint>
        <div className="flex flex-col gap-1.5">{S2.map((x, i) => <PL key={i} tag="Part 2" text={x} onClick={sp(i)} />)}</div></Section>
      <Section><H3>Part 1 and Part 3</H3>
        <p><b>Part 1:</b> work or study, hometown, home, hobbies, food, weather, friends, routine, transport, reading, music, shopping, phones, sleep, social media.</p>
        <p><b>Part 3 patterns:</b> compare past and present, predict the future, causes and effects, advantages and disadvantages, "should the government...", why generations differ. Answer with a position, a reason and an example in 30 to 45 seconds.</p></Section>
      <Section><H3>Sources</H3>
        <UL className="text-[13px]">
          <li><A href="https://ieltsfever.org/september-2026-to-december-2026-cue-cards-with-sample-answers-updating-weekly">IELTS Fever: Sep to Dec 2026 cue cards</A></li>
          <li><A href="https://www.ieltspodcast.com/sample-ielts-task-2-questions/">IELTS Podcast: recent Task 2 questions</A></li>
          <li><A href="https://writing9.com/ielts-academic-writing-task-1-topics">Writing9: recent Academic Task 1 topics</A></li>
        </UL></Section>
    </Panel>
  );
}
