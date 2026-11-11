import englishEquipment from '@/lib/equipment-procurement-en.json';
import type { Locale } from '@/types/site';
import { HiPhone } from 'react-icons/hi2';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PhoneContactLink } from '@/components/lead/PhoneContactLink';
import { WechatContactButton } from '@/components/lead/WechatContactButton';
import { NewsArticleContent } from '@/components/news/NewsArticleContent';
import { NewsArticleToc } from '@/components/news/NewsArticleToc';
import { approvedProcurementPages, type ApprovedProcurementPageId } from '@/lib/approved-procurement-pages';
import { getBreadcrumbJsonLd, getWebPageJsonLd } from '@/lib/seo/jsonld';
import { SITE_URL } from '@/lib/seo/config';
import styles from '@/app/[locale]/news/[slug]/NewsDetailPage.module.css';
import procurementStyles from './ApprovedProcurementPage.module.css';

export function ApprovedProcurementPage({ id, locale = 'zh' }: { id: ApprovedProcurementPageId; locale?: Locale }) {
  const english = id === 'equipment' && locale === 'en';
  const equipment = english ? englishEquipment : approvedProcurementPages.equipment;
  const page = id === 'equipment' ? equipment : approvedProcurementPages.parts;
  const details = id === 'equipment' ? equipment : undefined;
  const resourceLabel = english ? 'Procurement guide' : '采购评估资料';
  const contentId = `procurement-${id}-body`;
  const pageJsonLd = [
    {
      ...getWebPageJsonLd({
        path: page.path,
        name: page.heading,
        description: page.description,
        locale,
        dateModified: details?.publishedModifiedAt,
      }),
      ...(details ? { publisher: { '@id': `${SITE_URL}/#organization` } } : {}),
    },
    getBreadcrumbJsonLd([
      { name: english ? 'Home' : '首页', url: `/${locale}` },
      { name: page.parentLabel, url: page.parentPath },
      { name: page.heading, url: page.path },
    ]),
  ];
  // Render stable heading anchors before hydration; the TOC must not depend on DOM mutation.
  let headingIndex = 0;
  const html = page.html.replace(/<h2>/g, () => `<h2 id="${contentId}-section-${++headingIndex}">`);
  const trackingContext = {
    pageType: id === 'parts' ? 'service' : 'article',
    properties: { position: 'procurement_consultation', contact_purpose: 'sales' },
  };
  return (
    <div className={styles.page} lang={locale} data-procurement-page={id}>
      <div className={styles.breadcrumb}>
        <Breadcrumb locale={locale} currentLabel={page.heading} tone="dark"
          items={[{ label: page.parentLabel, href: page.parentPath }, { label: page.heading }]} />
      </div>
      <main className={styles.main}>
        <article className={styles.article}>
          <header className={styles.articleHeader}>
            <h1 id="news-detail-title" className={styles.title}>{page.heading}</h1>
            {details ? (
              <div className={`${styles.meta} ${procurementStyles.meta}`}>
                <div data-body-updated-at={details.bodyUpdatedAt}>{resourceLabel}</div>
                <div>{english ? 'Publisher: ' : '发布单位：'}{details.publisherName}</div>
              </div>
            ) : <div className={styles.meta}>{resourceLabel}</div>}
          </header>
          <NewsArticleToc contentId={contentId} locale={locale} mobile />
          <div id={contentId} className={styles.bodyWrap}>
            <NewsArticleContent html={html} />
          </div>
          {details ? (
            <section className={procurementStyles.references} aria-labelledby={`${contentId}-references`}>
              <h2 id={`${contentId}-references`}>{english ? 'Further reading from Suneng' : '参考资料（苏能官网）'}</h2>
              <p>{english ? 'Use these resources to compare equipment designs and selection criteria. Confirm specifications, operating conditions and scope of supply for each project.' : '以下公开资料可用于核对相关设备的结构和选型条件；具体规格、适用工况与供货范围，仍按项目确认。'}</p>
              <div className={procurementStyles.referenceLinks}>
                {details.references.map((reference) => (
                  <Link key={reference.href} href={reference.href}>{reference.title}</Link>
                ))}
              </div>
            </section>
          ) : null}
        </article>
        <aside className={styles.sidebar} aria-label={english ? 'Article resources' : '文章辅助资料'}>
          <NewsArticleToc contentId={contentId} locale={locale} />
          <div className={styles.sidebarCards} data-news-sidebar-cards>
            <section className={styles.consultation} aria-labelledby="news-consultation-title">
              <h2 id="news-consultation-title">{english ? 'Need a technical proposal?' : '需要技术方案？'}</h2>
              <p>{english ? 'Discuss heat treatment equipment and process requirements for your workpiece with our team.' : '我们为不同行业、不同工件提供定制化热处理设备与工艺解决方案。'}</p>
              <WechatContactButton locale={locale} label={english ? 'Contact us on WeChat' : '微信联系'} className={styles.consultButton}
                trackingContext={trackingContext} />
              <PhoneContactLink className={styles.phone} trackingContext={trackingContext}>
                <HiPhone aria-hidden="true" />{english ? '+86 130 5298 6814' : '130-5298-6814'}
              </PhoneContactLink>
              <p className={styles.hours}>{english ? 'Weekdays, 8:30–17:30 (China time)' : '工作日 8:30–17:30'}</p>
            </section>
          </div>
        </aside>
      </main>
      <JsonLd id={`procurement-${id}-page-jsonld`} data={pageJsonLd} />
    </div>
  );
}
