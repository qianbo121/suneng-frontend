import { Locale } from '@/types/site';

type HomeDataNoticeProps = {
  locale: Locale;
  sections: string[];
};

export function HomeDataNotice({ locale, sections }: HomeDataNoticeProps) {
  if (!sections.length) {
    return null;
  }

  return (
    <div className="mx-auto max-w-content px-4 lg:px-6">
      <div className="-mt-8 rounded-[22px] border border-[rgba(230,0,18,0.14)] bg-white/92 px-5 py-4 text-sm text-neutral-700 shadow-soft backdrop-blur lg:-mt-10">
        {locale === 'en'
          ? 'Some homepage sections are currently using fallback content because the live API request failed.'
          : '首页部分区块当前因接口请求失败，已自动降级显示占位内容。'}
      </div>
    </div>
  );
}
