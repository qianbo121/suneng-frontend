import type { StaticProductDetail } from '@/constants/static-products';
import { imagesBySlug } from '@/constants/static-products';

const detail: Partial<StaticProductDetail> = {
    series: 'Continuous Heat-Treatment Line Series',
    title:
      'Annealing & Solution-Treatment Line | Custom-Engineered Continuous Heat-Treatment Equipment for Metal Strip',
    breadcrumbSeries: 'Heat-Treatment Lines',
    summary:
      'The annealing & solution-treatment line is built for continuous heat treatment of metal strip and coil, covering continuous annealing, solution treatment, bright annealing and stress relief of stainless steel strip, alloy strip, non-ferrous metal strip and coil. The equipment is custom-engineered to your material grade, strip width and thickness, coil weight, line speed, cooling method and plant layout.',
    sellingPoints: [
      'Continuous heat treatment for metal strip',
      'Continuous annealing / solution treatment',
      'Tension & strip-guiding configuration',
      'Cooling section sized to the process',
    ],
    quickTags: [
      'Annealing & solution-treatment line',
      'Metal strip / coil',
      'Continuous annealing / solution treatment',
      'Tension & strip-guiding configuration',
      'Cooling section sized to the process',
      'PLC control system',
    ],
    ctaHighlights: [
      'Founded in 2006',
      'company-reported approx. 14,700 m² production site',
      'Custom-engineered production lines',
    ],
    reasons: [
      {
        title: 'Solution scoped to material specs',
        text: 'Furnace chamber length and process curve are scoped to your material grade, strip width and thickness, coil weight, annealing temperature, solution temperature, soak time and cooling-rate requirements.',
      },
      {
        title: 'Built around continuous-line needs',
        text: 'Overall line configuration is scoped to your line cycle time, uncoiling and recoiling arrangement, entry and exit speeds, tension control and available floor space.',
      },
      {
        title: 'Better consistency and surface condition',
        text: 'Multi-zone temperature control, stable conveying, optimized thermal cycling and cooling-section design create room to improve annealing/solution consistency and surface condition, with actual results confirmed against the material and operating conditions.',
      },
      {
        title: 'Smoother continuous-production flow',
        text: 'Entry accumulator, exit accumulator, strip guiding, tension control and interlock systems can be configured to smooth continuous-production flow, subject to the final project configuration.',
      },
      {
        title: 'Energy-efficiency assessment',
        text: 'Energy efficiency can be assessed through furnace insulation, heating zoning, waste-heat recovery, the thermal-cycling system and the continuous-running regime.',
      },
      {
        title: 'Systems configured to your operating conditions',
        text: 'The furnace structure, drive system, roller table, heating system, cooling system and electrical control system are all configured to continuous-production operating conditions.',
      },
    ],
    customSpecs: [
      {
        key: 'Material grade',
        value:
          'Stainless steel, non-ferrous metals, alloy strip and more — confirmed against the grade and process standard.',
      },
      {
        key: 'Material form',
        value: 'Strip, coil, plate-and-strip, precision metal strip and similar.',
      },
      {
        key: 'Strip width',
        value:
          'Provide the target strip width, edge condition and required effective heating width.',
      },
      {
        key: 'Strip thickness',
        value: 'Provide the thickness range, thickness variation and heat-treatment objective.',
      },
      {
        key: 'Maximum coil weight',
        value:
          'Used to size the uncoiling/recoiling system, tension control and on-site load-bearing conditions.',
      },
      {
        key: 'Entry speed / exit speed',
        value:
          'Confirmed together with soak time, cooling capacity, accumulator configuration and upstream/downstream processes.',
      },
      {
        key: 'Target throughput',
        value: 'Assessed from material specs, running regime and continuous-production cycle time.',
      },
      {
        key: 'Annealing temperature',
        value:
          'Confirmed against the material grade, microstructure condition and annealing objective.',
      },
      {
        key: 'Solution temperature',
        value:
          'Confirmed against the material grade, solution-treatment objective, cooling method and acceptance requirements.',
      },
      {
        key: 'Maximum operating temperature',
        value:
          'Confirmed together with the refractory lining, heating system, temperature-zone layout and safety margin.',
      },
      {
        key: 'Soak time',
        value:
          'Calculated from strip thickness, line speed and the length of the effective heating zone.',
      },
      {
        key: 'Cooling rate',
        value:
          'Confirmed against the material process, surface condition and cooling-section configuration.',
      },
      {
        key: 'Cooling method',
        value:
          'Air cooling, water cooling, air-mist cooling or staged cooling — assessed per the process.',
      },
      {
        key: 'Protective atmosphere required?',
        value:
          'Assessed from bright-annealing, surface-quality and oxidation-control requirements.',
      },
      {
        key: 'Surface-quality requirements',
        value:
          'Specify oxidation, color variation, scratching, strip shape and downstream-process requirements.',
      },
      {
        key: 'Tension-control requirements',
        value:
          'Confirmed together with coil weight, strip width and thickness, speed and the uncoiling/recoiling method.',
      },
      {
        key: 'Strip-guiding requirements',
        value:
          'Confirmed together with strip width, speed, entry/exit arrangement and on-site conditions.',
      },
      {
        key: 'Accumulator configuration',
        value:
          'Entry accumulator, exit accumulator or other buffer sections assessed against the continuous-production cycle time.',
      },
      {
        key: 'Line boundaries',
        value:
          'Define the interfaces for uncoiling, cleaning, heating, cooling, recoiling and upstream/downstream equipment.',
      },
      {
        key: 'Control-system requirements',
        value:
          'PLC, touchscreen HMI, chart recorder, data traceability and interlock control confirmed per project.',
      },
      {
        key: 'On-site space and upstream/downstream equipment conditions',
        value:
          'Provide the workshop layout, foundations, lifting, energy connections and upstream/downstream process conditions.',
      },
    ],
    configurations: [
      {
        title: 'Metal-strip annealing & solution line',
        image: imagesBySlug['annealing-solution-line'].configs[0],
        specs: [
          'Suitable materials: stainless steel strip, alloy strip, precision metal strip',
          'Strip width and thickness: confirmed per material specs',
          'Operating temperature: confirmed per the annealing or solution process',
          'Line speed: assessed from soak time and cooling capacity',
        ],
      },
      {
        title: 'Continuous annealing & solution line',
        image: imagesBySlug['annealing-solution-line'].configs[1],
        specs: [
          'Suitable materials: austenitic stainless steel, stainless steel coil, cold-rolled strip',
          'Temperature-zone layout: confirmed per the process curve',
          'Cooling method: assessed per material and surface requirements',
          'Control system: configured per tension, strip-guiding and data-recording needs',
        ],
      },
      {
        title: 'Continuous coil heat-treatment line',
        image: imagesBySlug['annealing-solution-line'].configs[0],
        specs: [
          'Suitable materials: wide stainless steel strip, alloy strip, non-ferrous metal strip',
          'Coil-weight range: confirmed per the uncoiling/recoiling system and site conditions',
          'Line boundaries: confirmed per the uncoiling, cleaning, heating, cooling and recoiling interfaces',
          'Acceptance criteria: per the mutually agreed technical proposal',
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
      'Continuous annealing',
      'Solution treatment',
      'Bright annealing',
      'Stress-relief annealing',
      'Stainless steel annealing',
      'Stainless steel solution treatment',
      'Steel-strip heat treatment',
      'Continuous coil heat treatment',
    ],
    industries: [
      'Stainless steel processing',
      'Metal-strip processing',
      'Steel-strip heat treatment',
      'Cold-rolled strip production',
      'Precision alloy materials',
      'New-energy materials',
      'Automotive component materials',
      'Energy-equipment materials',
    ],
    leadBullets: [
      'Initial proposal discussion',
      'Configuration assessed against material specs and the annealing/solution process',
      'Configuration boundaries confirmed against the parameters',
      'After-sales support provided per the contract',
    ],
    parameterTitle:
      'Which parameters need to be confirmed for a custom annealing & solution-treatment line?',
    parameterLink: {
      title: 'See which parameters a quote requires',
      description:
        'A summary of the quoting parameters, to help engineers scope the boundaries of a solution.',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle:
      'Annealing & solution line, copper-wire annealing line, or mesh-belt furnace — how to choose?',
    comparisonHeaders: [
      'Annealing & solution line suits',
      'Automated copper-wire annealing line suits',
      'Mesh-belt furnace suits',
    ],
    comparisonRows: [
      {
        left: 'Stainless steel strip, alloy strip, non-ferrous metal strip',
        middle: 'Copper wire, copper conductor, copper-alloy wire and other wire products',
        right: 'Small parts, standard parts, fasteners and hardware',
      },
      {
        left: 'Continuous processing of coil with defined strip width, thickness and coil weight',
        middle: 'Continuous pay-off, annealing, cooling and take-up production',
        right: 'Workpieces that can be laid flat on the mesh belt for continuous conveying',
      },
      {
        left: 'Continuous annealing, solution treatment, bright annealing or stress relief required',
        middle: 'Focus on wire diameter, speed, tension control and surface quality',
        right: 'Focus on mesh-belt width, layer thickness and temperature-zone layout',
      },
      {
        left: 'Requirements on tension, strip guiding, cooling and uncoiling/recoiling integration',
        middle: 'Suited to softening annealing, bright annealing and stress relief',
        right: 'Suited to continuous annealing, tempering and quench heating of small parts',
      },
      {
        left: 'Suited to continuous heat-treatment lines for metal strip',
        middle: 'Key items to confirm: wire diameter, speed, atmosphere and pay-off/take-up method',
        right: 'Key items to confirm: loading method, charge weight and load/unload integration',
      },
    ],
    faq: [
      {
        question: 'Q1: What materials suit an annealing and solution-treatment line?',
        answer:
          'An annealing and solution-treatment line is well suited to stainless steel strip, non-ferrous metal strip, alloy strip and other coil/strip materials that require continuous heat treatment. Whether a single line can cover a given material depends on the grade, strip width and thickness, coil weight, surface-quality requirements and the annealing or solution-treatment temperature curve, all of which should be assessed together.',
      },
      {
        question:
          'Q2: How does a continuous annealing line differ from a standalone annealing furnace?',
        answer:
          'A continuous annealing line typically integrates uncoiling, cleaning, heating, cooling, tension control, edge guiding and recoiling, which makes it suited to steady, high-volume production. A standalone annealing furnace is better matched to discrete charging or to operations where batch sizes are not fixed. The right choice depends on throughput, material form and the on-site process flow.',
      },
      {
        question: 'Q3: How is line speed determined?',
        answer:
          'Line speed is set by combining material thickness, target temperature, effective furnace length, soak time, cooling rate, tension control and the capacity of the upstream and downstream stages. Speed is not a standalone parameter; it has to be calculated together with the number of temperature zones, the cooling section and the overall line automation.',
      },
      {
        question: 'Q4: How does solution-treatment temperature relate to the material grade?',
        answer:
          'Different material grades call for different solution-treatment temperatures, soak times and cooling requirements, so this cannot be judged from the equipment maximum temperature alone. The design should start from the material process requirements and then be finalized in conjunction with strip thickness, line speed, cooling method and furnace temperature uniformity.',
      },
      {
        question:
          'Q5: Can an annealing and solution-treatment line be upgraded for energy savings?',
        answer:
          'Yes. Potential areas to evaluate include furnace-body insulation, the heating system, hot-air circulation, the cooling section, flue-gas waste-heat recovery, the drive system and the control logic. The actual savings must be calculated case by case against the condition of the existing equipment, the material specifications, the operating regime, the line load and the scope of the retrofit.',
      },
      {
        question:
          'Q6: Which parameters mainly drive the price of an annealing and solution-treatment line?',
        answer:
          'Price is driven mainly by the material grade, strip width and thickness, maximum coil weight, line speed, annealing or solution-treatment temperature, furnace chamber length, number of temperature zones, cooling method, tension and edge-guiding control, accumulator (looper) configuration, control system and the boundary of installation and commissioning. The more complete the parameters, the closer the quotation reflects the real project.',
      },
      {
        question:
          'Q7: How is temperature uniformity ensured on an annealing and solution-treatment line?',
        answer:
          'Temperature uniformity has to be confirmed against the effective heating zone, the temperature-zone layout, strip speed, the heat-circulation design, the charging condition, the temperature-measurement method and the project acceptance requirements. The design can be optimized through zoned temperature control, refractory lining insulation, heat circulation and a data-recording system, but the specific target values should be defined clearly in the technical proposal.',
      },
      {
        question: 'Q8: What information should be prepared before requesting a quotation?',
        answer:
          'We recommend preparing the material grade, strip width and thickness, maximum coil weight, target throughput, annealing or solution-treatment temperature, line speed, cooling method, surface-quality requirements, tension control, the uncoiling/recoiling arrangement and the on-site layout. You can start the conversation even if the information is incomplete; our engineers will identify what still needs to be supplied.',
      },
    ],
    geoSections: [
      {
        title: 'Applicable workpieces',
        text: 'An annealing and solution-treatment line suits stainless steel strip, non-ferrous metal strip, alloy strip and other coil/strip materials that require continuous annealing or solution treatment. Strip width, thickness, coil weight, material grade, surface-quality requirements and tension-control needs all influence furnace length, the temperature zones, the cooling section and the overall line layout.',
      },
      {
        title: 'Typical processes',
        text: 'Common processes include continuous annealing, solution treatment, stress relief and continuous heat treatment; bright annealing or special-atmosphere processes require project-specific evaluation. Solution-treatment temperature, soak time, cooling rate and tension control should be confirmed against the material grade and the relevant product standards.',
      },
      {
        title: 'Selection focus',
        items: [
          'Strip width, thickness and coil-weight range',
          'Line speed and dwell time inside the furnace',
          'Temperature-zone length and effective heating-zone layout',
          'Cooling-section type and cooling capacity',
          'Tension control, edge guiding and accumulator (looper) configuration',
          'Energy-efficiency improvement potential of an existing line',
        ],
      },
    ],
    relatedLinks: [
      {
        title: 'What parameters are needed to quote an industrial furnace',
        description:
          'Organize material, dimensions, temperature, throughput and on-site conditions to help define the boundaries of a quotation.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title:
          'Industrial furnace energy-saving retrofit and heat-treatment furnace overhaul services',
        description:
          'Understand how the refractory lining, heating, cooling and automation systems of an aging annealing and solution-treatment line are evaluated.',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: 'Heat-treatment furnace manufacturer page',
        description:
          'Learn about Suneng as a heat-treatment furnace manufacturer, including our product range, manufacturing capabilities and custom-engineering process.',
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: 'Automated copper-wire annealing line',
        description:
          'Compare the selection boundaries of continuous annealing equipment for copper wire, copper line and copper-alloy wire.',
        href: '/zh/products/detail/copper-wire-annealing-line',
      },
      {
        title: 'Mesh-belt furnace page',
        description:
          'Explore mesh-belt furnace solutions for continuous heat treatment of small parts, standard parts and fasteners.',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: 'Roller-supported mesh-belt resistance furnace line',
        description:
          'Understand the configuration approach for roller-supported mesh-belt equipment for continuous annealing, tempering and normalizing.',
        href: '/zh/products/detail/roller-mesh-belt-line',
      },
      {
        title: 'Product center',
        description:
          'Browse the heat-treatment furnaces, industrial furnaces and heat-treatment lines Suneng has made public.',
        href: '/zh/products',
      },
      {
        title: 'Contact us',
        description:
          'Submit your annealing and solution-treatment line parameters, request a proposal or schedule further technical discussion.',
        href: '/zh/contact',
      },
    ],
    parameterNote:
      'The above are common configuration ranges. The exact specification depends on the material grade, strip width and thickness, coil weight, annealing or solution-treatment temperature, line speed, cooling method, site layout and project acceptance requirements, and is ultimately governed by the technical proposal agreed by both parties.',
  };

export default detail;
