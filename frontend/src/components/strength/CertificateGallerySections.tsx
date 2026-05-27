'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import type { CertificateItem } from '@/constants/certificates';
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
        <p className="mt-4 text-[13px] font-semibold text-[#c51624]">点击查看大图</p>
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
    <section className="border-t border-[#e5e8ef] pt-9 first:border-t-0 first:pt-0">
      <div className="max-w-[900px]">
        <h2 className="text-[24px] font-semibold leading-[1.35] text-[#101828]">{title}</h2>
        <p className="mt-3 text-[15px] leading-[1.9] text-[#526071]">{description}</p>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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

  return (
    <div className="space-y-10">
      <div className="rounded-[8px] border border-[#dbe4ef] bg-[#f8fafc] px-5 py-5">
        <p className="text-[15px] leading-[1.9] text-[#344054]">
          本页集中展示苏能工业炉可公开展示的企业资质、管理体系认证与 14 项已授权专利证书。证书图片旁保留可抓取文字，便于客户核对证书名称、类型与相关编号。
        </p>
      </div>

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

      <a
        href={`/${locale}/about/suneng-profile`}
        className="inline-flex min-h-[44px] items-center justify-center rounded-[4px] bg-[#c51624] px-5 text-[15px] font-semibold text-white transition hover:bg-[#a90f1b]"
      >
        了解苏能工业炉资质、产品与服务范围
      </a>

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
