'use client';

import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { FASTENER_CASE_QUESTIONS as questions } from '@/lib/cases/fastener-case-content';
import s from './page.module.css';

export function Faq() {
  const [open, setOpen] = useState<number[]>([]);
  const allOpen = open.length === questions.length;
  return <section className={s.section} aria-labelledby="case-faq">
    <h2 id="case-faq">常见问题</h2>
    <div className={s.faqIntro}>
      <p>关于协议产量、工件条件与验收的常见问题。</p>
      <button type="button" aria-expanded={allOpen} aria-controls="case-answers" onClick={() => setOpen(allOpen ? [] : questions.map((_, i) => i))}>
        {allOpen ? '收起全部回答' : '展开全部回答'} <FiChevronDown aria-hidden />
      </button>
    </div>
    <div id="case-answers">{questions.map(([question, answer], i) => <div className={s.faqRow} key={question}>
      <h3><button type="button" aria-expanded={open.includes(i)} aria-controls={'answer-' + i}
        onClick={() => setOpen(current => current.includes(i) ? current.filter(n => n !== i) : [...current, i])}>
        {question}<FiChevronDown aria-hidden />
      </button></h3>
      <p id={'answer-' + i} hidden={!open.includes(i)}>{answer}</p>
    </div>)}</div>
  </section>;
}
