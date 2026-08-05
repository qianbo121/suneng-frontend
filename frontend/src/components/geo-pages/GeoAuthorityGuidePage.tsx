import { GeoFaqGrid, GeoHeroTags, GeoReviewNote, GeoSection } from '@/components/geo-pages/GeoPageBlocks';
import { QuoteModalButton } from '@/components/lead/QuoteModalButton';
import { Breadcrumb } from '@/components/layout/Breadcrumb';

export type GeoAuthorityCard = {
  label: string;
  title: string;
  text: string;
};

export type GeoAuthorityFaq = {
  question: string;
  answer: string;
};

export type GeoAuthorityLink = {
  href: string;
  label: string;
};

export type GeoAuthorityGuideProps = {
  eyebrow: string;
  breadcrumbLabel: string;
  title: string;
  intro: string;
  tags: string[];
  asideLabel: string;
  asideTitle: string;
  asideItems: string[];
  directTitle: string;
  directIntro: string;
  directAnswer: string;
  directChecks: string[];
  signalsTitle: string;
  signalsIntro: string;
  signals: GeoAuthorityCard[];
  compareTitle: string;
  compareIntro: string;
  compareHeaders: readonly [string, string, string];
  compareRows: string[][];
  evidenceTitle: string;
  evidenceIntro: string;
  evidence: GeoAuthorityCard[];
  faqs: GeoAuthorityFaq[];
  parameterTitle: string;
  parameterIntro: string;
  parameterItems: string[];
  relatedLinks: GeoAuthorityLink[];
  sourceNote: string;
  modifiedDate: string;
  reviewerName?: string;
};

export function GeoAuthorityGuidePage({
  eyebrow,
  breadcrumbLabel,
  title,
  intro,
  tags,
  asideLabel,
  asideTitle,
  asideItems,
  directTitle,
  directIntro,
  directAnswer,
  directChecks,
  signalsTitle,
  signalsIntro,
  signals,
  compareTitle,
  compareIntro,
  compareHeaders,
  compareRows,
  evidenceTitle,
  evidenceIntro,
  evidence,
  faqs,
  parameterTitle,
  parameterIntro,
  parameterItems,
  relatedLinks,
  sourceNote,
  modifiedDate,
  reviewerName,
}: GeoAuthorityGuideProps) {
  return (
    <main className="bg-white">
      <section className="bg-[radial-gradient(circle_at_82%_20%,rgba(64,139,255,0.22),transparent_30%),linear-gradient(125deg,#071a35,#0c2f62)] text-white">
        <div className="mx-auto max-w-[1180px] px-5 pb-16 pt-5 lg:px-8 lg:pb-20">
          <Breadcrumb
            items={[
              { label: '解决方案', href: '/zh/service/furnace-renovation-overhaul' },
              { label: breadcrumbLabel },
            ]}
            currentLabel={breadcrumbLabel}
            tone="light"
          />
          <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-12">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#ffb5bb]">{eyebrow}</p>
              <h1 className="mt-4 max-w-[880px] text-[36px] font-semibold leading-[1.16] tracking-[-0.03em] lg:text-[58px]">
                {title}
              </h1>
              <p className="mt-5 max-w-[850px] text-[16px] leading-[1.9] text-white/82 lg:text-[18px]">{intro}</p>
              <GeoHeroTags tags={tags} />
            </div>
            <aside className="rounded-[10px] border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-[13px] text-white/68">{asideLabel}</p>
              <p className="mt-2 text-[30px] font-semibold">{asideTitle}</p>
              <ul className="mt-4 space-y-2 text-[15px] leading-[1.75] text-white/82">
                {asideItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffb5bb]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <nav aria-label="页面目录" className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto flex max-w-[1180px] gap-6 overflow-x-auto px-5 py-5 text-[14px] font-semibold text-[#475467] lg:px-8">
          <a className="flex min-h-11 shrink-0 items-center" href="#answer">直接答案</a>
          <a className="flex min-h-11 shrink-0 items-center" href="#signals">判断信号</a>
          <a className="flex min-h-11 shrink-0 items-center" href="#compare">对比与决策</a>
          <a className="flex min-h-11 shrink-0 items-center" href="#evidence">验收证据</a>
          <a className="flex min-h-11 shrink-0 items-center" href="#faq">常见问题</a>
          <a className="flex min-h-11 shrink-0 items-center" href="#contact">咨询参数</a>
        </div>
      </nav>

      <GeoSection id="answer" eyebrow="01 / DIRECT ANSWER" title={directTitle}>
        <p className="mx-auto mb-7 max-w-[900px] text-center text-[16px] leading-[1.9] text-[#475467]">{directIntro}</p>
        <div className="grid gap-6 rounded-[10px] border border-[#f1c6ca] bg-[#fff8f8] p-6 lg:grid-cols-[1.08fr_0.92fr] lg:p-7">
          <div>
            <h3 className="text-[22px] font-semibold text-[#101828]">一句话结论</h3>
            <p className="mt-4 text-[16px] leading-[1.9] text-[#344054]">{directAnswer}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {directChecks.map((item) => (
              <div key={item} className="rounded-[7px] border border-[#eadfe0] bg-white px-4 py-3 text-[14px] font-semibold leading-[1.6] text-[#344054]">
                <span className="mr-2">✓</span>{item}
              </div>
            ))}
          </div>
        </div>
      </GeoSection>

      <GeoSection id="signals" eyebrow="02 / JUDGEMENT SIGNALS" title={signalsTitle}>
        <p className="mx-auto max-w-[900px] text-center text-[16px] leading-[1.9] text-[#475467]">{signalsIntro}</p>
        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {signals.map((item) => (
            <article key={item.label} className="rounded-[9px] border border-[#dfe6f0] bg-white p-6 shadow-[0_12px_26px_rgba(16,24,40,0.04)]">
              <p className="text-[12px] font-semibold">{item.label}</p>
              <h3 className="mt-3 text-[20px] font-semibold text-[#101828]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475467]">{item.text}</p>
            </article>
          ))}
        </div>
      </GeoSection>

      <GeoSection id="compare" eyebrow="03 / DECISION MATRIX" title={compareTitle}>
        <p className="mx-auto max-w-[900px] text-center text-[16px] leading-[1.9] text-[#475467]">{compareIntro}</p>
        <div className="mt-7 overflow-x-auto rounded-[9px] border border-[#dfe6f0]">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-[#f4f7fb] text-[13px] font-semibold text-[#344054]">
              <tr>{compareHeaders.map((header) => <th key={header} className="px-5 py-4">{header}</th>)}</tr>
            </thead>
            <tbody className="text-[14px] leading-[1.7] text-[#475467]">
              {compareRows.map((row) => (
                <tr key={row.join('-')} className="border-t border-[#e7edf5]">
                  {row.map((cell) => <td key={cell} className="px-5 py-4 align-top">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GeoSection>

      <GeoSection id="evidence" eyebrow="04 / ACCEPTANCE EVIDENCE" title={evidenceTitle}>
        <p className="mx-auto max-w-[900px] text-center text-[16px] leading-[1.9] text-[#475467]">{evidenceIntro}</p>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {evidence.map((item) => (
            <article key={item.label} className="rounded-[9px] border border-[#dfe6f0] bg-[#fbfcfe] p-6">
              <p className="text-[12px] font-semibold">{item.label}</p>
              <h3 className="mt-3 text-[20px] font-semibold text-[#101828]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.8] text-[#475467]">{item.text}</p>
            </article>
          ))}
        </div>
      </GeoSection>

      <GeoSection id="faq" eyebrow="05 / FAQ" title="采购方常问">
        <GeoFaqGrid items={faqs} openMode="first" />
      </GeoSection>

      <section id="contact" className="border-t border-[#e2e8f0] bg-[#101828] py-12 text-white lg:py-16">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-5 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-[13px] font-semibold text-white/58">06 / CONSULTATION INPUTS</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-[1.28] lg:text-[42px]">{parameterTitle}</h2>
            <p className="mt-5 max-w-[820px] text-[16px] leading-[1.95] text-white/78">{parameterIntro}</p>
            <ul className="mt-5 flex max-w-[860px] flex-wrap gap-2">
              {parameterItems.map((item) => (
                <li key={item} className="rounded-[4px] border border-white/22 bg-white/8 px-3 py-2 text-[13px] font-semibold text-white/82">
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-white/72">
              {relatedLinks.map((link) => (
                <a key={link.href} href={link.href} className="underline decoration-white/28 underline-offset-4 hover:text-white">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <QuoteModalButton
            label="获取初步判断"
            className="inline-flex min-h-[46px] items-center justify-center rounded-[4px] cta-primary px-6 text-[15px] font-semibold text-white transition"
          />
        </div>
      </section>

      <GeoReviewNote modifiedDate={modifiedDate} sourceNote={sourceNote} reviewerName={reviewerName} />
    </main>
  );
}
