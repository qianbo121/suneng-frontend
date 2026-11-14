import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { FASTENER_CASE_PATH, fastenerCaseVisible } from '@/lib/cases/fastener-case-entry';
import data from './mesh-belt-agreement-data.json';
import styles from './MeshBeltAgreement.module.css';

const model = 'RCWT-160/105-9/6';
const overviewUrl = '/zh/products/detail/mesh-belt-furnace';
const fastenerUrl = '/zh/products/detail/fastener-quench-temper-line';

export function BeltAgreementTable({ fasteners = false }: { fasteners?: boolean }) {
  const showCase = fastenerCaseVisible();
  const rows = fasteners ? data.rows.filter(row => row.fastenerScope) : data.rows;
  return (
    <section className={styles.section} id="agreement-capacity">
      <h2>{fasteners ? '紧固件调质配置与处理量' : '网带炉技术协议的配置及处理量'}</h2>
      <p>{fasteners
        ? '选调质线时，请先核对处理量对应哪道工序。淬火炉的数据只覆盖淬火段，整线数据包含后续回火。'
        : '下表列出各配置的工艺和处理量。以件/年计的产量按协议原单位列示。'}</p>
      <div className={styles.scroll} role="region" aria-label="协议配置参数表" tabIndex={0}>
        <table>
          <caption>{fasteners ? '网带炉配置与对应工艺的协议参数' : '技术协议中的配置与处理量'}</caption>
          <thead><tr>{data.headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead>
          <tbody>{rows.map(row => {
            const name = row.model ?? row.selectionCode;
            return (
              <tr key={name} id={row.anchor} className={styles.configRow}>
                <th scope="row">
                  {!fasteners && name === model && showCase ? (
                    <Link className={`${styles.modelName} ${styles.modelCaseLink}`} href={FASTENER_CASE_PATH}
                      aria-label={`查看 ${name} 紧固件项目案例`} prefetch={false}>
                      {name}<span aria-hidden="true" className={styles.caseChevron}>›</span>
                    </Link>
                  ) : <span className={styles.modelName}>{name}</span>}
                  {row.selectionCode && <small className={styles.codeLabel}>选型代号</small>}
                </th>
                <td>{row.size}</td><td>{row.power}</td>
                <td>{(fasteners && row.fastenerProcess) || row.process}</td>
                <td>{fasteners ? <><span className={styles.capacityScope}>{row.fastenerScope}</span>{' '}<strong>{row.fastenerCapacity ?? row.capacity}</strong></> : row.capacity}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
      <p className={styles.note}>{data.note}</p>
      {fasteners && showCase && <Link href={FASTENER_CASE_PATH} prefetch={false} className={styles.projectEntry}>
        <span>紧固件网带炉项目：同一台炉淬火、渗碳各约定多少产量？</span><FiArrowRight aria-hidden="true" />
      </Link>}
      <p className={styles.note}>RCWT 三款型号列的是有效宽度，其余配置列的是网带宽度。</p>
      <p className={styles.note}>选型代号按工艺、网带宽度和加热段长度编写，供询价时指明配置。正式型号以技术协议为准。</p>
      {!fasteners && <p className={styles.note}>油淬回火线和硝盐等温淬火线是两条独立生产线。曲轴线按年件数列示，该指标对应的设备台数尚未核定。</p>}
      {fasteners && <p>{model} 的协议列明，同一台炉子做渗碳150 kg/h，见<Link href="/zh/products/detail/mesh-belt-carbonitriding-line#surface-carburising">网带式渗碳淬火生产线</Link>。</p>}
      {fasteners && <p>需要硝盐等温淬火时，可查看<Link href={`${overviewUrl}#salt-austemper-config`}>等温淬火线的独立配置</Link>。</p>}
    </section>
  );
}

export function BeltFeatureOverview({ className }: { className: string }) {
  return (
    <section className={`${styles.section} ${className}`} id="equipment-features">
      <h2>设备特点</h2>
      <p>以 {model} 的协议配置为例。其他配置的加热方式和气氛按项目确定。</p>
      <dl>
        <div><dt>网带输送</dt><dd>炉底托辊同步托送网带，带速通过变频调节。</dd></div>
        <div><dt>分区控温</dt><dd>淬火炉采用辐射管加热，分 3 区控温，每区配电流表。</dd></div>
        <div><dt>炉内气氛</dt><dd>甲醇汽化后入炉，另设丙烷供给。氧探头配合碳控仪自动控制碳势。</dd></div>
      </dl>
      <p><Link href={`${fastenerUrl}#equipment-features`}>查看 {model} 的完整设备配置</Link></p>
    </section>
  );
}

function BeltEquipmentFeatures() {
  return (
    <section className={styles.section} id="equipment-features">
      <h2>设备特点</h2>
      <p>以下为 {model} 连续式网带炉的配置。</p>
      <dl>{data.features.map(feature => (
        <div key={feature.title}><dt>{feature.title}</dt><dd>{feature.text}</dd></div>
      ))}</dl>
    </section>
  );
}

export function FastenerAgreement() {
  return (
    <>
      <BeltAgreementTable fasteners />
      <BeltEquipmentFeatures />
    </>
  );
}

export function CarburisingAgreement() {
  return (
    <section className={styles.section} id="surface-carburising">
      <h2>网带炉渗碳协议处理量</h2>
      <p>{fastenerCaseVisible() ? <Link href={FASTENER_CASE_PATH} prefetch={false}>{model}</Link> : model}{' '}{data.carburisingDescription}</p>
    </section>
  );
}
