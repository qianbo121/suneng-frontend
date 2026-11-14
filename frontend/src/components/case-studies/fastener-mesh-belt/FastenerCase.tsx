import Image from 'next/image';
import { FiArrowRight, FiBarChart2, FiBox, FiSettings, FiShield, FiUsers } from 'react-icons/fi';
import { WechatContactButton } from '@/components/lead/WechatContactButton';
import { LineFlow } from './LineFlow';
import { Faq } from './Faq';
import s from './page.module.css';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { JsonLd } from '@/components/JsonLd';
import { caseSearchJsonLd } from '@/lib/cases/search-metadata';
import { fastenerCaseSearchContent } from '@/lib/cases/fastener-case-search';

const assets = '/images/cases/fastener-mesh-belt';
const features = [
  ['一台炉，两种工艺', '同一台炉可分别用于螺丝钉淬火和渗碳。本项目渗碳时，工件在炉内停留更久。'],
  ['小螺丝钉怎样防卡、防滑落？', '淬火炉网带采用双人字形紧密编织，减少工件卡挂。网带两侧做了折边，防止工件从两边滑落。'],
  ['分区控温，记录可查', '淬火炉分 3 区、回火炉分 4 区控温，可按时段查询温度记录。'],
];

export function FastenerCase() {
  return <article className={s.page}>
    <header className={s.hero}>
      <Image className={s.panorama} src={assets + '/line-panorama.webp'} alt={fastenerCaseSearchContent.imageAlt} fill sizes="(max-width: 720px) 100vw, 64vw" priority />
      <div className={`site-page-container ${s.heroInner}`}><div className={s.copy}>
        <Breadcrumb locale="zh" tone="light" className={s.category}
          items={[{ label: '项目案例', href: '/zh/case' }]} currentLabel="紧固件网带炉项目" />
        <h1>紧固件网带炉项目：<br />淬火与渗碳各约定多少产量？</h1>
        <p className={s.summary}>2025 年，江苏苏能工业炉有限公司与一家紧固件企业签订技术协议，约定由苏能设计、制造一条网带炉热处理生产线。</p>
        <p className={s.model}><FiSettings aria-hidden />设备型号： RCWT-160/105-9/6</p>
      </div></div>
    </header>
    <div className={`site-page-container ${s.content}`}>
      <section className={s.capacity} aria-label="本项目协议约定产量">
        <dl>{[['300', '淬火炉 · 淬火'], ['150', '淬火炉 · 渗碳'], ['约 300', '回火炉 · 回火']].map(([value, label]) => <div key={label}>
          <dt>{label}</dt><dd>{value.startsWith('约') && <small>约 </small>}{value.replace('约 ', '')}<small> kg/h</small></dd>
        </div>)}</dl>
        <p>以上为本项目技术协议约定值，实际产量随工件、装料和工艺条件变化。</p>
      </section>
      <ul className={s.workpiece}>
        <li><b>工件名称：</b>本项目淬火和渗碳处理的工件均为螺丝钉。</li>
        <li><b>材料与规格：</b>客户未提供材料和单件规格，产量按重量计算。</li>
        <li><b>渗层深度：</b>协议未注明 150 公斤/小时对应的渗层深度。</li>
      </ul>
      <section className={s.section}><h2>项目特点</h2><div className={s.features}>{features.map(([heading, body]) => <div key={heading}><h3>{heading}</h3><p>{body}</p></div>)}</div></section>
      <section id="process-flow" className={s.section} style={{ scrollMarginTop: 96 }}><h2>项目配置与工艺流程</h2>
        <LineFlow />
      </section>
      <div className={s.cards}>
        <section><h2><FiBarChart2 aria-hidden />设备参数</h2><table aria-label="设备参数"><tbody>{[['总长度', '约 25 米'], ['总功率', '约 300 千瓦'], ['网带有效宽度', '500 毫米']].map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table></section>
        <section><h2><FiUsers aria-hidden />供货分工</h2><dl><dt>苏能</dt><dd>负责整线设计、制造、设备就位安装及操作培训。控制柜至网带炉设备的配线由苏能施工。</dd><dt>买方</dt><dd>负责设备卸货、冷却水系统、厂房至控制柜的供电接线、水电气管路和设备地坑，并提供控制柜至网带炉设备所需的线材。工艺调试由买方主导，苏能协助。</dd></dl></section>
        <section><h2><FiBox aria-hidden />协议供货范围</h2><p>淬火炉、带提升机的油槽、清洗机、回火炉和控制系统。</p></section>
        <section><h2><FiShield aria-hidden />验收办法</h2><dl><dt>出厂前</dt><dd>检查网带传动、冷态测试控制系统。</dd><dt>买方现场</dt><dd>终验收约定产量为 150～300 公斤/小时。淬火炉在 800℃ 时测三点，同一温区炉温偏差要求在 ±5℃ 以内。</dd></dl></section>
      </div>
      <Faq />
      <p className={s.source}>设备配置与产量依据双方签订的技术协议，工件信息由苏能项目人员补充。</p>
      <aside className={s.cta}><h2>提交工件参数，核算产量与炉型</h2><WechatContactButton label="获取方案" className={s.action} icon={<FiArrowRight aria-hidden />} /></aside>
    </div>
    <JsonLd id="case-search-jsonld" data={caseSearchJsonLd(fastenerCaseSearchContent)} />
  </article>;
}
