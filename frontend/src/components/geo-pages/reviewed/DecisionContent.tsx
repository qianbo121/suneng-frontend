import Image from 'next/image';
import { ReviewedDocument } from '../ReviewedDocument';
import styles from './article.module.css';
import { ReviewedFaqs } from '../ReviewedFaqs';
import faqs from './decision-faqs.json';

/** Reviewed design content imported from output/article-ui-draft-20260915/index.html; edit this JSX for future revisions. */
export function DecisionContent() {
  return (
    <>
      <ReviewedDocument className={styles.page}>
        <section className={'hero'}>
          <div className={'container'}>
            <nav className={'breadcrumb'} aria-label={'面包屑'}>
              <a href={'/zh'}>{'首页'}</a>
              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                <path d={'m9 5 7 7-7 7'}></path>
              </svg>
              <a href={'/zh/service/furnace-renovation-overhaul'}>{'改造与服务'}</a>
              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                <path d={'m9 5 7 7-7 7'}></path>
              </svg>
              <span>{'老旧热处理炉决策指南'}</span>
            </nav>
            <div className={'hero-layout'}>
              <div className={'hero-copy'}>
                <p className={'eyebrow'}>{'苏能工业炉 · 旧炉评估指南'}</p>
                <h1>
                  {'老旧热处理炉，'}
                  <br />
                  <span>{'大修还是买新？'}</span>
                </h1>
                <p className={'hero-desc'}>
                  {
                    '先看炉体安全、工艺适配和问题范围，再比较大修、局部改造与换新。使用年限也要结合设备现状判断。'
                  }
                </p>
                <div className={'actions'}>
                  <a className={'button'} href={'#decision'}>
                    {'先看三种处理方向'}
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                    </svg>
                  </a>
                  <a className={'text-link'} href={'#materials'}>
                    {'评估前准备什么'}
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'m6 9 6 6 6-6'}></path>
                    </svg>
                  </a>
                </div>
                <div className={'hero-meta'}>
                  <span>{'江苏苏能工业炉有限公司'}</span>
                  <span>
                    {'发布 '}
                    <time dateTime={'2026-06-13'}>{'2026-06-13'}</time>
                  </span>
                  <span>
                    {'更新 '}
                    <time dateTime={'2026-07-30'}>{'2026-07-30'}</time>
                  </span>
                </div>
              </div>
              <figure className={'hero-photo'}>
                <Image
                  src={'/images/reviewed-guides/decision/furnace-repair.jpg'}
                  width={1200}
                  height={760}
                  alt={'工业炉炉门与机械部件维修场景'}
                  sizes="(max-width: 767px) 100vw, 50vw"
                  priority
                />
                <figcaption>{'先检查设备现状，再确认维修与改造范围'}</figcaption>
              </figure>
            </div>
          </div>
        </section>
        <nav className={'section-nav'} aria-label={'页面章节'}>
          <div className={'container'}>
            <a className={'current'} href={'#decision'}>
              {'处理方向'}
            </a>
            <a href={'#criteria'}>{'适用情况'}</a>
            <a href={'#comparison'}>{'快速判断表'}</a>
            <a href={'#projects'}>{'项目参考'}</a>
            <a href={'#materials'}>{'评估资料'}</a>
            <a href={'#process'}>{'流程与风险'}</a>
            <a href={'#faq'}>{'常见问题'}</a>
          </div>
        </nav>
        <section
          className={'quick-start container'}
          id={'decision'}
          style={{ scrollMarginTop: '150px' }}
        >
          <div className={'section-head'}>
            <h2>{'三种情况，先找到你的方向'}</h2>
            <p>{'以现场检查和书面方案为准'}</p>
          </div>
          <div className={'decision-cards'}>
            <article className={'decision-card'}>
              <div className={'decision-heading'}>
                <span className={'icon-box'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path
                      d={
                        'M14 6a5 5 0 0 0-6.5 6.5L3 17a2.8 2.8 0 0 0 4 4l4.5-4.5A5 5 0 0 0 18 10l-3 3-4-4 3-3Z'
                      }
                    ></path>
                    <path d={'m16 3 5 5M17 7l3-3'}></path>
                  </svg>
                </span>
                <h3>{'优先大修'}</h3>
              </div>
              <p className={'lede'}>{'原工艺仍适用，恢复设备状态'}</p>
              <p className={'description'}>
                {'炉体结构基本完好，主要是炉衬、加热、密封或传动等系统老化。'}
              </p>
              <a className={'card-foot'} href={'#repairCards'}>
                {'先核查：主体结构与修复范围'}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </a>
            </article>
            <article className={'decision-card'}>
              <div className={'decision-heading'}>
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
                <h3>{'优先局部改造'}</h3>
              </div>
              <p className={'lede'}>{'问题集中，针对具体系统改善'}</p>
              <p className={'description'}>
                {'温控、保温、燃烧或局部机构存在瓶颈，先确认问题范围和新旧接口。'}
              </p>
              <a className={'card-foot'} href={'#partialCards'}>
                {'先核查：问题根因与系统接口'}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </a>
            </article>
            <article className={'decision-card'}>
              <div className={'decision-heading'}>
                <span className={'icon-box'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <rect x={'5'} y={'3'} width={14} height={17} rx={'1'}></rect>
                    <path d={'M8 6h8v8H8zM8 17h5M16 17h.01M7 20v2M17 20v2'}></path>
                  </svg>
                </span>
                <h3>{'评估买新炉'}</h3>
              </div>
              <p className={'lede'}>{'原设备已难以满足生产需求'}</p>
              <p className={'description'}>
                {'结构安全、炉膛尺寸或工艺适配存在明显限制，需独立比较换新方案。'}
              </p>
              <a className={'card-foot'} href={'#replaceCards'}>
                {'先核查：工艺适配与整体成本'}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </a>
            </article>
          </div>
          <div className={'notice'}>
            <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
              <circle cx={'12'} cy={'12'} r={'9'}></circle>
              <path d={'M12 11v6M12 7h.01'}></path>
            </svg>
            <p>
              {
                '炉体与基础安全、原工艺没有根本变化、问题范围可以界定时，优先比较大修或局部改造；存在结构安全风险或工艺不再适配时，应把换新作为独立方案比较。'
              }
            </p>
          </div>
        </section>
        <div className={'reading-zone'}>
          <div className={'reading-grid container'}>
            <article className={'article-body'} aria-label={'旧炉评估详细指南'}>
              <section className={'article-section'} id={'criteria'}>
                <div className={'article-heading'}>
                  <span className={'section-number'}>{'01'}</span>
                  <h2>{'哪些情况适合修、改或换新？'}</h2>
                </div>
                <p className={'section-intro'}>
                  {
                    '把设备现状与下面的情况对照，初步确定要检查的重点。多种问题同时存在时，需要一起评估。'
                  }
                </p>
                <div className={'conditions'}>
                  <div
                    className={'condition-column'}
                    id={'repairCards'}
                    style={{ scrollMarginTop: '155px' }}
                  >
                    <h3>{'优先大修'}</h3>
                    <ul>
                      <li>{'炉体结构完整，没有明显变形'}</li>
                      <li>{'炉衬老化但主体结构可继续使用'}</li>
                      <li>{'加热系统可维修或更换'}</li>
                      <li>{'控制系统可以升级'}</li>
                      <li>{'机械传动只是局部磨损'}</li>
                      <li>{'当前工艺需求没有根本变化'}</li>
                      <li>{'改造费用明显低于新炉投入'}</li>
                      <li>{'停产窗口可以接受'}</li>
                    </ul>
                  </div>
                  <div
                    className={'condition-column'}
                    id={'partialCards'}
                    style={{ scrollMarginTop: '155px' }}
                  >
                    <span id="partial" className="anchor-alias" />
                    <h3>{'优先局部改造'}</h3>
                    <ul>
                      <li>{'炉衬开裂、保温效果下降'}</li>
                      <li>{'炉门密封差、炉口漏热明显'}</li>
                      <li>{'控温系统落后、数据记录不完整'}</li>
                      <li>{'燃气炉燃烧效率低'}</li>
                      <li>{'电炉加热元件老化'}</li>
                      <li>{'风循环系统效果下降'}</li>
                      <li>{'台车、网带、辊道、推杆等局部机构磨损'}</li>
                      <li>{'安全联锁和报警保护需要补强'}</li>
                    </ul>
                  </div>
                  <div
                    className={'condition-column'}
                    id={'replaceCards'}
                    style={{ scrollMarginTop: '155px' }}
                  >
                    <h3>{'评估买新炉'}</h3>
                    <ul>
                      <li>{'炉体严重变形或存在安全隐患'}</li>
                      <li>{'原炉膛尺寸已经不适合当前工件'}</li>
                      <li>{'原炉型无法满足新工艺'}</li>
                      <li>{'改造费用接近或超过新炉成本'}</li>
                      <li>{'旧设备缺少关键图纸和备件'}</li>
                      <li>{'长期维修成本过高'}</li>
                      <li>{'能耗、效率、质量问题来自整体设计缺陷'}</li>
                      <li>{'客户希望同步提升自动化和产线能力'}</li>
                    </ul>
                  </div>
                </div>
              </section>
              <section className={'article-section'} id={'comparison'}>
                <span id="decision-table" className="anchor-alias" />
                <div className={'article-heading'}>
                  <span className={'section-number'}>{'02'}</span>
                  <h2>{'按当前问题，快速查找建议'}</h2>
                </div>
                <p className={'section-intro'}>
                  {'同一种现象可能有不同原因，下面用于整理检查方向。'}
                </p>
                <div className={'table-frame'}>
                  <table>
                    <thead>
                      <tr>
                        <th scope={'col'}>{'设备现在是什么情况'}</th>
                        <th scope={'col'}>{'优先评估什么'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{'炉体结构完好，只是炉衬老化'}</td>
                        <td>{'优先考虑炉衬翻新与保温优化'}</td>
                      </tr>
                      <tr>
                        <td>{'控制系统老旧，但炉体和加热系统可继续使用'}</td>
                        <td>{'优先考虑控制系统升级'}</td>
                      </tr>
                      <tr>
                        <td>{'炉门漏热、密封差、局部热损失明显'}</td>
                        <td>{'优先做炉门密封、台车密封或局部结构优化'}</td>
                      </tr>
                      <tr>
                        <td>{'燃气消耗高，燃烧不充分'}</td>
                        <td>{'评估燃烧系统和空燃比控制改造'}</td>
                      </tr>
                      <tr>
                        <td>{'加热元件老化，但炉体结构正常'}</td>
                        <td>{'评估加热元件更换和电气系统检修'}</td>
                      </tr>
                      <tr>
                        <td>{'炉体变形严重，存在安全风险'}</td>
                        <td>{'不建议简单改造，应评估大修或重新采购'}</td>
                      </tr>
                      <tr>
                        <td>{'改造费用接近新炉成本'}</td>
                        <td>{'重新采购新炉可能更合理'}</td>
                      </tr>
                      <tr>
                        <td>{'工艺需求变化很大，原炉型不再适配'}</td>
                        <td>{'重新设计整炉方案'}</td>
                      </tr>
                      <tr>
                        <td>{'缺少图纸、运行记录和关键部件资料'}</td>
                        <td>{'先做现场勘查和设备状态评估'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className={'table-note'}>
                  {'具体指标、施工范围和停产安排，需在现场检查后写入正式技术方案。'}
                </p>
              </section>
              <section className={'article-section'} id={'projects'}>
                <div className={'article-heading'}>
                  <span className={'section-number'}>{'03'}</span>
                  <h2>{'三个项目，理解不同处理路径'}</h2>
                </div>
                <p className={'section-intro'}>
                  {
                    '项目参数帮助识别决策变量。设计要求与实际验收结果需要区分，也不能替代对当前旧炉的检测。'
                  }
                </p>
                <div>
                  <article className={'evidence-item'}>
                    <div className={'evidence-type'}>{'新建方案参考'}</div>
                    <h3>{'台车式轴承钢丝球化退火炉新建方案'}</h3>
                    <p>
                      {
                        '2017 年新炉方案的有效炉膛为 10 × 3 × 2.2 m，最高设计温度 850℃，最大装炉量 30 t，有效区炉温均匀性设计要求为 ≤±5℃。'
                      }
                    </p>
                    <div className={'evidence-use'}>
                      <p>
                        {
                          '当原炉型、装炉能力或温度均匀性目标已不匹配时，应把新建方案作为独立选项比较；以上为设计参数与要求，不是实际验收结果。'
                        }
                      </p>
                    </div>
                  </article>
                  <article className={'evidence-item'}>
                    <div className={'evidence-type'}>{'旧炉改造参考'}</div>
                    <h3>{'超大型燃气台车退火炉改造'}</h3>
                    <p>
                      {
                        '项目炉膛约 13 × 7.4 × 4.3 m，额定温度 700℃，配置 14 套燃气烧嘴，助燃空气预热约 250–300℃。'
                      }
                    </p>
                    <div className={'evidence-use'}>
                      <p>
                        {
                          '说明大型旧炉不能只看使用年限，应先核查炉体、燃烧、炉衬、密封、排烟和施工边界。'
                        }
                      </p>
                    </div>
                  </article>
                  <article className={'evidence-item'}>
                    <div className={'evidence-type'}>{'新建产线参考'}</div>
                    <h3>{'PC200–PC400 支重轮新建连续热处理线'}</h3>
                    <p>
                      {
                        '项目加热炉额定温度 950℃，有效加热区约 6400 × 300 × 300 mm，资料设计处理能力约 500 kg/h。'
                      }
                    </p>
                    <div className={'evidence-use'}>
                      <p>
                        {
                          '当目标变为连续加热、自动淬火、回火、冷却和多规格节拍联动时，应把新建产线作为独立方案比较。'
                        }
                      </p>
                    </div>
                  </article>
                </div>
              </section>
              <section className={'article-section'} id={'materials'}>
                <div className={'article-heading'}>
                  <span className={'section-number'}>{'04'}</span>
                  <h2>{'评估前，准备这三类资料'}</h2>
                </div>
                <p className={'section-intro'}>
                  {'先把现有资料整理好，便于技术人员判断哪些信息还需现场补充。'}
                </p>
                <div className={'material-groups'}>
                  <div className={'material-group'}>
                    <h3>
                      <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                        <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                      </svg>
                      {'设备与工件'}
                    </h3>
                    <ul>
                      <li>{'炉型'}</li>
                      <li>{'炉膛尺寸'}</li>
                      <li>{'最高温度'}</li>
                      <li>{'常用工作温度'}</li>
                      <li>{'工件材质'}</li>
                      <li>{'工件尺寸'}</li>
                      <li>{'单件重量'}</li>
                      <li>{'装炉量'}</li>
                    </ul>
                  </div>
                  <div className={'material-group'}>
                    <h3>
                      <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                        <path d={'M8 5 6 8H3v12h18V8h-3l-2-3H8Z'}></path>
                        <circle cx={'12'} cy={'14'} r={'4'}></circle>
                      </svg>
                      {'现场与运行'}
                    </h3>
                    <ul>
                      <li>{'设备照片'}</li>
                      <li>{'当前问题'}</li>
                      <li>{'能耗数据'}</li>
                      <li>{'炉衬状态'}</li>
                      <li>{'控制系统照片'}</li>
                      <li>{'加热系统照片'}</li>
                    </ul>
                  </div>
                  <div className={'material-group'}>
                    <h3>
                      <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                        <circle cx={'12'} cy={'12'} r={'9'}></circle>
                        <path d={'M12 6v6l4 2'}></path>
                      </svg>
                      {'历史与计划'}
                    </h3>
                    <ul>
                      <li>{'设备使用年限'}</li>
                      <li>{'停产窗口'}</li>
                      <li>{'是否有原始图纸'}</li>
                      <li>{'是否有历史维修记录'}</li>
                    </ul>
                  </div>
                </div>
                <div className={'material-footer'}>
                  <p>{'资料不完整也可以先沟通，再确认是否需要现场勘查。'}</p>
                  <a className={'text-link'} href={'/zh/articles/gongye-lu-baojia-canshu'}>
                    {'查看完整报价参数'}
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                    </svg>
                  </a>
                </div>
              </section>
              <section className={'article-section'} id={'process'}>
                <span id="vendor-selection" className="anchor-alias" />
                <div className={'article-heading'}>
                  <span className={'section-number'}>{'05'}</span>
                  <h2>{'从初步判断，到确认方案边界'}</h2>
                </div>
                <p className={'section-intro'}>
                  {'选择大修厂家时，重点核对诊断、工程量、停产、验收和同类项目证据。'}
                </p>
                <div className={'process'}>
                  <div className={'process-item'}>
                    <p>{'提交设备基础资料'}</p>
                  </div>
                  <div className={'process-item'}>
                    <p>{'判断关键系统状态'}</p>
                  </div>
                  <div className={'process-item'}>
                    <p>{'明确修、改或换新'}</p>
                  </div>
                  <div className={'process-item'}>
                    <p>{'输出初步建议和范围'}</p>
                  </div>
                  <div className={'process-item'}>
                    <p>{'确认正式方案边界'}</p>
                  </div>
                </div>
                <div className={'vendor-checks'}>
                  <h3>热处理炉大修厂家怎么选？</h3>
                  <div className={'vendor-check'}>
                    <strong>{'先诊断，再报价'}</strong>
                    <span>
                      {
                        '厂家应先核查炉体、炉衬、热源、控制、机械、安全和现场条件，不能只凭炉型名称给出大修结论。'
                      }
                    </span>
                  </div>
                  <div className={'vendor-check'}>
                    <strong>{'工程量清单可核对'}</strong>
                    <span>
                      {
                        '方案要区分保留、修复、更换和新增项，并说明拆除、制造、安装、调试及客户配合边界。'
                      }
                    </span>
                  </div>
                  <div className={'vendor-check'}>
                    <strong>{'停产计划可执行'}</strong>
                    <span>
                      {
                        '设计、备料、施工、调试和验收节点应分别确认，不能用一个固定天数替代现场排程。'
                      }
                    </span>
                  </div>
                  <div className={'vendor-check'}>
                    <strong>{'验收条件写完整'}</strong>
                    <span>
                      {
                        '温度、产能、能耗和连续运行指标要带负载、工件、测点、仪器、统计周期及异常工况说明。'
                      }
                    </span>
                  </div>
                  <div className={'vendor-check'}>
                    <strong>{'项目证据能对上'}</strong>
                    <span>
                      {
                        '优先核查同类炉型、相近工艺和相近改造边界的项目资料，不能只看无参数的客户名单。'
                      }
                    </span>
                  </div>
                </div>
                <p className={'risk-note'}>
                  {
                    '老旧热处理炉改造不是简单更换配件。炉体结构、加热系统、控制系统、装料方式和工艺需求需要相互匹配。停产周期、节能效果和验收指标，均需结合设备现状和具体方案确认。'
                  }
                </p>
              </section>
              <section className={'article-section'} id={'faq'}>
                <div className={'article-heading'}>
                  <span className={'section-number'}>{'06'}</span>
                  <h2>{'你可能还关心这些问题'}</h2>
                </div>
                <ReviewedFaqs items={faqs} />
                <details className={'source-note'}>
                  <summary>{'资料更新与来源'}</summary>
                  <p>
                    {
                      '内容来自原页面与苏能项目资料；项目参数对应原页面证据记录 SN-CASE-P1-013、SN-CASE-P1-014、SN-CASE-P0-001。项目证据只能帮助识别系统和决策变量，不能替代现场检测、风险评估和正式技术方案。原页面发布于 2026-06-13，更新于 2026-07-30。'
                    }
                  </p>
                </details>
              </section>
            </article>
            <aside className={'reading-aside'} aria-label={'阅读辅助'}>
              <p className={'aside-label'}>{'本文导航'}</p>
              <nav className={'toc'}>
                <a href={'#criteria'}>
                  <span>{'01'}</span>
                  {'适用情况'}
                </a>
                <a href={'#comparison'}>
                  <span>{'02'}</span>
                  {'快速判断表'}
                </a>
                <a href={'#projects'}>
                  <span>{'03'}</span>
                  {'项目参考'}
                </a>
                <a href={'#materials'}>
                  <span>{'04'}</span>
                  {'评估资料'}
                </a>
                <a href={'#process'}>
                  <span>{'05'}</span>
                  {'流程与风险'}
                </a>
                <a href={'#faq'}>
                  <span>{'06'}</span>
                  {'常见问题'}
                </a>
              </nav>
              <div className={'aside-contact'}>
                <span className={'icon-box'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path
                      d={'M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-1l-5 2 1-5a9 9 0 1 1 17-5Z'}
                    ></path>
                    <path d={'M8 11h.01M12 11h.01M16 11h.01'}></path>
                  </svg>
                </span>
                <h3>{'不确定该修还是换？'}</h3>
                <p>{'先整理设备照片、当前问题和停产窗口，让苏能工程师协助判断方向。'}</p>
                <a className={'button'} href={'/zh/inquiry'}>
                  {'联系苏能工程师'}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                  </svg>
                </a>
                <a className={'phone-link'} href={'tel:13052986814'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path
                      d={
                        'M5 3h4l2 5-3 2a16 16 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2Z'
                      }
                    ></path>
                  </svg>
                  {'130–5298–6814'}
                </a>
              </div>
              <div className={'aside-related'}>
                <h3>{'继续了解'}</h3>
                <a href={'/zh/service/furnace-renovation-overhaul'}>
                  {'工业炉维修、改造与大修服务'}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                  </svg>
                </a>
                <a href={'/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi'}>
                  {'改造风险、周期与生产影响'}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                  </svg>
                </a>
                <a href={'/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou'}>
                  {'电改燃、燃改电与余热回收'}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                  </svg>
                </a>
                <a href={'/zh/products'}>
                  {'查看工业炉产品'}
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
            <h2>{'按具体问题，继续往下看'}</h2>
            <a className={'text-link'} href={'/zh/service/furnace-renovation-overhaul'}>
              {'查看改造与服务'}
              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                <path d={'M5 12h14M13 6l6 6-6 6'}></path>
              </svg>
            </a>
          </div>
          <div className={'related-grid'}>
            <a className={'related-card'} href={'/zh/solutions/rechuli-lu-wendu-bujun-zhenggai'}>
              <span>{'温控问题'}</span>
              <h3>
                {'温度不均怎么整改'}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </h3>
              <p>{'从测量、热源、气流、密封和装炉条件查起。'}</p>
            </a>
            <a className={'related-card'} href={'/zh/solutions/rechuli-lu-luchen-fanxin'}>
              <span>{'炉衬问题'}</span>
              <h3>
                {'局部修还是整体翻新'}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </h3>
              <p>{'结合冷面、锚固、失效原因和工况判断范围。'}</p>
            </a>
            <a className={'related-card'} href={'/zh/solutions/rechuli-lu-kongzhi-xitong-shengji'}>
              <span>{'电控问题'}</span>
              <h3>
                {'控制系统升级判断'}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </h3>
              <p>{'核对测量、执行机构、联锁和切换边界。'}</p>
            </a>
            <a
              className={'related-card'}
              href={'/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan'}
            >
              <span>{'复产问题'}</span>
              <h3>
                {'停产炉重启与搬迁'}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </h3>
              <p>{'先恢复状态，再完成冷态、空载和负载验证。'}</p>
            </a>
          </div>
        </section>
        <section className={'bottom-cta'}>
          <div className={'container'}>
            <div>
              <h2>{'把设备现状说清楚，下一步才更好判断。'}</h2>
              <p>{'设备照片、炉型、当前问题和停产窗口，都可以作为沟通的起点。'}</p>
            </div>
            <a className={'button'} href={'/zh/inquiry'}>
              {'联系苏能工程师'}
              <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                <path d={'M5 12h14M13 6l6 6-6 6'}></path>
              </svg>
            </a>
          </div>
        </section>
        <div className={'mobile-action'}>
          <span>
            {'先了解设备现状'}
            <small>{'沟通大修、局改或换新方向'}</small>
          </span>
          <a className={'button'} href={'/zh/inquiry'}>
            {'联系工程师'}
          </a>
        </div>
      </ReviewedDocument>
    </>
  );
}
