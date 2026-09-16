import { HiArrowRight } from 'react-icons/hi2';
import type { ProductionLineContent } from '@/lib/production-line-types';
import styles from './FastenerLineDetailPage.module.css';

export function ProductionLineHeroDiagram({ content }: { content: ProductionLineContent }) {
  return (
    <figure className={`${styles.gallery} ${styles.heroDiagram}`}>
      <span>工艺关系示意</span>
      <h2>{content.sections.process.title}</h2>
      <ol>
        {(content.sections.process.routes?.[0]?.steps ?? []).map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <figcaption>设备组合与现场布置按材料、工艺及节拍确定。</figcaption>
    </figure>
  );
}

export function ProductionLineFlow({ content }: { content: ProductionLineContent }) {
  const process = content.sections.process;
  return (
    <div className={styles.routeStack}>
      {process.mode === 'cell' && (
        <figure className={styles.cellDiagram} aria-label="炉组与共享资源关系示意">
          <div>
            加热炉组<span>各炉出料时间窗</span>
          </div>
          <HiArrowRight aria-hidden="true" />
          <div>
            共享操作机<span>取放、转移与调度</span>
          </div>
          <HiArrowRight aria-hidden="true" />
          <div>
            淬火资源与后续工位<span>占用、释放与交接</span>
          </div>
          <figcaption>共享资源关系示意，不代表设备数量、空间位置或施工布置。</figcaption>
        </figure>
      )}
      {process.routes?.map((route) => (
        <article key={route.title} className={styles.processRoute}>
          <h3>{route.title}</h3>
          <ol className={styles.routeSteps}>
            {route.steps.map((step, index) => (
              <li key={`${index}-${step}`}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          <p className={styles.note}>{route.note}</p>
        </article>
      ))}
    </div>
  );
}
