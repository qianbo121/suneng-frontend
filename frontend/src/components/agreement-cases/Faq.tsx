import { MeasuredText } from './MeasuredText';
import cards from '@/components/products/Cqi9EquipmentPage.module.css';
import styles from './Faq.module.css';

export function Faq({ questions, en, intro }: { questions: string[][]; en: boolean; intro: string }) {
  return <section className={`${cards.faq} ${styles.section}`} aria-labelledby="case-faq">
    <h2 id="case-faq">{en ? 'Common questions' : '常见问题'}</h2>
    <p className={styles.intro}>{intro}</p>
    <div id="case-answers" className={`${cards.faqGrid} ${styles.grid}`}>
      {questions.map(([question, answer], index) => (
        <div key={question} className={cards.faqCard}>
          <h3><MeasuredText text={question} /></h3>
          <p id={`answer-${index}`}><MeasuredText text={answer} /></p>
        </div>
      ))}
    </div>
  </section>;
}
