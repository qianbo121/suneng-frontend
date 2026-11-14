import { FASTENER_CASE_QUESTIONS } from '@/lib/cases/fastener-case-content';
import s from './page.module.css';

export function Faq() {
  return <section className={s.section} aria-labelledby="case-faq">
    <h2 id="case-faq">常见问题</h2>
    <p className={s.faqIntro}>关于协议产量、工件条件与验收的常见问题。</p>
    <div id="case-answers">
      {FASTENER_CASE_QUESTIONS.map(([question, answer]) => <div className={s.faqRow} key={question}>
        <h3>{question}</h3>
        <p>{answer}</p>
      </div>)}
    </div>
  </section>;
}
