type Faq = { question: string; answer: string };

/** The same reviewed answers feed the visible article and its search metadata. */
export function ReviewedFaqs({ items }: { items: Faq[] }) {
  return (
    <div className="faq-list">
      {items.map((item, index) => (
        <details key={item.question} open={index === 0}>
          <summary>
            {item.question}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
