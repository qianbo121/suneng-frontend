import { Skeleton } from '@/components/ui/Skeleton';

export default function LocaleHomeLoading() {
  return (
    <div className="pb-0">
      <div className="px-0">
        <Skeleton className="min-h-[calc(100vh-78px)] rounded-none lg:min-h-[calc(100vh-88px)]" />
      </div>
      <div className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-content px-4 lg:px-6">
          <Skeleton className="mx-auto h-12 w-[340px]" />
          <Skeleton className="mx-auto mt-4 h-10 w-48" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[320px]" />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#f7f7f7] py-16 lg:py-20">
        <div className="mx-auto max-w-content px-4 lg:px-6">
          <Skeleton className="mx-auto h-12 w-[320px]" />
          <div className="mt-12 space-y-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-[460px]" />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#162434] py-16 lg:py-20">
        <div className="mx-auto max-w-content px-4 lg:px-6">
          <Skeleton className="mx-auto h-10 w-40 bg-white/10" />
          <Skeleton className="mx-auto mt-4 h-12 w-full max-w-[440px] bg-white/10" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[120px] bg-white/10" />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-content px-4 lg:px-6">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.95fr_0.85fr]">
            <Skeleton className="h-[520px]" />
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[160px]" />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#18345a] py-6 lg:py-7">
        <div className="mx-auto grid max-w-content gap-10 px-4 lg:grid-cols-[0.95fr_1.05fr] lg:px-6">
          <Skeleton className="h-[68px] bg-white/10" />
          <Skeleton className="h-[48px] bg-white/10" />
        </div>
      </div>
    </div>
  );
}
