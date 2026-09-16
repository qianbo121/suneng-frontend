import Image from 'next/image';
import { localizeCertificate } from '@/constants/certificates-en';
import type { CertificateItem } from '@/constants/certificates';
import type { Locale } from '@/types/site';
import { AboutSubpageHeader } from '@/components/about-subpages/AboutSubpageHeader';
import { OriginalImageLink } from '@/components/about-subpages/OriginalImageLink';
import { AboutSubpageJsonLd } from '@/components/about-subpages/AboutSubpageJsonLd';
import styles from '@/components/about-subpages/AboutSubpages.module.css';

type CertificateGallerySectionsProps = {
  locale: Locale;
  qualifications: CertificateItem[];
  isoCertificates: CertificateItem[];
  patents: CertificateItem[];
};
export function CertificateGallerySections({
  locale,
  qualifications,
  isoCertificates,
  patents,
}: CertificateGallerySectionsProps) {
  const english = locale === 'en';
  const title = english ? 'Qualifications & Patents' : '荣誉资质';
  const description = english
    ? 'Company registration, management system certification and patent certificates. Open each item to inspect the original document.'
    : '企业资质、管理体系与专利证书，集中查阅。';
  return (
    <div className={styles.page} data-about-subpage="honors">
      <AboutSubpageJsonLd
        title={title}
        description={description}
        path={`/${locale}/strength/honors`}
        locale={locale}
      />
      <AboutSubpageHeader title={title} description={description} locale={locale} />
      <div className={styles.container}>
        <section
          className={styles.section}
          id="company-qualifications"
          aria-labelledby="qualifications-title"
        >
          <h2 id="qualifications-title">{english ? 'Company Qualifications & Management System' : '企业资质与管理体系'}</h2>
          <div className={styles.qualifications}>
            {[...qualifications, ...isoCertificates].map((item) => localizeCertificate(item, locale)).map((item) => (
              <article
                key={item.id}
                id={item.category === 'iso' ? 'management-systems' : item.id}
                className={styles.qualification}
              >
                <OriginalImageLink
                  locale={locale}
                  src={item.image}
                  alt={item.title}
                  className={styles.qualificationImage}
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    width={400}
                    height={250}
                    priority
                    sizes="(max-width: 767px) 90vw, 380px"
                  />
                </OriginalImageLink>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
                <dl className="mt-3 space-y-1 text-[13px] leading-6 text-[#526277]">
                  {item.certificateNo ? <div className="flex flex-wrap gap-x-2"><dt>{english ? 'Certificate number' : '证书编号'}</dt><dd className="break-all">{item.certificateNo}</dd></div> : null}
                  {item.authorizedDate ? <div className="flex flex-wrap gap-x-2"><dt>{english ? 'Issued on' : '发证日期'}</dt><dd>{item.authorizedDate}</dd></div> : null}
                  {item.validUntil ? <div className="flex flex-wrap gap-x-2"><dt>{english ? 'Validity' : '有效期'}</dt><dd>{item.validUntil}</dd></div> : null}
                </dl>
                <OriginalImageLink
                  locale={locale}
                  src={item.original || item.image}
                  alt={item.title}
                  className={styles.textLink}
                >
                  {english ? 'View Original' : '查看原件'}
                </OriginalImageLink>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.section} id="patents" aria-labelledby="patents-title">
          <div className={styles.sectionTitle}>
            <h2 id="patents-title">{english ? 'Patent Certificates' : '专利证书'}</h2>
            <span>{english ? `${patents.length} patents` : `共 ${patents.length} 项`}</span>
          </div>
          <div className={styles.patents}>
            {patents.map((item) => localizeCertificate(item, locale)).map((item) => (
              <article key={item.id} className={styles.patent} data-patent-id={item.id}>
                <OriginalImageLink
                  locale={locale}
                  src={item.original || item.image}
                  alt={item.title}
                  className={styles.patentImage}
                >
                  <Image src={item.image} alt={item.alt} width={78} height={112} sizes="78px" />
                </OriginalImageLink>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                  <OriginalImageLink
                  locale={locale}
                    src={item.original || item.image}
                    alt={item.title}
                    className={styles.textLink}
                  >
                    {english ? 'View Original' : '查看原件'}
                  </OriginalImageLink>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
