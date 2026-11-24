import copy from './quote-en.json';
import englishFaqs from './quote-faqs-en.json';
import Image from 'next/image';
import { ReviewedDocument } from '../ReviewedDocument';
import styles from './quote.module.css';
import { ReviewedFaqs } from '../ReviewedFaqs';
import faqs from './quote-faqs.json';
import { CopyQuoteChecklistButton } from '@/app/[locale]/articles/gongye-lu-baojia-canshu/CopyQuoteChecklistButton';
import { HomepageLeadForm } from '@/components/home/HomepageLeadForm';
import { FurnaceGuideTabs } from '../FurnaceGuideTabs';
import checklist from './quote-checklist.json';

/** Reviewed design content imported from output/quote-params-ui-draft-20260915/index.html; edit this JSX for future revisions. */
export function QuoteContent({ locale = 'zh' }: { locale?: 'en' | 'zh' }) {
  const english = locale === 'en';
  const t = (source: keyof typeof copy) => english ? copy[source] : source;
  const englishChecklist = "Fill in the available fields and contact Suneng using the website inquiry form, phone, WeChat or email.\n\n- Equipment type:\n- Workpiece material:\n- Workpiece dimensions:\n- Weight per piece:\n- Batch load or hourly throughput:\n- Maximum temperature:\n- Usual operating temperature:\n- Heat-treatment process:\n- Heating, soaking and cooling schedule:\n- Temperature uniformity:\n- Heating method:\n- Controls:\n- Site conditions:\n- Target delivery:\n- New furnace, retrofit or overhaul:\n- Current problem:\n- Available photos or drawings:\n";
  return (
    <>
      <ReviewedDocument className={styles.page}>
        <section className={'hero'}>
          <div className={'container'}>
            <nav className={'breadcrumb'} aria-label={t('面包屑')}>
              <a href={english ? '/en' : '/zh'}>{t('首页')}</a>
              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                <path d={'m9 5 7 7-7 7'}></path>
              </svg>
              <a href={english ? '/en/service' : '/zh/service'}>{t('改造与服务')}</a>
              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                <path d={'m9 5 7 7-7 7'}></path>
              </svg>
              <span>{t('工业炉报价资料清单')}</span>
            </nav>
            <div className={'hero-layout'}>
              <div className={'hero-copy'}>
                <p className={'eyebrow'}>{t('苏能工业炉 · 询价准备指南')}</p>
                <h1>
                  {t('单台工业炉报价，')}
                  <br />
                  <span>{t('先准备哪些资料？')}</span>
                </h1>
                <p className={'hero-desc'}>
                  {t('先整理工件、装载、温度、工艺和现场条件，')}
                  <br className={'desktop-break'} />
                  {t('再确认炉型、配置与供货范围。')}
                </p>
                <div className={'actions'}>
                  <a className={'button'} href={'#parameters'}>
                    {t('查看核心参数')}
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                    </svg>
                  </a>
                  <CopyQuoteChecklistButton
                    english={english} text={english ? englishChecklist : checklist}
                    className="secondary-button"
                    wrapperClassName="copy-control"
                    messageClassName="copy-message"
                  />
                </div>
                <p className={'hero-scope'}>
                  {t('适用于单台工业炉及必要配套。整条生产线请查看')}
                  <br />
                  <a href={english ? '/en/news/shuju-news-29' : '/zh/news/shuju-news-29'}>
                    {t('整线询价的 11 组输入清单')}
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                    </svg>
                  </a>
                </p>
                <div className={'hero-meta'}>
                  <span>{t('江苏苏能工业炉有限公司')}</span>
                  <span>
                    {t('发布 ')}
                    <time dateTime={'2026-06-12'}>{'2026-06-12'}</time>
                  </span>
                </div>
              </div>
              <figure className={'hero-photo'}>
                <Image
                  src={'/images/reviewed-guides/quote/quote-workpieces-v2.png'}
                  width={1536}
                  height={1024}
                  alt={t('工业炉询价资料：工件、量具与技术图纸')}
                  sizes="(max-width: 767px) 100vw, 50vw"
                  priority
                />
                <figcaption>{t('从工件与工艺出发，核对设备方案与参数')}</figcaption>
              </figure>
            </div>
          </div>
        </section>
        <nav className={'section-nav'} aria-label={t('页面章节')}>
          <div className={'container'}>
            <a href={'#parameters'}>{t('核心参数')}</a>
            <a href={'#furnace-types'}>{t('炉型重点')}</a>
            <a href={'#scope'}>{t('报价范围')}</a>
            <a href={'#projects'}>{t('项目参考')}</a>
            <a href={'#template'}>{t('复制清单')}</a>
            <a href={'#process'}>{t('报价流程')}</a>
            <a href={'#faq'}>{t('常见问题')}</a>
          </div>
        </nav>
        <section className={'prep container'}>
          <div className={'section-head'}>
            <h2>{t('先说清这三件事，就能开始沟通')}</h2>
            <p>{t('不知道炉型，也可以先提供工件信息')}</p>
          </div>
          <div className={'prep-grid'}>
            <article className={'prep-item'}>
              <span className={'icon-box'}>
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'m12 3 9 5v9l-9 5-9-5V8l9-5Zm0 10v9M3 8l9 5 9-5M7 5.8l9 5'}></path>
                </svg>
              </span>
              <div>
                <h3>{t('处理什么工件')}</h3>
                <p>{t('工件材质、尺寸、重量，以及每炉装多少、每小时要处理多少。')}</p>
              </div>
            </article>
            <article className={'prep-item'}>
              <span className={'icon-box'}>
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path
                    d={
                      'M10 3h4l1 3 3-1 2 3-2 3 2 3-2 3-3-1-1 3h-4l-1-3-3 1-2-3 2-3-2-3 2-3 3 1 1-3Z'
                    }
                  ></path>
                  <circle cx={'12'} cy={'11'} r={'3'}></circle>
                </svg>
              </span>
              <div>
                <h3>{t('达到什么工艺要求')}</h3>
                <p>{t('常用与最高温度、升温保温降温曲线，以及温度均匀性要求。')}</p>
              </div>
            </article>
            <article className={'prep-item'}>
              <span className={'icon-box'}>
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                </svg>
              </span>
              <div>
                <h3>{t('现场与交付怎么安排')}</h3>
                <p>{t('能源条件、车间空间、装卸方式，以及交期和安装调试范围。')}</p>
              </div>
            </article>
          </div>
          <div className={'notice'}>
            <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
              <circle cx={'12'} cy={'12'} r={'9'}></circle>
              <path d={'M12 11v6M12 7h.01'}></path>
            </svg>
            <p>
              {
                t('资料不全可以先判断方向，再补充关键参数。正式报价以确认后的技术方案、配置清单和交付范围为准。')
              }
            </p>
          </div>
        </section>
        <div className={'reading-zone'}>
          <div className={'reading-grid container'}>
            <article className={'article-body'} aria-label={t('工业炉报价资料说明')}>
              <section className={'article-section'} id={'parameters'}>
                <div className={'article-heading'}>
                  <span className={'section-number'}>{'01'}</span>
                  <h2>{t('报价前，逐项核对这 11 个参数')}</h2>
                </div>
                <p className={'section-intro'}>
                  {t('按工件、工艺和现场分组整理；暂时不确定的内容，可先标注待确认。')}
                </p>
                <section className={'parameter-group'}>
                  <h3 className={'group-label'}>
                    <span>{'A'}</span>
                    {t('工件与装载')}
                  </h3>
                  <div className={'parameter-table'}>
                    <div className={'parameter-row'}>
                      <strong>{t('工件信息')}</strong>
                      <p>{t('材质、单件尺寸、单件重量、装夹方式、最大外形尺寸。')}</p>
                    </div>
                    <div className={'parameter-row'}>
                      <strong>{t('炉膛尺寸')}</strong>
                      <p>{t('长、宽、高或有效工作区尺寸，决定炉体结构和装料空间。')}</p>
                    </div>
                    <div className={'parameter-row'}>
                      <strong>{t('装炉量 / 产能')}</strong>
                      <p>{t('每炉装多少、每天处理多少、连续炉每小时产能或线速度。')}</p>
                    </div>
                  </div>
                </section>
                <section className={'parameter-group'}>
                  <h3 className={'group-label'}>
                    <span>{'B'}</span>
                    {t('工艺与配置')}
                  </h3>
                  <div className={'parameter-table'}>
                    <div className={'parameter-row'}>
                      <strong>{t('最高温度')}</strong>
                      <p>{t('设计最高温度和常用工作温度，例如 650℃、950℃、1200℃ 等。')}</p>
                    </div>
                    <div className={'parameter-row'}>
                      <strong>{t('工艺要求')}</strong>
                      <p>
                        {t('退火、固溶、时效、回火、淬火、正火等；最好提供升温、保温、降温曲线。')}
                      </p>
                    </div>
                    <div className={'parameter-row'}>
                      <strong>{t('温度均匀性')}</strong>
                      <p>{t('是否要求 ±5℃、±10℃、±15℃ 等，具体需结合炉型和工艺判断。')}</p>
                    </div>
                    <div className={'parameter-row'}>
                      <strong>{t('能源类型')}</strong>
                      <p>{t('电、天然气、液化气、柴油、钢厂副产气等。')}</p>
                    </div>
                    <div className={'parameter-row'}>
                      <strong>{t('控制系统要求')}</strong>
                      <p>{t('普通温控、PLC、触摸屏、记录仪、数据追溯、MES/SCADA 对接等。')}</p>
                    </div>
                  </div>
                </section>
                <section className={'parameter-group'}>
                  <h3 className={'group-label'}>
                    <span>{'C'}</span>
                    {t('设备与现场')}
                  </h3>
                  <div className={'parameter-table'}>
                    <div className={'parameter-row'}>
                      <strong>{t('炉型需求')}</strong>
                      <p>
                        {
                          t('台车炉、箱式炉、井式炉、网带炉、辊底炉、推杆炉等；如果不确定，可描述工件和工艺，由苏能协助判断。')
                        }
                      </p>
                    </div>
                    <div className={'parameter-row'}>
                      <strong>{t('现场条件')}</strong>
                      <p>{t('车间空间、电源、气源、吊装条件、基础条件、进出料方式。')}</p>
                    </div>
                    <div className={'parameter-row'}>
                      <strong>{t('交付要求')}</strong>
                      <p>{t('交期、安装调试、是否需要改造旧炉、是否涉及搬迁复产。')}</p>
                    </div>
                  </div>
                </section>
                <div className={'parameter-hint'}>
                  <p>{t('有工件照片、图纸或温度曲线，可在技术沟通时一并补充。')}</p>
                  <a className={'text-link'} href={'#template'}>
                    {t('直接使用可复制清单')}
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                    </svg>
                  </a>
                </div>
              </section>
              <section className={'article-section'} id={'furnace-types'}>
                <div className={'article-heading'}>
                  <span className={'section-number'}>{'02'}</span>
                  <h2>{t('不同炉型，还要重点补充什么？')}</h2>
                </div>
                <p className={'section-intro'}>
                  {t('在通用参数之外，按计划采购或改造的炉型核对重点。')}
                </p>
                <FurnaceGuideTabs english={english}
                  items={[
                    {
                      id: 'furnace-0',
                      label: t('台车炉'),
                      content: (
                        <>
                          {' '}
                          <h3>{t('台车炉报价重点')}</h3>
                          <ul>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('炉膛尺寸')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('装炉重量')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('台车承重')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('炉门结构')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('轨道和基础')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('温度均匀性')}
                            </li>
                          </ul>
                          <a className={'text-link'} href={english ? '/en/products/detail/trolley-furnace' : '/zh/products/detail/trolley-furnace'}>
                            {t('了解台车炉的参数与适用场景')}
                            <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                              <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                            </svg>
                          </a>{' '}
                        </>
                      ),
                    },
                    {
                      id: 'furnace-1',
                      label: t('箱式炉'),
                      content: (
                        <>
                          {' '}
                          <h3>{t('箱式炉报价重点')}</h3>
                          <ul>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('有效工作区尺寸')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('温度等级')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('加热元件类型')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('炉门开启方式')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('控制精度')}
                            </li>
                          </ul>
                          <a className={'text-link'} href={english ? '/en/products/detail/box-furnace' : '/zh/products/detail/box-furnace'}>
                            {t('了解箱式炉的参数与适用场景')}
                            <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                              <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                            </svg>
                          </a>{' '}
                        </>
                      ),
                    },
                    {
                      id: 'furnace-2',
                      label: t('网带炉'),
                      content: (
                        <>
                          {' '}
                          <h3>{t('网带炉报价重点')}</h3>
                          <ul>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('网带宽度')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('产能或线速度')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('温区数量')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('网带材质')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('连续运行时间')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('上下料方式')}
                            </li>
                          </ul>
                          <a className={'text-link'} href={english ? '/en/products/detail/mesh-belt-furnace' : '/zh/products/detail/mesh-belt-furnace'}>
                            {t('了解网带炉的参数与适用场景')}
                            <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                              <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                            </svg>
                          </a>{' '}
                        </>
                      ),
                    },
                    {
                      id: 'furnace-3',
                      label: t('井式炉'),
                      content: (
                        <>
                          {' '}
                          <h3>{t('井式炉报价重点')}</h3>
                          <ul>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('有效直径和深度')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('吊装方式')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('工件长度')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('炉盖结构')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('气氛或风循环要求')}
                            </li>
                          </ul>
                          <a className={'text-link'} href={english ? '/en/products/detail/pit-furnace' : '/zh/products/detail/pit-furnace'}>
                            {t('了解井式炉的参数与适用场景')}
                            <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                              <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                            </svg>
                          </a>{' '}
                        </>
                      ),
                    },
                    {
                      id: 'furnace-4',
                      label: t('旧炉改造'),
                      content: (
                        <>
                          {' '}
                          <h3>{t('改造项目报价重点')}</h3>
                          <ul>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('原炉照片')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('炉衬状态')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('控制系统状态')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('当前问题')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('改造范围')}
                            </li>
                            <li>
                              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                                <path d={'m5 12 4 4L19 6'}></path>
                              </svg>
                              {t('停产窗口')}
                            </li>
                          </ul>
                          <a
                            className={'text-link'}
                            href={english ? '/en/articles/laojiu-rechuli-lu-daxiu-haishi-maixin' : '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin'}
                          >
                            {t('了解旧炉改造的处理方向')}
                            <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                              <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                            </svg>
                          </a>{' '}
                        </>
                      ),
                    },
                  ]}
                />
              </section>
              <section className={'article-section'} id={'scope'}>
                <div className={'article-heading'}>
                  <span className={'section-number'}>{'03'}</span>
                  <h2>{t('比较报价，先看供货范围是否一致')}</h2>
                </div>
                <p className={'section-intro'}>
                  {
                    t('同样叫“台车炉”或“退火炉”，配置和工程量也可能不同。新炉及改造项目，都应明确哪些工作包含在内、哪些需要单独确认。')
                  }
                </p>
                <div className={'table-frame'}>
                  <table className={'scope-table'}>
                    <thead>
                      <tr>
                        <th scope={'col'}>{t('工作类别')}</th>
                        <th scope={'col'}>{t('通常涉及的工作')}</th>
                        <th scope={'col'}>{t('需要单独确认的边界')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{t('方案与工程')}</td>
                        <td>{t('诊断、方案设计、工程量清单、设备与系统配置、图纸及技术文件。')}</td>
                        <td>{t('现场测绘、第三方设计或专项认证是否包含，需在报价中单列。')}</td>
                      </tr>
                      <tr>
                        <td>{t('设备与材料')}</td>
                        <td>
                          {t('炉体、炉衬、热源或燃烧系统、机械传动、控制系统、安全联锁及约定附件。')}
                        </td>
                        <td>{t('保留旧件、客户自备件、易损件和备品备件范围需逐项确认。')}</td>
                      </tr>
                      <tr>
                        <td>{t('现场实施')}</td>
                        <td>{t('按约定范围拆除、制造、运输、安装、调试和操作培训。')}</td>
                        <td>
                          {
                            t('基础、吊装、水电气接入、脚手架、保温拆除恢复及停产配合由谁承担，必须写清。')
                          }
                        </td>
                      </tr>
                      <tr>
                        <td>{t('测试与交付')}</td>
                        <td>{t('合同约定的出厂检查、现场调试、性能测试和资料交付。')}</td>
                        <td>{t('第三方检测、排放检测、认证测试及额外复测通常需按项目单独确认。')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <h3 className={'subheading'}>{t('这些差异，会改变设备配置与成本')}</h3>
                <div className={'cost-reasons'}>
                  <article className={'cost-reason'}>
                    <span>{'01'}</span>
                    <div>
                      <h3>{t('炉膛尺寸不同')}</h3>
                      <p>
                        {
                          t('有效工作区越大，炉体钢结构、炉衬材料、加热功率和制造工时都会变化，不能只按炉型名称估算。')
                        }
                      </p>
                    </div>
                  </article>
                  <article className={'cost-reason'}>
                    <span>{'02'}</span>
                    <div>
                      <h3>{t('温度等级不同')}</h3>
                      <p>
                        {t('650℃、950℃、1200℃ 等温度等级对应的耐材、加热元件、测温和控制配置不同。')}
                      </p>
                    </div>
                  </article>
                  <article className={'cost-reason'}>
                    <span>{'03'}</span>
                    <div>
                      <h3>{t('装炉量不同')}</h3>
                      <p>
                        {
                          t('单炉装料重量、台车承重、料筐或输送结构会影响炉体强度、传动方式和安全余量。')
                        }
                      </p>
                    </div>
                  </article>
                  <article className={'cost-reason'}>
                    <span>{'04'}</span>
                    <div>
                      <h3>{t('工艺要求不同')}</h3>
                      <p>
                        {
                          t('退火、回火、正火、固溶等工艺对温区、风循环、升温曲线和保温控制的要求不同。')
                        }
                      </p>
                    </div>
                  </article>
                  <article className={'cost-reason'}>
                    <span>{'05'}</span>
                    <div>
                      <h3>{t('能源类型不同')}</h3>
                      <p>
                        {
                          t('电加热、天然气、液化气、柴油或钢厂副产气涉及不同的热源系统、管路和安全联锁配置。')
                        }
                      </p>
                    </div>
                  </article>
                  <article className={'cost-reason'}>
                    <span>{'06'}</span>
                    <div>
                      <h3>{t('自动化程度不同')}</h3>
                      <p>
                        {
                          t('普通温控、PLC、触摸屏、记录仪、数据追溯和产线联动会带来不同的电控系统成本。')
                        }
                      </p>
                    </div>
                  </article>
                </div>
                <details className={'factor-more'}>
                  <summary>{t('查看影响价格的 8 项因素')}</summary>
                  <ul>
                    <li>{t('在温度、材料和供货范围等条件可比时，工作区扩大通常增加材料和制造投入；具体成本还需核对结构与配置。')}</li>
                    <li>{t('温度越高，耐材和加热系统要求越高。')}</li>
                    <li>{t('装炉量越大，结构强度要求越高。')}</li>
                    <li>{t('温度均匀性要求应结合加热、传热、装载、测温和控制方案核对；采用强制对流的炉型，再核对循环风与导流设计。')}</li>
                    <li>{t('在功能、品牌、接口和供货范围可比时，新增自动化功能通常增加电控配置与实施投入；不能只按自动化程度的标签比较总价。')}</li>
                    <li>{t('燃气炉比普通电阻炉多燃烧系统、管路和安全联锁。')}</li>
                    <li>{t('连续炉比周期炉更依赖输送、温区和节拍设计。')}</li>
                    <li>{t('改造项目需要结合旧炉状态判断，不能只按新炉价格估算。')}</li>
                  </ul>
                </details>
              </section>
              <section className={'article-section'} id={'projects'}>
                <div className={'article-heading'}>
                  <span className={'section-number'}>{'04'}</span>
                  <h2>{t('三个项目，看清报价变量')}</h2>
                </div>
                <p className={'section-intro'}>
                  {
                    t('以下为具体项目参数参考，包含旧炉改造与产线级项目，用于说明报价变量；不代表单台炉标准配置、其他项目的价格或产能。')
                  }
                </p>
                <article className={'evidence-item'}>
                  <div className={'evidence-type'}>{t('旧炉改造 · 炉体与燃烧系统')}</div>
                  <h3>{t('超大型燃气台车退火炉改造')}</h3>
                  <p>
                    {
                      t('有效加热区约 13 × 7.4 × 4.3 m，额定/最高使用温度 700℃；方案按 14 个温控区、14 × 630 kW = 8820 kW 核对，采用 14 套 630 kW 级高速天然气烧嘴，助燃空气 250–300℃为设计目标。')
                    }
                  </p>
                  <div className={'evidence-use'}>
                    <p>
                      <strong>{t('对报价的影响：')}</strong>
                      {t('需要同时核算炉体结构、炉衬、燃烧系统、管路、安全联锁、排烟与现场施工边界。')}
                    </p>
                  </div>
                </article>
                <article className={'evidence-item'}>
                  <div className={'evidence-type'}>{t('连续生产线 · 产线接口')}</div>
                  <h3>{t('850 mm 连续退火钝化线退火固溶段')}</h3>
                  <p>{t('项目退火温度约 1050–1150℃，炉温最高可至 1300℃，退火炉主体长度约 130 m。')}</p>
                  <div className={'evidence-use'}>
                    <p>
                      <strong>{t('对报价的影响：')}</strong>
                      {t('除炉体外，还要确认带材规格、速度核算、温区、冷却、收放卷和自动化接口。')}
                    </p>
                  </div>
                </article>
                <article className={'evidence-item'}>
                  <div className={'evidence-type'}>{t('网带线 · 多工序配套')}</div>
                  <h3>{t('RCWT-75/45-9/6 可控气氛网带线')}</h3>
                  <p>
                    {
                      t('淬火炉工作尺寸约 400 × 3200 mm，回火炉约 400 × 5600 mm，额定温度 950℃，生产能力约 150 kg/h。')
                    }
                  </p>
                  <div className={'evidence-use'}>
                    <p>
                      <strong>{t('对报价的影响：')}</strong>
                      {
                        t('报价需覆盖连续输送、气氛、淬火、清洗、回火、速度和产能边界，不能按单台炉估算。')
                      }
                    </p>
                  </div>
                </article>
              </section>
              <section className={'article-section'} id={'template'}>
                <div className={'article-heading'}>
                  <span className={'section-number'}>{'05'}</span>
                  <h2>{t('复制这份清单，整理你的询价资料')}</h2>
                </div>
                <p className={'section-intro'}>
                  {
                    t('按已有信息填写，暂时不清楚的项目写“待确认”即可，再通过官网表单、电话或微信、邮箱与苏能沟通。')
                  }
                </p>
                <div className={'template-panel'}>
                  <div className={'template-top'}>
                    <h3>
                      <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                        <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                      </svg>
                      {t('工业炉报价参数清单')}
                    </h3>
                    <span>{t('17 项信息')}</span>
                  </div>
                  <div className={'template-columns'}>
                    <ul className={'template-column'}>
                      <li>{t('设备类型：')}</li>
                      <li>{t('工件材质：')}</li>
                      <li>{t('工件尺寸：')}</li>
                      <li>{t('单件重量：')}</li>
                      <li>{t('每炉装炉量 / 每小时产能：')}</li>
                      <li>{t('最高温度：')}</li>
                      <li>{t('常用工作温度：')}</li>
                      <li>{t('热处理工艺：')}</li>
                      <li>{t('升温 / 保温 / 降温要求：')}</li>
                    </ul>
                    <ul className={'template-column'}>
                      <li>{t('温度均匀性要求：')}</li>
                      <li>{t('加热方式：')}</li>
                      <li>{t('控制系统要求：')}</li>
                      <li>{t('车间现场条件：')}</li>
                      <li>{t('期望交期：')}</li>
                      <li>{t('是否为新炉 / 改造 / 大修：')}</li>
                      <li>{t('当前问题描述：')}</li>
                      <li>{t('是否有照片或图纸：')}</li>
                    </ul>
                  </div>
                  <div className={'template-bottom'}>
                    <p>{t('整理工况，便于后续技术确认。')}</p>
                    <div className={'actions'}>
                      <CopyQuoteChecklistButton
                        english={english} text={english ? englishChecklist : checklist}
                        className="secondary-button"
                        wrapperClassName="copy-control"
                        messageClassName="copy-message"
                      />
                      <a
                        className={'text-link'}
                        href={english ? '/downloads/reviewed-guides/quote-checklist-en.txt' : '/downloads/reviewed-guides/quote-checklist.txt'}
                        download
                      >
                        {t('下载文字清单')}
                        <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                          <path d={'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5'}></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </section>
              <section className={'article-section'} id={'process'}>
                <div className={'article-heading'}>
                  <span className={'section-number'}>{'06'}</span>
                  <h2>{t('资料提交后，报价如何推进？')}</h2>
                </div>
                <p className={'section-intro'}>
                  {t('先判断方案方向，再确认关键参数，最后形成可核对的正式报价。')}
                </p>
                <div className={'quote-process'}>
                  <div className={'quote-step'}>
                    <span>{'01'}</span>
                    <div>
                      <h3>{t('客户提交基础参数')}</h3>
                      <p>{t('先提供炉型、工件、温度、产能、工艺和现场条件等基础信息。')}</p>
                    </div>
                  </div>
                  <div className={'quote-step'}>
                    <span>{'02'}</span>
                    <div>
                      <h3>{t('苏能初步判断炉型和方案方向')}</h3>
                      <p>{t('技术人员根据参数判断适合新炉定制、旧炉改造还是大修升级。')}</p>
                    </div>
                  </div>
                  <div className={'quote-step'}>
                    <span>{'03'}</span>
                    <div>
                      <h3>{t('技术人员确认关键参数')}</h3>
                      <p>{t('对炉膛尺寸、装炉量、控温要求、能源条件和交付边界做二次确认。')}</p>
                    </div>
                  </div>
                  <div className={'quote-step'}>
                    <span>{'04'}</span>
                    <div>
                      <h3>{t('输出初步技术方案和报价范围')}</h3>
                      <p>{t('在资料清楚的前提下，给出方案方向、主要配置和报价范围。')}</p>
                    </div>
                  </div>
                  <div className={'quote-step'}>
                    <span>{'05'}</span>
                    <div>
                      <h3>{t('形成正式报价和技术方案')}</h3>
                      <p>{t('双方确认细节后，再输出正式报价、技术方案和交付范围。')}</p>
                    </div>
                  </div>
                </div>
                <div className={'notice'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <circle cx={'12'} cy={'12'} r={'9'}></circle>
                    <path d={'M12 11v6M12 7h.01'}></path>
                  </svg>
                  <p>
                    {
                      t('通常 1 个工作日内进行初步判断；具体回复时间以项目复杂度和资料完整度为准。资料完整度、项目复杂度和现场条件，会影响技术确认与报价安排。涉及旧炉或复杂产线时，可能需要进一步勘查。')
                    }
                  </p>
                </div>
              </section>
              <section className={'article-section'} id={'faq'}>
                <div className={'article-heading'}>
                  <span className={'section-number'}>{'07'}</span>
                  <h2>{t('报价前，你可能还有这些疑问')}</h2>
                </div>
                <ReviewedFaqs items={english ? englishFaqs : faqs} />
                <details className={'source-note'}>
                  <summary>{t('资料来源与适用边界')}</summary>
                  <p>
                    {
                      t('资料与项目参数沿用原页面，来源为苏能项目资料，对应记录 SN-CASE-P1-014、SN-CASE-P0-006、SN-CASE-P0-004。项目参数用于说明报价变量，不是通用标准配置。正式报价应以双方确认后的技术方案、配置清单、交付边界和合同条款为准。原页面发布于 2026-06-12。')
                    }
                  </p>
                </details>
              </section>
            </article>
            <aside className={'reading-aside'} aria-label={t('清单工具与阅读导航')}>
              <div className={'aside-template'}>
                <div className={'aside-template-head'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <h3>{t('报价资料清单')}</h3>
                  <p>{t('17 项可复制清单，按已有信息填写。')}</p>
                </div>
                <div className={'aside-template-body'}>
                  <CopyQuoteChecklistButton
                    english={english} text={english ? englishChecklist : checklist}
                    className="secondary-button"
                    wrapperClassName="copy-control"
                    messageClassName="copy-message"
                  />
                  <a
                    className={'download'}
                    href={english ? '/downloads/reviewed-guides/quote-checklist-en.txt' : '/downloads/reviewed-guides/quote-checklist.txt'}
                    download
                  >
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5'}></path>
                    </svg>
                    {t('下载文字清单')}
                  </a>
                </div>
              </div>
              <p className={'aside-label'}>{t('本文导航')}</p>
              <nav className={'toc'}>
                <a href={'#parameters'}>
                  <span>{'01'}</span>
                  {t('核心参数')}
                </a>
                <a href={'#furnace-types'}>
                  <span>{'02'}</span>
                  {t('炉型重点')}
                </a>
                <a href={'#scope'}>
                  <span>{'03'}</span>
                  {t('报价范围')}
                </a>
                <a href={'#projects'}>
                  <span>{'04'}</span>
                  {t('项目参考')}
                </a>
                <a href={'#template'}>
                  <span>{'05'}</span>
                  {t('复制清单')}
                </a>
                <a href={'#process'}>
                  <span>{'06'}</span>
                  {t('报价流程')}
                </a>
                <a href={'#faq'}>
                  <span>{'07'}</span>
                  {t('常见问题')}
                </a>
              </nav>
              <div className={'aside-help'}>
                <h3>{t('资料不全，先沟通也可以')}</h3>
                <p>{t('先说清工件、工艺、产能需求和现场情况，由工程师提示需要补充的参数。')}</p>
                <a className={'text-link'} href={'#contact'}>
                  {t('填写项目需求')}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                  </svg>
                </a>
              </div>
            </aside>
          </div>
        </div>
        <section className={'related container'}>
          <div className={'section-head'}>
            <h2>{t('根据你的项目，继续了解')}</h2>
            <a className={'text-link'} href={english ? '/en/service' : '/zh/service'}>
              {t('查看改造与服务')}
              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                <path d={'M5 12h14M13 6l6 6-6 6'}></path>
              </svg>
            </a>
          </div>
          <div className={'related-grid'}>
            <a className={'related-card'} href={english ? '/en/products' : '/zh/products'}>
              <span>{t('单台炉选型')}</span>
              <h3>
                {t('不知道选什么炉型')}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </h3>
              <p>{t('从工件材质、尺寸、装载和工艺出发，判断设备方向。')}</p>
            </a>
            <a
              className={'related-card'}
              href={english ? '/en/articles/laojiu-rechuli-lu-daxiu-haishi-maixin' : '/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin'}
            >
              <span>{t('旧炉项目')}</span>
              <h3>
                {t('大修还是买新炉')}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </h3>
              <p>{t('结合原炉状态、当前问题和停产窗口，先确定处理方向。')}</p>
            </a>
            <a className={'related-card'} href={english ? '/en/news/shuju-news-29' : '/zh/news/shuju-news-29'}>
              <span>{t('整线项目')}</span>
              <h3>
                {t('整线询价的 11 组输入')}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </h3>
              <p>{t('同时核对工序节拍、设备接口、上下料和整线责任。')}</p>
            </a>
            <a className={'related-card'} href={english ? '/en/solutions/rechuli-lu-gaizao-fengxian-zhouqi' : '/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi'}>
              <span>{t('改造实施')}</span>
              <h3>
                {t('风险与停产周期')}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </h3>
              <p>{t('确认未知工程量、新旧接口、停产切换和验收条件。')}</p>
            </a>
          </div>
          <details className={'source-note'}>
            <summary>{t('更多改造与选型资料')}</summary>
            <div className={'aside-related'}>
              <a href={english ? '/en/solutions/rechuli-lu-wendu-bujun-zhenggai' : '/zh/solutions/rechuli-lu-wendu-bujun-zhenggai'}>
                {t('热处理炉温度不均怎么整改')}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </a>
              <a href={english ? '/en/solutions/rechuli-lu-luchen-fanxin' : '/zh/solutions/rechuli-lu-luchen-fanxin'}>
                {t('炉衬翻新报价前核对什么')}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </a>
              <a href={english ? '/en/solutions/rechuli-lu-dian-gai-ran-yure-huishou' : '/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou'}>
                {t('能源改造与余热回收如何立项')}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </a>
              <a href={english ? '/en/solutions/rechuli-lu-kongzhi-xitong-shengji' : '/zh/solutions/rechuli-lu-kongzhi-xitong-shengji'}>
                {t('控制系统升级报价前核对什么')}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </a>
              <a href={english ? '/en/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan' : '/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan'}>
                {t('停产炉重启与搬迁复产')}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </a>
              <a href={english ? '/en/products/detail/annealing-solution-line' : '/zh/products/detail/annealing-solution-line'}>
                {t('连续退火固溶生产线')}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </a>
            </div>
          </details>
        </section>
        <div className={'mobile-action'}>
          <span>
            {t('单台工业炉询价')}
            <small>{t('先整理资料，再确认方案')}</small>
          </span>
          <CopyQuoteChecklistButton
            english={english} text={english ? englishChecklist : checklist}
            className="secondary-button"
            wrapperClassName="copy-control"
            messageClassName="copy-message"
          />
        </div>
      </ReviewedDocument>
      <section id="contact" className={styles.contactSection}>
        <HomepageLeadForm
          locale={locale}
          sectionId="quote-requirements"
          pageType="报价资料页"
          productTag={english ? 'Individual furnace quotation' : '单台工业炉报价参数'}
          successProductTag="单台工业炉报价需求"
          sourceModule="quote_requirements_form"
          revealResult
          privacyNoticeEnabled
          title={english ? 'Request an industrial furnace quotation' : '提交工业炉报价需求'}
          description={english ? 'Send the details you have. An engineer can identify the missing parameters.' : '资料不完整也可以先沟通，工程师会据此判断需要补充哪些参数。'}
          submitLabel={english ? 'Send quotation request' : '提交报价需求'}
          inquiryProduct={english ? 'Individual furnace quotation' : '单台工业炉报价参数'}
        />
      </section>
    </>
  );
}
