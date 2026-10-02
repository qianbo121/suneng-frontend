import Image from 'next/image';
import { ReviewedDocument } from '../ReviewedDocument';
import styles from './guide.module.css';
import { ReviewedFaqs } from '../ReviewedFaqs';
import faqs from './lining-faqs.json';

/** Reviewed design content imported from output/six-guide-ui-drafts-20260915/lining.html; edit this JSX for future revisions. */
export function LiningContent() {
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
              <span>{'炉衬损坏与翻新'}</span>
            </nav>
            <div className={'guide-hero-grid'}>
              <div className={'guide-hero-copy'}>
                <p className={'guide-kicker'}>{'苏能工业炉 · 维修与改造指南'}</p>
                <h1>
                  {'炉衬损坏与翻新'}
                  <span>{'先查损坏，再定修复'}</span>
                </h1>
                <p className={'guide-hero-intro'}>
                  {
                    '从热面损坏、冷面钢板、锚固体系和密封接口入手，判断局部修复、扩大拆检还是整体处理，并把烘炉与外壁温升写成可核对的验收条件。'
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
                    {'损坏范围'}
                  </li>
                  <li>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'m5 12 4 4L19 6'}></path>
                    </svg>
                    {'锚固密封'}
                  </li>
                  <li>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'m5 12 4 4L19 6'}></path>
                    </svg>
                    {'烘炉验收'}
                  </li>
                </ul>
              </div>
              <figure className={'guide-hero-image'}>
                <Image
                  src={'/images/reviewed-guides/lining/lining-hero-v2.png'}
                  width={1448}
                  height={1086}
                  alt={'工程师检查工业炉内部炉衬与加热元件'}
                  style={{ objectPosition: 'center center' }}
                  sizes="(max-width: 767px) 100vw, 50vw"
                  priority
                />
                <figcaption>{'炉衬、加热元件与结构接口，需要一起检查'}</figcaption>
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
          <article className={'article-body'} aria-label={'炉衬损坏与翻新资料正文'}>
            <section className={'article-section'} id={'answer'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'01'}</span>
                <h2>{'先判断支撑体系，不只看热面坏了多少'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '炉龄和损坏面积都不能单独决定翻新范围。真正影响决策的是冷面状态、锚固连续性、失效原因、新旧衬接缝条件，以及工况是否发生变化。'
                }
              </p>
              <p className={'answer-copy'}>
                {
                  '损坏不连片、未贯穿冷面、损坏区外锚固完好、失效原因为局部且新旧衬可以可靠衔接时，可考虑局部修复；出现炉顶下沉、冷面异常升温、贯通裂缝等信号时，应扩大拆检，最终范围以停炉检查为准。'
                }
              </p>
              <ul className={'direct-checks'}>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'热面损坏范围'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'冷面钢板状态'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'锚固体系连续性'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'失效原因'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'密封与穿墙接口'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'新旧工况变化'}
                </li>
              </ul>
            </section>
            <section className={'article-section'} id={'signals'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'02'}</span>
                <h2>{'出现这些信号，应扩大检查'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '信号本身不是脱离现场条件的通用否决项，但说明继续只补热面存在遗漏冷面和锚固风险的可能。'
                }
              </p>
              <div className={'signal-grid'}>
                <article className={'signal'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <h3>{'炉顶下沉、鼓包或外凸'}</h3>
                  <p>{'优先检查吊挂、锚固件和背衬状态，不能只覆盖表面纤维。'}</p>
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
                  <h3>{'冷面异常升温或变色'}</h3>
                  <p>{'排除密封漏热后，应检查贯通裂缝、热桥和保温层缺损。'}</p>
                </article>
                <article className={'signal'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <circle cx={'12'} cy={'12'} r={'9'}></circle>
                      <path d={'M12 11v6M12 7h.01'}></path>
                    </svg>
                  </span>
                  <h3>{'多次补丁或异常工况'}</h3>
                  <p>{'反复修补、超温、进水、气氛侵蚀和工况变化都需要重新核算。'}</p>
                </article>
              </div>
            </section>
            <section className={'article-section'} id={'compare'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'03'}</span>
                <h2>{'局部修、扩大拆检还是整体处理'}</h2>
              </div>
              <p className={'section-intro'}>
                {'决策表用于组织现场检查，不替代停炉开衬后的工程结论。'}
              </p>
              <div className={'comparison'}>
                <table>
                  <thead>
                    <tr>
                      <th scope={'col'}>{'判断结果'}</th>
                      <th scope={'col'}>{'需要同时满足或确认'}</th>
                      <th scope={'col'}>{'不能忽略的边界'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td data-label={'判断结果'}>{'考虑局部修复'}</td>
                      <td data-label={'需要同时满足或确认'}>
                        {'损坏局部、未及冷面、区外锚固完好、接缝可连续'}
                      </td>
                      <td data-label={'不能忽略的边界'}>
                        {'仍需查明火焰直冲、碰撞或局部超温等失效原因'}
                      </td>
                    </tr>
                    <tr>
                      <td data-label={'判断结果'}>{'扩大拆检'}</td>
                      <td data-label={'需要同时满足或确认'}>
                        {'冷面异常、贯通裂缝、锚固腐蚀、炉顶下沉或多次修补'}
                      </td>
                      <td data-label={'不能忽略的边界'}>
                        {'拆检范围根据结构图、测温与开衬结果确定'}
                      </td>
                    </tr>
                    <tr>
                      <td data-label={'判断结果'}>{'重新核算'}</td>
                      <td data-label={'需要同时满足或确认'}>
                        {'改燃料、提高温度、增加装炉量或改变炉压和气流'}
                      </td>
                      <td data-label={'不能忽略的边界'}>
                        {'旧炉衬按旧工况设计，不能直接沿用原结论'}
                      </td>
                    </tr>
                    <tr>
                      <td data-label={'判断结果'}>{'材料与接口'}</td>
                      <td data-label={'需要同时满足或确认'}>
                        {'纤维、浇注料、砖体、烧嘴口、炉门与热电偶接口'}
                      </td>
                      <td data-label={'不能忽略的边界'}>
                        {'材料牌号、压缩要求和烘炉制度按项目确认'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
            <section className={'article-section'} id={'evidence'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'04'}</span>
                <h2>{'翻新后应留下哪些验收证据'}</h2>
              </div>
              <p className={'section-intro'}>
                {'记录不仅证明施工完成，也为后续判断外壁温升、密封和能耗变化提供可比基线。'}
              </p>
              <div className={'evidence-grid'}>
                <article className={'evidence-block'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <div>
                    <h3>{'冷面、锚固与接缝记录'}</h3>
                    <p>{'保留拆除前后照片、冷面钢板状态、锚固检查、新旧衬接缝及穿墙接口记录。'}</p>
                  </div>
                </article>
                <article className={'evidence-block'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <div>
                    <h3>{'合格证与施工参数'}</h3>
                    <p>
                      {
                        '2018年方案将“1140 型、压缩量≥40%”用于烧嘴周围和炉口的局部纤维修复。型号不能直接解释为使用温度；材料牌号、压缩量的计算基准和方向须与产品资料、施工设计对应，不能套到全部炉衬。'
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
                    <h3>{'实测曲线与排湿记录'}</h3>
                    <p>
                      {
                        '记录时间—温度曲线、保温时长、排湿口状态、排汽观察、异常处理和环境温湿度，不发布跨材料体系的通用曲线。'
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
                    <h3>{'把温升变成可验收条件'}</h3>
                    <p>
                      {
                        '2018年方案在“炉壁温升”项下写“环境温度+40℃”，另列800℃稳定态和热桥除外条件。外表温度比环境高40℃相当于40 K温升，与外表温度不超过40℃不同。用于验收前，应统一原文口径，明确测量对象、工况、测点、环境基准及排除范围。'
                      }
                    </p>
                  </div>
                </article>
              </div>
            </section>
            <section className={'article-section'} id={'inputs'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'05'}</span>
                <h2>{'提交炉衬资料，先判断检查边界'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '建议提供炉型与温度、运行气氛、炉衬结构图、损坏照片、冷面温度、维修与异常历史、计划工况、可用停产窗口和希望复测的指标。'
                }
              </p>
              <ul className={'input-list'}>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'炉型与温度'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'运行气氛'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'炉衬结构图'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'损坏照片'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'冷面温度'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'维修与异常历史'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'计划工况'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'可用停产窗口'}
                </li>
              </ul>
              <div className={'input-bottom'}>
                <p>{'先整理现有资料，再确认需要补充的信息。'}</p>
                <a
                  className={'button'}
                  href={'/downloads/reviewed-guides/lining-checklist.txt'}
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
              <p className={'intro-label'}>{'停炉检查前先准备'}</p>
              <h3>{'6 组判断资料'}</h3>
              <ul className={'boundary-list'}>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'炉型、温度与运行气氛'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'损坏位置和范围照片'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'冷面温度与异常记录'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'炉衬及锚固结构图'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'超温、进水和维修历史'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'计划变更的生产工况'}
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
                <a
                  href={'/zh/solutions/rechuli-lu-luchen-fanxin'}
                  className={'current'}
                  aria-current={'page'}
                >
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                  </svg>
                  {'炉衬损坏与翻新'}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m9 5 7 7-7 7'}></path>
                  </svg>
                </a>
                <a href={'/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou'}>
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
          <p>{'公司批准公开的炉衬诊断方法、项目技术方案、材料与验收边界。 '}</p>
          <p>{'原页面标题：热处理炉炉衬翻新方案：旧衬诊断、耐材选型与验收'}</p>
        </details>
      </ReviewedDocument>
    </>
  );
}
