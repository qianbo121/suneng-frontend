import { HiPhone } from 'react-icons/hi2';
import { JsonLd } from '@/components/JsonLd';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { PhoneContactLink } from '@/components/lead/PhoneContactLink';
import { WechatContactButton } from '@/components/lead/WechatContactButton';
import { NewsArticleContent } from '@/components/news/NewsArticleContent';
import { NewsArticleToc } from '@/components/news/NewsArticleToc';
import { approvedProcurementPages, type ApprovedProcurementPageId } from '@/lib/approved-procurement-pages';
import { getBreadcrumbJsonLd, getWebPageJsonLd } from '@/lib/seo/jsonld';
import styles from '@/app/[locale]/news/[slug]/NewsDetailPage.module.css';

export function ApprovedProcurementPage({ id }: { id: ApprovedProcurementPageId }) {
  const page = approvedProcurementPages[id];
  const contentId = `procurement-${id}-body`;
  const pageJsonLd = [
    getWebPageJsonLd({
      path: page.path,
      name: page.heading,
      description: page.description,
      locale: 'zh',
    }),
    getBreadcrumbJsonLd([
      { name: '首页', url: '/zh' },
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
    <div className={styles.page} lang="zh" data-procurement-page={id}>
      <div className={styles.breadcrumb}>
        <Breadcrumb locale="zh" currentLabel={page.heading} tone="dark"
          items={[{ label: page.parentLabel, href: page.parentPath }, { label: page.heading }]} />
      </div>
      <main className={styles.main}>
        <article className={styles.article}>
          <header className={styles.articleHeader}>
            <h1 id="news-detail-title" className={styles.title}>{page.heading}</h1>
            <div className={styles.meta}>采购评估资料</div>
          </header>
          <NewsArticleToc contentId={contentId} locale="zh" mobile />
          <div id={contentId} className={styles.bodyWrap}>
            <NewsArticleContent html={html} />
          </div>
        </article>
        <aside className={styles.sidebar} aria-label="文章辅助资料">
          <NewsArticleToc contentId={contentId} locale="zh" />
          <div className={styles.sidebarCards} data-news-sidebar-cards>
            <section className={styles.consultation} aria-labelledby="news-consultation-title">
              <h2 id="news-consultation-title">需要技术方案？</h2>
              <p>我们为不同行业、不同工件提供定制化热处理设备与工艺解决方案。</p>
              <WechatContactButton locale="zh" label="微信联系" className={styles.consultButton}
                trackingContext={trackingContext} />
              <PhoneContactLink className={styles.phone} trackingContext={trackingContext}>
                <HiPhone aria-hidden="true" />130-5298-6814
              </PhoneContactLink>
              <p className={styles.hours}>工作日 8:30–17:30</p>
            </section>
          </div>
        </aside>
      </main>
      <JsonLd id={`procurement-${id}-page-jsonld`} data={pageJsonLd} />
    </div>
  );
}
