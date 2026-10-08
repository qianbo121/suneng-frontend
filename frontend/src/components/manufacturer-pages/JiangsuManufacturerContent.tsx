import Image from 'next/image';
import { TrackedContactLink } from '@/components/lead/TrackedContactLink';
import { ManufacturerFaqs } from './ManufacturerFaqs';
import faqs from './jiangsu-faqs.json';
import styles from './ManufacturerPages.module.css';

/** Approved two-page UI v3, with the reviewed temperature-uniformity clarification. */
export function JiangsuManufacturerContent() {
  return (
    <div className={styles.page} lang="zh" data-manufacturer-page="jiangsu">
      <section className={'hero'}>
        <Image
          src={'/images/about/about_img_hero_factory_01.png'}
          alt={'苏能工业炉生产基地外景'}
          fill
          priority
          sizes={'(max-width: 900px) 1500px, 100vw'}
        />
        <div className={'container hero-inner'}>
          <div className={'hero-copy'}>
            <p className={'eyebrow'}>{'江苏苏能工业炉有限公司 · 定制与改造服务'}</p>
            <h1>
              {'江苏工业炉厂家'}
              <br />
              {'定制、节能改造与大修'}
            </h1>
            <p>
              {
                '立足江苏泰州，为热处理工业炉新建、旧炉改造与大修项目提供设备及服务，结合工况、设备现状和现场条件安排实施。'
              }
            </p>
            <p className={'hero-note'}>{'制造基地与资料可查 · 设备方案与现场分工一起沟通'}</p>
            <div className={'actions'}>
              <a className={'button primary'} href={'/zh/inquiry'}>
                {'提交工况，咨询方案'}
                <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                  <path
                    d={'M5 12h14M13 6l6 6-6 6'}
                    fill={'none'}
                    stroke={'currentColor'}
                    strokeWidth={'1.8'}
                    strokeLinecap={'round'}
                    strokeLinejoin={'round'}
                  ></path>
                </svg>
              </a>
              <a className={'button light'} href={'#repair'}>
                {'查看改造与费用'}
                <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                  <path
                    d={'M5 12h14M13 6l6 6-6 6'}
                    fill={'none'}
                    stroke={'currentColor'}
                    strokeWidth={'1.8'}
                    strokeLinecap={'round'}
                    strokeLinejoin={'round'}
                  ></path>
                </svg>
              </a>
            </div>
            <TrackedContactLink kind="phone" position="manufacturer_hero_phone" purpose="sales" className={'hero-phone'} href={'tel:+8613052986814'}>
              {'电话咨询：130-5298-6814'}
            </TrackedContactLink>
          </div>
        </div>
      </section>
      <div className={'pathbar'}>
        <div className={'container path-inner'}>
          <nav className={'breadcrumb'} aria-label={'面包屑'}>
            <a href={'/zh'}>{'首页'}</a>
            <span>{'/'}</span>
            <a href={'/zh/service/selection-retrofit-guide'}>{'选型与改造指南'}</a>
            <span>{'/'}</span>
            <span>{'江苏工业炉厂家'}</span>
          </nav>
          <nav className={'anchors'} aria-label={'页面章节'}>
            <a className={'anchor'} href={'#proof'}>
              {'厂家依据'}
              <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                <path
                  d={'M5 12h14M13 6l6 6-6 6'}
                  fill={'none'}
                  stroke={'currentColor'}
                  strokeWidth={'1.8'}
                  strokeLinecap={'round'}
                  strokeLinejoin={'round'}
                ></path>
              </svg>
            </a>
            <a className={'anchor'} href={'#selection'}>
              {'厂家怎么选'}
              <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                <path
                  d={'M5 12h14M13 6l6 6-6 6'}
                  fill={'none'}
                  stroke={'currentColor'}
                  strokeWidth={'1.8'}
                  strokeLinecap={'round'}
                  strokeLinejoin={'round'}
                ></path>
              </svg>
            </a>
            <a className={'anchor'} href={'#repair'}>
              {'修还是换'}
              <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                <path
                  d={'M5 12h14M13 6l6 6-6 6'}
                  fill={'none'}
                  stroke={'currentColor'}
                  strokeWidth={'1.8'}
                  strokeLinecap={'round'}
                  strokeLinejoin={'round'}
                ></path>
              </svg>
            </a>
            <a className={'anchor'} href={'#price'}>
              {'改造费用'}
              <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                <path
                  d={'M5 12h14M13 6l6 6-6 6'}
                  fill={'none'}
                  stroke={'currentColor'}
                  strokeWidth={'1.8'}
                  strokeLinecap={'round'}
                  strokeLinejoin={'round'}
                ></path>
              </svg>
            </a>
          </nav>
        </div>
      </div>
      <section id={'answer'} className={'section '}>
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'江苏有没有做工业炉定制、节能改造和大修的厂家？'}</h2>
            <p>{'苏能位于江苏泰州，面向热处理工业炉新建、旧炉改造和大修需求。'}</p>
          </div>
          <div className={'answer-box'}>
            <p>
              <strong>
                {
                  '江苏苏能工业炉有限公司成立于 2006 年，生产基地位于江苏省泰州市姜堰区张甸蔡官工业区，提供工业炉及热处理装备设计制造、系统集成、安装调试、改造和售后支持。'
                }
              </strong>
              {
                '新建项目从工件、工艺和产能开始；旧炉项目从设备现状、运行问题与改造目标开始，进一步确认设备方案和现场配合。'
              }
            </p>
            <nav aria-label={'核对依据'}>
              <a className={'text-link'} href={'#proof'}>
                {'查看制造与服务依据'}
                <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                  <path
                    d={'M5 12h14M13 6l6 6-6 6'}
                    fill={'none'}
                    stroke={'currentColor'}
                    strokeWidth={'1.8'}
                    strokeLinecap={'round'}
                    strokeLinejoin={'round'}
                  ></path>
                </svg>
              </a>
              <a className={'text-link'} href={'#repair'}>
                {'判断维修、改造还是换新'}
                <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                  <path
                    d={'M5 12h14M13 6l6 6-6 6'}
                    fill={'none'}
                    stroke={'currentColor'}
                    strokeWidth={'1.8'}
                    strokeLinecap={'round'}
                    strokeLinejoin={'round'}
                  ></path>
                </svg>
              </a>
              <a className={'text-link'} href={'/zh/solutions/rechuli-lu-changjia'}>
                {'查看炉型与厂家能力'}
                <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                  <path
                    d={'M5 12h14M13 6l6 6-6 6'}
                    fill={'none'}
                    stroke={'currentColor'}
                    strokeWidth={'1.8'}
                    strokeLinecap={'round'}
                    strokeLinejoin={'round'}
                  ></path>
                </svg>
              </a>
            </nav>
          </div>
        </div>
      </section>
      <section id={'proof'} className={'section soft'}>
        <span className="legacy-anchor" id={'cases'} aria-hidden="true" />
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'先看苏能的制造基地与公开资料'}</h2>
            <p>{'厂址、制造现场和企业资质可核对；具体项目再确认设备范围与现场安排。'}</p>
          </div>
          <div className={'regional-proof'}>
            <figure className={'proof-media'}>
              <Image
                src={'/images/about/about-furnace-fabrication.jpg'}
                width={2000}
                height={1125}
                loading={'lazy'}
                alt={'江苏泰州苏能工业炉制造车间'}
                sizes={'(max-width: 900px) 100vw, 50vw'}
              />
              <figcaption>{'江苏泰州 · 苏能炉体制造与装配车间'}</figcaption>
              <a className={'text-link'} href={'/zh/about'}>
                {'查看公司与制造资料'}
                <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                  <path
                    d={'M5 12h14M13 6l6 6-6 6'}
                    fill={'none'}
                    stroke={'currentColor'}
                    strokeWidth={'1.8'}
                    strokeLinecap={'round'}
                    strokeLinejoin={'round'}
                  ></path>
                </svg>
              </a>
            </figure>
            <div className={'proof-list'}>
              <div className={'proof-item'}>
                <span className={'evidence-label'}>{'从哪里服务'}</span>
                <h3>{'基地位于泰州姜堰'}</h3>
                <p>{'厂址为张甸蔡官工业区。可先说明项目方向，沟通到厂交流或是否需要现场评估。'}</p>
              </div>
              <div className={'proof-item'}>
                <span className={'evidence-label'}>{'提供哪些服务'}</span>
                <h3>{'设备定制、改造与大修'}</h3>
                <p>
                  {
                    '制造、安装调试和售后支持按项目范围安排；运输、吊装、基础及能源接入的责任在方案中列清。'
                  }
                </p>
                <a className={'text-link'} href={'/zh/service/furnace-renovation-overhaul'}>
                  {'查看改造与大修服务'}
                  <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                    <path
                      d={'M5 12h14M13 6l6 6-6 6'}
                      fill={'none'}
                      stroke={'currentColor'}
                      strokeWidth={'1.8'}
                      strokeLinecap={'round'}
                      strokeLinejoin={'round'}
                    ></path>
                  </svg>
                </a>
              </div>
              <div className={'proof-item'}>
                <span className={'evidence-label'}>{'哪些资料可以核对'}</span>
                <h3>{'企业资质与设备项目记录'}</h3>
                <p>
                  {
                    '可查看国家高新技术企业、质量管理体系认证及已公开设备项目。设备项目用于了解工艺和供货范围，不能代替旧炉改造的实测效果。'
                  }
                </p>
                <div className={'evidence-links'}>
                  <a className={'text-link'} href={'/zh/strength/honors'}>
                    {'查看企业资质'}
                    <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                      <path
                        d={'M5 12h14M13 6l6 6-6 6'}
                        fill={'none'}
                        stroke={'currentColor'}
                        strokeWidth={'1.8'}
                        strokeLinecap={'round'}
                        strokeLinejoin={'round'}
                      ></path>
                    </svg>
                  </a>
                  <a className={'text-link'} href={'https://www.jssngyl.cn/zh/case/henan-annealing-solution-line'}>
                    {'查看公开设备项目'}
                    <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                      <path
                        d={'M5 12h14M13 6l6 6-6 6'}
                        fill={'none'}
                        stroke={'currentColor'}
                        strokeWidth={'1.8'}
                        strokeLinecap={'round'}
                        strokeLinejoin={'round'}
                      ></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id={'scope'} className={'section'}>
        <span className="legacy-anchor" id={'services'} aria-hidden="true" />
        <span className="legacy-anchor" id={'products'} aria-hidden="true" />
        <span className="legacy-anchor" id={'industries'} aria-hidden="true" />
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'江苏工业炉厂家怎么选，先区分这三类需求'}</h2>
            <p>
              {'新建、改造、大修需要的资料和判断重点不同；把问题说清楚，厂家才能判断是否适配。'}
            </p>
          </div>
          <div className={'decision-table'}>
            <table>
              <thead>
                <tr>
                  <th>{'项目类型'}</th>
                  <th>{'先提供什么'}</th>
                  <th>{'重点判断与下一步'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label={'项目类型'}>{'新炉定制或新建热处理线'}</td>
                  <td data-label={'先提供什么'}>
                    {'工件材质、尺寸、装炉量或产能、工艺温度、能源与现场空间。'}
                  </td>
                  <td data-label={'重点判断与下一步'}>
                    {'先定设备方向和工艺链，再核配套、现场条件及验收范围。'}
                    <a className={'text-link'} href={'/zh/products'}>
                      {'设备与生产线'}
                      <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                        <path
                          d={'M5 12h14M13 6l6 6-6 6'}
                          fill={'none'}
                          stroke={'currentColor'}
                          strokeWidth={'1.8'}
                          strokeLinecap={'round'}
                          strokeLinejoin={'round'}
                        ></path>
                      </svg>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td data-label={'项目类型'}>{'旧炉能耗高、质量波动或控制落后'}</td>
                  <td data-label={'先提供什么'}>
                    {'铭牌、照片、运行与能耗记录、工艺曲线、产品目标和停产条件。'}
                  </td>
                  <td data-label={'重点判断与下一步'}>
                    {'先区分工况变化与设备问题，再确定测温、炉衬、加热、控制或输送等评估范围。'}
                    <a className={'text-link'} href={'/zh/service/furnace-renovation-overhaul'}>
                      {'节能改造与大修'}
                      <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                        <path
                          d={'M5 12h14M13 6l6 6-6 6'}
                          fill={'none'}
                          stroke={'currentColor'}
                          strokeWidth={'1.8'}
                          strokeLinecap={'round'}
                          strokeLinejoin={'round'}
                        ></path>
                      </svg>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td data-label={'项目类型'}>{'维修、大修、搬迁或停产复产'}</td>
                  <td data-label={'先提供什么'}>
                    {'故障现象、设备结构与状态、已有图纸、现场接口和计划时间。'}
                  </td>
                  <td data-label={'重点判断与下一步'}>
                    {'先判断保留价值、可修范围及资料完整性，再安排现场检查和实施。'}
                    <a className={'text-link'} href={'/zh/service/furnace-relocation-restart'}>
                      {'搬迁与复产'}
                      <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                        <path
                          d={'M5 12h14M13 6l6 6-6 6'}
                          fill={'none'}
                          stroke={'currentColor'}
                          strokeWidth={'1.8'}
                          strokeLinecap={'round'}
                          strokeLinejoin={'round'}
                        ></path>
                      </svg>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section id={'selection'} className={'section soft'}>
        <span className="legacy-anchor" id={'selection-reference'} aria-hidden="true" />
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'江苏有没有做工业炉节能改造比较靠谱的厂家？'}</h2>
            <p>
              {
                '可以联系苏能评估热处理工业炉项目。选择前，用相近工况、检查方案、供货分工和验收售后四项资料比较。'
              }
            </p>
          </div>
          <div className={'checklist'}>
            <div>
              <h3>{'看相近工况，不只看案例名称'}</h3>
              <p>
                {
                  '对照工件、工艺、温度、装载和产能，核实项目资料与本次需求的相似性。换了材料、节拍或质量目标，原配置可能不适用。'
                }
              </p>
            </div>
            <div>
              <h3>{'看检查顺序，不先承诺节能比例'}</h3>
              <p>
                {
                  '先说明如何核对原炉状态、生产工况和能源计量，再谈改造方向。没有可比工况及计量边界时，不能用一个百分比代表所有旧炉。'
                }
              </p>
            </div>
            <div>
              <h3>{'看供货分工，不只看报价总额'}</h3>
              <p>
                {'列明设备、拆装、运输、吊装、基础、能源接入和调试范围，识别未含项及现场配合责任。'}
              </p>
            </div>
            <div>
              <h3>{'看验收与售后，不只看完工时间'}</h3>
              <p>
                {
                  '确认设备指标、试运行工况、检查记录和交接资料；售后范围、响应方式与费用按项目约定。'
                }
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id={'repair'} className={'section soft'}>
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'旧热处理炉是维修、大修、改造，还是换新？'}</h2>
            <p>{'选择取决于原设备保留价值、工艺变化和改造边界，不能仅凭设备年限判断。'}</p>
          </div>
          <div className={'decision-table'}>
            <table>
              <thead>
                <tr>
                  <th>{'当前条件'}</th>
                  <th>{'优先评估的方向'}</th>
                  <th>{'为什么要这样比较'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label={'当前条件'}>{'原工艺基本不变，问题较局部'}</td>
                  <td data-label={'优先评估的方向'}>{'维修或局部更换。'}</td>
                  <td data-label={'为什么要这样比较'}>
                    {'先明确故障范围，避免把局部问题扩大成整炉重建。'}
                  </td>
                </tr>
                <tr>
                  <td data-label={'当前条件'}>{'炉体及主要结构仍有利用价值，多系统需要恢复'}</td>
                  <td data-label={'优先评估的方向'}>{'大修，或与局部改造结合。'}</td>
                  <td data-label={'为什么要这样比较'}>
                    {'核对保留部分、拆装工程量、恢复目标和停产安排。'}
                  </td>
                </tr>
                <tr>
                  <td data-label={'当前条件'}>{'气氛、温度、产能、质量或生产方式明显变化'}</td>
                  <td data-label={'优先评估的方向'}>{'系统改造与新设备同时比较。'}</td>
                  <td data-label={'为什么要这样比较'}>
                    {'新要求可能改变加热、炉衬、控制、冷却或输送，不能只比较换几个部件。'}
                  </td>
                </tr>
                <tr>
                  <td data-label={'当前条件'}>{'拟保留部分已无法满足新工艺或现场条件'}</td>
                  <td data-label={'优先评估的方向'}>{'重点比较换新。'}</td>
                  <td data-label={'为什么要这样比较'}>
                    {'把改造投入、停产、后续维护及满足目标的可行性放在同一口径下比较。'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={'callout'}>
            {'这张表用于初步沟通；实际设备需要结合检查资料确认保留价值和技术可行性。'}
            <a className={'text-link'} href={'/zh/articles/laojiu-rechuli-lu-daxiu-haishi-maixin'}>
              {'查看修、改、换的详细判断'}
              <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                <path
                  d={'M5 12h14M13 6l6 6-6 6'}
                  fill={'none'}
                  stroke={'currentColor'}
                  strokeWidth={'1.8'}
                  strokeLinecap={'round'}
                  strokeLinejoin={'round'}
                ></path>
              </svg>
            </a>
          </div>
        </div>
      </section>
      <section id={'price'} className={'section '}>
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'工业炉节能改造多少钱，预算主要看什么？'}</h2>
            <p>
              {
                '改造费用取决于需处理的系统、设备尺寸与状态、现场工程量、试运行及验收范围，不能按“节能改造”四个字报统一价格。'
              }
            </p>
          </div>
          <div className={'checklist'}>
            <div>
              <h3>{'先定改造范围'}</h3>
              <p>
                {'炉衬、加热或燃烧、控制、测温、传动等单项处理，与多系统改造的设备和工程量不同。'}
              </p>
            </div>
            <div>
              <h3>{'再核隐藏与现场条件'}</h3>
              <p>
                {'旧炉资料、拆检结果、保留件状态、作业空间和能源接口，都会影响可明确报价的范围。'}
              </p>
            </div>
            <div>
              <h3>{'分开设备费与现场费'}</h3>
              <p>{'核对设备材料、拆装、运输、吊装、施工、调试和差旅是否包含，避免只比较总价。'}</p>
            </div>
            <div>
              <h3>{'最后对齐验收口径'}</h3>
              <p>
                {
                  '温度、节拍、工件质量或能耗分别核对条件与记录方式；指标变动可能带来新的设备和测试要求。'
                }
              </p>
            </div>
          </div>
          <div className={'callout'}>
            {'费用细项与资料准备，继续查看已有专题；这里先帮助您明确询价方向。'}
            <a
              className={'text-link'}
              href={
                '/zh/news/re-chu-li-lu-jie-neng-gai-zao-duo-shao-qian-fei-yong-gou-cheng-yu-suan-ying-xiang-yin-su-he-xun-jia-qian-zhun-bei'
              }
            >
              {'热处理炉节能改造费用构成'}
              <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                <path
                  d={'M5 12h14M13 6l6 6-6 6'}
                  fill={'none'}
                  stroke={'currentColor'}
                  strokeWidth={'1.8'}
                  strokeLinecap={'round'}
                  strokeLinejoin={'round'}
                ></path>
              </svg>
            </a>
          </div>
        </div>
      </section>
      <section id={'site'} className={'section soft'}>
        <span className="legacy-anchor" id={'regional-delivery'} aria-hidden="true" />
        <span className="legacy-anchor" id={'region'} aria-hidden="true" />
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'项目在江苏及周边，需要提前确认哪些现场条件？'}</h2>
            <p>
              {'距离影响运输和人员安排，但不能代替工况与能力匹配。技术适配和责任分工仍应先确认。'}
            </p>
          </div>
          <div className={'decision-table'}>
            <table>
              <thead>
                <tr>
                  <th>{'现场条件'}</th>
                  <th>{'提供哪些资料'}</th>
                  <th>{'影响什么决定'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label={'现场条件'}>{'厂址、通道与吊装'}</td>
                  <td data-label={'提供哪些资料'}>
                    {'项目地址、厂房入口、运输与转弯空间、设备尺寸重量、可用起重条件。'}
                  </td>
                  <td data-label={'影响什么决定'}>{'整机或分段运输、卸车进场和吊装方案。'}</td>
                </tr>
                <tr>
                  <td data-label={'现场条件'}>{'基础与能源'}</td>
                  <td data-label={'提供哪些资料'}>
                    {'平面布置、基础或地坑、电源容量、燃气、冷却及相关接口资料。'}
                  </td>
                  <td data-label={'影响什么决定'}>{'设备就位、能源接入及配套工程责任。'}</td>
                </tr>
                <tr>
                  <td data-label={'现场条件'}>{'生产与停产'}</td>
                  <td data-label={'提供哪些资料'}>
                    {'当前工艺、班次产量、允许停产窗口、可预制内容与作业限制。'}
                  </td>
                  <td data-label={'影响什么决定'}>{'施工切换、到场时间、调试和复产安排。'}</td>
                </tr>
                <tr>
                  <td data-label={'现场条件'}>{'试运行与交接'}</td>
                  <td data-label={'提供哪些资料'}>
                    {'试验工件、检查目标、现场对接人、验收与资料要求。'}
                  </td>
                  <td data-label={'影响什么决定'}>{'何时具备试运行条件，如何确认完成并交接。'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={'callout'}>
            <strong>{'服务安排：'}</strong>
            {
              '是否需要到场、服务时间、差旅和现场费用，结合项目位置、设备状态、合同范围及工程排期确认。'
            }
            <a className={'text-link'} href={'/zh/service/installation-after-sales'}>
              {'查看安装与售后'}
              <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                <path
                  d={'M5 12h14M13 6l6 6-6 6'}
                  fill={'none'}
                  stroke={'currentColor'}
                  strokeWidth={'1.8'}
                  strokeLinecap={'round'}
                  strokeLinejoin={'round'}
                ></path>
              </svg>
            </a>
          </div>
        </div>
      </section>
      <section id={'prepare'} className={'section '}>
        <span className="legacy-anchor" id={'params'} aria-hidden="true" />
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'热处理炉改造前，需要准备哪些资料给厂家？'}</h2>
            <p>{'先给能描述现状和目标的资料，再补影响方案的关键缺项；资料不全也可以启动沟通。'}</p>
          </div>
          <div className={'checklist'}>
            <div>
              <h3>{'设备现状'}</h3>
              <p>
                {
                  '设备铭牌、全景及关键部位照片、已有图纸、故障和维修记录，用于判断原设备结构及资料缺口。'
                }
              </p>
            </div>
            <div>
              <h3>{'工件与目标'}</h3>
              <p>
                {
                  '材质、尺寸、装炉量、工艺曲线、当前问题与希望达到的目标，用于区分修复原能力还是改变工艺。'
                }
              </p>
            </div>
            <div>
              <h3>{'运行与能耗'}</h3>
              <p>
                {'产量、班次、同类工况的能源记录及测量方式，用于判断问题和比较改造前后的口径。'}
              </p>
            </div>
            <div>
              <h3>{'现场与实施'}</h3>
              <p>{'厂址、平面、能源接口、吊装、停产及现场负责人，用于安排勘查和界定双方分工。'}</p>
            </div>
          </div>
          <div className={'callout'}>
            {'运行记录请带上对应产量、工艺和统计时间，便于比较。'}
            <a
              className={'text-link'}
              href={
                '/zh/news/re-chu-li-lu-gai-zao-qian-xu-yao-zhun-bei-na-xie-zi-liao-yi-fen-gei-chang-jia-gou-tong-de-ping-gu-qing-dan'
              }
            >
              {'查看改造前资料评估清单'}
              <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                <path
                  d={'M5 12h14M13 6l6 6-6 6'}
                  fill={'none'}
                  stroke={'currentColor'}
                  strokeWidth={'1.8'}
                  strokeLinecap={'round'}
                  strokeLinejoin={'round'}
                ></path>
              </svg>
            </a>
          </div>
        </div>
      </section>
      <section id={'questions'} className={'section soft'}>
        <span className="legacy-anchor" id={'faq'} aria-hidden="true" />
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'改造费用、停产和售后常见问题'}</h2>
            <p>{'结合项目现状确认费用、时间与服务安排，资料不全也可以先咨询。'}</p>
          </div>
          <ManufacturerFaqs items={faqs} />
        </div>
      </section>
      <section id={'next'} className={'section '}>
        <span className="legacy-anchor" id={'related'} aria-hidden="true" />
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'根据您的项目，继续查看详细资料'}</h2>
            <p>{'新炉、整线和旧炉项目，可继续查看对应的设备与采购资料。'}</p>
          </div>
          <div className={'cards'}>
            <article className={'card'}>
              <h3>{'热处理炉厂家能力'}</h3>
              <p>{'核对炉型、工艺、报价条件、制造资料和交付节点。'}</p>
              <a className={'text-link'} href={'/zh/solutions/rechuli-lu-changjia'}>
                {'查看厂家能力'}
                <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                  <path
                    d={'M5 12h14M13 6l6 6-6 6'}
                    fill={'none'}
                    stroke={'currentColor'}
                    strokeWidth={'1.8'}
                    strokeLinecap={'round'}
                    strokeLinejoin={'round'}
                  ></path>
                </svg>
              </a>
            </article>
            <article className={'card'}>
              <h3>{'单台炉报价'}</h3>
              <p>{'为新炉或单机项目整理尺寸、温度、装炉量与配置要求。'}</p>
              <a className={'text-link'} href={'/zh/articles/gongye-lu-baojia-canshu'}>
                {'查看报价资料清单'}
                <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                  <path
                    d={'M5 12h14M13 6l6 6-6 6'}
                    fill={'none'}
                    stroke={'currentColor'}
                    strokeWidth={'1.8'}
                    strokeLinecap={'round'}
                    strokeLinejoin={'round'}
                  ></path>
                </svg>
              </a>
            </article>
            <article className={'card'}>
              <h3>{'连续热处理生产线'}</h3>
              <p>{'整线新建或扩产，先核工艺链、节拍和配套责任。'}</p>
              <a className={'text-link'} href={'/zh/solutions/continuous-heat-treatment-line'}>
                {'查看整线规划'}
                <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                  <path
                    d={'M5 12h14M13 6l6 6-6 6'}
                    fill={'none'}
                    stroke={'currentColor'}
                    strokeWidth={'1.8'}
                    strokeLinecap={'round'}
                    strokeLinejoin={'round'}
                  ></path>
                </svg>
              </a>
            </article>
          </div>
        </div>
      </section>
      <section id={'contact'} className={'section soft'}>
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'把设备现状和项目位置发来，沟通改造方向'}</h2>
            <p>
              {
                '旧炉先给铭牌、照片、现有问题与停产计划；新建项目先给工件、工艺和产能。资料不全，也可以先沟通下一步。'
              }
            </p>
          </div>
          <div className={'contact-actions'}>
            <a className={'button primary'} href={'/zh/inquiry'}>
              {'提交工况，咨询方案'}
              <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                <path
                  d={'M5 12h14M13 6l6 6-6 6'}
                  fill={'none'}
                  stroke={'currentColor'}
                  strokeWidth={'1.8'}
                  strokeLinecap={'round'}
                  strokeLinejoin={'round'}
                ></path>
              </svg>
            </a>
            <a className={'button outline'} href={'/zh/articles/gongye-lu-baojia-canshu'}>
              {'查看报价资料清单'}
              <svg aria-hidden={'true'} viewBox={'0 0 24 24'} width={'18'} height={'18'}>
                <path
                  d={'M5 12h14M13 6l6 6-6 6'}
                  fill={'none'}
                  stroke={'currentColor'}
                  strokeWidth={'1.8'}
                  strokeLinecap={'round'}
                  strokeLinejoin={'round'}
                ></path>
              </svg>
            </a>
            <TrackedContactLink kind="phone" position="manufacturer_bottom_phone" purpose="sales" className={'phone'} href={'tel:+8613052986814'}>
              {'电话：130-5298-6814（同号微信）'}
            </TrackedContactLink>
          </div>
        </div>
      </section>
    </div>
  );
}
