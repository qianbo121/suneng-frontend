import type { StaticProductDetail } from '@/constants/static-products';
import { imagesBySlug } from '@/constants/static-products';

const detail: Partial<StaticProductDetail> = {
    series: 'Roller-Hearth Furnace Series',
    title: 'Roller-Hearth Furnace | Custom-Engineered Roller-Hearth Heat-Treatment Furnaces',
    breadcrumbSeries: 'Roller-Hearth Furnace Series',
    summary:
      'Roller-hearth furnaces are suited to annealing, tempering, solution treatment, normalizing and other heat-treatment processes for plate, bar, tube, regularly shaped workpieces and continuous-production applications. Based on workpiece material, dimensions, weight, throughput and cycle time, maximum temperature, roller-table load-bearing arrangement, charging/discharging conditions and available floor space, Suneng delivers custom-engineered roller-hearth heat-treatment furnace solutions.',
    sellingPoints: [
      'Continuous heat treatment',
      'Custom roller-table conveying',
      'Heating zones defined per project',
      'Upstream/downstream integration available for assessment',
    ],
    quickTags: [
      'Plate / bar / tube',
      'Continuous heat treatment',
      'Custom roller-table width',
      'Multi-zone temperature control',
      'Annealing / tempering / solution treatment',
      'PLC control system',
    ],
    ctaHighlights: [
      'Founded in 2006',
      'company-reported approx. 14,700 m² production site',
      'Custom-engineered roller-hearth furnaces',
    ],
    heroCtas: [
      {
        title: 'Get a Quotation',
        description:
          'Scroll to the inquiry form and submit your roller-hearth furnace requirements.',
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
        title: 'Meets Process Requirements',
        text: 'Furnace chamber length, heating zones and the temperature-control curve are tailored to workpiece specifications, heat-treatment temperature, soak time and continuous-conveying requirements.',
      },
      {
        title: 'Matches Equipment Requirements',
        text: 'Roller-table design, conveying speed and degree of automation are matched to line cycle time, charging/discharging method and workpiece weight.',
      },
      {
        title: 'Improves Treatment Consistency',
        text: 'Through zoned temperature control, furnace-roller conveying and optimized thermal cycling, there is room to improve heating consistency across the workpiece.',
      },
      {
        title: 'Optimizes Operating Energy Use',
        text: 'The heating section, soak section and furnace insulation structure can be optimized in configuration, with potential energy savings assessed against actual operating conditions.',
      },
      {
        title: 'Stability Configured per Project',
        text: 'Furnace rollers, drive system, refractory lining structure, heating system and control system are configured for continuous-operation conditions.',
      },
    ],
    customSpecs: [
      {
        key: 'Workpiece Material',
        value:
          'Provide material grade, heat-treatment objectives and surface-quality requirements.',
      },
      {
        key: 'Workpiece Form',
        value:
          'Plate, bar, tube, regularly shaped workpieces, etc.; specify load-bearing and conveying method.',
      },
      {
        key: 'Workpiece Dimensions',
        value: 'Provide length, width, thickness, diameter, maximum profile and common sizes.',
      },
      {
        key: 'Unit Weight',
        value:
          'Provide unit weight, maximum weight, center-of-gravity position and roller-table contact method.',
      },
      {
        key: 'Hourly Throughput',
        value:
          'State hourly processing volume, shift pattern, continuous-operation cycle time and cycle-time variation.',
      },
      {
        key: 'Effective Chamber Width',
        value:
          'Determined by workpiece width, conveying clearance, thermal-cycling space and roller-table structure.',
      },
      {
        key: 'Effective Chamber Length',
        value:
          'Calculated comprehensively from heat-up, soak and cool-down times and conveying speed.',
      },
      {
        key: 'Roller-Table Width',
        value:
          'Confirmed by workpiece load-bearing width, edge margins, tracking control and maintenance access.',
      },
      {
        key: 'Roller Pitch',
        value:
          'Determined by workpiece length, weight, deflection control and conveying stability.',
      },
      {
        key: 'Roller Material',
        value:
          'Selected in conjunction with operating temperature, workpiece weight, furnace atmosphere, maintenance interval and spare-parts availability.',
      },
      {
        key: 'Conveying Speed',
        value:
          'Calculated from in-furnace dwell time, throughput cycle time, heating-zone length and charging/discharging capacity.',
      },
      {
        key: 'Number of Temperature Zones',
        value:
          'Determined by heat-up, soak, cool-down or process-stage configuration requirements.',
      },
      {
        key: 'Maximum Temperature',
        value:
          'Provide the design maximum temperature and the maximum temperature required by the process.',
      },
      {
        key: 'Typical Operating Temperature',
        value:
          'Provide the day-to-day operating temperature range to aid selection of refractory lining, furnace rollers and heating system.',
      },
      {
        key: 'Heat-Treatment Process',
        value:
          'Annealing, tempering, solution treatment, normalizing, continuous heat treatment, etc.',
      },
      {
        key: 'Temperature-Uniformity Requirement',
        value:
          'Confirmed in conjunction with the effective working zone, loading method, thermal-cycling structure and acceptance criteria.',
      },
      {
        key: 'Atmosphere Requirement',
        value:
          'Air, nitrogen, protective atmosphere or other atmosphere requirements to be confirmed per the process.',
      },
      {
        key: 'Cooling Method',
        value:
          'Air cooling, water cooling, atmosphere cooling or an integrated cooling section, determined per the process.',
      },
      {
        key: 'Charging/Discharging Method',
        value:
          'Manual, roller-table interfacing, mechanical loading or automated integration, confirmed on site.',
      },
      {
        key: 'Control-System Requirements',
        value:
          'PLC, touchscreen HMI, temperature controllers, chart recorder, multi-zone control, alarm protection, etc.',
      },
      {
        key: 'Site Space and Upstream/Downstream Equipment Conditions',
        value:
          'Provide workshop length, power supply, gas supply, fume exhaust, cooling water, upstream/downstream equipment and installation boundaries.',
      },
    ],
    configurations: [
      {
        title: 'Plate & Bar Roller-Hearth Furnace',
        image: imagesBySlug['roller-hearth-furnace'].configs[0],
        specs: [
          'Effective width: customized to plate, strip or bar specifications',
          'Temperature-zone configuration: confirmed per heat-up, soak and cool-down cycle times',
          'Roller table: designed for workpiece weight and conveying stability',
          'Applications: continuous heat treatment of plate, bar and medium-size regularly shaped workpieces',
        ],
      },
      {
        title: 'Continuous Roller-Hearth Heat-Treatment Furnace',
        image: imagesBySlug['roller-hearth-furnace'].configs[1],
        specs: [
          'Chamber length: calculated from soak time, conveying speed and throughput cycle time',
          'Control system: configurable with PLC, touchscreen HMI and multi-zone recording',
          'Upstream/downstream interfacing: assessed by charging/discharging, cooling section and site layout',
          'Applications: tube, regularly shaped workpieces and continuous heat-treatment lines',
        ],
      },
    ],
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
    processes: [
      'Annealing',
      'Tempering',
      'Solution treatment',
      'Normalizing',
      'Continuous heat treatment',
      'Protective atmosphere available for assessment',
    ],
    industries: [
      'Steel processing',
      'Large plate',
      'Bar and tube',
      'Mechanical manufacturing',
      'Energy equipment',
      'High-end equipment components',
    ],
    leadBullets: [
      'Determine roller-table structure from workpiece form',
      'Calculate chamber length from throughput cycle time',
      'Configure the control system to temperature-zone requirements',
      'Define the full-line boundaries from upstream/downstream conditions',
    ],
    parameterTitle: 'Which Parameters Need to Be Confirmed for a Custom Roller-Hearth Furnace?',
    parameterLink: {
      title: 'See Which Parameters a Quote Requires',
      description: 'View the quotation-parameter reference page.',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle:
      'Roller-Hearth Furnace, Mesh-Belt Furnace or Bogie-Hearth Furnace — How to Choose?',
    comparisonHeaders: [
      'Roller-hearth furnace suits',
      'Mesh-belt furnace suits',
      'Bogie-hearth furnace suits',
    ],
    comparisonRows: [
      {
        left: 'Plate, bar, tube or fairly regularly shaped workpieces',
        middle: 'Small parts, standard parts, fasteners',
        right: 'Large workpieces',
      },
      {
        left: 'Workpieces that can be stably supported and conveyed on a roller table',
        middle: 'Light individual parts that can be laid out on a mesh belt',
        right: 'Heavy individual parts or irregular shapes',
      },
      {
        left: 'Continuous production with a defined cycle time',
        middle: 'Stable batches with continuous in/out feeding',
        right: 'Batch-type furnace loading',
      },
      {
        left: 'High requirements for in-furnace conveying stability',
        middle: 'Focus on belt speed, layer thickness and load/unload interfacing',
        right: 'Requires bogie support or overhead-crane lifting',
      },
      {
        left: 'Suited to continuous annealing, solution treatment, tempering and similar lines',
        middle: 'Suited to continuous heat treatment of small parts',
        right: 'Suited to heat treatment of large castings/forgings, dies and structural parts',
      },
    ],
    faq: [
      {
        question: 'Q1: What workpieces are roller-hearth furnaces suited to?',
        answer:
          'Roller-hearth furnaces suit plates, bars, tubes, regularly shaped parts and heavier workpieces in continuous heat treatment, and are especially well matched to applications where the rollers can stably carry and convey the load. The right configuration depends on the workpiece material, dimensions, weight, method of support, required throughput and the process curve.',
      },
      {
        question:
          'Q2: Can a roller-hearth furnace perform annealing, tempering and solution treatment?',
        answer:
          'Yes. Depending on the project, a roller-hearth furnace can be used for continuous annealing, tempering, normalizing, solution treatment and other continuous heat-treatment processes. Each process places different demands on maximum temperature, soak time, cooling method, atmosphere and the heat resistance of the rollers, so these should be confirmed item by item during the design stage.',
      },
      {
        question: 'Q3: Which parameters mainly determine the price of a roller-hearth furnace?',
        answer:
          'The price of a roller-hearth furnace is driven mainly by the effective chamber width, effective length, roller table width, roller pitch, roller material, number of temperature zones, maximum temperature, required throughput, cooling method, atmosphere requirements, the control system and the scope of installation and commissioning. We recommend submitting your parameters first so we can advise on a price range.',
      },
      {
        question:
          'Q4: What is the difference between a roller-hearth furnace and a mesh-belt furnace?',
        answer:
          'A roller-hearth furnace carries and conveys the workpiece on furnace rollers, making it better suited to plates, bars, tubes and more regularly shaped parts; a mesh-belt furnace conveys the load on a belt and suits small parts, standard parts and fasteners. The choice should be based on a comparison of unit weight, the way parts are loaded, conveying stability and required throughput.',
      },
      {
        question: 'Q5: How is the roller table of a roller-hearth furnace designed?',
        answer:
          'Roller-table design must account for the workpiece dimensions, unit weight, chamber width, roller pitch, conveying speed, operating temperature, furnace atmosphere and maintenance interval. Under high-temperature or heavy-load conditions, attention must also be paid to roller material, deformation control, drive synchronization and the ease of replacing spare parts.',
      },
      {
        question: 'Q6: How is temperature uniformity ensured in a roller-hearth furnace?',
        answer:
          'Temperature uniformity depends on the effective chamber width and length, the temperature-zone layout, the arrangement of heating elements or the combustion system, the insulation of the refractory lining, the heat-circulation design, conveying speed, the loading method and the agreed acceptance criteria. The specific figures should be confirmed against the project configuration and the test conditions.',
      },
      {
        question: 'Q7: Can an old roller-hearth furnace be retrofitted or overhauled?',
        answer:
          'It is best to first assess the condition of the refractory insulation, roller wear, the drive system, the heating system, the temperature-zone control, the sealing structure, the cooling section and the automation controls. Whether a retrofit is worthwhile depends on the condition of the furnace shell, roller service life, the available shutdown window, spare-parts availability and the objectives of the upgrade.',
      },
      {
        question:
          'Q8: What information should be prepared before requesting a roller-hearth furnace quotation?',
        answer:
          'We recommend preparing the workpiece material, shape, dimensions and unit weight, the hourly throughput, the maximum and normal operating temperatures, the heat-treatment process, the temperature-uniformity requirement, atmosphere and cooling requirements, the loading and unloading method, the available floor space and details of the upstream and downstream equipment.',
      },
    ],
    geoSections: [
      {
        title: 'Applicable Workpieces',
        text: 'Roller-hearth furnaces suit plates, tubes, bars and medium-to-large workpieces in continuous heat treatment. Workpiece weight, length and straightness, the way the load contacts the rollers, the running speed and the chamber sealing requirements all influence the roller material, the drive arrangement, temperature-zone control and the overall line layout.',
      },
      {
        title: 'Typical Processes',
        text: 'Common processes include annealing, normalizing, tempering and continuous heat treatment; solution treatment requires a project-specific review of the material grade, the temperature schedule, the cooling rate and the heat resistance of the rollers. The conveying method appropriate to different workpiece cross-sections and weights should be confirmed individually.',
      },
      {
        title: 'Selection Considerations',
        items: [
          'Roller material, diameter and heat-resistance class',
          'Workpiece weight, length and method of support',
          'Running speed and dwell time inside the furnace',
          'Temperature-zone control and furnace temperature uniformity',
          'Roller-hearth drive, sealing and maintenance access',
          'Cooling section, loading/unloading and integration with up- and downstream processes',
        ],
      },
    ],
    relatedLinks: [
      {
        title: 'Which parameters are needed to quote an industrial furnace',
        description:
          'Organize furnace type, dimensions, temperature, throughput, process curve and site conditions to make your enquiry more efficient.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title:
          'Industrial furnace energy-saving retrofits and heat-treatment furnace overhaul services',
        description:
          'Learn how we assess the rollers, drive, refractory lining, heating and control systems of aging roller-hearth and continuous heat-treatment furnaces.',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: 'Heat-treatment furnace manufacturer page',
        description:
          'Learn about Suneng as a heat-treatment furnace manufacturer, including our product range, manufacturing capabilities and custom-engineering process.',
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: 'Mesh-belt furnace page',
        description:
          'Explore mesh-belt furnace solutions for continuous, batch heat treatment of small parts and standard parts.',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: 'Bogie-hearth furnace page',
        description:
          'Compare bogie-hearth furnace solutions for large workpieces, batch-type loading and custom-engineered bogie load capacities.',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        title: 'Box (chamber) furnace page',
        description:
          'Compare box (chamber) furnace solutions for small-to-medium workpieces, small-batch production and trial runs.',
        href: '/zh/products/detail/box-furnace',
      },
      {
        title: 'Product center',
        description:
          "Browse Suneng's publicly listed heat-treatment furnaces, industrial furnaces and heat-treatment lines.",
        href: '/zh/products',
      },
      {
        title: 'Contact us',
        description:
          'Submit your roller-hearth furnace parameters, request a solution or arrange further technical discussion.',
        href: '/zh/contact',
      },
    ],
    parameterNote:
      'A roller-hearth furnace cannot be quoted from the furnace type name alone. The figure depends on the workpiece material, dimensions and weight, throughput cycle time, furnace chamber length, roller-table structure, number of temperature zones, cooling method, loading and unloading method and site conditions, and is ultimately governed by the technical proposal agreed by both parties.',
  };

export default detail;
