import Link from 'next/link';
import { HiArrowUpRight } from 'react-icons/hi2';
import styles from './HomePurchaseGuides.module.css';

export const HOME_PURCHASE_GUIDES = [
  { label: '报价准备', title: '报价需要哪些参数？', description: '整理工件、装炉量、温度和能源条件，减少询价时的往返确认。', href: '/zh/articles/gongye-lu-baojia-canshu' },
  { label: '维修决策', title: '旧炉该修，还是换新？', description: '结合设备状态、停产窗口和长期使用成本，判断维修与换新的边界。', href: '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin' },
  { label: '厂家选择', title: '怎样核对厂家能力？', description: '从设计制造、质量管理到安装调试，核对项目需要的能力与资料。', href: '/zh/solutions/rechuli-lu-changjia' },
  { label: '整线规划', title: '热处理生产线怎么规划？', description: '从工艺链、产能节拍、输送冷却和控制要求出发，梳理整线方案。', href: '/zh/solutions/continuous-heat-treatment-line' },
] as const;

export function HomePurchaseGuides() {
  return (
    <section className={styles.section} aria-labelledby="home-purchase-guides-title">
      <div className={styles.container}>
        <h2 id="home-purchase-guides-title">选型与采购，先看这些</h2>
        <p className={styles.intro}>准备询价、评估旧炉或规划新线，从您关心的问题开始。</p>
        <div className={styles.grid}>
          {HOME_PURCHASE_GUIDES.map((item) => (
            <Link key={item.href} href={item.href} className={styles.card}>
              <span className={styles.label}>{item.label}<HiArrowUpRight aria-hidden="true" /></span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
