import Image from 'next/image';
import { ReviewedDocument } from '../ReviewedDocument';
import styles from './guide.module.css';
import { ReviewedFaqs } from '../ReviewedFaqs';
import faqs from './control-faqs.json';

/** Reviewed design content imported from output/six-guide-ui-drafts-20260915/control.html; edit this JSX for future revisions. */
export function ControlContent() {
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
              <span>{'控制系统升级'}</span>
            </nav>
            <div className={'guide-hero-grid'}>
              <div className={'guide-hero-copy'}>
                <p className={'guide-kicker'}>{'苏能工业炉 · 维修与改造指南'}</p>
                <h1>
                  {'控制系统升级'}
                  <span>{'先理清任务，再选系统'}</span>
                </h1>
                <p className={'guide-hero-intro'}>
                  {
                    '先盘点控制对象、测量回路、执行机构、安全联锁、程序备份和数据接口，再决定保留、局部升级还是更换架构。PLC、DCS 或其他架构应按项目复杂度与维护条件选择。'
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
                    {'控制对象'}
                  </li>
                  <li>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'m5 12 4 4L19 6'}></path>
                    </svg>
                    {'安全联锁'}
                  </li>
                  <li>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'m5 12 4 4L19 6'}></path>
                    </svg>
                    {'系统接口'}
                  </li>
                </ul>
              </div>
              <figure className={'guide-hero-image'}>
                <Image
                  src={'/images/reviewed-guides/control/control-hero-v2.webp'}
                  width={496}
                  height={496}
                  alt={'工程师检查工业炉控制柜内的控制模块与接线'}
                  style={{ objectPosition: 'center 10%' }}
                  sizes="(max-width: 767px) 100vw, 50vw"
                  priority
                />
                <figcaption>{'从控制柜与现场回路出发，梳理升级范围'}</figcaption>
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
          <article className={'article-body'} aria-label={'控制系统升级资料正文'}>
            <section className={'article-section'} id={'answer'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'01'}</span>
                <h2>{'先盘点控制对象，再选择控制架构'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  'PLC 品牌、HMI 尺寸或算法名称，都不能单独决定控温精度、温度均匀性和工艺稳定性。控制升级必须连同炉体、加热、循环、测温和联锁一起核对。'
                }
              </p>
              <p className={'answer-copy'}>
                {
                  '先恢复图纸、点表、程序、参数和版本基线，再检查测量回路、执行机构和安全联锁；依据 I/O 规模、控制复杂度、数据接口与维护能力，决定保留、局部升级或更换架构，并通过冷态、热态和负载验证形成闭环。'
                }
              </p>
              <ul className={'direct-checks'}>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'图纸、点表与程序'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'测温与校准状态'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'执行机构与反馈'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'安全联锁与报警'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'历史数据与接口'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'切换与回退条件'}
                </li>
              </ul>
            </section>
            <section className={'article-section'} id={'signals'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'02'}</span>
                <h2>{'出现这些信号，应先做控制系统体检'}</h2>
              </div>
              <p className={'section-intro'}>
                {'体检用于找出真正的失效链，不把所有温度波动、停机和质量问题都归因于 PLC。'}
              </p>
              <div className={'signal-grid'}>
                <article className={'signal'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <h3>{'备件停产，程序不可维护'}</h3>
                  <p>
                    {
                      '控制器、模块或触摸屏难以替换，程序、密码、备份或注释缺失，故障恢复依赖临时处理。'
                    }
                  </p>
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
                  <h3>{'显示稳定，工艺仍波动'}</h3>
                  <p>
                    {
                      '应核对传感器位置、校准、执行机构、加热能力、循环与炉膛状态，不能只改控制参数。'
                    }
                  </p>
                </article>
                <article className={'signal'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <circle cx={'12'} cy={'12'} r={'9'}></circle>
                      <path d={'M12 11v6M12 7h.01'}></path>
                    </svg>
                  </span>
                  <h3>{'报警、追溯和接口缺失'}</h3>
                  <p>
                    {
                      '事件记录、历史曲线、配方版本或上位接口不足时，异常原因难以复盘，质量责任也难以追溯。'
                    }
                  </p>
                </article>
              </div>
            </section>
            <section className={'article-section'} id={'compare'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'03'}</span>
                <h2>{'不同架构分别核对什么'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '架构选择不是品牌排名。应比较控制对象、联锁复杂度、冗余要求、数据治理、维护能力和改造边界。'
                }
              </p>
              <div className={'comparison'}>
                <table>
                  <thead>
                    <tr>
                      <th scope={'col'}>{'方案方向'}</th>
                      <th scope={'col'}>{'优先核对'}</th>
                      <th scope={'col'}>{'不能直接承诺'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td data-label={'方案方向'}>{'PLC'}</td>
                      <td data-label={'优先核对'}>
                        {'I/O 规模、顺序控制、分区温控、通信接口和维护能力'}
                      </td>
                      <td data-label={'不能直接承诺'}>
                        {'不能仅凭品牌或型号承诺控温精度与温度均匀性'}
                      </td>
                    </tr>
                    <tr>
                      <td data-label={'方案方向'}>{'DCS'}</td>
                      <td data-label={'优先核对'}>
                        {'多系统协同、冗余、权限、历史数据库和全厂接口'}
                      </td>
                      <td data-label={'不能直接承诺'}>
                        {'系统更复杂不等于更适合单台炉，需核对运维与数据边界'}
                      </td>
                    </tr>
                    <tr>
                      <td data-label={'方案方向'}>{'保留并局部升级'}</td>
                      <td data-label={'优先核对'}>
                        {'原程序可读性、备件状态、现有回路与新增接口'}
                      </td>
                      <td data-label={'不能直接承诺'}>
                        {'安全逻辑、图纸和数据基础不清时，不宜继续叠加补丁'}
                      </td>
                    </tr>
                    <tr>
                      <td data-label={'方案方向'}>{'HMI / SCADA / MES'}</td>
                      <td data-label={'优先核对'}>
                        {'点位映射、时间戳、存储周期、权限和网络安全'}
                      </td>
                      <td data-label={'不能直接承诺'}>
                        {'更换画面或增加看板不等于完成底层控制升级'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
            <section className={'article-section'} id={'evidence'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'04'}</span>
                <h2>{'切换和验收必须留下哪些证据'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '交付物要能回答“改了什么、如何验证、出现问题怎样回退”，而不只是证明新柜体已经通电。'
                }
              </p>
              <div className={'evidence-grid'}>
                <article className={'evidence-block'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <div>
                    <h3>{'原程序、参数与版本归档'}</h3>
                    <p>
                      {
                        '保留原程序、参数、校验信息、I/O 点表、通信表和图纸版本，记录变更项与回退条件。'
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
                    <h3>{'模拟 I/O、报警和联锁'}</h3>
                    <p>
                      {
                        '按项目测试大纲验证输入输出、报警触发、联锁顺序和失效安全动作，并形成偏差整改闭环。'
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
                    <h3>{'冷态、热态与负载验证'}</h3>
                    <p>
                      {
                        '现场核对回路、执行机构、联锁、工艺曲线和负载结果；冷态逻辑通过不能替代热态或负载验证。'
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
                    <h3>{'项目配置只作边界示例'}</h3>
                    <p>
                      {
                        '某项目技术方案采用 S7-1200 PLC、14 英寸 HMI、每室 2 区 PID；它只说明该项目的方案配置，不代表所有控制升级都应采用相同品牌、屏幕尺寸或分区。'
                      }
                    </p>
                  </div>
                </article>
              </div>
            </section>
            <section className={'article-section'} id={'inputs'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'05'}</span>
                <h2>{'提交图纸、点表和程序信息，先拆保留与替换边界'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '建议提供炉型与工艺、原电气图、I/O 点表、PLC 与 HMI 型号和程序、测温与执行机构清单、联锁与报警、数据接口、故障记录和可用停产窗口。'
                }
              </p>
              <ul className={'input-list'}>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'炉型与工艺'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'原电气图'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'I/O 点表'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'PLC 与 HMI 程序'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'测温与执行机构'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'联锁与报警'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'数据接口'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'停产窗口'}
                </li>
              </ul>
              <div className={'input-bottom'}>
                <p>{'先整理现有资料，再确认需要补充的信息。'}</p>
                <a
                  className={'button'}
                  href={'/downloads/reviewed-guides/control-checklist.txt'}
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
              <p className={'intro-label'}>{'升级前先盘点'}</p>
              <h3>{'6 组控制资料'}</h3>
              <ul className={'boundary-list'}>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'原电气图与 I/O 点表'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'PLC、HMI 程序与版本'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'测温与执行机构清单'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'安全联锁与报警逻辑'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'历史数据和外部接口'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'停产切换与回退条件'}
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
                <a href={'/zh/solutions/rechuli-lu-dian-gai-ran-yure-huishou'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                  </svg>
                  {'能源切换与余热利用'}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m9 5 7 7-7 7'}></path>
                  </svg>
                </a>
                <a
                  href={'/zh/solutions/rechuli-lu-kongzhi-xitong-shengji'}
                  className={'current'}
                  aria-current={'page'}
                >
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
          <p>{'公司批准公开的控制系统改造判断方法与项目技术方案配置。 '}</p>
          <p>{'原页面标题：热处理炉控制系统升级怎么做？PLC、DCS、测温、联锁与数据接口检查清单'}</p>
        </details>
      </ReviewedDocument>
    </>
  );
}
