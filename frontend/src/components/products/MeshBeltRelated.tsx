import Image from 'next/image';
import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi2';
import type { FurnacePageConfig } from './industry-furnace-data/types';
import shared from './PitFurnaceDetailPage.module.css';
import s from './MeshBeltRelated.module.css';

type Resource = readonly [string, string];

function ResourceList({ links, start = 1 }: { links: Resource[]; start?: number }) {
  return (
    <ol className={s.resources} start={start}>
      {links.map(([title, href], i) => (
        <li key={href}><Link href={href}>
          <span aria-hidden="true">{String(i + start).padStart(2, '0')}</span>
          <strong>{title}</strong><HiArrowRight aria-hidden="true" />
        </Link></li>
      ))}
    </ol>
  );
}

export function MeshBeltRelated({ equipment, resources }: {
  equipment: FurnacePageConfig['related']; resources: Resource[];
}) {
  return (
    <section id="related" className={shared.section} aria-labelledby="mesh-related-title">
      <header className={shared.sectionHeader}>
        <h2 id="mesh-related-title">{resources.length ? '相关设备与选型资料' : '相关设备'}</h2>
        <p>先比较装料或输送方向，再带着完整工况进入技术沟通。</p>
      </header>
      <div className={s.group}>
        <h3>相关设备</h3>
        <ul className={s.cards}>{equipment.map(item => (
          <li key={item.href}><Link href={item.href} className={s.card}>
            <span className={s.photo}><Image src={item.image} alt="" fill sizes="(max-width: 740px) 88px, 126px" /></span>
            <span className={s.copy}><strong>{item.title}</strong><span>{item.text}</span></span>
            <HiArrowRight aria-hidden="true" />
          </Link></li>
        ))}</ul>
      </div>
      {resources.length > 0 && <div className={s.group}>
        <h3>选型资料</h3>
        <ResourceList links={resources.slice(0, 8)} />
        {resources.length > 8 && <details className={s.more}>
          <summary>更多选型资料（{resources.length - 8}篇）</summary>
          <ResourceList links={resources.slice(8)} start={9} />
        </details>}
      </div>}
    </section>
  );
}
