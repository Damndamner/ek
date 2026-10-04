import { useTimer } from '../timer.jsx';
import { makePresets } from '../lib/presets.js';
import { A, Btn, Card, H2, H3, Hint, Panel, Scroll, Section, Table, Td, Th, UL } from '../components/ui.jsx';

const yt = (q) => 'https://www.youtube.com/results?search_query=' + q;
const TYPES = [
  ['True / False / Not Given', 'False means the text says the opposite. Not Given means the text is silent. Find the exact sentence before answering.'],
  ['Matching headings', 'Read the first and last sentence of each paragraph. Eliminate as you go. Do this type last.'],
  ['Summary completion', 'Check the word limit, predict the part of speech, copy exact words from the text.'],
  ['Matching information', 'The answer is a paragraph letter. Look for paraphrases, not repeated words.'],
  ['Multiple choice', 'Eliminate with evidence. Options with extreme words (all, never) are usually traps.'],
];

export default function ReadListen() {
  const { load, chkEvery } = useTimer();
  const presets = makePresets(chkEvery).reading;
  return (
    <Panel>
      <Section>
        <H2>Listening</H2>
        <Card><H3>Free official practice</H3>
          <UL>
            <li><A href="https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/academic/listening">British Council: Academic Listening practice</A></li>
            <li><A href="https://ielts.idp.com/prepare/all-test-types/all-skills/practice-test">IDP: practice tests for all four skills</A></li>
            <li><A href="https://ieltsidpindia.com/prepare/ielts-listening-test/practice-tests">IDP India: Listening practice tests with audio</A></li>
            <li><A href="https://ielts.idp.com/prepare/article-common-vocabulary-ielts-listening">IDP: common vocabulary in IELTS Listening</A></li>
            <li><A href="https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/ielts-familiarisation-test">British Council: familiarisation test</A></li>
          </UL></Card>
        <Card><H3>Full tests</H3><p>Cambridge IELTS 15 to 19 Academic books come with audio. Use them for the timed full tests and keep one sealed for the final mock.</p></Card>
        <Card><H3>Train your ear for accents</H3>
          <UL>
            <li><A href="https://www.bbc.co.uk/learningenglish/english/features/6-minute-english">BBC Learning English: 6 Minute English</A> (British, with transcripts)</li>
            <li>TED talks with English subtitles hidden on the first listen, shown on the second. <A href={yt('TED+talk+education+technology')}>Search</A></li>
            <li>Australian and Canadian news clips appear in the real test. <A href={yt('ABC+Australia+news+explainer')}>Search</A></li>
          </UL></Card>
        <Card><H3>Channels for Listening</H3>
          <UL>
            <li><b>Academic English Help</b>: full section walkthroughs. <A href={yt('Academic+English+Help+IELTS+listening')}>Search</A></li>
            <li><b>IELTS Liz</b>: strategies per question type. <A href={yt('IELTS+Liz+listening')}>Search</A></li>
            <li><b>E2 IELTS</b>: method-driven lessons. <A href={yt('E2+IELTS+listening')}>Search</A></li>
          </UL></Card>
        <Card><H3>Listening rules that save marks</H3>
          <UL>
            <li>Read the questions in the preview time and underline the keyword in each.</li>
            <li>The speaker often corrects themselves. The final version is the answer, not the first one.</li>
            <li>Spelling counts. Singular or plural counts. Check the word limit.</li>
            <li>Never leave a blank, guess. Move on instantly when you lose one, or you lose the next three.</li>
            <li>Commonly misspelled: accommodation, necessary, Wednesday, February, government, environment, separate, receive, definitely, library, restaurant, schedule.</li>
          </UL></Card>
      </Section>
      <Section>
        <H2>Reading</H2>
        <Card><H3>Free official practice</H3>
          <UL>
            <li><A href="https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/academic/reading">British Council: Academic Reading practice</A></li>
            <li><A href="https://ielts.idp.com/prepare/all-test-types/reading/practice-test">IDP: Reading practice tests</A></li>
            <li><A href="https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/academic/writing">British Council: Writing practice (official Task 1 visuals)</A></li>
            <li><A href="https://takeielts.britishcouncil.org/prepare/ielts-free-practice-mock-tests/academic/speaking">British Council: Speaking practice</A></li>
          </UL></Card>
        <Card><H3>Official books</H3><p>Cambridge IELTS 15 to 19 Academic (Cambridge University Press, the official past-paper series). They are paid and in many libraries. I cannot reproduce passages because they are copyrighted. Avoid pirated PDFs: layouts and answer keys are often wrong. Do tests 15 to 18 as practice and keep one sealed for the final mock.</p></Card>
        <Card><H3>YouTube channels for Reading and Writing</H3>
          <UL>
            <li><b>Academic English Help</b>: full passage walkthroughs. <A href={yt('Academic+English+Help+IELTS+reading')}>Search</A></li>
            <li><b>IELTS Liz</b>: all-round strategies and model answers. <A href={yt('IELTS+Liz+academic+reading')}>Search</A></li>
            <li><b>E2 IELTS</b>: method-driven lessons. <A href={yt('E2+IELTS+reading+strategy')}>Search</A></li>
            <li><b>IELTS Advantage</b> and <b>IELTS Simon</b>: Writing. <A href={yt('IELTS+Advantage+writing+task+2')}>Search</A></li>
            <li><b>Fastrack IELTS</b>: tactics for bands 7 to 8.5. <A href={yt('Fastrack+IELTS+band+8')}>Search</A></li>
          </UL>
          <Hint>Watching is not practice. After each video, do one timed set of that question type the same day.</Hint></Card>
        <Scroll>
          <Table>
            <thead><tr><Th>Type</Th><Th>Method</Th></tr></thead>
            <tbody>{TYPES.map(([a, b]) => <tr key={a}><Td>{a}</Td><Td>{b}</Td></tr>)}</tbody>
          </Table>
        </Scroll>
        <div className="flex flex-wrap gap-2">{presets.map((x) => <Btn key={x.t} variant="ghost" onClick={() => load(x.p())}>{x.t}</Btn>)}</div>
      </Section>
    </Panel>
  );
}
