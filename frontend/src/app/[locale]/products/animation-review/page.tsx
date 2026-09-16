import { notFound } from 'next/navigation';
import { ProductCenterLineCarousel } from '@/components/products/ProductCenterLineCarousel';
import { productCenterProductionLines } from '@/lib/products-landing-data';
import styles from '@/components/products/ChineseProductsLanding.module.css';

export const metadata = { title: '生产线动画审核预览', robots: { index: false, follow: false } };

export default function ProductionLineAnimationReview() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return (
    <main className={`home-page-scope ${styles.page}`}>
      <section className={styles.section}>
        <div className={styles.container}>
          <h1 className="mb-3 text-2xl font-semibold">生产线动画审核预览</h1>
          <p className="mb-8 text-sm text-slate-600">
            用于逐条核验工艺与设备动作。此页仅在本地开发中开放，未通过审核的新增动画不会进入正式产品列表。
          </p>
          <ProductCenterLineCarousel items={productCenterProductionLines} previewAll />
        </div>
      </section>
    </main>
  );
}
