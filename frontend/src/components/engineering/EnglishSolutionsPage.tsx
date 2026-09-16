import Image from 'next/image';
import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi2';
import { JsonLd } from '@/components/JsonLd';
import { ProductLeadForm } from '@/components/products/ProductLeadForm';
import { englishSolutions, getEnglishSolution, solutionAlternates, ENGLISH_SOLUTIONS_UPDATED } from '@/lib/english-solutions';
import { absoluteUrl, buildMetadata } from '@/lib/seo/metadata';
import { getBreadcrumbJsonLd, getFaqJsonLd } from '@/lib/seo/jsonld';
import styles from './EnglishSolutionsPage.module.css';

const hubTitle = 'Heat Treatment Solutions';
const hubDescription = 'Plan a continuous heat treatment line or assess furnace temperature, controls, lining and restart requirements with Suneng’s engineering guides.';

export function englishSolutionMetadata(slug?: string) {
  const solution = slug ? getEnglishSolution(slug) : undefined;
  return buildMetadata({
    locale: 'en',
    path: `/en/solutions${slug ? `/${slug}` : ''}`,
    title: solution?.title ?? hubTitle,
    description: solution?.summary ?? hubDescription,
    image: solution?.image ?? englishSolutions[0].image,
    alternateLocales: solutionAlternates(slug),
  });
}

function Inquiry({ title, checklist }: { title: string; checklist: string[] }) {
  return (
    <section id="inquiry" className={styles.inquiry} aria-labelledby="inquiry-heading">
      <div className={styles.container}>
        <div className={styles.inquiryGrid}>
          <div>
            <p className={styles.eyebrow}>Discuss your project</p>
            <h2 id="inquiry-heading">Start with what you know</h2>
            <p>Share the available information below. Mark anything unknown so it can be clarified during the technical discussion.</p>
            <ul>{checklist.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <ProductLeadForm locale="en" title="Send Your Project Requirements" description="Share your workpiece, process, target output or existing furnace issue, and site conditions." inquiryProduct={title} anchorId="solution-requirements" />
        </div>
      </div>
    </section>
  );
}

export function EnglishSolutionsHub() {
  return (
    <div className={styles.page}>
      <JsonLd data={[
        getBreadcrumbJsonLd([{ name: 'Home', url: '/en' }, { name: 'Solutions', url: '/en/solutions' }]),
        { '@context': 'https://schema.org', '@type': 'CollectionPage', name: hubTitle, description: hubDescription, url: absoluteUrl('/en/solutions'), inLanguage: 'en-US', hasPart: englishSolutions.map((item) => ({ '@type': 'WebPage', name: item.title, url: absoluteUrl(`/en/solutions/${item.slug}`) })) },
      ]} />
      <section className={styles.hero}>
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/en">Home</Link><span aria-hidden="true">/</span><span>Solutions</span></nav>
            <p className={styles.eyebrow}>Suneng Industrial Furnace</p>
            <h1>{hubTitle}</h1>
            <p className={styles.heroText}>{hubDescription}</p>
            <a className={styles.primary} href="#guides">Find Your Engineering Guide <HiArrowRight aria-hidden="true" /></a>
          </div>
          <figure className={styles.heroMedia}>
            <Image src={englishSolutions[0].image} alt={englishSolutions[0].imageAlt} fill priority sizes="(max-width: 767px) 100vw, 50vw" />
            <figcaption>Continuous line · Equipment reference</figcaption>
          </figure>
        </div>
      </section>
      <section id="guides" className={styles.section} aria-labelledby="guides-heading">
        <div className={styles.container}>
          <p className={styles.eyebrow}>Select a starting point</p>
          <h2 id="guides-heading">What are you planning or trying to resolve?</h2>
          <div className={styles.guides}>{englishSolutions.map((item, index) => (
            <article key={item.slug} className={styles.guide}>
              <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
              <div><h3><Link href={`/en/solutions/${item.slug}`}>{item.title}</Link></h3><p>{item.summary}</p></div>
              <Link className={styles.textLink} href={`/en/solutions/${item.slug}`} aria-label={`Read guide: ${item.title}`}>Read Guide <HiArrowRight aria-hidden="true" /></Link>
            </article>
          ))}</div>
        </div>
      </section>
      <Inquiry title="heat treatment project" checklist={['Workpiece material, dimensions and treatment requirements', 'Target output or the existing equipment problem', 'Photographs, drawings and available operating records', 'Site utilities, workshop space and timing']} />
    </div>
  );
}

export function EnglishSolutionPage({ slug }: { slug: string }) {
  const solution = getEnglishSolution(slug);
  const path = `/en/solutions/${slug}`;
  return (
    <div className={styles.page}>
      <JsonLd data={[
        { '@context': 'https://schema.org', '@type': 'WebPage', name: solution.title, headline: solution.title, description: solution.summary, url: absoluteUrl(path), inLanguage: 'en-US', dateModified: ENGLISH_SOLUTIONS_UPDATED, image: absoluteUrl(solution.image) },
        getBreadcrumbJsonLd([{ name: 'Home', url: '/en' }, { name: 'Solutions', url: '/en/solutions' }, { name: solution.title, url: path }]),
        getFaqJsonLd(solution.faqs),
      ]} />
      <section className={styles.detailHero}>
        <div className={styles.container}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/en">Home</Link><span aria-hidden="true">/</span><Link href="/en/solutions">Solutions</Link></nav>
          <p className={styles.eyebrow}>Engineering guide</p>
          <h1>{solution.title}</h1>
          <p className={styles.heroText}>{solution.summary}</p>
          <a className={styles.primary} href="#inquiry">Discuss Your Requirements <HiArrowRight aria-hidden="true" /></a>
        </div>
      </section>
      <div className={`${styles.container} ${styles.article}`}>
        <section className={styles.answer} aria-labelledby="starting-heading"><h2 id="starting-heading">Where to start</h2><p>{solution.answer}</p></section>
        {solution.sections.map((section) => (
          <section className={styles.contentSection} key={section.title}>
            <h2>{section.title}</h2>
            {section.intro && <p className={styles.sectionIntro}>{section.intro}</p>}
            <div className={styles.cards}>{section.items.map((item) => <article className={styles.card} key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
          </section>
        ))}
        {solution.products.length > 0 && <section className={styles.contentSection}><h2>Explore equipment for your process</h2><p className={styles.sectionIntro}>Use these equipment pages as selection references, then confirm the configuration for your workpiece and process.</p><div className={styles.productLinks}>{solution.products.map((product) => <Link className={styles.productLink} key={product.slug} href={`/en/products/detail/${product.slug}`}>{product.title}<HiArrowRight aria-hidden="true" /></Link>)}</div></section>}
        <section className={styles.contentSection} aria-labelledby="faq-heading"><h2 id="faq-heading">Common Questions</h2><div className={styles.faqs}>{solution.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section>
        <p className={styles.source}>Based on Suneng’s existing Chinese engineering guide. Project examples retain their original design and acceptance limits. English content updated <time dateTime={ENGLISH_SOLUTIONS_UPDATED}>12 September 2026</time>.</p>
      </div>
      <Inquiry title={solution.title} checklist={solution.checklist} />
      <section className={styles.section}><div className={styles.container}><h2>Continue Planning</h2><div className={styles.productLinks}><Link className={styles.productLink} href="/en/solutions">All Engineering Guides <HiArrowRight aria-hidden="true" /></Link><Link className={styles.productLink} href="/en/products">Equipment & Production Lines <HiArrowRight aria-hidden="true" /></Link><Link className={styles.productLink} href="/en/service">Retrofit & Service Support <HiArrowRight aria-hidden="true" /></Link></div></div></section>
    </div>
  );
}
