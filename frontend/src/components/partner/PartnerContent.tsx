import { partnerText } from '@/lib/partner-copy';
import { ENGLISH_PROVINCES } from '@/lib/partner-provinces-en';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { AboutSubpageJsonLd } from '@/components/about-subpages/AboutSubpageJsonLd';
import PartnerMap, { type Province } from '@/components/partner/map-kit/PartnerMap';
import provinces from '@/components/partner/map-kit/provinces.json';
import { getPartnerMapData } from '@/lib/partner-map-data';
import { PartnerIndustryDirectory } from '@/components/partner/PartnerIndustryDirectory';
import styles from '@/components/partner/PartnerPage.module.css';

import type { Locale } from '@/types/site';

const description = '展示苏能工业炉部分历年客户与合作单位，按省份和行业查看名单，了解工业炉设备配套与合作范围。';

export function PartnerContent({ locale, embedded = false }: { locale: Locale; embedded?: boolean }) {
  const t = (text: string) => partnerText(text, locale);
  const partners = getPartnerMapData();
  const Heading = embedded ? 'h2' : 'h1';
  return (
    <div className={styles.page} data-about-subpage="partners">
      {!embedded && <AboutSubpageJsonLd
        title={t("客户与合作单位")}
        description={locale === 'en' ? 'Selected Suneng customers and partners by region and industry.' : description}
        path={`/${locale}/partner`}
        locale={locale}
        type="CollectionPage"
      />}
      <div className={styles.container}>
        {!embedded && <Breadcrumb
          locale={locale}
          tone="dark"
          currentLabel={t("客户与合作单位")}
          items={[{ label: t('关于苏能'), href: `/${locale}/about` }, { label: t('客户与合作单位') }]}
          className={styles.breadcrumb}
        />}
        <header className={styles.hero}>
          <div>
            <Heading>{t("客户与合作单位")}</Heading>
            <p>{t("累计 1000+ 工业炉项目案例。")}</p>
          </div>
        </header>
        <div className={styles.map}>
          <PartnerMap
            headingLevel={2}
            title={t("近年合作分布")}
            locale={locale}
            assetBasePath="/partner-map"
            partners={partners}
            provinces={provinces.map(
              (province): Province => ({
                ...province,
                ...(locale === 'en' ? ENGLISH_PROVINCES[province.code] : {}),
                anchor: [province.anchor[0], province.anchor[1]],
                label: [province.label[0], province.label[1]],
              }),
            )}
          />
        </div>
        <PartnerIndustryDirectory partners={partners} locale={locale} />
      </div>
    </div>
  );
}
