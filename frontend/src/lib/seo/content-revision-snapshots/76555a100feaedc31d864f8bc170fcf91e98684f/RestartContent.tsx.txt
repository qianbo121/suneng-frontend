import Image from 'next/image';
import { ReviewedDocument } from '../ReviewedDocument';
import styles from './guide.module.css';
import { ReviewedFaqs } from '../ReviewedFaqs';
import faqs from './restart-faqs.json';

/** Reviewed design content imported from output/six-guide-ui-drafts-20260915/restart.html; edit this JSX for future revisions. */
export function RestartContent() {
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
              <span>{'停产与搬迁复产'}</span>
            </nav>
            <div className={'guide-hero-grid'}>
              <div className={'guide-hero-copy'}>
                <p className={'guide-kicker'}>{'苏能工业炉 · 维修与改造指南'}</p>
                <h1>
                  {'停产与搬迁复产'}
                  <span>{'先查状态，再安排复产'}</span>
                </h1>
                <p className={'guide-hero-intro'}>
                  {
                    '不能从“设备还能启动”直接跳到负载生产。应先还原停机原因和设备状态，再检查结构、炉衬、能源、电气、测温、联锁和机械系统，按实际设备确定冷态、热态及负载验证的适用条件。'
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
                    {'停机原因'}
                  </li>
                  <li>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'m5 12 4 4L19 6'}></path>
                    </svg>
                    {'设备检查'}
                  </li>
                  <li>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'m5 12 4 4L19 6'}></path>
                    </svg>
                    {'复产验证'}
                  </li>
                </ul>
              </div>
              <figure className={'guide-hero-image'}>
                <Image
                  src={'/images/reviewed-guides/restart/restart-hero-v2.webp'}
                  width={2172}
                  height={724}
                  alt={'两名工程师在大型工业炉旁核对图纸'}
                  style={{ objectPosition: '73% center' }}
                  sizes="(max-width: 767px) 100vw, 50vw"
                  priority
                />
                <figcaption>{'重新核对设备状态、现场条件与投产前检查'}</figcaption>
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
          <article className={'article-body'} aria-label={'停产与搬迁复产资料正文'}>
            <section className={'article-section'} id={'answer'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'01'}</span>
                <h2>{'先证明设备安全可控，再谈负载复产'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '原设计能力、旧验收记录和短时启动结果，都不能自动成为搬迁后或长期停产后的新验收结论。'
                }
              </p>
              <p className={'answer-copy'}>
                {
                  '先查清停机原因、资料完整度和设备现状，完成结构、炉衬、能源、电气、测温、联锁与机械检查。复产验证方案应明确冷态、热态及负载检查各自的前置条件、所需介质和先后依赖；是否适合空载升温按设备文件与维修范围确定，满足本项试验条件后再执行。'
                }
              </p>
              <ul className={'direct-checks'}>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'停机原因与历史'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'基础和钢结构'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'炉衬与密封'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'能源与安全联锁'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'电气、测温和绝缘'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'机械与传动系统'}
                </li>
              </ul>
            </section>
            <section className={'article-section'} id={'signals'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'02'}</span>
                <h2>{'出现这些情况，不能直接通电或点火'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '以下信号说明设备状态或安全边界尚未建立，应先补检查和资料，不以一次空转代替系统判断。'
                }
              </p>
              <div className={'signal-grid'}>
                <article className={'signal'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <h3>{'停机原因和现状不清'}</h3>
                  <p>
                    {'不知道最后工况、故障原因、异常维修或介质残留时，不能直接恢复原启停程序。'}
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
                  <h3>{'图纸、程序或铭牌缺失'}</h3>
                  <p>
                    {'控制版本、回路、设备参数和安全逻辑无法核对时，应先测绘、盘点并建立新基线。'}
                  </p>
                </article>
                <article className={'signal'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <circle cx={'12'} cy={'12'} r={'9'}></circle>
                      <path d={'M12 11v6M12 7h.01'}></path>
                    </svg>
                  </span>
                  <h3>{'搬迁拆解记录不完整'}</h3>
                  <p>
                    {'基础、定位、管线、接线和部件编号发生变化后，原安装与验收结论不能直接沿用。'}
                  </p>
                </article>
              </div>
            </section>
            <section className={'article-section'} id={'compare'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'03'}</span>
                <h2>{'重启、搬迁与再制造分别核对什么'}</h2>
              </div>
              <p className={'section-intro'}>
                {'四种任务的检查重点不同，不能用一份“通电试机”清单覆盖全部风险。'}
              </p>
              <div className={'comparison'}>
                <table>
                  <thead>
                    <tr>
                      <th scope={'col'}>{'任务方向'}</th>
                      <th scope={'col'}>{'优先核对'}</th>
                      <th scope={'col'}>{'不能直接沿用'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td data-label={'任务方向'}>{'原地重启'}</td>
                      <td data-label={'优先核对'}>
                        {'停机历史、绝缘、密封、执行机构、联锁与能源条件'}
                      </td>
                      <td data-label={'不能直接沿用'}>
                        {'原设计能力不能自动成为当前负载生产结果'}
                      </td>
                    </tr>
                    <tr>
                      <td data-label={'任务方向'}>{'搬迁复产'}</td>
                      <td data-label={'优先核对'}>
                        {'拆解编号、运输变形、基础、找正、管线和接口复原'}
                      </td>
                      <td data-label={'不能直接沿用'}>
                        {'原安装状态和旧验收记录不能替代新现场验证'}
                      </td>
                    </tr>
                    <tr>
                      <td data-label={'任务方向'}>{'旧炉再制造'}</td>
                      <td data-label={'优先核对'}>
                        {'结构完整性、安全系统、备件可得性和新工艺适配'}
                      </td>
                      <td data-label={'不能直接沿用'}>
                        {'炉体或安全边界不可恢复时，不能只靠更换外观件继续使用'}
                      </td>
                    </tr>
                    <tr>
                      <td data-label={'任务方向'}>{'机械系统大修'}</td>
                      <td data-label={'优先核对'}>
                        {'推杆、辊道、链条、液压、磨损、找正与负载动作'}
                      </td>
                      <td data-label={'不能直接沿用'}>
                        {'空载能转不等于负载下速度、定位和保护均符合要求'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
            <section className={'article-section'} id={'evidence'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'04'}</span>
                <h2>{'按适用项目形成复产证据'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '下列分组用于整理证据，具体试验顺序、介质和代表负载按设备确定。各项记录条件、结果、偏差和整改，避免用“已开机”替代完整复产验收。'
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
                    <h3>{'动作、绝缘与联锁检查'}</h3>
                    <p>
                      {
                        '核对旋向、行程、限位、阀门、急停、报警、绝缘和失效安全动作，记录缺陷与整改。'
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
                    <h3>{'按适用条件升温试运行'}</h3>
                    <p>
                      {
                        '依据炉衬材料、设备状态和工艺确认升温或烘炉条件、所需介质与保护要求；适合空载试验时才采用空载方式，并核对温区、循环、炉压、机械和报警。'
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
                    <h3>{'固定工件和工艺验证'}</h3>
                    <p>
                      {
                        '记录工件、装炉方式、负载、工艺曲线、测量方法和结果；不把空载结果直接作为负载验收结论。'
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
                    <h3>{'形成新的设备基线'}</h3>
                    <p>
                      {
                        '归档竣工图、程序与参数备份、报警清单、试验记录、培训资料、备件清单和后续检查计划。'
                      }
                    </p>
                  </div>
                </article>
              </div>
            </section>
            <section className={'article-section'} id={'inputs'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'05'}</span>
                <h2>{'提交设备现状，先判断检查与复产边界'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '建议提供炉型与工艺、停机原因和最后工况、设备照片、原图纸与程序、铭牌、维修记录、搬迁拆解记录、能源条件、目标工件和计划复产窗口。'
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
                  {'停机原因与最后工况'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'设备照片'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'原图纸与程序'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'铭牌与维修记录'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'搬迁拆解记录'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'能源条件'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'目标工件与复产窗口'}
                </li>
              </ul>
              <div className={'input-bottom'}>
                <p>{'先整理现有资料，再确认需要补充的信息。'}</p>
                <a
                  className={'button'}
                  href={'/downloads/reviewed-guides/restart-checklist.txt'}
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
                <a href={'/zh/service/furnace-relocation-restart'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                  </svg>
                  {'工业炉搬迁与复产服务'}
                </a>
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
              <p className={'intro-label'}>{'恢复生产前先确认'}</p>
              <h3>{'6 组设备状态'}</h3>
              <ul className={'boundary-list'}>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'停机原因与最后工况'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'基础、炉体与钢结构'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'炉衬、加热或燃烧系统'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'绝缘、测温与安全联锁'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'机械系统与能源管线'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'图纸、程序、铭牌与备件'}
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
                <a href={'/zh/solutions/rechuli-lu-kongzhi-xitong-shengji'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                  </svg>
                  {'控制系统升级'}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m9 5 7 7-7 7'}></path>
                  </svg>
                </a>
                <a
                  href={'/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan'}
                  className={'current'}
                  aria-current={'page'}
                >
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
              '公司批准公开的停产炉重启、搬迁复产与再制造检查方法。 本页已按正文技术审查意见修订，供文稿与版式确认；不代表具体设备已完成设计批准或现场验收。'
            }
          </p>
          <p>{'原页面标题：停产热处理炉重启与搬迁复产怎么评估？检查、试运行和验收清单'}</p>
        </details>
      </ReviewedDocument>
    </>
  );
}
