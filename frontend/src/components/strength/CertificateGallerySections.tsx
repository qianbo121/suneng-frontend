'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { HiArrowRight } from 'react-icons/hi2';

import type { CertificateItem } from '@/constants/certificates';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import type { Locale } from '@/types/site';

const ImageLightbox = dynamic(
  () => import('@/components/ui/ImageLightbox').then((module) => ({ default: module.ImageLightbox })),
  { ssr: false },
);

type CertificateGallerySectionsProps = {
  locale: Locale;
  qualifications: CertificateItem[];
  isoCertificates: CertificateItem[];
  patents: CertificateItem[];
};

function getCategoryLabel(item: CertificateItem) {
  if (item.category === 'patent') return '实用新型专利';
  if (item.category === 'iso') return '管理体系认证';
  return '企业资质';
}

function CertificateCard({
  item,
  onPreview,
}: {
  item: CertificateItem;
  onPreview: (item: CertificateItem) => void;
}) {
  const metadata = [
    ['类型', getCategoryLabel(item)],
    item.certificateNo ? ['编号', item.certificateNo] : null,
    item.patentNo ? ['专利号', item.patentNo] : null,
    item.announcementNo ? ['公告号', item.announcementNo] : null,
    item.authorizedDate ? ['日期', item.authorizedDate] : null,
    item.validUntil ? ['有效期', item.validUntil] : null,
    item.relatedProduct ? ['关联方向', item.relatedProduct] : null,
  ].filter(Boolean) as string[][];

  return (
    <article className="overflow-hidden rounded-[8px] border border-[#e1e7f0] bg-white shadow-[0_10px_24px_rgba(15,35,75,0.04)]">
      <button
        type="button"
        className="group block w-full bg-[#f6f8fb] text-left"
        onClick={() => onPreview(item)}
        aria-label={`查看${item.title}大图`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={item.image}
            alt={item.alt}
            fill
            className="object-contain p-3 transition duration-500 group-hover:scale-[1.03]"
            sizes="(min-width: 1280px) 360px, (min-width: 768px) 50vw, 100vw"
          />
        </div>
      </button>
      <div className="px-5 py-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#c51624]">
          {getCategoryLabel(item)}
        </p>
        <h3 className="mt-3 text-[18px] font-semibold leading-[1.45] text-[#101828]">{item.title}</h3>
        {item.subtitle ? (
          <p className="mt-2 text-[14px] leading-[1.7] text-[#526071]">{item.subtitle}</p>
        ) : null}
        <dl className="mt-4 grid gap-2 text-[13px] leading-[1.65]">
          {metadata.map(([label, value]) => (
            <div key={`${item.id}-${label}`} className="grid grid-cols-[72px_1fr] gap-2">
              <dt className="font-semibold text-[#667085]">{label}</dt>
              <dd className="break-words text-[#253047]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

function CertificateSection({
  title,
  description,
  items,
  onPreview,
}: {
  title: string;
  description: string;
  items: CertificateItem[];
  onPreview: (item: CertificateItem) => void;
}) {
  return (
    <section className="border-t border-[#e5e8ef] py-12 first:border-t-0 lg:py-16">
      <div className="max-w-[900px]">
        <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#c51624]">Certificate Evidence</p>
        <h2 className="mt-3 text-[26px] font-semibold leading-[1.28] text-[#101828] lg:text-[38px]">{title}</h2>
        <p className="mt-4 text-[16px] leading-[1.9] text-[#526071] lg:text-[17px]">{description}</p>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <CertificateCard key={item.id} item={item} onPreview={onPreview} />
        ))}
      </div>
    </section>
  );
}

export function CertificateGallerySections({
  locale,
  qualifications,
  isoCertificates,
  patents,
}: CertificateGallerySectionsProps) {
  const allItems = useMemo(
    () => [...qualifications, ...isoCertificates, ...patents],
    [isoCertificates, patents, qualifications],
  );
  const [selectedItem, setSelectedItem] = useState<CertificateItem | null>(null);
  const selectedIndex = selectedItem ? allItems.findIndex((item) => item.id === selectedItem.id) : 0;
  const stats = [
    ['国家高新技术企业', '2024 年认定'],
    ['ISO 三体系认证', `${isoCertificates.length} 张体系证书`],
    [`${patents.length} 项已授权专利`, `${patents.length} 张专利证书`],
    [`${allItems.length} 张证书资料`, '公开展示图片'],
  ];

  return (
    <div className="bg-white text-[#101828]">
      <section className="relative overflow-hidden bg-[#101828] text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/about/about_img_hero_factory_01.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-[0.34]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,18,36,0.95)_0%,rgba(12,38,74,0.86)_58%,rgba(12,38,74,0.58)_100%)]" />
        </div>

        <div className="relative mx-auto max-w-[1180px] px-5 py-14 lg:px-8 lg:py-20">
          <Breadcrumb
            locale={locale}
            currentLabel="荣誉资质"
            tone="light"
            className="text-[13px]"
            items={[
              { label: '关于苏能', href: `/${locale}/about` },
              { label: '荣誉资质' },
            ]}
          />

          <div className="mt-10 max-w-[940px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-white/64">Honors & Certificates</p>
            <h1 className="mt-4 text-[36px] font-semibold leading-[1.16] tracking-[0.01em] lg:text-[58px]">
              荣誉资质
            </h1>
            <p className="mt-5 text-[18px] font-semibold leading-[1.7] text-white/92 lg:text-[24px]">
              企业资质、体系认证与 14 项已授权专利证书
            </p>
            <p className="mt-7 max-w-[860px] text-[16px] leading-[1.95] text-white/78 lg:text-[18px]">
              苏能工业炉通过国家高新技术企业认定，建立 ISO 9001 / ISO 14001 / ISO 45001 管理体系，并持有 14 项已授权专利。以下证书用于展示企业资质、管理体系和技术成果。
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f7fafc] py-10">
        <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-[8px] border border-[#e1e7f0] bg-white p-5">
                <p className="text-[13px] font-semibold text-[#667085]">{label}</p>
                <p className="mt-2 text-[20px] font-semibold leading-[1.35] text-[#101828]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1180px] px-5 lg:px-8">
        <CertificateSection
          title="企业资质"
          description="包括营业执照、国家高新技术企业证书、安全生产标准化、信用公示及相关企业资质材料。"
          items={qualifications}
          onPreview={setSelectedItem}
        />

        <CertificateSection
          title="管理体系认证"
          description="包括 ISO 9001 质量管理体系、ISO 14001 环境管理体系与 ISO 45001 职业健康安全管理体系认证。"
          items={isoCertificates}
          onPreview={setSelectedItem}
        />

        <CertificateSection
          title="专利证书"
          description="展示 14 项已授权专利证书，覆盖电阻炉、燃气热处理炉、网带式淬火炉、固溶热处理生产线、锻造炉等方向。"
          items={patents}
          onPreview={setSelectedItem}
        />

        <section className="border-t border-[#e5e8ef] py-12 lg:py-16">
          <div className="rounded-[8px] border border-[#dbe4ef] bg-[#f8fafc] p-6 lg:p-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.26em] text-[#c51624]">Related Pages</p>
            <h2 className="mt-3 text-[24px] font-semibold leading-[1.35] text-[#101828] lg:text-[32px]">
              相关页面
            </h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <Link
                href={`/${locale}/about`}
                className="inline-flex min-h-[46px] items-center justify-between rounded-[4px] bg-[#c51624] px-5 text-[15px] font-semibold text-white transition hover:bg-[#a90f1b]"
              >
                <span>了解苏能工业炉资质、产品与服务范围</span>
                <HiArrowRight className="ml-3 h-5 w-5 shrink-0" />
              </Link>
              <Link
                href={`/${locale}/service/furnace-renovation-overhaul`}
                className="inline-flex min-h-[46px] items-center justify-between rounded-[4px] border border-[#c51624] bg-white px-5 text-[15px] font-semibold text-[#c51624] transition hover:bg-[#c51624] hover:text-white"
              >
                <span>工业炉节能改造与大修服务</span>
                <HiArrowRight className="ml-3 h-5 w-5 shrink-0" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <ImageLightbox
        images={allItems.map((item) => item.image)}
        imageAlts={allItems.map((item) => item.alt)}
        isOpen={Boolean(selectedItem)}
        initialIndex={selectedIndex >= 0 ? selectedIndex : 0}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
