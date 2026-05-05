import Image from 'next/image';
import { HiEnvelope, HiMapPin, HiPhone, HiQrCode } from 'react-icons/hi2';
import { RiPrinterLine } from 'react-icons/ri';

import { ContactInfoContent } from '@/types/contact';
import { Locale } from '@/types/site';

type ContactInfoGridProps = {
  locale: Locale;
  info: ContactInfoContent;
};

const ICON_CLASS = 'text-[22px] text-brand-primary';

export function ContactInfoGrid({ locale, info }: ContactInfoGridProps) {
  const cards = [
    {
      key: 'address',
      icon: <HiMapPin className={ICON_CLASS} />,
      title: locale === 'en' ? 'Address' : '公司地址',
      value: info.address,
    },
    {
      key: 'phone',
      icon: <HiPhone className={ICON_CLASS} />,
      title: locale === 'en' ? 'Phone' : '联系电话',
      value: info.phone,
    },
    {
      key: 'email',
      icon: <HiEnvelope className={ICON_CLASS} />,
      title: locale === 'en' ? 'Email' : '联系邮箱',
      value: info.email,
    },
    {
      key: 'fax',
      icon: <RiPrinterLine className={ICON_CLASS} />,
      title: locale === 'en' ? 'Fax' : '传真号码',
      value: info.fax,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.key} className="border border-[#e5eaf1] bg-white px-6 py-6 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(0,75,151,0.08)]">
              {card.icon}
            </div>
            <p className="mt-5 text-[12px] uppercase tracking-[0.24em] text-neutral-400">{card.title}</p>
            <p className="mt-3 text-[17px] leading-8 text-neutral-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="border border-[#e5eaf1] bg-white px-6 py-6 shadow-soft">
          <p className="text-[12px] uppercase tracking-[0.28em] text-brand-accent">
            {locale === 'en' ? 'Location' : '公司位置'}
          </p>
          <h2 className="mt-3 text-[28px] font-semibold text-[#1d1f23]">
            {locale === 'en' ? 'Factory & Office Location' : '工厂与办公位置'}
          </h2>
          <div className="relative mt-6 aspect-[16/8] overflow-hidden bg-[#eef2f6]">
            <Image src={info.mapImage} alt={locale === 'en' ? 'Company map' : '公司地图'} fill className="object-cover" />
          </div>
        </div>

        <div className="border border-[#e5eaf1] bg-[#18345a] px-6 py-6 text-white shadow-soft">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/12">
            <HiQrCode className="text-[22px] text-white" />
          </div>
          <p className="mt-5 text-[12px] uppercase tracking-[0.24em] text-white/56">
            {locale === 'en' ? 'QR Code' : '官方二维码'}
          </p>
          <div className="relative mt-5 aspect-square overflow-hidden bg-white p-4">
            <Image src={info.qrCodeImage} alt={locale === 'en' ? 'QR code' : '二维码'} fill className="object-cover p-4" />
          </div>
          <p className="mt-5 text-sm leading-7 text-white/74">
            {locale === 'en'
              ? 'Scan the code to add WeChat or keep in touch with our business team.'
              : '扫描二维码添加企业微信或与业务团队保持联系。'}
          </p>
        </div>
      </div>
    </section>
  );
}

