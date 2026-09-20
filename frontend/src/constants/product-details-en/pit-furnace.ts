import type { StaticProductDetail } from '@/constants/static-products';
import { imagesBySlug } from '@/constants/static-products';

const detail: Partial<StaticProductDetail> = {
    series: 'Pit Furnace Series',
    title: 'Pit Furnace | Custom-Engineered Pit-Type Heat-Treatment Furnaces',
    breadcrumbSeries: 'Pit Furnace Series',
    summary:
      'Pit furnaces are built for batch heat treatment of shafts, bars, long parts, sleeves and other workpieces that are best charged vertically. Suneng delivers custom-engineered pit-type heat-treatment furnaces sized around your workpiece length, diameter, individual part weight, charge weight, maximum temperature, heat-treatment process, hoisting method and on-site conditions.',
    sellingPoints: [
      'Heat treatment of shafts and long parts',
      'Custom effective depth',
      'Furnace lid design confirmed per project',
      'Electric or gas-fired options',
    ],
    quickTags: [
      'Heat treatment of shafts and bars',
      'Tempering / annealing / quench heating',
      'Custom electric pit furnaces',
      'Custom effective depth',
      'Protective atmosphere assessable',
      'PLC control system',
    ],
    ctaHighlights: [
      'Founded in 2006',
      'company-reported approx. 14,700 m² production site',
      'Custom-engineered pit furnaces',
    ],
    heroCtas: [
      {
        title: 'Get a Quote',
        description: 'Scroll to the inquiry form and submit your pit furnace specifications.',
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
        title: 'Furnace type sized to long parts',
        text: 'We determine the effective diameter, effective depth and furnace-mouth clearance from the length, diameter and charging method of your shafts, bars and sleeves.',
      },
      {
        title: 'Structure confirmed by hoisting',
        text: 'We match the loading and unloading approach to your crane capacity, lifting fixtures, lid-opening method and available headroom on site.',
      },
      {
        title: 'Heating configured to the process',
        text: 'We match the heating method, refractory lining and temperature-control zoning to processes such as tempering, annealing, quench heating and aging.',
      },
      {
        title: 'Scope defined by site conditions',
        text: 'We define the delivery scope around your shop-floor space, foundation conditions, power or gas supply, installation boundaries and safety requirements.',
      },
      {
        title: 'Acceptance criteria agreed upfront',
        text: 'Indicators such as temperature uniformity, recording method and interlock protection should be confirmed in the technical proposal and contract annexes.',
      },
    ],
    customSpecs: [
      {
        key: 'Workpiece material',
        value:
          'Provide the material grade, heat-treatment objective and surface-quality requirements.',
      },
      {
        key: 'Workpiece length',
        value: 'Provide the maximum length, typical lengths, and fixture and clamping allowances.',
      },
      {
        key: 'Workpiece diameter',
        value:
          'Provide the maximum outer diameter, common sizes and required in-furnace handling clearances.',
      },
      {
        key: 'Individual part weight',
        value:
          'Provide the per-part weight, maximum weight, center-of-gravity location and hoisting method.',
      },
      {
        key: 'Charge weight per cycle',
        value: 'State the parts per cycle, total weight, part spacing and batch cycle time.',
      },
      {
        key: 'Effective working-zone diameter',
        value:
          'Determined from workpiece outer diameter, fixtures, charging clearance and thermal-circulation space combined.',
      },
      {
        key: 'Effective working-zone depth',
        value:
          'Determined from workpiece length, fixtures, lid structure and effective heating zone.',
      },
      {
        key: 'Maximum temperature',
        value:
          'Provide both the design maximum temperature and the maximum temperature required by the process.',
      },
      {
        key: 'Normal working temperature',
        value:
          'Provide the routine process temperature range to support refractory-lining and heating-system selection.',
      },
      {
        key: 'Heat-treatment process',
        value:
          'Tempering, annealing, quench heating, aging, stress relief and similar; carburizing and nitriding can be assessed per project.',
      },
      {
        key: 'Temperature uniformity requirement',
        value:
          'Confirmed together with the effective working zone, charging method, temperature-control zoning and acceptance criteria.',
      },
      {
        key: 'Charging method',
        value:
          'Vertical hoisting, baskets, lifting fixtures or tooling confirmed to suit the workpiece.',
      },
      {
        key: 'Hoisting method',
        value:
          'Provide the crane capacity, lifting-fixture type, furnace-mouth working space and safety boundaries.',
      },
      {
        key: 'Furnace lid structure',
        value:
          'Lift lid, swing lid, sealing structure and safety interlocks confirmed per project.',
      },
      {
        key: 'Heating method',
        value:
          'Electric resistance or gas-fired heating, selected to suit your energy conditions and process requirements.',
      },
      {
        key: 'Protective atmosphere required?',
        value:
          'Assessed against material, surface quality and process objectives; different atmospheres call for clearly defined safety requirements.',
      },
      {
        key: 'Control-system requirements',
        value:
          'Standard temperature control, PLC, touchscreen HMI, chart recorder, multi-zone temperature control, data traceability and more.',
      },
      {
        key: 'On-site space and hoisting conditions',
        value:
          'Provide the shop headroom, hoisting capacity, furnace pit or foundation, power and gas supply, and installation boundaries.',
      },
    ],
    configurations: [
      {
        title: 'Prototyping and small-batch pit furnace',
        image: imagesBySlug['pit-furnace'].configs[0],
        specs: [
          'Effective dimensions: custom-built for test samples, long parts and lifting-fixture method',
          'Temperature class: confirmed to material and process requirements',
          'Control system: configurable temperature controller, chart recorder or PLC',
          'Applications: R&D, laboratory work, prototyping and small-batch processing',
        ],
      },
      {
        title: 'Production pit-type heat-treatment furnace',
        image: imagesBySlug['pit-furnace'].configs[1],
        specs: [
          'Effective dimensions: custom-built for shaft and bar length and diameter',
          'Lid structure: confirmed to hoisting and sealing requirements',
          'Heating system: calculated from furnace chamber size and heat-up requirements',
          'Applications: heat treatment of dies, hardware, machined parts and long parts',
        ],
      },
      {
        title: 'Large-scale industrial pit furnace',
        image: imagesBySlug['pit-furnace'].configs[2],
        specs: [
          'Effective dimensions: custom-built for large long shafts, sleeves or bars',
          'Hoisting conditions: confirmed against crane capacity, furnace-mouth space and safety boundaries',
          'Energy type: electric, natural gas and others matched to site conditions',
          'Applications: large components, rail transit and energy-equipment supply',
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
      'Tempering',
      'Annealing',
      'Quench heating',
      'Aging',
      'Stress relief',
      'Protective atmosphere assessable',
    ],
    industries: [
      'Research institutes',
      'Die manufacturing',
      'Hardware processing',
      'Rail transit',
      'Mechanical manufacturing',
      'Energy equipment',
    ],
    leadBullets: [
      'Effective depth determined by workpiece length',
      'Effective working zone confirmed by diameter and lifting fixtures',
      'Lid structure determined by hoisting method',
      'Control system configured to process requirements',
    ],
    parameterTitle: 'Which Parameters Need Confirming for a Custom Pit Furnace?',
    parameterLink: {
      title: 'See Which Parameters a Quote Requires',
      description: 'View the quote-parameter reference page.',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle: 'Pit Furnace, Box Furnace or Bogie-Hearth Furnace: How to Choose?',
    comparisonHeaders: ['Pit furnace suits', 'Box furnace suits', 'Bogie-hearth furnace suits'],
    comparisonRows: [
      {
        left: 'Shafts, bars and long parts',
        middle: 'Small to medium workpieces',
        right: 'Large workpieces',
      },
      {
        left: 'Workpieces better charged vertically',
        middle: 'Relatively simple loading and unloading',
        right: 'Heavy individual parts',
      },
      {
        left: 'High effective-depth requirements',
        middle: 'Small-batch or prototyping tasks',
        right: 'Need for a bogie to carry the load',
      },
      {
        left: 'Need to be hoisted in and out of the furnace',
        middle: 'More compact furnace body',
        right: 'Need for crane hoisting',
      },
      {
        left: 'Suited to heat treatment of long shafts, sleeves and bars',
        middle: 'Batch heat treatment of workpieces of limited height',
        right: 'Batch heat treatment with a larger furnace chamber',
      },
    ],
    faq: [
      {
        question: 'Q1: What workpieces are pit furnaces suited for?',
        answer:
          'Pit furnaces are well suited to shafts, bars, long parts, and sleeve-type components, as well as any workpiece better charged vertically. They are commonly used for tempering, annealing, quench heating, aging, and stress relief. Whether a given part is a good fit depends on its length, diameter, weight, lifting method, and process curve.',
      },
      {
        question: 'Q2: Can a pit furnace handle tempering, annealing, and quench heating?',
        answer:
          'Yes. A pit furnace can be configured for tempering, annealing, pre-quench heating, aging, stress relief, and similar processes according to project requirements. Different processes call for different temperature ranges, heating and cooling profiles, soak times, transfer methods, and control or data-recording requirements, all of which should be confirmed item by item during the proposal stage.',
      },
      {
        question: 'Q3: Which parameters mainly drive the price of a pit furnace?',
        answer:
          'The price of a pit furnace is driven mainly by effective diameter, effective depth, maximum temperature, charge weight, lid (cover) design, heating method, refractory lining material, control system, atmosphere requirements, and the scope of on-site installation work. Pit furnaces are largely custom-engineered equipment, so we recommend submitting your parameters first before assessing the configuration and price range.',
      },
      {
        question: 'Q4: What is the difference between a pit furnace and a box (chamber) furnace?',
        answer:
          'A pit furnace uses vertical charging, which makes it better suited to shafts, bars, sleeve-type parts, and long components. A box (chamber) furnace has a more compact structure and is better suited to small and medium workpieces, small batches, or trial production. When choosing between them, compare workpiece height, loading and unloading method, lifting conditions, effective working zone, and available floor space.',
      },
      {
        question: 'Q5: How is the effective depth of a pit furnace determined?',
        answer:
          'Effective depth is typically determined by the maximum workpiece length, fixture height, lid (cover) design, the working space at the furnace mouth, charging clearance, and the effective heating zone. If product specifications may change in the future, a reasonable margin should also be reserved at the design stage to avoid a mismatch between the furnace chamber dimensions and the actual workpieces.',
      },
      {
        question: 'Q6: How is temperature uniformity ensured in a pit furnace?',
        answer:
          'Temperature uniformity depends on the effective working zone, the layout of the heating elements or combustion system, the refractory lining structure, the number of control zones, thermocouple placement, charging spacing, and the process schedule. Specific figures cannot be committed in isolation from the furnace type and the state of the workpiece, so the test conditions and acceptance criteria should be defined clearly in the technical proposal.',
      },
      {
        question: 'Q7: Can an old pit furnace be retrofitted or overhauled?',
        answer:
          'Yes, starting with an equipment condition assessment. Common retrofit directions for an old pit furnace include refractory lining renewal, heating system servicing, lid (cover) seal repair, control system upgrades, and improved interlock protection. Whether an overhaul is worthwhile depends on the furnace body structure, safety risks, spare-parts availability, and the available production-downtime window.',
      },
      {
        question:
          'Q8: What information should be prepared before requesting a pit furnace quotation?',
        answer:
          'We recommend preparing the workpiece material, length, diameter, single-piece weight, charge weight per cycle, maximum temperature, typical working temperature, heat-treatment process, temperature uniformity requirements, lifting method, available floor space, and photographs. Even if the information is incomplete, you can start the conversation first and let our engineers determine what additional details are needed.',
      },
    ],
    geoSections: [
      {
        title: 'Applicable Workpieces',
        text: 'Pit furnaces are suited to shafts, bars, sleeve-type parts, long shaft components, and any workpiece that needs to be charged vertically. Workpiece length, diameter, lifting method, charge weight, and distortion-control requirements all affect the pit depth, effective diameter, lid (cover) design, lifting fixtures, and safe-operation configuration.',
      },
      {
        title: 'Typical Processes',
        text: 'Common processes include tempering, annealing, quench heating, aging, and stress relief. Whether to add atmosphere protection, hot-air circulation, or a special lifting arrangement should be assessed against the material, the workpiece length-to-diameter ratio, the temperature uniformity requirements, and the on-site operating method.',
      },
      {
        title: 'Selection Considerations',
        items: [
          'Pit depth, effective diameter, and effective heating zone',
          'Workpiece length, weight, and lifting method',
          'Lid (cover) design and sealing arrangement',
          'Temperature uniformity and control zoning',
          'Safe charging/discharging and on-site floor space',
          'Control system, interlock, and data-recording requirements',
        ],
      },
    ],
    relatedLinks: [
      {
        title: 'Which Parameters Are Needed for an Industrial Furnace Quotation',
        description:
          'Organize furnace type, dimensions, temperature, charge weight, process curves, and site conditions to make your inquiry more efficient.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title:
          'Industrial Furnace Energy-Saving Retrofit and Heat-Treatment Furnace Overhaul Service',
        description:
          'Learn how we assess the refractory lining, heating, lid sealing, and control system of aging pit furnaces and heat-treatment furnaces.',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: 'Heat-Treatment Furnace Manufacturer Page',
        description:
          "Explore Suneng's product range, manufacturing capability, and customization process as a heat-treatment furnace manufacturer.",
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: 'Bogie-Hearth Furnace Page',
        description:
          'Compare bogie-hearth furnace solutions for large workpieces, batch (cyclic) charging, and custom car load-bearing scenarios.',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        title: 'Box (Chamber) Furnace Page',
        description:
          'Compare box (chamber) furnace solutions for small and medium workpieces, small batches, and trial production.',
        href: '/zh/products/detail/box-furnace',
      },
      {
        title: 'Mesh-Belt Furnace Page',
        description:
          'Learn about mesh-belt furnace solutions for small parts, standard parts, and continuous heat treatment.',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: 'Product Center',
        description:
          'Browse the heat-treatment furnaces, industrial furnaces, and heat-treatment lines that Suneng has made public.',
        href: '/zh/products',
      },
      {
        title: 'Contact Us',
        description:
          'Submit your pit furnace parameters, discuss a solution, or schedule further technical consultation.',
        href: '/zh/contact',
      },
    ],
    parameterNote:
      'A pit furnace cannot be quoted from the furnace type name alone. The figure depends on the workpiece length and diameter, charge weight, effective working zone, lid structure, hoisting method, and temperature and process requirements, and is ultimately governed by the technical proposal agreed by both parties.',
  };

export default detail;
