import type { StaticProductDetail } from '@/constants/static-products';
import { imagesBySlug } from '@/constants/static-products';

const detail: Partial<StaticProductDetail> = {
    series: 'Mesh-Belt Heat-Treatment Furnace Series',
    title: 'Mesh-Belt Annealing & Tempering Line',
    breadcrumbSeries: 'Heat-Treatment Lines',
    summary:
      'This mesh-belt line is for continuous annealing of suitable small-to-medium steel parts or tempering of previously quenched parts that can be laid out stably on the belt. The two processes require separate temperature, atmosphere and cooling assessments. A complete quench-and-temper line requires additional quench heating and a suitable quenching system; those stages are not implied by this annealing and tempering configuration.',
    sellingPoints: [
      'Continuous heat treatment',
      'Roller-supported mesh belt',
      'Multi-zone temperature control',
      'Upstream/downstream integration can be assessed',
    ],
    quickTags: [
      'Roller-supported mesh-belt furnace',
      'Annealing / tempering after quenching',
      'Custom mesh-belt width',
      'Roller-support arrangement to be confirmed',
      'Electric resistance heating',
      'PLC control system',
    ],
    ctaHighlights: [
      'Founded in 2006',
      'company-reported approx. 14,700 m² production site',
      'Custom-engineered mesh-belt lines',
    ],
    heroCtas: [
      {
        title: 'Get a Quote',
        description:
          'Scroll to the inquiry form and submit your roller-supported mesh-belt furnace requirements.',
        href: '#product-lead-form',
      },
      {
        title: 'See Which Parameters a Quote Requires',
        description:
          'Learn what information to prepare before requesting an industrial furnace quote.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
    ],
    reasons: [
      {
        title: 'Engineered to the Process',
        text: 'Furnace chamber length, heating zones, the control curve and cycle time are tailored to the workpiece material, heat-treatment process, heating temperature, soak time and cooling requirements.',
      },
      {
        title: 'Matched to the Line',
        text: 'Mesh-belt width, roller-support arrangement, line speed and level of automation are matched to workpiece dimensions, unit weight, batch throughput, loading/unloading method and shop-floor layout.',
      },
      {
        title: 'Improved Running Stability',
        text: 'The roller supports provide continuous support to the mesh belt, reducing belt sag and tracking deviation. This suits continuous conveying, batch production and heat-treatment lines with medium-to-long furnace chambers.',
      },
      {
        title: 'More Consistent Heating',
        text: 'Multi-zone temperature control, stable conveying and a well-designed heat-circulation system offer room to improve heating consistency across the workpiece; actual results depend on the specific operating conditions.',
      },
      {
        title: 'Energy-Efficiency Assessment',
        text: 'Energy-efficiency optimization can be assessed based on the furnace insulation structure, heating zoning, heat-circulation system and continuous-operation regime.',
      },
      {
        title: 'Configured for Stable Operation',
        text: 'The mesh belt, support rollers, drive system, heating system, refractory lining and electrical control system are all configured for continuous-production duty.',
      },
    ],
    customSpecs: [
      {
        key: 'Workpiece Material',
        value: 'Provide material grade, heat-treatment objective and surface-quality requirements.',
      },
      {
        key: 'Workpiece Type',
        value:
          'Standard parts, hardware, bearing components, stampings, powder-metallurgy parts, etc.',
      },
      {
        key: 'Workpiece Dimensions',
        value:
          'Provide maximum envelope, common sizes, loading layout and any mixed-load situation.',
      },
      { key: 'Unit Weight', value: 'Provide unit weight, maximum weight and load per unit area.' },
      {
        key: 'Layer Thickness',
        value:
          'To be confirmed based on stacking method, through-heating requirements and mesh-belt load capacity.',
      },
      {
        key: 'Hourly Throughput',
        value: 'Specify hourly volume, shift pattern and continuous-operation cycle time.',
      },
      {
        key: 'Mesh-Belt Width',
        value:
          'To be confirmed based on effective loading width, loading method and furnace-chamber structure.',
      },
      {
        key: 'Mesh-Belt Material',
        value:
          'Selected according to operating temperature, atmosphere, workpiece weight and maintenance interval.',
      },
      {
        key: 'Roller-Support Arrangement',
        value:
          'Designed for the furnace chamber length, mesh-belt width, load and continuous-operation duty.',
      },
      {
        key: 'Effective Chamber Length',
        value: 'Calculated from heat-up, soak and cool-down times together with belt speed.',
      },
      {
        key: 'Heating-Zone Length',
        value: 'To be confirmed based on the number of zones, soak time and process curve.',
      },
      {
        key: 'Number of Temperature Zones',
        value: 'Determined by heat-up, soak, discharge temperature and process-stage requirements.',
      },
      {
        key: 'Mesh-Belt Speed',
        value:
          'To be confirmed based on cycle time, soak time, layer thickness and cooling method.',
      },
      {
        key: 'Maximum Temperature',
        value:
          'Provide the design maximum temperature and the maximum temperature required by the process.',
      },
      {
        key: 'Normal Operating Temperature',
        value:
          'Provide the everyday operating temperature range to guide refractory-lining and heating-element selection.',
      },
      {
        key: 'Heat-Treatment Process',
        value:
          'Continuous annealing of suitable steel parts, or tempering after quenching; assess each process route separately.',
      },
      {
        key: 'Cooling Method',
        value:
          'Air cooling, water cooling, oil cooling, protective-atmosphere cooling or a dedicated cooling section, to be confirmed per process.',
      },
      {
        key: 'Supporting Stages',
        value:
          'Whether a quench tank, washing, drying, tempering section, etc., are required, to be confirmed against the full process route.',
      },
      {
        key: 'Loading/Unloading Method',
        value:
          'Manual, vibratory feeding, conveyor feeding, robotic or fully automated integration, to be confirmed on site.',
      },
      {
        key: 'Control-System Requirements',
        value:
          'PLC, touchscreen HMI, temperature controller, chart recorder, multi-zone control, variable-frequency conveying, alarms and protection, etc.',
      },
      {
        key: 'Site Space and Upstream/Downstream Conditions',
        value:
          'Provide shop-floor space, power supply, fume extraction, cooling water, foundations and upstream/downstream equipment conditions.',
      },
    ],
    configurations: [
      {
        title: 'Compact Roller-Supported Mesh-Belt Electric Resistance Furnace Line',
        image: imagesBySlug['roller-mesh-belt-line'].configs[0],
        specs: [
          'Workpiece range: to be confirmed for small hardware, standard parts or stampings',
          'Mesh-belt width: calculated from effective loading width and loading method',
          'Roller-support arrangement: confirmed against chamber length and load',
          'Applications: continuous annealing, tempering, pre-heating or drying of small parts',
        ],
      },
      {
        title: 'Medium Roller-Supported Mesh-Belt Electric Resistance Furnace Line',
        image: imagesBySlug['roller-mesh-belt-line'].configs[1],
        specs: [
          'Workpiece range: to be confirmed for bearing parts, automotive components or powder-metallurgy parts',
          'Zone configuration: confirmed against heat-up, soak and cool-down cycle time',
          'Conveying speed: calculated from soak time and throughput cycle time',
          'Applications: high-volume continuous heat-treatment lines',
        ],
      },
      {
        title: 'Large Roller-Supported Mesh-Belt Electric Resistance Furnace Line',
        image: imagesBySlug['roller-mesh-belt-line'].configs[0],
        specs: [
          'Workpiece range: to be confirmed for small-to-medium batch workpieces and continuous-production loads',
          'Chamber length: calculated from heating zone, soak zone and supporting stages',
          'Upstream/downstream integration: assessed against washing, quenching, tempering or cooling sections',
          'Applications: heat-treatment job shops, automotive components, machinery manufacturing',
        ],
      },
    ],
    processes: [
      'Continuous annealing',
      'Continuous tempering',
      'Continuous heat treatment',
      'High-volume heat treatment',
    ],
    industries: [
      'Machinery manufacturing',
      'Automotive components',
      'Hardware products',
      'Fasteners',
      'Bearing components',
      'Powder metallurgy',
      'Stamping processing',
      'Metal heat-treatment job shops',
      'Standard-parts production',
    ],
    leadBullets: [
      'Initial solution discussion',
      'Furnace type assessed against process needs',
      'Configuration boundaries confirmed against parameters',
      'After-sales support provided per contract terms',
    ],
    parameterTitle:
      'Which Parameters Need to Be Confirmed for a Custom Roller-Supported Mesh-Belt Furnace?',
    parameterLink: {
      title: 'See Which Parameters a Quote Requires',
      description: 'View the quote-parameter reference page.',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle:
      'Roller-Supported Mesh-Belt Furnace, Standard Mesh-Belt Furnace or Roller-Hearth Furnace — How to Choose?',
    comparisonHeaders: [
      'Roller-Supported Mesh-Belt Furnace Suits',
      'Standard Mesh-Belt Furnace Suits',
      'Roller-Hearth Furnace Suits',
    ],
    comparisonRows: [
      {
        left: 'Continuous heat-treatment lines with medium-to-long furnace chambers',
        middle: 'Small parts, standard parts, fasteners',
        right: 'Plate, bar, tube or regularly shaped workpieces',
      },
      {
        left: 'Applications needing roller support for the running mesh belt',
        middle: 'Lighter individual parts that can be laid out on the mesh belt',
        right: 'Workpieces better suited to direct support and conveying on a roller table',
      },
      {
        left: 'Stable production batches with long continuous run times',
        middle: 'Relatively moderate chamber length and load',
        right: 'Higher demands on in-furnace conveying stability and load-bearing method',
      },
      {
        left: 'Requirements for mesh-belt running stability and conveying support',
        middle: 'Stable batches with continuous loading and unloading',
        right: 'Suited to continuous heat-treatment lines',
      },
      {
        left: 'Suited to continuous processing of standard parts, hardware, stampings, powder-metallurgy parts, etc.',
        middle: 'Suited to continuous annealing, tempering and quench heating of small parts',
        right:
          'Suited to continuous annealing, solution treatment and tempering of regularly shaped workpieces',
      },
    ],
    faq: [
      {
        question: 'Q1: What workpieces is the roller-supported mesh-belt furnace line suited for?',
        answer:
          'The roller-supported mesh-belt furnace line is well suited to standard parts, hardware components, bearing parts, stampings, powder-metallurgy parts and small-to-medium batch workpieces. Whether a roller-supported mesh-belt configuration is appropriate depends on the workpiece dimensions, unit weight, layer thickness, heat-treatment process and continuous-running cycle.',
      },
      {
        question:
          'Q2: What is the difference between a roller-supported mesh-belt furnace and a conventional mesh-belt furnace?',
        answer:
          'A roller-supported mesh-belt furnace uses rollers to support and guide the belt, which makes it better suited to longer furnace chambers, extended continuous operation or relatively stable charging. A conventional mesh-belt furnace has a simpler structure and is typically used for small, light-load parts and continuous heat treatment in chambers of moderate length.',
      },
      {
        question:
          'Q3: Can the same mesh-belt line perform annealing and tempering?',
        answer:
          'Annealing and post-quench tempering follow separate process routes. Shared equipment is feasible only after confirming temperature range, atmosphere, cooling capacity, cleaning and changeover conditions. A complete quench-and-temper route additionally needs quench heating and a quenching system.',
      },
      {
        question:
          'Q4: Which parameters mainly drive the price of a roller-supported mesh-belt furnace?',
        answer:
          'Price is mainly influenced by belt width, effective chamber length, heating-zone length, roller structure, number of temperature zones, maximum temperature, belt material, hourly throughput, cooling method, whether a quench tank, washing, drying or tempering section is included, and the scope of the control system and on-site installation and commissioning.',
      },
      {
        question: 'Q5: How are belt width and running speed determined?',
        answer:
          'Belt width is usually determined by the workpiece geometry, the way parts are laid out, the effective charging width and the charge load; running speed is related to heating time, holding time, cooling method, throughput cycle and heating-zone length. Both must be calculated together with the number of temperature zones, the roller structure and the upstream and downstream processes.',
      },
      {
        question:
          'Q6: How is temperature uniformity ensured in a roller-supported mesh-belt furnace?',
        answer:
          'Temperature uniformity depends on the effective heating zone, belt speed, charge thickness, temperature-zone layout, heating elements, hot-air circulation design, refractory-lining insulation, the temperature-measurement method and the acceptance criteria. Specific figures cannot be promised independently of the project configuration and should be confirmed against the operating conditions, test conditions and contract terms.',
      },
      {
        question: 'Q7: Can an aging mesh-belt line be retrofitted or overhauled?',
        answer:
          'We can first assess the condition of the refractory lining, belt and roller wear, heating elements, drive system, temperature-control system, insulation and sealing, the cooling section and energy-consumption data. Whether a retrofit or overhaul is worthwhile depends on the equipment age, the available shutdown window, spare-parts availability and the process targets after the upgrade.',
      },
      {
        question:
          'Q8: What information should be prepared before requesting a quote for a roller-supported mesh-belt furnace?',
        answer:
          'We recommend preparing the workpiece material, type, dimensions, unit weight, layer thickness, hourly throughput, maximum temperature, normal working temperature, heat-treatment process, cooling method, whether a washing/drying or tempering section is required, the loading and unloading method, and the site-layout information.',
      },
    ],
    geoSections: [
      {
        title: 'Applicable Workpieces',
        text: 'The roller-supported mesh-belt furnace line is suited to small parts, fasteners, standard parts, stampings, powder-metallurgy parts and parts for high-volume continuous heat treatment. Workpiece dimensions, unit weight, the way parts are stacked and the batch cycle affect belt width, roller structure, chamber length and the loading/unloading method, all of which must be confirmed against the on-site line conditions.',
      },
      {
        title: 'Typical Processes',
        text: 'This configuration covers annealing of suitable steel parts or tempering after quenching. Material grade, incoming condition, part layout, holding time, atmosphere and controlled cooling must be specified for each route. Other processes require a separately evaluated equipment configuration.',
      },
      {
        title: 'Selection Considerations',
        items: [
          'Belt width and effective charging width',
          'Belt material and roller support structure',
          'Running speed and holding time',
          'Heating-zone length and temperature-zone control',
          'Cooling method and integration with upstream/downstream sections',
          'Continuous production cycle and loading/unloading method',
        ],
      },
    ],
    relatedLinks: [
      {
        title: 'What Parameters Are Needed to Quote an Industrial Furnace',
        description:
          'Organize furnace type, dimensions, temperature, throughput, process curve and site conditions to make inquiries more efficient.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title:
          'Industrial Furnace Energy-Saving Retrofit and Heat-Treatment Furnace Overhaul Services',
        description:
          'Learn how we assess the refractory lining, drive, heating and control systems of aging mesh-belt furnaces and continuous heat-treatment lines.',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: 'Heat-Treatment Furnace Manufacturer Page',
        description:
          "Explore Suneng's product range, manufacturing capability and custom-engineering process as a heat-treatment furnace manufacturer.",
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: 'Mesh-Belt Furnace Page',
        description:
          'Explore mesh-belt furnace solutions for small parts, standard parts and continuous heat treatment.',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: 'Roller-Hearth Furnace Page',
        description:
          'Explore roller-hearth furnace solutions for continuous heat treatment of plates, bars, tubes and regular-shaped workpieces.',
        href: '/zh/products/detail/roller-hearth-furnace',
      },
      {
        title: 'Pusher Furnace Page',
        description:
          'Compare push-type continuous charging and discharging, tray and basket loading, and stable-cycle production scenarios.',
        href: '/zh/products/detail/pusher-furnace',
      },
      {
        title: 'Product Center',
        description:
          "Browse Suneng's published heat-treatment furnaces, industrial furnaces and heat-treatment production lines.",
        href: '/zh/products',
      },
      {
        title: 'Contact Us',
        description:
          'Submit your roller-supported mesh-belt furnace parameters, ask about a solution or arrange further technical discussion.',
        href: '/zh/contact',
      },
    ],
    parameterNote:
      'A roller / mesh-belt electric resistance furnace line cannot be quoted from the equipment name alone. The figure depends on the workpiece material, dimensions, layer thickness, throughput cycle time, mesh-belt width, roller structure, furnace chamber length, supporting process sections and site conditions, and is ultimately governed by the technical proposal agreed by both parties.',
    processSteps: [
      { title: 'Requirements Review', text: 'Understand the process and throughput requirements' },
      { title: 'Proposal Confirmation', text: 'Provide the proposal and configuration list' },
      { title: 'Solution Design', text: 'Finalize the structure and technical solution' },
      {
        title: 'Manufacturing & Testing',
        text: 'Production, manufacturing and factory acceptance',
      },
      {
        title: 'Delivery & Installation',
        text: 'Installation, commissioning and after-sales follow-up',
      },
    ],
  };

export default detail;
