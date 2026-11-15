import { MeasuredText } from './MeasuredText';
import s from './page.module.css';

export function Faq({questions, en, intro, classNames = s}: {
  questions: string[][]; en: boolean; intro: string; classNames?: Record<string, string>;
}) {
  return <section className={classNames.section} aria-labelledby="case-faq">
    <h2 id="case-faq">{en ? 'Common questions' : '常见问题'}</h2>
    <p className={classNames.faqIntro}>{intro}</p>
    <div id="case-answers">
      {questions.map(([question, answer], i) => (
        <div className={classNames.faqRow} key={question}>
          <h3><MeasuredText text={question} /></h3>
          <p id={'answer-' + i}><MeasuredText text={answer} /></p>
        </div>
      ))}
    </div>
  </section>;
}
