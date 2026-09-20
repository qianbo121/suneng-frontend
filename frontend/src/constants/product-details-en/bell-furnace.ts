import type { StaticProductDetail } from '@/constants/static-products';
import { imagesBySlug } from '@/constants/static-products';

const detail: Partial<StaticProductDetail> = {
    series: 'Bell-Type Furnace Series',
    title: 'Bell-Type Furnace | Custom Bell-Type Heat-Treatment Furnaces',
    breadcrumbSeries: 'Bell-Type Furnace Series',
    summary:
      'Bell-type furnaces are suited to annealing, tempering, soaking, and protective-atmosphere heat treatment of coil, wire, rolled coils, small parts, and basket-loaded batch workpieces. Based on workpiece geometry, charge weight, bell dimensions, hearth size, maximum temperature, atmosphere requirements, and on-site conditions, Suneng delivers custom-engineered bell-type heat-treatment furnace solutions.',
    sellingPoints: [
      'Protective atmosphere assessed',
      'Custom bell dimensions',
      'Hearth structure confirmed per project',
      'Custom bell-type electric resistance furnaces',
    ],
    quickTags: [
      'Coil / wire / rolled coils',
      'Annealing / tempering / soaking',
      'Protective-atmosphere bell-type furnace',
      'Custom bell dimensions',
      'Custom hearth structure',
      'PLC control system',
    ],
    ctaHighlights: [
      'Founded in 2006',
      'company-reported approx. 14,700 m² production site',
      'Response time agreed per project',
    ],
    heroCtas: [
      {
        title: 'Get a Quote',
        description: 'Scroll to the inquiry form and submit your bell-type furnace parameters.',
        href: '#product-lead-form',
      },
      {
        title: 'See What Parameters a Quote Needs',
        description:
          'Learn what information to prepare before requesting an industrial furnace quote.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
    ],
    reasons: [
      {
        title: 'Meets Your Process Requirements',
        text: 'We tailor the bell structure, hearth size, and temperature-control scheme to your workpiece type, charge height, protective-atmosphere needs, and temperature-uniformity targets.',
      },
      {
        title: 'Fits Your Equipment Needs',
        text: 'We adapt to the loading method for small parts, rolled coils, wire, basket-loaded parts, or batch workpieces, optimizing operability for your site conditions.',
      },
      {
        title: 'Improves Heat-Treatment Consistency',
        text: 'Through optimized bell structure, thermal-circulation system, and temperature-control configuration, there is room to improve heating consistency across the workpiece.',
      },
      {
        title: 'Optimizes Running Energy Use',
        text: 'By tuning the heating-zone configuration to the effective heating area, insulation structure, and thermal-circulation method, there is room to improve running energy consumption.',
      },
      {
        title: 'Project-Specific Configuration for Stability',
        text: 'The bell, hearth, sealing structure, heating system, and control system are configured to your operating conditions to improve running stability.',
      },
    ],
    customSpecs: [
      {
        key: 'Workpiece Material',
        value:
          'Provide the material grade, heat-treatment objective, and surface-quality requirements.',
      },
      {
        key: 'Workpiece Geometry',
        value:
          'For coil, wire, rolled coils, small parts, basket-loaded parts, etc., specify the loading method.',
      },
      {
        key: 'Weight per Piece / per Basket',
        value:
          'Provide the weight per piece, basket weight, total charge weight, and support method.',
      },
      {
        key: 'Charge per Cycle',
        value:
          'Specify the pieces per cycle, number of coils, number of baskets, total weight, and batch cycle time.',
      },
      {
        key: 'Effective Bell Dimensions',
        value:
          'Determined together from the load envelope, thermal-circulation space, bell structure, and maintenance clearance.',
      },
      {
        key: 'Hearth Size',
        value:
          'Confirmed from the load width, hearth load capacity, sealing structure, and lifting method.',
      },
      {
        key: 'Charge Height',
        value: 'Provide the maximum charge height, typical height, and reserved bell clearance.',
      },
      {
        key: 'Maximum Temperature',
        value:
          'Provide both the design maximum temperature and the maximum temperature required by the process.',
      },
      {
        key: 'Typical Working Temperature',
        value:
          'Provide the day-to-day process temperature range to aid selection of the refractory lining, heating, and atmosphere systems.',
      },
      {
        key: 'Heat-Treatment Process',
        value: 'Annealing, tempering, soaking, protective-atmosphere heat treatment, etc.',
      },
      {
        key: 'Protective Atmosphere Required?',
        value:
          'Assessed against material, surface quality, oxidation control, and safety requirements.',
      },
      {
        key: 'Atmosphere Type',
        value:
          'Nitrogen, argon, mixed gas, or other atmospheres are confirmed in light of process and safety requirements.',
      },
      {
        key: 'Sealing Requirements',
        value:
          'Confirmed together with the bell, hearth, atmosphere system, cooling method, and acceptance criteria.',
      },
      {
        key: 'Cooling Method',
        value:
          'Furnace cooling, forced-air cooling, atmosphere cooling, or a supporting cooling method is confirmed per process.',
      },
      {
        key: 'Bell Lift Method',
        value:
          'Crane lifting, mechanical lift, or another method is determined by site conditions.',
      },
      {
        key: 'Heating Method',
        value:
          'Electric resistance heating / gas-fired heating, selectable per energy supply and process requirements.',
      },
      {
        key: 'Control-System Requirements',
        value:
          'Basic temperature control, PLC, touchscreen HMI, chart recorder, multi-zone temperature control, data traceability, etc.',
      },
      {
        key: 'On-Site Lifting and Installation Conditions',
        value:
          'Provide the shop height, crane capacity, foundation conditions, power and gas supply, and installation boundary.',
      },
    ],
    configurations: [
      {
        title: 'Bell-Type Furnace for Basket-Loaded Small Parts',
        image: imagesBySlug['bell-furnace'].configs[0],
        specs: [
          'Effective dimensions: custom-engineered to the basket, charge height, and bell structure',
          'Temperature rating: confirmed per material and process requirements',
          'Atmosphere configuration: assessed against surface-quality, sealing, and safety requirements',
          'Applications: small parts, laboratory, trial production, and basket-loaded batch processing',
        ],
      },
      {
        title: 'Protective-Atmosphere Bell-Type Annealing Furnace',
        image: imagesBySlug['bell-furnace'].configs[1],
        specs: [
          'Bell dimensions: confirmed from the geometry of rolled coils, wire, or basket-loaded workpieces',
          'Hearth structure: designed per load capacity, sealing, and loading/unloading method',
          'Heating system: sized to the bell dimensions and heat-up requirements',
          'Applications: annealing or soaking of rolled coils, wire, and batch workpieces',
        ],
      },
    ],
    processes: [
      'Annealing',
      'Tempering',
      'Soaking',
      'Protective-atmosphere heat treatment',
      'Basket-loaded batch processing',
      'Coil heat treatment',
    ],
    industries: [
      'Hardware processing',
      'Small-batch production',
      'Mold and die making',
      'Metal-material processing',
      'Job-shop heat treaters',
    ],
    leadBullets: [
      'Determine bell structure from workpiece geometry',
      'Confirm hearth load capacity from charge weight',
      'Assess sealing method from atmosphere requirements',
      'Define delivery boundary from site conditions',
    ],
    parameterTitle: 'Which Parameters Need to Be Confirmed for a Custom Bell-Type Furnace?',
    parameterLink: {
      title: 'See What Parameters a Quote Needs',
      description: 'View the quote-parameter reference page.',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle: 'Bell-Type Furnace, Box (Chamber) Furnace, or Pit Furnace - How to Choose?',
    comparisonHeaders: [
      'Bell-type furnace suits',
      'Box (chamber) furnace suits',
      'Pit furnace suits',
    ],
    comparisonRows: [
      {
        left: 'Coil, wire, rolled coils, or basket-loaded batch workpieces',
        middle: 'Small to medium workpieces',
        right: 'Shafts, rods, and long parts',
      },
      {
        left: 'Workpieces needing a combined bell-and-hearth structure',
        middle: 'Small-batch or trial-production tasks',
        right: 'Workpieces better suited to vertical loading',
      },
      {
        left: 'Need for a protective atmosphere or full bell-type heating',
        middle: 'Relatively simple loading and unloading',
        right: 'High effective-depth requirements',
      },
      {
        left: 'Charge height and bell dimensions requiring customization',
        middle: 'A more compact furnace body',
        right: 'Workpieces requiring crane loading in and out',
      },
      {
        left: 'Suited to basket-loaded batch work, coil annealing, or protective-atmosphere heat treatment',
        middle: 'Suited to standard batch-type heat treatment',
        right: 'Suited to heat treatment of long shafts, sleeves, rods, and similar parts',
      },
    ],
    faq: [
      {
        question: 'Q1: Which heat-treatment applications are bell-type furnaces suited to?',
        answer:
          'Bell-type furnaces suit coils, wire, strip coils, small parts and batches of basket-loaded workpieces, and are commonly used for annealing, tempering, soaking and controlled-atmosphere heat treatment. The exact configuration is confirmed against the workpiece geometry, charge height, bell dimensions, hearth structure, atmosphere requirements and cooling method.',
      },
      {
        question:
          'Q2: What is the difference between a bell-type furnace and a box (chamber) furnace?',
        answer:
          'A bell-type furnace typically pairs a removable bell with a fixed hearth, which suits strip coils, basket-loaded batches and applications that need the entire charge heated under the bell; a box (chamber) furnace has a more fixed structure better suited to small and medium workpieces, small lots and trial production. The choice depends on the loading method, the working space and the atmosphere requirements.',
      },
      {
        question: 'Q3: Can a bell-type furnace be fitted with a protective atmosphere?',
        answer:
          'A protective atmosphere can be evaluated on a project basis, but it requires confirming the material, surface-quality requirements, gas type, sealing structure, safety interlocks, exhaust method and cooling conditions. A protective-atmosphere system differs considerably from a standard air furnace and must be engineered to the site conditions and process requirements.',
      },
      {
        question: 'Q4: How is the loading method for a bell-type furnace determined?',
        answer:
          'The loading method is generally driven by the workpiece geometry, basket structure, charge weight per load, charge height, lifting conditions and production rate. The design must also account for the effective heating zone, heat-circulation paths, hearth load capacity, charge/discharge efficiency, sealing structure and ease of subsequent maintenance.',
      },
      {
        question: 'Q5: Can an aging bell-type furnace be overhauled?',
        answer:
          'The condition of the bell, hearth, sealing structure, refractory lining, heating elements, heat circulation, atmosphere system and control system can be assessed first. Whether an overhaul is worthwhile depends on the equipment age, spare-parts availability, existing faults, the available shutdown window, the operating history and future throughput needs.',
      },
      {
        question: 'Q6: Which parameters mainly determine the price of a bell-type furnace?',
        answer:
          'The price of a bell-type furnace is driven mainly by the bell dimensions, hearth dimensions, charge height, charge weight, maximum temperature, heating method, atmosphere system, sealing requirements, cooling method, control system and the scope of on-site installation. We recommend submitting your parameters first, then assessing the configuration and price range.',
      },
      {
        question: 'Q7: How is temperature uniformity ensured in a bell-type furnace?',
        answer:
          'Temperature uniformity depends on the effective working zone, the loading method, the bell structure, the refractory insulation, the heat-circulation system, the control zoning, the temperature-measurement method and the acceptance criteria. Specific figures should not be committed to in isolation from the operating conditions; the test conditions and acceptance requirements should be defined in the technical proposal.',
      },
      {
        question:
          'Q8: What information should be prepared before requesting a quotation for a bell-type furnace?',
        answer:
          'We recommend preparing the workpiece material and geometry, the weight per piece or per basket, the charge weight per load, the bell dimensions, the hearth dimensions, the maximum temperature, the usual working temperature, the heat-treatment process, the atmosphere requirements, the cooling method, the lifting conditions and site photographs.',
      },
    ],
    geoSections: [
      {
        title: 'Applicable Workpieces',
        text: 'Bell-type furnaces suit coils, small parts, batches of basket-loaded parts and workpieces that require bell-type heating or uniform soaking of the whole charge. The charge height, bell dimensions, hearth structure, sealing conditions and cooling method all affect the furnace structure, the atmosphere configuration and the production rate.',
      },
      {
        title: 'Typical Processes',
        text: 'Common processes include annealing, tempering and soaking; controlled-atmosphere heat treatment requires a project-specific evaluation of bell sealing, the gas system, safety interlocks and the cooling method. Temperature uniformity and heat-up time should be calculated separately for each loading method.',
      },
      {
        title: 'Selection Considerations',
        items: [
          'Bell dimensions, hearth dimensions and charge height',
          'Loading method, basket or fixture structure',
          'Sealing structure and atmosphere conditions',
          'Cooling method and discharge rate',
          'Temperature uniformity and heat-circulation configuration',
          'Bell raising/lowering, lifting and on-site clearance',
        ],
      },
    ],
    relatedLinks: [
      {
        title: 'What Parameters Are Needed to Quote an Industrial Furnace',
        description:
          'Compile the furnace type, dimensions, temperature, charge weight, process curve and site conditions to make your enquiry more efficient.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title:
          'Industrial Furnace Energy-Saving Retrofit and Heat-Treatment Furnace Overhaul Services',
        description:
          'Learn how we evaluate the bell, sealing, refractory lining, atmosphere and control systems of aging bell-type and heat-treatment furnaces.',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: 'Heat-Treatment Furnace Manufacturer Page',
        description:
          "Learn about Suneng's product range, manufacturing capabilities and custom-engineering process as a heat-treatment furnace manufacturer.",
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: 'Box (Chamber) Furnace Page',
        description:
          'Compare box (chamber) furnace solutions for small and medium workpieces, small lots and trial production.',
        href: '/zh/products/detail/box-furnace',
      },
      {
        title: 'Pit Furnace Page',
        description:
          'Learn about pit furnace solutions for shafts, rods, long parts and vertical loading.',
        href: '/zh/products/detail/pit-furnace',
      },
      {
        title: 'Bogie-Hearth Furnace Page',
        description:
          'Compare bogie-hearth furnace solutions for large workpieces, batch (cyclic) loading and custom-engineered bogie load capacity.',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        title: 'Product Center',
        description:
          "Browse Suneng's published heat-treatment furnaces, industrial furnaces and continuous heat-treatment lines.",
        href: '/zh/products',
      },
      {
        title: 'Contact Us',
        description:
          'Submit your bell-type furnace parameters, discuss a solution or arrange further technical consultation.',
        href: '/zh/contact',
      },
    ],
    parameterNote:
      'A bell-type furnace cannot be quoted from the furnace type name alone. The figure depends on the workpiece form, charge weight, bell (hood) dimensions, base dimensions, temperature, atmosphere, sealing, cooling and on-site lifting conditions, and is ultimately governed by the technical proposal agreed by both parties.',
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
