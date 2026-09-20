import type { StaticProductDetail } from '@/constants/static-products';
import { imagesBySlug } from '@/constants/static-products';

const detail: Partial<StaticProductDetail> = {
    series: 'Rotary-Hearth Furnace Series',
    title: 'Rotary-Hearth Furnace | Custom-Engineered Rotary-Hearth Heat-Treatment Furnaces',
    breadcrumbSeries: 'Rotary-Hearth Furnace Series',
    summary:
      'Rotary-hearth furnaces are suited to forgings, disc-shaped parts, ring-shaped parts, dies, hardware components, and takt-based continuous heating, annealing, normalizing, and tempering. Based on workpiece material, dimensions, weight, throughput and cycle time, hearth diameter, charging/discharging method, and available floor space, Suneng delivers custom-engineered rotary-hearth heat-treatment furnace solutions.',
    sellingPoints: [
      'Continuous heating on a ring-shaped rotating hearth',
      'Takt-based production',
      'Hearth rotation speed confirmed per project',
      'Charging/discharging method assessed to suit your site',
    ],
    quickTags: [
      'Rotary-hearth heat-treatment furnace',
      'Continuous heating on a ring-shaped hearth',
      'Annealing / normalizing / tempering',
      'Custom hearth diameter',
      'Charging/discharging takt confirmed',
      'PLC control system',
    ],
    ctaHighlights: [
      'Founded in 2006',
      'company-reported approx. 14,700 m² production site',
      'Custom-engineered rotary-hearth furnaces',
    ],
    heroCtas: [
      {
        title: 'Get a Quotation',
        description:
          'Scroll to the inquiry form and submit your rotary-hearth furnace requirements.',
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
        title: 'Meet Your Process Requirements',
        text: 'We tailor hearth diameter, rotation speed, and heating zones to your workpiece specifications, heating temperature, soak time, and production takt.',
      },
      {
        title: 'Match Your Equipment Requirements',
        text: 'We match the rotating-hearth design, charging/discharging method, and control system to your shop layout, loading/unloading approach, and automation requirements.',
      },
      {
        title: 'Optimize Treatment Consistency',
        text: 'Through optimization of hearth rotation speed, zone layout, and temperature control, there is room to improve heating consistency across the workpiece.',
      },
      {
        title: 'Energy-Efficiency Assessment',
        text: 'We can carry out an energy-efficiency assessment based on furnace insulation, heating zones, and operating schedule.',
      },
      {
        title: 'Stability Configured to Your Operating Conditions',
        text: 'The rotating hearth, drive system, refractory lining, and temperature control are configured to your production conditions for improved operating stability.',
      },
    ],
    customSpecs: [
      {
        key: 'Workpiece Material',
        value:
          'Provide the material grade, heat-treatment objective, and surface-quality requirements.',
      },
      {
        key: 'Workpiece Type',
        value:
          'Forgings, disc-shaped parts, ring-shaped parts, dies, hardware components, or other workpieces heated on a takt basis.',
      },
      {
        key: 'Workpiece Dimensions',
        value:
          'Provide maximum envelope, typical sizes, layout arrangement, and required spacing between workpieces.',
      },
      {
        key: 'Unit Weight',
        value:
          'Provide the unit weight, maximum weight, and required load distribution on the hearth.',
      },
      {
        key: 'Hourly Throughput',
        value:
          'Specify the hourly throughput, takt schedule, and continuous-operation requirements.',
      },
      {
        key: 'Hearth Diameter',
        value:
          'Calculated from the loading area for workpieces, the charging/discharging positions, and the dwell time in the furnace.',
      },
      {
        key: 'Effective Loading Area',
        value:
          'Confirmed from workpiece arrangement, spacing, rotation path, and heating coverage.',
      },
      {
        key: 'Effective Chamber Height',
        value:
          'Determined by workpiece height, fixture height, heat-circulation clearance, and safety clearances.',
      },
      {
        key: 'Hearth Load Capacity',
        value:
          'Designed comprehensively from workpiece weight, layout method, hearth structure, and rotating mechanism.',
      },
      {
        key: 'Hearth Rotation Speed',
        value:
          'Confirmed from heating time, soak time, charging/discharging takt, and zone layout.',
      },
      {
        key: 'Charging/Discharging Method',
        value:
          'Manual, robotic, conveyor, or automated loading/unloading, assessed to suit on-site conditions.',
      },
      {
        key: 'Number of Temperature Zones',
        value:
          'Determined by heat-up, soak, and discharge temperatures and the process-stage configuration required.',
      },
      {
        key: 'Maximum Temperature',
        value:
          'Provide the design maximum temperature and the maximum temperature required by your process.',
      },
      {
        key: 'Normal Operating Temperature',
        value:
          'Provide the day-to-day operating temperature range to guide selection of the refractory lining and heating system.',
      },
      {
        key: 'Heat-Treatment Process',
        value:
          'Continuous heating, annealing, normalizing, tempering, or other takt-based heat-treatment processes.',
      },
      {
        key: 'Heating Method',
        value:
          'Electric resistance heating, gas-fired heating, or other methods, to be confirmed in light of the process and energy conditions.',
      },
      {
        key: 'Atmosphere Requirements',
        value:
          'Air, protective atmosphere, or other atmosphere requirements, to be confirmed by material and process.',
      },
      {
        key: 'Cooling Method',
        value:
          'Natural cooling, air cooling, an integrated cooling section, or downstream cooling equipment, to be confirmed by process.',
      },
      {
        key: 'Automated Loading/Unloading Requirements',
        value:
          'Confirmed by takt, positioning, fixture return flow, and interlocking with upstream and downstream equipment.',
      },
      {
        key: 'Control System Requirements',
        value:
          'PLC, touchscreen HMI, temperature controllers, chart recorder, multi-zone control, alarm protection, and more.',
      },
      {
        key: 'Site Space and Upstream/Downstream Equipment Conditions',
        value:
          'Provide shop floor space, power supply, gas supply, fume exhaust, foundation, and upstream/downstream equipment conditions.',
      },
    ],
    configurations: [
      {
        title: 'Compact Rotary-Hearth Furnace',
        image: imagesBySlug['rotary-hearth-furnace'].configs[0],
        specs: [
          'Workpiece range: confirmed for small parts, disc-shaped parts, or ring-shaped parts',
          'Hearth diameter: calculated from the effective loading area and takt',
          'Zone configuration: confirmed from heat-up, soak, and discharge temperatures',
          'Applications: small parts, hardware components, takt-based heating',
        ],
      },
      {
        title: 'Large Rotary-Hearth Furnace',
        image: imagesBySlug['rotary-hearth-furnace'].configs[1],
        specs: [
          'Workpiece range: confirmed for dies, forgings, or batch-heated workpieces',
          'Hearth load capacity: designed from unit weight, layout method, and rotating mechanism',
          'Charging/discharging method: assessed from mechanical loading, conveyor handoff, and on-site space',
          'Applications: dies, forging, high-end equipment components, machinery manufacturing',
        ],
      },
    ],
    processes: [
      'Continuous heating',
      'Annealing',
      'Normalizing',
      'Tempering',
      'Forge heating',
      'Takt-based heat treatment',
    ],
    industries: [
      'Die manufacturing',
      'Hardware components',
      'High-end equipment components',
      'Forging',
      'Machinery manufacturing',
      'Heat-treatment job shops',
    ],
    leadBullets: [
      'Initial solution discussion',
      'Furnace type assessed against process requirements',
      'Configuration boundaries confirmed against parameters',
      'After-sales support provided per contract',
    ],
    parameterTitle: 'Which Parameters Need to Be Confirmed for a Custom Rotary-Hearth Furnace?',
    parameterLink: {
      title: 'See Which Parameters a Quote Requires',
      description: 'View the quotation-parameter reference page.',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle:
      'Rotary-Hearth Furnace, Pusher Furnace, or Bogie-Hearth Furnace—How to Choose?',
    comparisonHeaders: [
      'Rotary-hearth furnace suits',
      'Pusher furnace suits',
      'Bogie-hearth furnace suits',
    ],
    comparisonRows: [
      {
        left: 'Workpieces suited to ring-shaped loading or takt-based rotary heating',
        middle: 'Workpieces suited to pusher-style continuous travel through the furnace',
        right: 'Large workpieces or heavier individual pieces',
      },
      {
        left: 'Fairly steady batch volumes',
        middle: 'Workpieces that can advance on trays, baskets, or in batches',
        right: 'Cyclic, whole-furnace loading and unloading',
      },
      {
        left: 'Continuous or semi-continuous takt-based production needed',
        middle: 'Steady production takt',
        right: 'Bogie support or overhead-crane lifting required',
      },
      {
        left: 'Defined requirements for hearth rotation speed, zone layout, and charging/discharging takt',
        middle: 'Well-defined dwell time in the furnace',
        right: 'Irregularly shaped workpieces',
      },
      {
        left: 'Suited to forgings, disc-shaped parts, ring-shaped parts, dies, and some small-to-medium batch workpieces',
        middle: 'Suited to continuous annealing, tempering, heating, and similar applications',
        right:
          'Suited to heat treatment of large castings and forgings, dies, and welded structures',
      },
    ],
    faq: [
      {
        question: 'Q1: What workpieces is a rotary-hearth furnace suited to?',
        answer:
          'Rotary-hearth furnaces are well suited to forgings, disc-shaped parts, ring-shaped parts, dies, hardware components, and batch workpieces that lend themselves to ring-pattern loading or cyclic rotary heating. Whether a rotary-hearth design is the right fit depends on the workpiece weight, loading arrangement, charge/discharge cycle, and available floor space.',
      },
      {
        question:
          'Q2: Can a rotary-hearth furnace handle annealing, normalizing, tempering, and heating?',
        answer:
          'Yes. Depending on the project, a rotary-hearth furnace can be used for cyclic continuous heating, annealing, normalizing, tempering, and certain forge-heating applications. Different processes call for different maximum temperatures, soak times, hearth rotation speeds, temperature-zone layouts, cooling methods, and discharge cycles, all of which should be confirmed item by item during the engineering stage.',
      },
      {
        question: 'Q3: Which parameters mainly drive the price of a rotary-hearth furnace?',
        answer:
          'The price of a rotary-hearth furnace is driven mainly by the hearth diameter, the effective loading area, the hearth load capacity, the number of temperature zones, the maximum temperature, the throughput cycle, the heating method, the atmosphere and cooling requirements, the charge/discharge arrangement, the level of automation, the control system, and the scope of installation and commissioning. We recommend submitting your parameters first so we can give you a meaningful price range.',
      },
      {
        question:
          'Q4: What is the difference between a rotary-hearth furnace and a bogie-hearth furnace?',
        answer:
          'A rotary-hearth furnace uses a rotating hearth to achieve cyclic heating with continuous or semi-continuous charging and discharging, making it well suited to applications with relatively steady batch volumes. A bogie-hearth furnace is better suited to whole-charge loading and unloading of large, heavy, or irregularly shaped workpieces. The choice depends on workpiece dimensions, loading method, throughput cycle, and on-site lifting conditions.',
      },
      {
        question: 'Q5: How do I choose between a rotary-hearth furnace and a pusher furnace?',
        answer:
          'A rotary-hearth furnace is better suited to ring-pattern loading, a rotating hearth, and fixed charge/discharge positions for cyclic production. A pusher furnace is better suited to trays, baskets, or batch workpieces advanced in a straight line. The choice calls for a comparison of the loading arrangement, the dwell time inside the furnace, the charge/discharge interface, and ease of maintenance.',
      },
      {
        question: 'Q6: How is heating uniformity ensured in a rotary-hearth furnace?',
        answer:
          'Heating uniformity depends on the effective loading area, the hearth rotation speed, the workpiece arrangement, the temperature-zone layout, the heating elements or combustion system, furnace-chamber circulation, the temperature-measurement points, and the agreed acceptance criteria. Specific figures cannot be separated from the committed project configuration and should be confirmed in line with the operating conditions, the test conditions, and the contractual terms.',
      },
      {
        question: 'Q7: Can an existing rotary-hearth furnace be retrofitted or overhauled?',
        answer:
          'It is best to first assess the condition of the hearth rotation mechanism, the drive system, the sealing structure, the refractory lining, the heating system, the temperature-control zoning, the safety interlocks, and the electrical control system. Whether the furnace is a suitable candidate for a retrofit or overhaul depends on the condition of the furnace body, the fault history, spare-part availability, the production load, and the available shutdown window.',
      },
      {
        question:
          'Q8: What information should I prepare before requesting a quotation for a rotary-hearth furnace?',
        answer:
          'We recommend preparing the workpiece material, form, dimensions, and weight per piece; the required throughput per hour; the hearth diameter or available floor space; the maximum temperature and typical working temperature; the heat-treatment process; the charge/discharge arrangement; the atmosphere and cooling requirements; the automation needs; and details of the on-site layout.',
      },
    ],
    geoSections: [
      {
        title: 'Applicable workpieces',
        text: 'Rotary-hearth furnaces suit ring-pattern loading, dies, forgings, small-to-medium batch workpieces, and parts that require cyclic continuous heating. The hearth diameter, rotation mechanism, loading method, workpiece weight, and charge/discharge cycle all influence the furnace-chamber zoning, the hearth load capacity, and the charging/discharging arrangement.',
      },
      {
        title: 'Typical processes',
        text: 'Common processes include heating, annealing, normalizing, tempering, and aging. For forge heating or cyclic continuous production, the workpiece placement, heating uniformity, discharge temperature, rotation speed, and integration with on-site automation all need to be confirmed.',
      },
      {
        title: 'Selection considerations',
        items: [
          'Hearth diameter and effective loading area',
          'Rotation mechanism, load capacity, and positioning method',
          'Loading method and workpiece weight',
          'Heating uniformity and temperature-zone distribution',
          'Charge/discharge cycle and automation integration',
          'Hearth sealing, maintenance, and safety interlocks',
        ],
      },
    ],
    relatedLinks: [
      {
        title: 'Parameters needed to quote an industrial furnace',
        description:
          'Organize the furnace type, dimensions, temperature, throughput, process curve, and site conditions to make your inquiry more efficient.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title: 'Energy-saving retrofit and heat-treatment furnace overhaul services',
        description:
          'Learn how the rotation mechanism, refractory lining, heating, sealing, and control system of aging rotary-hearth and heat-treatment furnaces are assessed.',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: 'Heat-treatment furnace manufacturer page',
        description:
          "Learn about Suneng's product range, manufacturing capability, and custom-engineering process as a heat-treatment furnace manufacturer.",
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: 'Pusher furnace page',
        description:
          'Compare continuous charging and discharging by pushing, tray and basket loading, and steady-cycle production scenarios.',
        href: '/zh/products/detail/pusher-furnace',
      },
      {
        title: 'Bogie-hearth furnace page',
        description:
          'Compare bogie-hearth furnace solutions for large workpieces, batch loading, and custom bogie load-bearing requirements.',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        title: 'Roller-hearth furnace page',
        description:
          'Learn about roller-hearth furnace solutions for the continuous heat treatment of plates, bars, tubes, and regularly shaped workpieces.',
        href: '/zh/products/detail/roller-hearth-furnace',
      },
      {
        title: 'Product center',
        description:
          "Browse Suneng's published heat-treatment furnaces, industrial furnaces, and heat-treatment lines.",
        href: '/zh/products',
      },
      {
        title: 'Contact us',
        description:
          'Submit your rotary-hearth furnace parameters, discuss a solution, or arrange further technical communication.',
        href: '/zh/contact',
      },
    ],
    parameterNote:
      'A rotary-hearth furnace cannot be quoted from the furnace type name alone. The figure depends on the workpiece material, dimensions and single-piece weight, throughput cycle time, hearth diameter, effective charging area, number of temperature zones, charging and discharging method and site conditions, and is ultimately governed by the technical proposal agreed by both parties.',
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
