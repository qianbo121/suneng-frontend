import Link from 'next/link';
import type { Locale } from '@/types/site';
import { ServiceSection, ServiceTable } from './ServicePageShared';
import styles from './ServicePages.module.css';

// A project preparation checklist, not a promise of certification or worldwide service.
const rows = {
  zh: [
    ['安装地点与工况', '提供国家、城市、工件、产能、工艺及验收要求；设备适用性按项目核对。'],
    ['电源与公用工程', '核对电压、频率、接地、燃料、气氛气体、冷却水、排风及现场接口。'],
    ['目的地要求', '在报价前提出当地安全、电气、排放及进口要求；所需认证、检测与承担方分别确认。'],
    ['供货与运输', '在报价和合同中明确设备边界、包装、运输、保险、清关、税费、卸货及吊装责任；交期另行确认。'],
    ['资料与语言', '约定图纸、操作维护说明、电气资料、程序备份的范围与语言；翻译和培训要求提前提出。'],
    ['安装与验收', '明确基础、能源接入、人员、现场或远程支持、差旅及费用；分别约定出厂检查与现场试运行的条件、方法和记录。'],
    ['质保与备件', '按合同确认质保期限、起算点、范围、耗材、备件及运输费用；时区、沟通语言和服务时间按项目协商。'],
  ],
  en: [
    ['Destination & Process', 'Share the country, city, workpiece, throughput, process and acceptance requirements. Equipment suitability is reviewed for each project.'],
    ['Power & Utilities', 'Confirm voltage, frequency, earthing, fuel, atmosphere gases, cooling water, exhaust and site connections.'],
    ['Destination Requirements', 'Identify local safety, electrical, emissions and import requirements before quotation. Confirm required certifications, inspections and responsible parties separately.'],
    ['Supply & Transport', 'Agree equipment boundaries, packing, freight, insurance, customs, taxes, unloading and lifting responsibilities in the quotation and contract. Confirm the schedule separately.'],
    ['Documents & Language', 'Agree the scope and language of drawings, operating and maintenance manuals, electrical documents and program backups. Specify translation and training needs early.'],
    ['Installation & Acceptance', 'Agree foundations, utility connections, staffing, on-site or remote support, travel and costs. Define factory checks and site trials separately, including conditions, methods and records.'],
    ['Warranty & Spares', 'Confirm the warranty period, start date, coverage, consumables, spare parts and shipping costs in the contract. Agree time zone, communication language and service timing for the project.'],
  ],
};

export function OverseasDeliverySection({ locale }: { locale: Locale }) {
  const en = locale === 'en';
  return (
    <ServiceSection
      id="overseas-delivery"
      title={en ? 'Overseas Project & Delivery Checklist' : '海外项目与交付核对清单'}
      intro={en ? 'Before quotation, agree the destination requirements and responsibilities on both sides.' : '报价前，先明确目的地要求与双方承担的工作。'}
    >
      <ServiceTable
        headers={en ? ['Item', 'What to Confirm'] : ['事项', '需要明确的内容']}
        rows={rows[locale]}
        label={en ? 'Overseas Delivery Checklist' : '海外交付核对清单'}
        numbered
      />
      <p className={styles.note}>
        {en ? 'This checklist does not confirm approval in any country, local service coverage or a fixed response time. Availability, compliance and delivery commitments require project-specific written confirmation.' : '本清单不代表已取得任何国家准入、设有当地服务点或承诺固定响应时间。项目可承接范围、合规与交付承诺须书面确认。'}
      </p>
      <Link className={styles.textLink} href={`/${locale}/contact`}>
        {en ? 'Discuss Destination & Delivery Requirements' : '沟通目的地与交付要求'}
      </Link>
    </ServiceSection>
  );
}
