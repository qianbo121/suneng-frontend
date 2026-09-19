import Image from 'next/image';
import { ReviewedDocument } from '../ReviewedDocument';
import styles from './guide.module.css';
import { ReviewedFaqs } from '../ReviewedFaqs';
import faqs from './energy-faqs.json';

/** Reviewed design content imported from output/six-guide-ui-drafts-20260915/energy.html; edit this JSX for future revisions. */
export function EnergyContent() {
  return (
    <>
      <ReviewedDocument className={styles.page}>
        <section className={'guide-hero'}>
          <div className={'container'}>
            <nav className={'breadcrumb'} aria-label={'面包屑'}>
              <a href={'/zh'}>{'首页'}</a>
              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                <path d={'m9 5 7 7-7 7'}></path>
              </svg>
              <a href={'/zh/service'}>{'改造与服务'}</a>
              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                <path d={'m9 5 7 7-7 7'}></path>
              </svg>
              <span>{'能源切换与余热利用'}</span>
            </nav>
            <div className={'guide-hero-grid'}>
              <div className={'guide-hero-copy'}>
                <p className={'guide-kicker'}>{'苏能工业炉 · 维修与改造指南'}</p>
                <h1>
                  {'能源切换与余热利用'}
                  <span>{'先核工况，再算改造'}</span>
                </h1>
                <p className={'guide-hero-intro'}>
                  {
                    '先建立同工况能源基线，再核算炉体、工艺、燃烧或配电、安全、排放、维护和停产边界；能源单价只是输入之一，不是改造结论。'
                  }
                </p>
                <div className={'guide-hero-actions'}>
                  <a className={'button'} href={'#answer'}>
                    {'查看判断与处理建议'}
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                    </svg>
                  </a>
                  <a className={'guide-secondary'} href={'#inputs'}>
                    {'准备咨询资料'}
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </a>
                </div>
                <ul className={'guide-hero-focus'}>
                  <li>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'m5 12 4 4L19 6'}></path>
                    </svg>
                    {'能源基线'}
                  </li>
                  <li>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'m5 12 4 4L19 6'}></path>
                    </svg>
                    {'配套条件'}
                  </li>
                  <li>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'m5 12 4 4L19 6'}></path>
                    </svg>
                    {'回收边界'}
                  </li>
                </ul>
              </div>
              <figure className={'guide-hero-image'}>
                <Image
                  src={'/images/reviewed-guides/energy/energy-hero-v2.png'}
                  width={1448}
                  height={1086}
                  alt={'带燃烧管路、风机与排烟管道的工业炉'}
                  style={{ objectPosition: 'center center' }}
                  sizes="(max-width: 767px) 100vw, 50vw"
                  priority
                />
                <figcaption>{'结合炉体、燃烧与排烟系统，核对能源改造条件'}</figcaption>
              </figure>
            </div>
          </div>
        </section>
        <nav className={'section-nav'} aria-label={'页面章节'}>
          <div className={'container'}>
            <a href={'#answer'}>{'先看结论'}</a>
            <a href={'#signals'}>{'判断信号'}</a>
            <a href={'#compare'}>{'对比与判断'}</a>
            <a href={'#evidence'}>{'验收资料'}</a>
            <a href={'#inputs'}>{'咨询准备'}</a>
            <a href={'#faq'}>{'常见问题'}</a>
          </div>
        </nav>
        <div className={'reading-grid container'}>
          <article className={'article-body'} aria-label={'能源切换与余热利用资料正文'}>
            <section className={'article-section'} id={'answer'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'01'}</span>
                <h2>{'不能只比较电价和气价'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '应先把工件吸热、炉体散热、烟气与排风损失、待机保温、负荷率、能源单价、增容、安全、排放、维护和停产成本放进同一项目边界。'
                }
              </p>
              <p className={'answer-copy'}>
                {
                  '电改燃、燃改电或余热回收是否值得做，取决于同工况能源基线、生产制度、现场公辅条件和完整改造成本。别的项目的节能比例、吨产品成本和回收期不能直接套用。'
                }
              </p>
              <ul className={'direct-checks'}>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'同工况能源基线'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'炉体与密封状态'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'燃烧或配电条件'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'安全与排放'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'稳定利用端'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'停产实施成本'}
                </li>
              </ul>
              <figure className={'recovery-diagram'} aria-labelledby={'recovery-title'}>
                <div className={'recovery-heading'}>
                  <span className={'recovery-eyebrow'}>{'余热利用 · 判断示意'}</span>
                  <h3 id={'recovery-title'}>{'有余热，还要有稳定的利用去向'}</h3>
                  <p>{'把热源、回收设备和利用端放在一起核对，再判断是否值得实施。'}</p>
                </div>
                <div className={'recovery-flow'}>
                  <section className={'recovery-node'}>
                    <div className={'recovery-node-head'}>
                      <span className={'recovery-icon'}>
                        <svg viewBox={'0 0 32 32'} aria-hidden={'true'}>
                          <path
                            d={'M5 26V10h19v16H5Zm3-16V5h8v5M10 26v-9h9v9M24 15h4V6M10 5V2M15 5V2'}
                          ></path>
                        </svg>
                      </span>
                      <span className={'recovery-step'}>{'01 · 热源'}</span>
                    </div>
                    <h4>{'炉后烟气 / 排风'}</h4>
                    <p>{'先看有没有可回收的热量'}</p>
                    <ul>
                      <li>{'温度与流量'}</li>
                      <li>{'运行时数与工况'}</li>
                      <li>{'含尘、腐蚀等条件'}</li>
                    </ul>
                  </section>
                  <div className={'recovery-arrow'} aria-label={'评估可回收热量'}>
                    <svg viewBox={'0 0 32 24'} aria-hidden={'true'}>
                      <path d={'M2 12h26M21 5l7 7-7 7'}></path>
                    </svg>
                    <span>
                      {'可回收'}
                      <br />
                      {'热量'}
                    </span>
                  </div>
                  <section className={'recovery-node recovery-center'}>
                    <div className={'recovery-node-head'}>
                      <span className={'recovery-icon'}>
                        <svg viewBox={'0 0 32 32'} aria-hidden={'true'}>
                          <rect x={'6'} y={'5'} width={20} height={22} rx={'2'}></rect>
                          <path d={'M1 11h9l4 10 4-10h13M1 21h9l4-10 4 10h13'}></path>
                        </svg>
                      </span>
                      <span className={'recovery-step'}>{'02 · 回收设备'}</span>
                    </div>
                    <h4>{'匹配换热与保护'}</h4>
                    <p>{'设备配置服从现场条件'}</p>
                    <ul>
                      <li>{'回收方式与接口'}</li>
                      <li>{'阻力与运行保护'}</li>
                      <li>{'清理、腐蚀与维护'}</li>
                    </ul>
                  </section>
                  <div className={'recovery-arrow'} aria-label={'匹配利用端的用热需求'}>
                    <svg viewBox={'0 0 32 24'} aria-hidden={'true'}>
                      <path d={'M2 12h26M21 5l7 7-7 7'}></path>
                    </svg>
                    <span>
                      {'用热'}
                      <br />
                      {'匹配'}
                    </span>
                  </div>
                  <section className={'recovery-node'}>
                    <div className={'recovery-node-head'}>
                      <span className={'recovery-icon'}>
                        <svg viewBox={'0 0 32 32'} aria-hidden={'true'}>
                          <path
                            d={'M5 27V14l8 4v-8l8 5V6h6v21H5ZM9 22h3m5 0h3m4 0h2M23 2v4'}
                          ></path>
                        </svg>
                      </span>
                      <span className={'recovery-step'}>{'03 · 利用端'}</span>
                    </div>
                    <h4>{'稳定、合适的热需求'}</h4>
                    <p>{'例如工艺预热等项目用途'}</p>
                    <ul>
                      <li>{'需要的温度与热量'}</li>
                      <li>{'用热时间是否匹配'}</li>
                      <li>{'运行稳定性与距离'}</li>
                    </ul>
                  </section>
                </div>
                <div className={'recovery-check'}>
                  <span>{'一起算'}</span>
                  <p>{'回收收益、设备与安装投入、维护和停产成本，应放在同一工况下比较。'}</p>
                </div>
                <figcaption>
                  {
                    '概念示意：箭头表示评估关系，不是管道连接图。具体介质、回路及保护措施按项目确认。'
                  }
                </figcaption>
              </figure>
            </section>
            <section className={'article-section'} id={'signals'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'02'}</span>
                <h2>{'先补齐这三类缺口，再谈回报'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '没有可比基线、没有现场边界或没有稳定利用端时，收益模型看起来精确，实际仍无法验收。'
                }
              </p>
              <div className={'signal-grid'}>
                <article className={'signal'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <h3>{'能耗口径不可比'}</h3>
                  <p>{'产量、负载、工艺曲线、能源热值、价格和统计周期没有统一。'}</p>
                </article>
                <article className={'signal'}>
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
                  <h3>{'炉体条件未检查'}</h3>
                  <p>{'电改燃会同时牵动炉衬、密封、炉压、排烟、烧嘴接口和控制联锁。'}</p>
                </article>
                <article className={'signal'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <circle cx={'12'} cy={'12'} r={'9'}></circle>
                      <path d={'M12 11v6M12 7h.01'}></path>
                    </svg>
                  </span>
                  <h3>{'余热没有稳定去向'}</h3>
                  <p>{'高温烟气不等于可利用；温度品位、流量、运行时数和利用端必须匹配。'}</p>
                </article>
              </div>
            </section>
            <section className={'article-section'} id={'compare'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'03'}</span>
                <h2>{'不同方案分别核对什么'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '决策应围绕工艺稳定性、基础设施、安全和完整生命周期成本，不用“哪种能源更先进”代替项目判断。'
                }
              </p>
              <div className={'comparison'}>
                <table>
                  <thead>
                    <tr>
                      <th scope={'col'}>{'方案方向'}</th>
                      <th scope={'col'}>{'必须核对'}</th>
                      <th scope={'col'}>{'不建议直接推进的情况'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td data-label={'方案方向'}>{'电改燃'}</td>
                      <td data-label={'必须核对'}>
                        {'热负荷、炉压、排烟、烧嘴布置、燃气供压与安全联锁'}
                      </td>
                      <td data-label={'不建议直接推进的情况'}>
                        {'炉体或基础无法支持、排烟空间不足、燃气与消防条件不成立'}
                      </td>
                    </tr>
                    <tr>
                      <td data-label={'方案方向'}>{'燃改电'}</td>
                      <td data-label={'必须核对'}>
                        {'配电容量、功率分区、加热元件、气氛、循环风与峰谷电价'}
                      </td>
                      <td data-label={'不建议直接推进的情况'}>
                        {'增容成本或电网条件无法满足，工艺气氛与节拍不适配'}
                      </td>
                    </tr>
                    <tr>
                      <td data-label={'方案方向'}>{'两用燃料'}</td>
                      <td data-label={'必须核对'}>
                        {
                          '燃料隔离与所需检漏、燃料和助燃条件、模式互锁、有效吹扫、点火及失焰保护；具体逻辑按设备安全设计确认'
                        }
                      </td>
                      <td data-label={'不建议直接推进的情况'}>
                        {'只有空气侧换向，无法证明燃料侧安全隔离'}
                      </td>
                    </tr>
                    <tr>
                      <td data-label={'方案方向'}>{'余热回收'}</td>
                      <td data-label={'必须核对'}>
                        {'烟温、流量、时数、腐蚀/含尘、压降、保护和稳定利用端'}
                      </td>
                      <td data-label={'不建议直接推进的情况'}>
                        {'利用端不稳定、维护代价过高或回收导致系统阻力失控'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
            <section className={'article-section'} id={'evidence'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'04'}</span>
                <h2>{'安全、能耗与排放分别留证'}</h2>
              </div>
              <p className={'section-intro'}>
                {'设计目标、接口接收和正式验收是不同层级；结论必须绑定测试条件、记录和责任边界。'}
              </p>
              <div className={'evidence-grid'}>
                <article className={'evidence-block'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <div>
                    <h3>{'逻辑和安全动作'}</h3>
                    <p>
                      {
                        '记录控制逻辑、阀门动作与严密性、报警触发点、失焰响应，以及断电、断气、断风的安全状态。'
                      }
                    </p>
                  </div>
                </article>
                <article className={'evidence-block'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <div>
                    <h3>{'管路和真实工况'}</h3>
                    <p>
                      {
                        '按经批准的现场测试大纲，由具备相应能力的人员在各项前置条件满足后，验证管路气密、有效吹扫、失焰保护、能源中断后的安全动作和炉压稳定性。测试方法、介质及先后依赖按设备文件确认；工厂测试不能替代现场验证。'
                      }
                    </p>
                  </div>
                </article>
                <article className={'evidence-block'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <div>
                    <h3>{'方案参数不是实际能耗'}</h3>
                    <p>
                      {
                        '烧嘴额定能力、炉体尺寸和温控分区属于方案配置，不能直接代表实际能耗。实际比较应使用约定负载与完整工艺周期下的能源计量记录，并核对供货清单、热值口径和运行条件。'
                      }
                    </p>
                  </div>
                </article>
                <article className={'evidence-block'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <div>
                    <h3>{'固定分母与统计周期'}</h3>
                    <p>
                      {
                        '统一负载、产量、工艺、热值、价格和运行制度后比较；排放是否达标以适用标准和有资质现场检测为准。'
                      }
                    </p>
                  </div>
                </article>
              </div>
            </section>
            <section className={'article-section'} id={'inputs'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'05'}</span>
                <h2>{'提交能源与运行资料，先做边界核算'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '建议提供工件与装炉量、工艺曲线、产量与运行时数、改造前能耗、能源价格和热值、炉体尺寸、配电/供气条件、烟气参数、排放要求、利用端与停产窗口。'
                }
              </p>
              <ul className={'input-list'}>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'工件与装炉量'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'工艺曲线'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'产量与运行时数'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'改造前能耗'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'能源价格与热值'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'炉体与公辅条件'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'烟气与排放要求'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'利用端与停产窗口'}
                </li>
              </ul>
              <div className={'input-bottom'}>
                <p>{'先整理现有资料，再确认需要补充的信息。'}</p>
                <a
                  className={'button'}
                  href={'/downloads/reviewed-guides/energy-checklist.txt'}
                  download
                >
                  {'下载资料清单'}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5'}></path>
                  </svg>
                </a>
              </div>
            </section>
            <section className={'article-section'} id={'faq'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'06'}</span>
                <h2>{'这些问题，采购前先问清'}</h2>
              </div>
              <ReviewedFaqs items={faqs} />
            </section>
            <section className={'article-section'} id={'related'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'07'}</span>
                <h2>{'下一步，继续核对你的项目'}</h2>
              </div>
              <div className={'related-guide-list'}>
                <a href={'/zh/service/furnace-renovation-overhaul'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                  </svg>
                  {'工业炉改造服务'}
                </a>
                <a href={'/zh/articles/gongye-lu-baojia-canshu'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                  </svg>
                  {'工业炉报价参数'}
                </a>
                <a href={'/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                  </svg>
                  {'老炉修还是换'}
                </a>
              </div>
            </section>
          </article>
          <aside className={'reading-aside'} aria-label={'咨询准备与相关资料'}>
            <section className={'aside-panel'}>
              <p className={'intro-label'}>{'立项前至少确认'}</p>
              <h3>{'6 组决策输入'}</h3>
              <ul className={'boundary-list'}>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'负载、产量与运行制度'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'电价、气价与热值口径'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'炉衬、密封与炉压状态'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'配电或燃气增容条件'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'安全联锁与排放要求'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'余热利用端和停产窗口'}
                </li>
              </ul>
              <a className={'text-link'} href={'#inputs'}>
                {'查看咨询准备'}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </a>
            </section>
            <nav className={'aside-panel'} aria-label={'改造专题资料'}>
              <h2>{'维修与改造资料'}</h2>
              <div className={'aside-link-list'}>
                <a href={'/zh/solutions/rechuli-lu-wendu-bujun-zhenggai'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                  </svg>
                  {'温度不均整改'}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m9 5 7 7-7 7'}></path>
                  </svg>
                </a>
                <a href={'/zh/solutions/rechuli-lu-luchen-fanxin'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                  </svg>
                  {'炉衬损坏与翻新'}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m9 5 7 7-7 7'}></path>
                  </svg>
                </a>
                <a
                  href={'/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou'}
                  className={'current'}
                  aria-current={'page'}
                >
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                  </svg>
                  {'能源切换与余热利用'}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m9 5 7 7-7 7'}></path>
                  </svg>
                </a>
                <a href={'/zh/solutions/rechuli-lu-kongzhi-xitong-shengji'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                  </svg>
                  {'控制系统升级'}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m9 5 7 7-7 7'}></path>
                  </svg>
                </a>
                <a href={'/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                  </svg>
                  {'停产与搬迁复产'}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m9 5 7 7-7 7'}></path>
                  </svg>
                </a>
                <a href={'/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                  </svg>
                  {'改造风险与停产安排'}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m9 5 7 7-7 7'}></path>
                  </svg>
                </a>
              </div>
              <a className={'text-link'} href={'/zh/inquiry'}>
                {'联系苏能工程师'}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </a>
            </nav>
          </aside>
        </div>
        <details className={'page-facts container'}>
          <summary>{'资料来源与适用边界'}</summary>
          <p>
            {
              '资料整理范围：能源切换与余热利用的前期评估、现场配套及验收记录要求。具体方案按设备安全设计、项目技术文件和适用要求确认。 本页已按正文技术审查意见修订，供文稿与版式确认；不代表具体设备已完成设计批准或现场验收。'
            }
          </p>
          <p>{'原页面标题：热处理炉电改燃、燃改电和余热回收怎么选？'}</p>
        </details>
      </ReviewedDocument>
    </>
  );
}
