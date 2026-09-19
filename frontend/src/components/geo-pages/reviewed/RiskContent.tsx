import Image from 'next/image';
import { ReviewedDocument } from '../ReviewedDocument';
import styles from './guide.module.css';
import { ReviewedFaqs } from '../ReviewedFaqs';
import faqs from './risk-faqs.json';

/** Reviewed design content imported from output/six-guide-ui-drafts-20260915/risk.html; edit this JSX for future revisions. */
export function RiskContent() {
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
              <span>{'改造风险与停产安排'}</span>
            </nav>
            <div className={'guide-hero-grid'}>
              <div className={'guide-hero-copy'}>
                <p className={'guide-kicker'}>{'苏能工业炉 · 维修与改造指南'}</p>
                <h1>
                  {'改造风险与停产安排'}
                  <span>{'先查清边界，再定计划'}</span>
                </h1>
                <p className={'guide-hero-intro'}>
                  {
                    '把原炉状态、隐蔽工程、旧新接口、停产切换和验收条件放进同一套执行文件，减少施工中才暴露的问题。'
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
                    {'隐蔽工程'}
                  </li>
                  <li>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'m5 12 4 4L19 6'}></path>
                    </svg>
                    {'新旧接口'}
                  </li>
                  <li>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'m5 12 4 4L19 6'}></path>
                    </svg>
                    {'停产窗口'}
                  </li>
                </ul>
              </div>
              <figure className={'guide-hero-image'}>
                <Image
                  src={'/images/reviewed-guides/risk/risk-hero-v3.png'}
                  width={1672}
                  height={941}
                  alt={'两名工程人员在旧炉前核对接口，桌上摆放图纸和阶段计划'}
                  style={{ objectPosition: 'center center' }}
                  sizes="(max-width: 767px) 100vw, 50vw"
                  priority
                />
                <figcaption>{'改造评估示意：对照现场接口、图纸与施工计划'}</figcaption>
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
          <article className={'article-body'} aria-label={'改造风险与停产安排资料正文'}>
            <section className={'article-section'} id={'answer'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'01'}</span>
                <h2>{'风险来自边界不清，不只来自旧设备'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '设计制造周期与现场停产窗口不是同一个概念；节能、产能和温度结论也必须绑定约定测试条件。'
                }
              </p>
              <p className={'answer-copy'}>
                {
                  '老炉改造最常见的风险，是原设备状态、改造范围、旧新接口、停产窗口和验收条件没有在开工前说清。应把诊断结论、工程量、不可预见项、预制范围、切换回退、测试条件和责任边界写进同一套执行文件。'
                }
              </p>
              <ul className={'direct-checks'}>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'原炉状态结论'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'范围与未知项'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'旧新接口清单'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'停产切换计划'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'应急回退条件'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'负载验收口径'}
                </li>
              </ul>
            </section>
            <section className={'article-section'} id={'signals'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'02'}</span>
                <h2>{'出现这些信号时，不能直接报固定周期'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '资料不完整、现场与图纸不一致或验收条件未冻结，都会把原本可预制的工作推迟到停产窗口内。'
                }
              </p>
              <div className={'signal-grid'}>
                <article className={'signal'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <h3>{'拆检范围和未知项不清'}</h3>
                  <p>{'炉衬、钢结构、基础或管线存在未暴露区域时，应提前约定确认和变更机制。'}</p>
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
                  <h3>{'图纸、现场与接口不一致'}</h3>
                  <p>
                    {
                      '保留、替换、临时和新增接口没有逐项核对，切换时容易出现机械、电气或能源条件冲突。'
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
                  <h3>{'测试与验收条件未冻结'}</h3>
                  <p>
                    {
                      '负载、测点、仪器、统计周期和异常处理没有写清，改造完成后仍可能无法形成一致结论。'
                    }
                  </p>
                </article>
              </div>
            </section>
            <section className={'article-section'} id={'compare'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'03'}</span>
                <h2>{'把总周期拆成可执行阶段'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '只有拆开非停产工作与现场停产工作，才能判断哪些环节可以预制、哪些必须占用生产窗口。'
                }
              </p>
              <div className={'comparison'}>
                <table>
                  <thead>
                    <tr>
                      <th scope={'col'}>{'阶段'}</th>
                      <th scope={'col'}>{'主要工作'}</th>
                      <th scope={'col'}>{'影响判断'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td data-label={'阶段'}>{'诊断与设计'}</td>
                      <td data-label={'主要工作'}>{'现场检查、测绘、范围、接口和验收条件确认'}</td>
                      <td data-label={'影响判断'}>{'资料与停机检查条件不完整时按项目单独确认'}</td>
                    </tr>
                    <tr>
                      <td data-label={'阶段'}>{'采购与预制'}</td>
                      <td data-label={'主要工作'}>{'设备材料、控制柜、管线与模块预制'}</td>
                      <td data-label={'影响判断'}>{'非标件、交期和变更冻结时间影响准备周期'}</td>
                    </tr>
                    <tr>
                      <td data-label={'阶段'}>{'停产施工'}</td>
                      <td data-label={'主要工作'}>{'拆除、安装、接口切换与隐蔽工程处理'}</td>
                      <td data-label={'影响判断'}>
                        {'现场状态、交叉施工和未知工程量影响停产窗口'}
                      </td>
                    </tr>
                    <tr>
                      <td data-label={'阶段'}>{'调试与验收'}</td>
                      <td data-label={'主要工作'}>{'烘炉、热态调试、负载验证与问题关闭'}</td>
                      <td data-label={'影响判断'}>{'工艺条件、生产排程和复测安排影响复产时间'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
            <details className={'article-section extra-guide'} id={'buyer-selection'} open>
              <summary>
                {'旧台车炉改造需要先确认什么？'}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'m6 9 6 6 6-6'}></path>
                </svg>
              </summary>
              <p>
                {
                  '先确认要解决的问题、原炉真实状态、准备保留的部件和新旧接口，再确定停产窗口与验收方法。加长炉膛、换燃料、修炉衬或升级控制会牵动不同系统，不能只按“改一台旧炉”报价。图纸与现场不符、承载或公辅条件不清时，先安排测绘与检查；据检查结果再比较局部修复、系统改造和整炉替换。'
                }
              </p>
              <div className={'comparison'}>
                <table>
                  <thead>
                    <tr>
                      <th scope={'col'}>{'处理方向'}</th>
                      <th scope={'col'}>{'适用情况'}</th>
                      <th scope={'col'}>{'需要确认'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td data-label={'处理方向'}>{'局部修复'}</td>
                      <td data-label={'适用情况'}>
                        {
                          '问题位置明确，原炉主体和保留系统经检查仍适用，目标工艺与装载没有实质改变。'
                        }
                      </td>
                      <td data-label={'需要确认'}>
                        {'列明损伤、拆检未知项、修复界面和复测范围；现有资料不能保证局修必然够用。'}
                      </td>
                    </tr>
                    <tr>
                      <td data-label={'处理方向'}>{'系统改造'}</td>
                      <td data-label={'适用情况'}>
                        {'准备加长、换燃料、改变分区或控制，需要旧设备与新增部分共同工作。'}
                      </td>
                      <td data-label={'需要确认'}>
                        {
                          '逐项冻结利旧、替换、新增和买方配套；核对轨道基础、风烟气路、供电、信号与整炉测试。'
                        }
                      </td>
                    </tr>
                    <tr>
                      <td data-label={'处理方向'}>{'整炉替换比较'}</td>
                      <td data-label={'适用情况'}>
                        {
                          '检查发现原结构、接口或工艺适配条件难以保留，或改造风险与停产安排无法接受。'
                        }
                      </td>
                      <td data-label={'需要确认'}>
                        {
                          '在相同工件、目标和供货范围下比较新炉方案；没有现场诊断，不能承诺哪一种更省钱或更快。'
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <h3>{'加长会同时改变热负荷、分区和运行机构'}</h3>
              <p>
                {
                  '2019-06-23的案例067把有效长度由7m加到10m，加热由750kW增加300kW，控温由6区增加2区，还增加轮组和轨道并要求整炉复测。这些相互关联的改动支持先核对供电、承载、台车行程和新旧温区，再定工程量；原六区记录不能代替改后八区的整炉验收。'
                }
              </p>
              <a
                className={'text-link'}
                href={
                  '/zh/case/trolley-furnace-three-meter-extension-whole-furnace-retest-proposal'
                }
              >
                {'查看案例067：加长三米与整炉复测的关系'}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </a>
              <h3>{'保留风机和烟道，也要重新确认可用条件'}</h3>
              <p>
                {
                  '2018-11-13的案例013保留燃油系统，新增16套天然气烧嘴，两种模式共用原助燃与排烟系统，同时增做空气支管和换向装置。因此“利旧”仍涉及风量、压力、支路隔离、模式切换和故障保护的核对。原件未确认两种燃料同时混烧，16个炉温区也不等于另列选配的24点工件记录。'
                }
              </p>
              <a
                className={'text-link'}
                href={'/zh/case/large-trolley-dual-fuel-existing-air-flue-proposal'}
              >
                {'查看案例013：旧风烟系统与新增燃烧系统的接口'}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </a>
              <h3>{'换燃料前，把检测、选配和买方配套分开'}</h3>
              <p>
                {
                  '2018-02-26的案例069讨论冷煤气改天然气，保留8烧嘴、4区的配置数量；燃料管道拟更新，部分风烟设备利旧。2套氧分析为选配，2套一氧化碳报警由买方配置，两者用途不同。它能支持逐项核对气源、管道、阀组、检测与保护范围，不能证明已经实现氧反馈自动调节、节能或表面质量改善。'
                }
              </p>
              <a
                className={'text-link'}
                href={'/zh/case/bearing-wire-gas-conversion-oxygen-analysis-co-alarm-proposal'}
              >
                {'查看案例069：换气源、氧分析与报警供货边界'}
                <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                  <path d={'M5 12h14M13 6l6 6-6 6'}></path>
                </svg>
              </a>
              <h3>{'下一步准备'}</h3>
              <ol>
                <li>
                  {
                    '提供旧炉与轨道照片、原图和历次改造记录、故障表现、当前装载与温度记录，标出未检查位置。'
                  }
                </li>
                <li>
                  {
                    '说明新工件与工艺目标、供电或燃气条件、允许停产窗口，列出保留、替换、新增和现场自备项。'
                  }
                </li>
                <li>
                  {
                    '由设备与现场负责人确认旧新接口、施工阶段、异常回退和改后整炉测试大纲，再形成可执行的工期与报价。'
                  }
                </li>
              </ol>
              <h3>{'当前资料支持范围'}</h3>
              <p>
                {
                  '三个案例均为方案，未证明工程已经实施或通过验收；旧设备现状和现场可用条件尚未核查。现有资料不能给出固定停产天数、统一改造价格、节能比例或利旧寿命。燃烧保护与承载等最终设计仍需技术负责人确认。'
                }
              </p>
            </details>
            <section className={'article-section'} id={'evidence'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'04'}</span>
                <h2>{'交付时必须留下哪些风险关闭证据'}</h2>
              </div>
              <p className={'section-intro'}>
                {'“已经改完”不是验收证据；范围、变更、切换和测试条件都应可回查。'}
              </p>
              <div className={'evidence-grid'}>
                <article className={'evidence-block'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <div>
                    <h3>{'原炉状态与改造基线'}</h3>
                    <p>{'记录炉体、炉衬、热源、循环、控制、机械和安全状态，并标出未拆检区域。'}</p>
                  </div>
                </article>
                <article className={'evidence-block'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <div>
                    <h3>{'隐蔽工程与变更记录'}</h3>
                    <p>{'记录拆除后发现的问题、确认过程、追加边界、责任和对计划的影响。'}</p>
                  </div>
                </article>
                <article className={'evidence-block'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <div>
                    <h3>{'切换与应急回退记录'}</h3>
                    <p>{'记录停机条件、旧新接口、联锁测试、回退触发条件和异常关闭结果。'}</p>
                  </div>
                </article>
                <article className={'evidence-block'}>
                  <span className={'icon-box'}>
                    <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                      <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                    </svg>
                  </span>
                  <div>
                    <h3>{'负载与统计条件'}</h3>
                    <p>
                      {'记录工件、负载、测点、仪器、统计周期与异常工况；无法统一时按项目单独确认。'}
                    </p>
                  </div>
                </article>
              </div>
            </section>
            <section className={'article-section'} id={'inputs'}>
              <div className={'article-heading'}>
                <span className={'section-number'}>{'05'}</span>
                <h2>{'提交改造范围与生产窗口，先拆风险和阶段'}</h2>
              </div>
              <p className={'section-intro'}>
                {
                  '范围、接口和验收条件未确认时，只提供阶段判断，不承诺固定停产天数、固定总周期或无条件总价。'
                }
              </p>
              <ul className={'input-list'}>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'原炉图纸与现场照片'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'历史故障与维修记录'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'保留和替换范围'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'目标工艺与产能'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'可用停产窗口'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'交叉施工条件'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'旧新系统接口'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'计划验收指标'}
                </li>
              </ul>
              <div className={'input-bottom'}>
                <p>{'先整理现有资料，再确认需要补充的信息。'}</p>
                <a
                  className={'button'}
                  href={'/downloads/reviewed-guides/risk-checklist.txt'}
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
              <p className={'intro-label'}>{'开工前先锁定'}</p>
              <h3>{'范围、接口与验收'}</h3>
              <ul className={'boundary-list'}>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'已知与未知工程量'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'图纸和现场差异'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'旧新系统接口'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'停产与交叉施工'}
                </li>
                <li>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m5 12 4 4L19 6'}></path>
                  </svg>
                  {'切换和应急回退'}
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
                <a href={'/zh/solutions/rechuli-lu-tingchan-chongqi-banqian-fuchan'}>
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h8'}></path>
                  </svg>
                  {'停产与搬迁复产'}
                  <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
                    <path d={'m9 5 7 7-7 7'}></path>
                  </svg>
                </a>
                <a
                  href={'/zh/solutions/rechuli-lu-gaizao-fengxian-zhouqi'}
                  className={'current'}
                  aria-current={'page'}
                >
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
          <p>{'公司批准公开的改造项目管理方法、阶段周期与项目事实边界。 '}</p>
          <p>{'原页面标题：热处理炉改造有哪些风险？'}</p>
        </details>
      </ReviewedDocument>
    </>
  );
}
