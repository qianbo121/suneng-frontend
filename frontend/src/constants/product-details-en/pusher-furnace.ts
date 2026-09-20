import type { StaticProductDetail } from '@/constants/static-products';
import { imagesBySlug } from '@/constants/static-products';

const detail: Partial<StaticProductDetail> = {
    series: 'Pusher Furnace Series',
    title: 'Pusher Furnace | Custom-Engineered Pusher-Type Heat-Treatment Furnaces',
    breadcrumbSeries: 'Pusher Furnace Series',
    summary:
      'The pusher furnace is built for continuous annealing, tempering, normalizing and heating of workpieces in steady, well-defined production runs. Drawing on workpiece material, dimensions, weight, throughput requirements, maximum temperature, pushing method, loading and unloading conditions and available floor space, Suneng delivers custom-engineered pusher-type heat-treatment furnace solutions.',
    sellingPoints: [
      'Continuous heat treatment',
      'Custom pushing cycle time',
      'Temperature zones configured per project',
      'Upstream and downstream integration assessed',
    ],
    quickTags: [
      'Continuous heat treatment',
      'Custom pushing method',
      'Tray / basket carriers',
      'Multi-zone temperature control',
      'Annealing / tempering / heating',
      'PLC control system',
    ],
    ctaHighlights: [
      'Founded in 2006',
      'company-reported approx. 14,700 m² production site',
      'Custom-engineered pusher furnaces',
    ],
    heroCtas: [
      {
        title: 'Get a Quotation',
        description: 'Scroll to the inquiry form and submit your pusher furnace parameters.',
        href: '#product-lead-form',
      },
      {
        title: 'See Which Parameters a Quote Requires',
        description:
          'Learn what information to prepare before requesting an industrial furnace quotation.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
    ],
    reasons: [
      {
        title: 'Built Around Your Process',
        text: 'Furnace chamber dimensions, pushing cycle time and heating zones are tailored to your batch volume, heat-treatment temperature and soak time.',
      },
      {
        title: 'Matched to Your Line',
        text: 'The pusher mechanism, charge and discharge structure and automation are matched to your line layout, loading and unloading method and fixture design.',
      },
      {
        title: 'Better Batch Consistency',
        text: 'Through pushing cycle time, zoned temperature control and optimized furnace structure, there is room to improve processing consistency across batches of workpieces.',
      },
      {
        title: 'Optimized Running Energy Use',
        text: 'Heating sections, insulation structure and thermal cycle configuration can be optimized for continuous production, with energy-saving potential assessed against actual operating conditions.',
      },
      {
        title: 'Reliability Configured per Project',
        text: 'The pusher mechanism, drive system, refractory lining, heating elements and control system are configured for continuous-duty operation.',
      },
    ],
    customSpecs: [
      {
        key: 'Workpiece Material',
        value: 'Provide the grade, heat-treatment objective and surface-quality requirements.',
      },
      {
        key: 'Workpiece Form',
        value:
          'Specify whether the workpieces are bars, billets, structural parts, tray-loaded parts, basket-loaded parts or another loading format.',
      },
      {
        key: 'Workpiece Dimensions',
        value: 'Provide length, width, height, maximum envelope and common sizes.',
      },
      {
        key: 'Unit Weight',
        value:
          'Provide unit weight, maximum weight, total tray or basket weight and support method.',
      },
      {
        key: 'Hourly Throughput',
        value:
          'State hourly volume, shift pattern, continuous cycle time and cycle-time variation.',
      },
      {
        key: 'Pushing Cycle Time',
        value:
          'Calculated from residence time in the furnace, soak time, tray spacing and loading/unloading capacity.',
      },
      {
        key: 'Effective Chamber Width',
        value:
          'Determined by tray, basket, fixture or workpiece width plus thermal-circulation clearance.',
      },
      {
        key: 'Effective Chamber Length',
        value:
          'Calculated from heat-up, soak and cool-down times together with the pushing cycle time.',
      },
      {
        key: 'In-Furnace Passage Size',
        value:
          'Confirmed from workpiece height, tray height, furnace-door opening and safety clearances.',
      },
      {
        key: 'Carrier Method',
        value:
          'Tray, basket, pallet, fixture or hearth-supported carrying, confirmed against the workpiece.',
      },
      {
        key: 'Pusher Mechanism Type',
        value:
          'Hydraulic, mechanical, electric or other pushing methods, confirmed against required thrust and cycle time.',
      },
      {
        key: 'Number of Temperature Zones',
        value:
          'Determined by the heat-up, soak, cool-down or process-section configuration required.',
      },
      {
        key: 'Maximum Temperature',
        value:
          'Provide the design maximum temperature and the maximum temperature required by the process.',
      },
      {
        key: 'Typical Working Temperature',
        value:
          'Provide the routine operating temperature range to guide selection of the refractory lining, carriers and heating system.',
      },
      {
        key: 'Heat-Treatment Process',
        value:
          'Continuous annealing, tempering, normalizing, heating, quench preheating and similar.',
      },
      {
        key: 'Temperature Uniformity Requirement',
        value:
          'Confirmed together with the effective working zone, loading method, zone configuration and acceptance criteria.',
      },
      {
        key: 'Atmosphere Requirement',
        value:
          'Air, nitrogen, protective atmosphere or other atmosphere requirements, confirmed against the process.',
      },
      {
        key: 'Cooling Method',
        value:
          'Air cooling, water cooling, atmosphere cooling or a dedicated cooling section, determined by the process.',
      },
      {
        key: 'Loading and Unloading Method',
        value:
          'Manual, mechanical loading, tray return, conveyor integration or automated linkage, confirmed on site.',
      },
      {
        key: 'Control System Requirements',
        value:
          'PLC, touchscreen HMI, temperature controllers, chart recorder, multi-zone control, alarms and protection, etc.',
      },
      {
        key: 'Site Space and Upstream/Downstream Equipment Conditions',
        value:
          'Provide workshop length, power supply, gas supply, fume extraction, cooling water, upstream/downstream equipment and installation boundaries.',
      },
    ],
    configurations: [
      {
        title: 'Tray / Basket Pusher Furnace',
        image: imagesBySlug['pusher-furnace'].configs[0],
        specs: [
          'Passage size: customized to tray, basket or fixture dimensions',
          'Pushing cycle time: calculated from in-furnace residence time and loading/unloading capacity',
          'Zone configuration: confirmed against heat-up, soak and cool-down cycle times',
          'Best suited to: continuous heat treatment with steady batches and a well-defined cycle time',
        ],
      },
      {
        title: 'Continuous Pusher Heat-Treatment Furnace',
        image: imagesBySlug['pusher-furnace'].configs[1],
        specs: [
          'Chamber length: calculated from soak time, pushing cycle time and throughput cycle time',
          'Pusher mechanism: designed for thrust, tray friction and continuous-duty operation',
          'Upstream/downstream integration: assessed against charge/discharge, cooling section and site layout',
          'Best suited to: continuous heating of bars, billets, structural parts and batch workpieces',
        ],
      },
    ],
    processes: [
      'Annealing',
      'Tempering',
      'Normalizing',
      'Continuous heating',
      'Quench preheating',
      'Continuous heat treatment',
    ],
    industries: [
      'Hardware machining',
      'Mold and die manufacturing',
      'Rail transit',
      'Standard-parts manufacturing',
      'Automotive components',
      'Job-shop heat treatment',
    ],
    leadBullets: [
      'Determine the carrier method from the workpiece form',
      'Calculate the pushing cycle time from the throughput cycle time',
      'Configure the control system to the temperature-zone requirements',
      'Define the full-line boundaries from upstream/downstream conditions',
    ],
    parameterTitle: 'Which Parameters Need to Be Confirmed for a Custom Pusher Furnace?',
    parameterLink: {
      title: 'See Which Parameters a Quote Requires',
      description: 'View the quotation-parameter reference page.',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle: 'Pusher Furnace, Roller-Hearth Furnace or Mesh-Belt Furnace — How to Choose?',
    comparisonHeaders: [
      'Pusher furnace suits',
      'Roller-hearth furnace suits',
      'Mesh-belt furnace suits',
    ],
    comparisonRows: [
      {
        left: 'A steady workpiece cycle time',
        middle: 'Plate, bar, tube or regularly shaped workpieces',
        right: 'Small parts, standard parts and fasteners',
      },
      {
        left: 'Continuous charge and discharge by pushing',
        middle: 'Workpieces better supported and conveyed on a roller table',
        right: 'Light single parts that can be laid out on the mesh belt',
      },
      {
        left: 'Workpieces advanced by batch or by tray',
        middle: 'High demand for stable in-furnace conveying',
        right: 'Steady batches with continuous charge and discharge',
      },
      {
        left: 'Well-defined requirements for production cycle time and in-furnace residence time',
        middle: 'A continuous heat-treatment line',
        right: 'Continuous heat treatment of small parts',
      },
      {
        left: 'Production scenarios such as continuous annealing, tempering and heating',
        middle:
          'Continuous annealing, solution treatment and tempering of regularly shaped workpieces',
        right: 'Processing of small parts such as standard parts and fasteners',
      },
    ],
    faq: [
      {
        question: 'Q1: What workpieces are pusher furnaces suited for?',
        answer:
          'Pusher furnaces suit continuous heat-treatment workpieces with steady, well-defined throughput cycles that can be carried on trays, baskets, pallets or fixtures, such as bars, billets, structural parts and certain volume components. Whether a pusher arrangement is viable depends on the workpiece weight, the way pieces are arranged, and how discharge ties into downstream operations.',
      },
      {
        question: 'Q2: Can a pusher furnace handle annealing, tempering and heating?',
        answer:
          'Yes. Depending on the project, a pusher furnace can be used for continuous annealing, tempering, normalizing, quench heating and other continuous heating processes. Different processes impose different requirements on maximum temperature, soaking time, pushing cycle, cooling method and control records, so each should be confirmed item by item during the proposal stage.',
      },
      {
        question: 'Q3: Which parameters mainly drive pusher furnace pricing?',
        answer:
          'Pusher furnace pricing is driven mainly by the effective chamber width and length, the channel dimensions inside the furnace, the carrying method, the pusher mechanism type, the number of temperature zones, the maximum temperature, the throughput cycle, atmosphere and cooling requirements, the control system, and the installation and commissioning scope. We recommend submitting your parameters first so the price range can be assessed.',
      },
      {
        question:
          'Q4: What is the difference between a pusher furnace and a roller-hearth furnace?',
        answer:
          'A pusher furnace generally advances trays, baskets or fixtures on a set cycle using a pusher mechanism, whereas a roller-hearth furnace supports and conveys workpieces on furnace rolls, making it better suited to regular workpieces such as plate, bar and tube. When choosing between them, compare the carrying method, the single-piece weight, the production cycle and the ease of maintenance.',
      },
      {
        question: 'Q5: How is the pushing cycle of a pusher furnace determined?',
        answer:
          'The pushing cycle is set jointly by the hourly throughput, the charge advanced per push, the effective chamber length, the number of temperature zones, the heating and soaking times, the cooling or transfer rhythm, and the loading/unloading capacity. The design must account for tray spacing, the push interval and the link to upstream and downstream operations together.',
      },
      {
        question: 'Q6: How is temperature uniformity ensured in a pusher furnace?',
        answer:
          'Temperature uniformity depends on the effective chamber dimensions, the zoning of the temperature regions, the layout of the heating elements or combustion system, the refractory lining and insulation, the pushing cycle, the loading arrangement, the heat-circulation structure and the acceptance criteria. Target figures should be confirmed in light of the project configuration, the operating conditions and the test conditions.',
      },
      {
        question: 'Q7: Can an old pusher furnace be retrofitted or overhauled?',
        answer:
          'We can first assess the condition of the refractory lining and insulation, the door seals, the heating system, the pusher mechanism, the rails, the drive system, the temperature-control zoning and the automation controls. Whether a retrofit is worthwhile depends on the furnace condition, throughput bottlenecks, spare-part availability, the shutdown window and the retrofit objectives.',
      },
      {
        question:
          'Q8: What information should be prepared before requesting a quote for a pusher furnace?',
        answer:
          'We recommend preparing the workpiece material, shape, dimensions and single-piece weight, the hourly throughput, the pushing cycle, the maximum temperature, the usual working temperature, the heat-treatment process, the temperature-uniformity requirement, atmosphere and cooling requirements, the loading/unloading method, and details of the site layout.',
      },
    ],
    geoSections: [
      {
        title: 'Applicable workpieces',
        text: 'Pusher furnaces suit batch continuous heat-treatment workpieces, bars, billets and structural parts, as well as production scenarios where pieces are carried on trays or baskets. The workpiece form, tray dimensions, pushing cycle, number of temperature zones and discharge method all influence the pusher mechanism, the chamber length and the layout of the complete line.',
      },
      {
        title: 'Typical processes',
        text: 'Common processes include continuous heating, normalizing, annealing and quench heating. Whether to add cooling, tempering or a protective atmosphere is determined by the workpiece material, the loading method, the process curve, the cycle requirements and the upstream and downstream operations on site.',
      },
      {
        title: 'Selection focus',
        items: [
          'Pusher mechanism and thrust margin',
          'Tray, basket and fixture dimensions',
          'Production cycle and dwell time in the furnace',
          'Number of temperature zones and length of the heating zone',
          'Loading/unloading method and link to upstream and downstream operations',
          'Hearth structure, sealing and ease of maintenance',
        ],
      },
    ],
    relatedLinks: [
      {
        title: 'What parameters are needed to quote an industrial furnace',
        description:
          'Organize the furnace type, dimensions, temperature, throughput, process curve and site conditions to make your enquiry more efficient.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title:
          'Industrial furnace energy-saving retrofit and heat-treatment furnace overhaul services',
        description:
          'Learn how the refractory lining, pushing mechanism, heating and control systems of aging pusher furnaces and continuous heat-treatment lines are assessed.',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: 'Heat-treatment furnace manufacturer page',
        description:
          "Learn about Suneng's product range, manufacturing capability and custom-engineering process as a heat-treatment furnace manufacturer.",
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: 'Roller-hearth furnace page',
        description:
          'Explore roller-hearth furnace solutions for the continuous heat treatment of plate, bar, tube and other regular workpieces.',
        href: '/zh/products/detail/roller-hearth-furnace',
      },
      {
        title: 'Mesh-belt furnace page',
        description:
          'Explore mesh-belt furnace solutions for small parts, standard parts and continuous heat treatment.',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: 'Bogie-hearth furnace page',
        description:
          'Compare bogie-hearth furnace solutions for large workpieces, batch (cyclic) loading and bogie load-bearing custom scenarios.',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        title: 'Product center',
        description:
          "Browse Suneng's published heat-treatment furnaces, industrial furnaces and heat-treatment lines.",
        href: '/zh/products',
      },
      {
        title: 'Contact us',
        description:
          'Submit your pusher furnace parameters, discuss a solution or arrange further technical communication.',
        href: '/zh/contact',
      },
    ],
    parameterNote:
      'A pusher furnace cannot be quoted from the furnace type name alone. The figure depends on the workpiece material, dimensions and weight, throughput cycle time, pushing cycle, furnace chamber channel, load-bearing method, number of temperature zones, loading and unloading method and site conditions, and is ultimately governed by the technical proposal agreed by both parties.',
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
