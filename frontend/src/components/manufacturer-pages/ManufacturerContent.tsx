import Image from 'next/image';
import { TrackedContactLink } from '@/components/lead/TrackedContactLink';
import { ManufacturerFaqs } from './ManufacturerFaqs';
import faqs from './manufacturer-faqs.json';
import styles from './ManufacturerPages.module.css';

/** Approved two-page UI v3, with the reviewed temperature-uniformity clarification. */
export function ManufacturerContent() {
  return (
    <div className={styles.page} lang="zh" data-manufacturer-page="manufacturer">
      <section className={'hero'}>
        <Image
          src={'/images/about/about_img_hero_factory_01.png'}
          alt={'苏能工业炉生产基地外景'}
          fill
          priority
          sizes={'100vw'}
        />
        <div className={'container hero-inner'}>
          <div className={'hero-copy'}>
            <p className={'eyebrow'}>{'江苏苏能工业炉有限公司 · 非标设备与生产线'}</p>
            <h1>
              {'热处理炉厂家'}
              <br />
              {'按工况定制设备与产线'}
            </h1>
            <p>
              {
                '苏能提供工业炉及热处理装备设计、制造、安装调试、改造与售后支持。从工件、工艺和产能出发，沟通适配的设备与配套。'
              }
            </p>
            <p className={'hero-note'}>
              {'成立于 2006 年 · 江苏泰州制造基地 · 制造、资质与项目资料可查'}
            </p>
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
              <a className={'button light'} href={'#equipment'}>
                {'查看炉型与报价'}
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
            <span>{'热处理炉厂家'}</span>
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
            <a className={'anchor'} href={'#equipment'}>
              {'炉型适配'}
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
              {'报价条件'}
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
            <a className={'anchor'} href={'#questions'}>
              {'常见问题'}
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
            <h2>{'苏能能为您的热处理项目提供什么？'}</h2>
            <p>{'从单台炉到连续热处理生产线，按工件、工艺和生产安排确定设备方案。'}</p>
          </div>
          <div className={'answer-box'}>
            <p>
              <strong>
                {
                  '江苏苏能工业炉有限公司成立于 2006 年，位于江苏泰州，提供工业炉及热处理装备的设计、制造、系统集成、安装调试、改造和售后支持。'
                }
              </strong>
              {
                '新建项目可沟通炉型与配套，旧炉项目可评估维修、大修和改造范围。苏能提供设备及改造服务，不直接提供按件收费的热处理加工。'
              }
            </p>
            <nav aria-label={'核对依据'}>
              <a className={'text-link'} href={'#proof'}>
                {'先看制造与项目资料'}
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
              <a className={'text-link'} href={'#equipment'}>
                {'按工件选择炉型'}
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
              <a className={'text-link'} href={'/zh/solutions/jiangsu-gongye-lu-changjia'}>
                {'了解江苏项目配合'}
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
        <span className="legacy-anchor" id={'capabilities'} aria-hidden="true" />
        <span className="legacy-anchor" id={'cases'} aria-hidden="true" />
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'制造现场、企业资质与公开项目，都有资料可查'}</h2>
            <p>{'先了解苏能，再把对应资料与您的工件、工艺及供货要求对照。'}</p>
          </div>
          <div className={'proof'}>
            <figure className={'proof-media'}>
              <Image
                src={'/images/about/about-furnace-fabrication.jpg'}
                width={2000}
                height={1125}
                loading={'lazy'}
                alt={'苏能工业炉炉体制作与装配车间'}
                sizes={'(max-width: 900px) 100vw, 50vw'}
              />
              <figcaption>{'苏能炉体制造与装配车间 · 图片来自现有公司介绍'}</figcaption>
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
                <span className={'evidence-label'}>{'制造基地'}</span>
                <h3>{'成立于 2006 年，位于江苏泰州'}</h3>
                <p>
                  {
                    '基地位于姜堰区张甸蔡官工业区。可结合项目需求，了解炉体制造、装配、配套及交付内容。'
                  }
                </p>
              </div>
              <div className={'proof-item'}>
                <span className={'evidence-label'}>{'企业资质'}</span>
                <h3>{'高新技术企业与质量管理体系认证'}</h3>
                <p>
                  {
                    '国家高新技术企业、ISO 9001 质量管理体系认证资料可查。现有质量体系证书有效期至 2027 年 1 月 11 日，采购时核对原件与适用范围。'
                  }
                </p>
                <a className={'text-link'} href={'/zh/strength/honors'}>
                  {'查看证书原件与专利资料'}
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
                <span className={'evidence-label'}>{'公开项目'}</span>
                <h3>{'河南连续退火固溶项目'}</h3>
                <p>
                  {
                    '可查看不锈钢带材工艺段、分段冷却及上下游接口的公开记录。记录未公布实测能耗、产量或验收成果，适合作为项目范围的参考。'
                  }
                </p>
                <a className={'text-link'} href={'https://www.jssngyl.cn/zh/case/henan-annealing-solution-line'}>
                  {'查看项目条件与供货范围'}
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
      </section>
      <section id={'equipment'} className={'section'}>
        <span className="legacy-anchor" id={'products'} aria-hidden="true" />
        <span className="legacy-anchor" id={'selection-reference'} aria-hidden="true" />
        <span className="legacy-anchor" id={'selection'} aria-hidden="true" />
        <span className="legacy-anchor" id={'industries'} aria-hidden="true" />
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'什么工件适合什么热处理炉？'}</h2>
            <p>{'按工件和生产方式初选，再结合材料、温度、装载、气氛及现场条件确认。'}</p>
          </div>
          <div className={'decision-table'}>
            <table>
              <thead>
                <tr>
                  <th>{'工件与生产条件'}</th>
                  <th>{'优先比较的设备方向'}</th>
                  <th>{'报价前还要核对什么'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label={'工件与生产条件'}>{'大型铸锻件、焊接件或模具'}</td>
                  <td data-label={'优先比较的设备方向'}>
                    {'可在需要整车装卸、周期式处理时比较台车炉。'}
                  </td>
                  <td data-label={'报价前还要核对什么'}>
                    {'有效装载尺寸、总重量、温度曲线、进出炉空间及装卸配合。'}
                    <a className={'text-link'} href={'/zh/products/detail/trolley-furnace'}>
                      {'台车炉适用范围'}
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
                  <td data-label={'工件与生产条件'}>{'中小型零件、试制或批次处理'}</td>
                  <td data-label={'优先比较的设备方向'}>
                    {'可比较箱式炉；根据装料方式和工艺温度确定具体结构。'}
                  </td>
                  <td data-label={'报价前还要核对什么'}>
                    {'每批数量、料框料盘、取放方式、有效工作区和测温要求。'}
                    <a className={'text-link'} href={'/zh/products/detail/box-furnace'}>
                      {'箱式炉适用范围'}
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
                  <td data-label={'工件与生产条件'}>{'长轴、杆件等适合竖直装炉的工件'}</td>
                  <td data-label={'优先比较的设备方向'}>
                    {'可比较井式炉；先确认竖直装载和吊装条件。'}
                  </td>
                  <td data-label={'报价前还要核对什么'}>
                    {'工件长度与变形要求、有效深度、吊装高度、基础和工装。'}
                    <a className={'text-link'} href={'/zh/products/detail/pit-furnace'}>
                      {'井式炉适用范围'}
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
                  <td data-label={'工件与生产条件'}>{'卷材、盘卷或装框件退火'}</td>
                  <td data-label={'优先比较的设备方向'}>
                    {'可比较罩式炉；保护气氛退火需同步确认气氛与密封条件。'}
                  </td>
                  <td data-label={'报价前还要核对什么'}>
                    {'材料、装载组合、温度路径、气氛与冷却安排。'}
                    <a className={'text-link'} href={'/zh/products/detail/bell-furnace'}>
                      {'罩式炉适用范围'}
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
                  <td data-label={'工件与生产条件'}>{'小型零件连续批量处理'}</td>
                  <td data-label={'优先比较的设备方向'}>
                    {'可在适合网带承载与输送时比较网带炉。'}
                  </td>
                  <td data-label={'报价前还要核对什么'}>
                    {'工件形状、铺料、工艺停留时间、产量及后续冷却配合。'}
                    <a className={'text-link'} href={'/zh/products/detail/mesh-belt-furnace'}>
                      {'网带炉适用范围'}
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
                  <td data-label={'工件与生产条件'}>{'板、棒、管材或规整工件连续处理'}</td>
                  <td data-label={'优先比较的设备方向'}>
                    {'可在工件适合辊道支承和输送时比较辊底炉。'}
                  </td>
                  <td data-label={'报价前还要核对什么'}>
                    {'支承间距、工件刚度与表面要求、温度、输送及节拍。'}
                    <a className={'text-link'} href={'/zh/products/detail/roller-hearth-furnace'}>
                      {'辊底炉适用范围'}
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
                  <td data-label={'工件与生产条件'}>{'料盘承载、按节拍推进的批量生产'}</td>
                  <td data-label={'优先比较的设备方向'}>
                    {'可比较推杆炉；核对料盘、推进和出料是否适合工艺。'}
                  </td>
                  <td data-label={'报价前还要核对什么'}>
                    {'装料组合、承载条件、推进节拍、出料及上下游接口。'}
                    <a className={'text-link'} href={'/zh/products/detail/pusher-furnace'}>
                      {'推杆炉适用范围'}
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
                  <td data-label={'工件与生产条件'}>{'多工序衔接的热处理生产线'}</td>
                  <td data-label={'优先比较的设备方向'}>
                    {'需把加热、冷却、输送、上下料及控制作为整体核对。'}
                  </td>
                  <td data-label={'报价前还要核对什么'}>
                    {'整线产量受各工序节拍与配合约束，不能只看加热炉额定能力。'}
                    <a
                      className={'text-link'}
                      href={'/zh/solutions/continuous-heat-treatment-line'}
                    >
                      {'连续热处理生产线规划'}
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
      <section id={'process'} className={'section soft'}>
        <span className="legacy-anchor" id={'processes'} aria-hidden="true" />
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'退火、淬火、回火等工艺，对配置有什么影响？'}</h2>
            <p>{'同一炉型可以用于不同工艺，但加热、气氛、装载和冷却条件必须逐项匹配。'}</p>
          </div>
          <div className={'checklist'}>
            <div>
              <h3>{'退火、固溶'}</h3>
              <p>
                {
                  '先确认材料和温度路径，再核对保温、气氛与冷却要求。固溶项目需把后续冷却和转运条件一并纳入设备方案。'
                }
              </p>
            </div>
            <div>
              <h3>{'回火、时效'}</h3>
              <p>
                {
                  '结合材料及前道工序，核对处理温度、保温时间、有效工作区温度均匀性、装载与测温条件，以及批次安排。'
                }
              </p>
            </div>
            <div>
              <h3>{'正火、淬火加热'}</h3>
              <p>
                {
                  '除加热能力外，还需核对出炉、转运和冷却组织。采购加热炉不等于同时买到了完整淬火处理能力。'
                }
              </p>
            </div>
            <div>
              <h3>{'渗碳、渗氮、光亮退火'}</h3>
              <p>
                {
                  '需要针对材料、气氛、密封、过程控制及安全要求单独评估，不能用普通空气炉的配置直接替代。'
                }
              </p>
            </div>
          </div>
          <div className={'callout'}>
            <strong>{'连续热处理是生产组织方式。'}</strong>
            {
              '它仍需明确退火、淬火、回火等具体工艺。产能、工艺停留时间、上下料与冷却条件应共同核对。'
            }
          </div>
        </div>
      </section>
      <section id={'price'} className={'section'}>
        <span className="legacy-anchor" id={'params'} aria-hidden="true" />
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'热处理炉价格由什么决定，怎么比较报价？'}</h2>
            <p>
              {
                '价格主要受工艺系统、有效工作区、装载与产能、配套及现场范围影响。对齐这些条件后，再比较总价。'
              }
            </p>
          </div>
          <p className={'short-answer'}>
            <strong>{'先确认系统，再比较清单。'}</strong>
            {
              '工艺、气氛或质量要求可能改变设备系统；尺寸与重量跨越材料、承载或安装条件时，也会改变方案。下面五项应分别写进询价条件。'
            }
          </p>
          <div className={'decision-table'}>
            <table>
              <thead>
                <tr>
                  <th>{'比较项目'}</th>
                  <th>{'为什么会影响方案与价格'}</th>
                  <th>{'向厂家核对什么'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label={'比较项目'}>{'有效工作区与装载'}</td>
                  <td data-label={'为什么会影响方案与价格'}>
                    {'工件能放进去，不等于按工艺要求装载后都位于有效工作区。'}
                  </td>
                  <td data-label={'向厂家核对什么'}>
                    {'对齐工件组合、料框工装、装炉方式与测温条件。'}
                  </td>
                </tr>
                <tr>
                  <td data-label={'比较项目'}>{'温度、气氛与质量要求'}</td>
                  <td data-label={'为什么会影响方案与价格'}>
                    {'温度等级、气氛和特殊质量要求可能改变炉衬、加热、密封、控制等系统配置。'}
                  </td>
                  <td data-label={'向厂家核对什么'}>
                    {'分别写清常用温度、最高温度、气氛和质量目标。'}
                  </td>
                </tr>
                <tr>
                  <td data-label={'比较项目'}>{'装炉量与生产节拍'}</td>
                  <td data-label={'为什么会影响方案与价格'}>
                    {'每炉装载量不等于每小时产量，连续炉也需考虑工艺停留时间和上下游配合。'}
                  </td>
                  <td data-label={'向厂家核对什么'}>{'对齐升温、保温、冷却、装卸和运行安排。'}</td>
                </tr>
                <tr>
                  <td data-label={'比较项目'}>{'单台炉与整线配套'}</td>
                  <td data-label={'为什么会影响方案与价格'}>
                    {'输送、冷却、上下料和控制记录是否包含，会改变设备范围。'}
                  </td>
                  <td data-label={'向厂家核对什么'}>
                    {'按设备与配套清单逐项比价，不只比较一项总价。'}
                  </td>
                </tr>
                <tr>
                  <td data-label={'比较项目'}>{'现场实施与验收'}</td>
                  <td data-label={'为什么会影响方案与价格'}>
                    {'运输、吊装、基础、能源接入、试运行与验收责任可能分属不同单位。'}
                  </td>
                  <td data-label={'向厂家核对什么'}>{'列明含项、未含项、责任方和验收条件。'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={'callout'}>
            {
              '不要把控温仪显示精度、有效工作区温度均匀性和工件处理质量当成同一指标；三者应分别约定检查对象、条件和方法。'
            }
            <a className={'text-link'} href={'/zh/articles/gongye-lu-baojia-canshu'}>
              {'准备完整报价参数'}
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
      <section id={'delivery'} className={'section soft'}>
        <span className="legacy-anchor" id={'flow'} aria-hidden="true" />
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'热处理炉定制到交付，需要确认哪些节点？'}</h2>
            <p>{'交期要结合方案复杂度、外购件、制造排期和现场准备共同确定。'}</p>
          </div>
          <ol className={'steps'}>
            <li>
              <span className={'step-no'}>{'01'}</span>
              <div>
                <h3>{'需求与方案确认'}</h3>
                <p>{'先收集工件、工艺、装载、产能与现场条件，明确设备及配套范围。'}</p>
              </div>
              <div className={'deliver'}>
                <span>{'核对资料'}</span>
                <p>{'需求清单、初步方案、技术协议'}</p>
              </div>
            </li>
            <li>
              <span className={'step-no'}>{'02'}</span>
              <div>
                <h3>{'制造与装配'}</h3>
                <p>{'根据确认的结构和配置推进炉体、炉衬、加热、机械与电控配套。'}</p>
              </div>
              <div className={'deliver'}>
                <span>{'核对资料'}</span>
                <p>{'制造进度、关键节点记录'}</p>
              </div>
            </li>
            <li>
              <span className={'step-no'}>{'03'}</span>
              <div>
                <h3>{'集成与试炉检查'}</h3>
                <p>{'结合项目核对设备动作、控制配合及保护功能，确认出厂检查内容。'}</p>
              </div>
              <div className={'deliver'}>
                <span>{'核对资料'}</span>
                <p>{'设备配置、电气资料、检查记录'}</p>
              </div>
            </li>
            <li>
              <span className={'step-no'}>{'04'}</span>
              <div>
                <h3>{'发运与现场准备'}</h3>
                <p>{'核对拆分、防护、运输及到货安排，协调基础、能源和吊装条件。'}</p>
              </div>
              <div className={'deliver'}>
                <span>{'核对资料'}</span>
                <p>{'装箱清单、进场条件、责任分工'}</p>
              </div>
            </li>
            <li>
              <span className={'step-no'}>{'05'}</span>
              <div>
                <h3>{'安装调试与验收交接'}</h3>
                <p>{'按技术协议核对试运行条件、验收项目和后续服务安排。'}</p>
              </div>
              <div className={'deliver'}>
                <span>{'核对资料'}</span>
                <p>{'使用文件、试运行记录、验收资料'}</p>
              </div>
            </li>
          </ol>
          <div className={'callout'}>
            <strong>{'交付范围：'}</strong>
            {
              '苏能承担约定的工业炉设备及配套部分，不直接承接工程总包。特殊工艺认证要求单独确认，采用某个标准不等于持有相关认证。'
            }
          </div>
        </div>
      </section>
      <section id={'questions'} className={'section '}>
        <span className="legacy-anchor" id={'faq'} aria-hidden="true" />
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'选厂、询价与交付，还有这些常见问题'}</h2>
            <p>{'已在正文展开的炉型与工艺可直接查表，这里集中回答采购时的补充问题。'}</p>
          </div>
          <ManufacturerFaqs items={faqs} />
        </div>
      </section>
      <section id={'next'} className={'section soft'}>
        <span className="legacy-anchor" id={'related'} aria-hidden="true" />
        <div className={'container'}>
          <div className={'section-head'}>
            <h2>{'已经有明确项目，下一步看这里'}</h2>
            <p>{'把选厂判断接到具体的参数、设备和实施需求。'}</p>
          </div>
          <div className={'cards'}>
            <article className={'card'}>
              <h3>{'单台工业炉询价'}</h3>
              <p>{'整理工件、工艺、装载与配置条件，核对报价范围。'}</p>
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
              <p>{'核对各工序能力、配套接口及整线交付边界。'}</p>
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
            <article className={'card'}>
              <h3>{'旧炉维修与改造'}</h3>
              <p>{'先判断设备问题、保留价值和实施条件，再确定修复范围。'}</p>
              <a className={'text-link'} href={'/zh/service/furnace-renovation-overhaul'}>
                {'查看维修与改造'}
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
            <h2>{'把现有工况发来，沟通设备方案与报价条件'}</h2>
            <p>
              {
                '新建项目先说明工件、工艺和产量；旧炉项目补充铭牌、照片与现有问题。资料不全，也可以先开始沟通。'
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
