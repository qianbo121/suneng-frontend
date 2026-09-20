import type { StaticProductDetail } from '@/constants/static-products';
import { imagesBySlug } from '@/constants/static-products';

const detail: Partial<StaticProductDetail> = {
    series: 'Mesh-Belt Furnace Series',
    title: 'Mesh-Belt Furnace | Custom-Engineered Continuous Mesh-Belt Heat-Treatment Furnaces',
    breadcrumbSeries: 'Mesh-Belt Furnace Series',
    summary:
      'Mesh-belt furnaces are built for continuous, high-volume heat treatment of standard parts, small components, hardware, fasteners and other metal parts. Based on workpiece dimensions, material, unit weight, throughput and cycle time, maximum temperature, process curve and on-site conditions, Suneng delivers custom-engineered mesh-belt heat-treatment furnace solutions.',
    sellingPoints: [
      'Continuous heat treatment',
      'Custom mesh-belt width',
      'Multi-zone temperature control',
      'Integrated charging and discharging',
    ],
    quickTags: [
      'Continuous heat treatment',
      'Batch processing of standard and small parts',
      'Custom mesh-belt width',
      'Multi-zone temperature control',
      'Annealing / tempering / quench heating',
      'PLC control system',
    ],
    ctaHighlights: [
      'Founded in 2006',
      'company-reported approx. 14,700 m² production site',
      'Custom-engineered mesh-belt furnaces',
    ],
    heroCtas: [
      {
        title: 'Request a Quote',
        description: 'Scroll to the inquiry form and submit your mesh-belt furnace specifications.',
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
        title: 'Designed Around Your Cycle Time',
        text: 'We determine mesh-belt speed and furnace chamber length from hourly throughput, unit weight, layer thickness and soak time.',
      },
      {
        title: 'Zones Configured to the Process',
        text: 'Around continuous annealing, tempering, quench heating, solution treatment and similar processes, we match the number of temperature zones, cooling method and control scheme.',
      },
      {
        title: 'Mesh Belt Selected for the Workpiece',
        text: 'We evaluate mesh-belt material, width, tensioning and drive design based on workpiece geometry, temperature, load and continuous running time.',
      },
      {
        title: 'Whole-Line Integration to Site',
        text: 'We can integrate upstream and downstream operations such as charging, discharging, washing, quench tanks and tempering furnaces, defining clear equipment-interface boundaries.',
      },
      {
        title: 'Acceptance Criteria Defined Up Front',
        text: 'Temperature uniformity, cycle time, recording and interlock requirements are specified in the technical proposal; we avoid committing to fixed figures detached from actual operating conditions.',
      },
    ],
    workpieceCards: [
      {
        title: 'Standard Parts',
        text: 'Suited to continuous, high-volume heat treatment of bolts, nuts and other standard parts with relatively stable specifications.',
      },
      {
        title: 'Fasteners',
        text: 'Commonly used for continuous tempering, annealing or quench heating of fasteners, where layer thickness and transfer cycle time require attention.',
      },
      {
        title: 'Small Metal Parts',
        text: 'Suited to batch processing of lightweight small metal parts that can be spread out and conveyed continuously.',
      },
      {
        title: 'Hardware',
        text: 'Suited to continuous annealing, tempering or stress relief of stamped hardware, connectors and small fittings.',
      },
      {
        title: 'Stampings',
        text: 'Common for continuous heating or stabilizing treatment of high-volume stampings, where distortion control and cooling method must be confirmed.',
      },
      {
        title: 'Small Bearing Components',
        text: 'Can be evaluated for heat treatment of certain small bearing components, with material, dimensions and temperature curve as the key items to confirm.',
      },
      {
        title: 'Small Automotive Components',
        text: 'Suited to continuous heat treatment of small, high-volume components, where cycle time, traceability and charging/discharging integration require attention.',
      },
      {
        title: 'High-Volume Continuous Heat-Treatment Workpieces',
        text: 'Suited to heat-treatment tasks with stable output, a fixed process route and continuous infeed and outfeed.',
      },
    ],
    workpieceTitle: 'Which Workpieces Suit a Mesh-Belt Furnace?',
    processCards: [
      {
        title: 'Continuous Annealing',
        text: 'Suited to softening or microstructure adjustment of small parts, hardware and certain metal parts; material, annealing temperature, in-furnace dwell time and cooling method must be confirmed.',
      },
      {
        title: 'Continuous Tempering',
        text: 'Suited to tempering of quenched small parts, fasteners and standard parts; tempering temperature, mesh-belt speed, load thickness and recording requirements must be confirmed.',
      },
      {
        title: 'Quench Heating',
        text: 'Can be used as the heating stage before continuous quenching; heating temperature, transfer time, quenching medium, interlock protection and downstream tempering setup must be confirmed.',
      },
      {
        title: 'Solution Treatment',
        text: 'Can be evaluated for stainless-steel small parts or alloy components based on project requirements, with material grade, temperature schedule, cooling rate and atmosphere conditions as the key items to confirm.',
      },
      {
        title: 'Aging',
        text: 'Suited to batch aging of certain alloy or metal small parts; temperature range, soak time, throughput, cycle time and charging method must be confirmed.',
      },
      {
        title: 'Stress Relief',
        text: 'Suited to small welded parts, stampings or machined parts; the source of residual stress, heat-up / cool-down requirements and continuous running cycle time must be confirmed.',
      },
    ],
    processCardsTitle: 'Which Heat-Treatment Processes Can a Mesh-Belt Furnace Cover?',
    customSpecs: [
      {
        key: 'Workpiece Material',
        value: 'Provide material grade, heat-treatment objective and surface-quality requirements',
      },
      {
        key: 'Workpiece Dimensions',
        value: 'Provide unit overall dimensions, maximum dimensions and loading layout',
      },
      {
        key: 'Unit Weight',
        value: 'Provide unit weight, load weight per unit area and layer thickness',
      },
      {
        key: 'Hourly Throughput',
        value: 'State hourly processing volume, shift pattern and continuous cycle time',
      },
      {
        key: 'Mesh-Belt Width',
        value:
          'Determined by workpiece loading width, edge clearance, throughput and mesh-belt load capacity',
      },
      {
        key: 'Mesh-Belt Speed',
        value:
          'Calculated from in-furnace dwell time, soak time and effective furnace chamber length',
      },
      {
        key: 'Effective Furnace Chamber Length',
        value:
          'Determined by the number of temperature zones, heat-up and soak time, and continuous throughput',
      },
      {
        key: 'Number of Temperature Zones',
        value: 'Determined by configuration needs for heat-up, soak, cooling or tempering stages',
      },
      {
        key: 'Maximum Temperature',
        value:
          'Provide the design maximum temperature and the maximum temperature required by the process',
      },
      {
        key: 'Typical Operating Temperature',
        value:
          'Provide the day-to-day operating temperature range to support selection of the refractory lining, mesh belt and heating system',
      },
      {
        key: 'Heat-Treatment Process',
        value:
          'Continuous annealing, continuous tempering, quench heating, solution treatment, aging, stress relief, etc.',
      },
      {
        key: 'Atmosphere Requirements',
        value:
          'Air, nitrogen, protective atmosphere or other atmosphere requirements to be confirmed per process',
      },
      {
        key: 'Cooling Method',
        value:
          'Air cooling, water cooling, protective-atmosphere cooling, quench tank or integrated cooling section, determined by process',
      },
      {
        key: 'Charging / Discharging Method',
        value:
          'Manual, hopper, vibratory feeding, conveyor integration or automated linkage, confirmed against the site',
      },
      {
        key: 'Heating Method',
        value:
          'Electric resistance heating / gas-fired heating, selectable based on energy availability and process requirements',
      },
      {
        key: 'Control System Requirements',
        value:
          'PLC, touchscreen HMI, temperature controllers, chart recorders, multi-zone control, alarm protection, etc.',
      },
      {
        key: 'Continuous Running Time',
        value:
          'State daily running hours, shifts, maintenance windows and long-term continuous-running requirements',
      },
      {
        key: 'Site Space and Utility Conditions',
        value:
          'Provide workshop length, power supply, gas supply, fume exhaust, cooling water, upstream/downstream equipment and installation boundaries',
      },
    ],
    configurations: [
      {
        title: 'Continuous Mesh-Belt Furnace for Small Parts',
        image: imagesBySlug['mesh-belt-furnace'].configs[0],
        specs: [
          'Mesh-belt width: customized to workpiece loading and throughput/cycle time',
          'Zone configuration: determined by the continuous annealing, tempering or quench-heating process',
          'Cooling method: air cooling, water cooling or integrated cooling section, confirmed per project',
          'Application: continuous heat treatment of standard parts, fasteners and hardware',
        ],
      },
      {
        title: 'Mesh-Belt Heat-Treatment Line',
        image: imagesBySlug['mesh-belt-furnace'].configs[1],
        specs: [
          'Furnace chamber length: calculated from soak time and mesh-belt speed',
          'Control system: configurable PLC, touchscreen HMI and multi-zone recording',
          'Linked equipment: charging, washing, quenching, tempering and discharging integration can be evaluated',
          'Application: continuous lines for small metal parts, small automotive parts and job-shop heat treaters',
        ],
      },
    ],
    processSteps: [
      {
        title: 'Submit Parameters',
        text: 'Provide workpiece material, dimensions, weight, throughput, temperature and process requirements.',
      },
      {
        title: 'Assess the Structure',
        text: 'Calculate mesh-belt width, running speed, furnace chamber length and charging method.',
      },
      {
        title: 'Confirm the Configuration',
        text: 'Define temperature zones, temperatures, atmosphere, cooling method and integration boundaries.',
      },
      {
        title: 'Proposal and Quote',
        text: 'Produce the technical proposal, main configuration, quote range and delivery scope.',
      },
      {
        title: 'Manufacturing Inspection',
        text: 'Complete inspection of the furnace body, mesh belt, drive, refractory lining, heating and electrical control systems.',
      },
      {
        title: 'Installation and After-Sales',
        text: 'Carry out on-site installation and commissioning, operator training and ongoing service support.',
      },
    ],
    processes: [
      'Continuous annealing',
      'Continuous tempering',
      'Quench heating',
      'Solution treatment',
      'Aging',
      'Stress relief',
    ],
    industries: [
      'Standard parts',
      'Hardware',
      'Automotive components',
      'Small bearing components',
      'Small mechanical parts',
      'Stainless-steel small parts',
      'Job-shop heat treaters',
    ],
    leadBullets: [
      'Furnace chamber length set by throughput and cycle time',
      'Mesh-belt width matched to workpiece dimensions',
      'Zones and cooling configured to the process curve',
      'Whole-line boundaries defined by site conditions',
    ],
    parameterTitle: 'Which Parameters Must Be Confirmed to Customize a Mesh-Belt Furnace?',
    parameterLink: {
      title: 'See Which Parameters a Quote Requires',
      description: 'View the quote-parameter reference page.',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    parameterNote:
      'A mesh-belt furnace cannot be quoted from the furnace type name alone. The price depends on workpiece material, dimensions, unit weight, hourly throughput, mesh-belt width, furnace chamber length, number of temperature zones, atmosphere and cooling method, and is ultimately governed by the technical proposal confirmed by both parties.',
    structureTitle: 'Main Structural Assemblies of a Mesh-Belt Furnace',
    structureComponents: [
      {
        title: 'Furnace Body Structure',
        text: 'Includes the shell, furnace chamber, insulation layer, zone partitioning and access provisions, designed to continuous-running and maintenance requirements.',
      },
      {
        title: 'Mesh-Belt Conveyor System',
        text: 'Mesh-belt material, width, speed, tensioning structure and drive method are determined by workpiece weight, temperature and running cycle time.',
      },
      {
        title: 'Heating System',
        text: 'Electric resistance heating or gas-fired heating, selected according to temperature range, energy availability, throughput and on-site safety requirements.',
      },
      {
        title: 'Refractory Lining and Insulation System',
        text: 'Refractory materials, ceramic fiber and composite insulation structures are selected by temperature class, continuous-running conditions and maintenance interval.',
      },
      {
        title: 'Cooling System',
        text: 'Air cooling, water cooling, protective-atmosphere cooling or an integrated cooling section, confirmed against material, process objective and downstream operations.',
      },
      {
        title: 'Control System',
        text: 'Configurable PLC, touchscreen HMI, temperature controllers, chart recorders, multi-zone control, variable-frequency conveying and alarm protection.',
      },
      {
        title: 'Charging/Discharging and Integration',
        text: 'Charging, discharging, washing, quench tank and tempering furnace linkage can be configured to project requirements.',
      },
    ],
    priceFactorsTitle: 'Which Factors Affect the Price of a Mesh-Belt Furnace?',
    priceFactorsIntro:
      'A mesh-belt furnace is a custom-engineered continuous heat-treatment system, and no fixed price can be given without reference to the workpiece, cycle time and process. The following factors significantly affect the furnace body structure, conveyor system, control configuration and delivery scope.',
    priceFactors: [
      'Mesh-belt width',
      'Furnace chamber length',
      'Number of temperature zones',
      'Maximum temperature',
      'Throughput and cycle time',
      'Mesh-belt material',
      'Heating method',
      'Atmosphere requirements',
      'Cooling method',
      'Control system configuration',
      'Whether integrated charging and discharging is required',
      'Whether washing, quenching, tempering and other ancillary equipment is required',
      'Whether installation and commissioning are involved',
    ],
    comparisonTitle:
      'Mesh-Belt Furnace vs. Bogie-Hearth Furnace vs. Roller-Hearth Furnace: How to Choose?',
    comparisonHeaders: [
      'Mesh-belt furnace is suited to',
      'Bogie-hearth furnace is suited to',
      'Roller-hearth furnace is suited to',
    ],
    comparisonRows: [
      {
        left: 'Batch processing of small parts, standard parts and fasteners',
        middle: 'Batch loading of large or individually heavy workpieces',
        right: 'Continuous conveying of plates, bars or fairly regular workpieces',
      },
      {
        left: 'Stable throughput requiring continuous production',
        middle: 'Changing batches that need the whole load moved in and out',
        right: 'Defined line cycle time with high demands on in-furnace conveying stability',
      },
      {
        left: 'Lightweight parts that can be spread across the mesh belt',
        middle: 'Loads requiring overhead crane handling or a supporting bogie',
        right: 'Workpieces better suited to roller-table support and straight-line conveying',
      },
      {
        left: 'A focus on mesh-belt speed, layer thickness and charging/discharging integration',
        middle: 'A focus on chamber dimensions, bogie load capacity and track foundations',
        right: 'A focus on furnace roller material, load, drive and roller-table maintenance',
      },
      {
        left: 'Suited to continuous annealing, tempering, quench heating and other batch processes for small parts',
        middle: 'Batch heat treatment of large castings, forgings, dies and structural components',
        right:
          'Suited to continuous heat-treatment lines for plates, bars, tubes and similar products',
      },
    ],
    processStepsTitle: 'Mesh-Belt Furnace Customization Process',
    industryCards: [
      {
        title: 'Standard Parts',
        text: 'Common for continuous annealing, tempering or quench heating of bolts, nuts and other standard parts.',
      },
      {
        title: 'Hardware',
        text: 'Suited to continuous heat treatment of stamped hardware, small connectors and high-volume fittings.',
      },
      {
        title: 'Automotive Components',
        text: 'Commonly used for continuous production of small components, where cycle time, stability and data-recording requirements need attention.',
      },
      {
        title: 'Small Bearing Components',
        text: 'Continuous heating, tempering or stabilizing treatment can be evaluated based on material, dimensions and heat-treatment objective.',
      },
      {
        title: 'Small Mechanical Parts',
        text: 'Suited to heat treatment of mechanical parts with stable specifications, light unit weight and continuous infeed and outfeed.',
      },
      {
        title: 'Stainless-Steel Small Parts',
        text: 'Continuous annealing or solution treatment can be evaluated, with material grade, temperature and cooling requirements as the key items to confirm.',
      },
      {
        title: 'Job-Shop Heat Treaters',
        text: 'Suited to continuous processing of small parts with stable batches and a clear process route, balancing process coverage and changeover efficiency.',
      },
    ],
    scenarioCards: [
      {
        title: 'Authorized Project: REWF-45-9 Muffle-Type Protective-Atmosphere Mesh-Belt Furnace',
        text: 'The project used a belt assembly measuring about 2100 × 200 × 50 mm, with an effective working width of about 180 mm, a 950°C rated temperature, throughput of about 60 kg/h, and belt speed of about 10–114 mm/min.',
      },
      {
        title: 'Continuous Tempering of Standard Parts',
        text: 'Temperature zones and control configuration are determined around tempering temperature, load thickness, mesh-belt speed and recording requirements.',
      },
      {
        title: 'Continuous Annealing of Small Metal Parts',
        text: 'Furnace chamber length and throughput/cycle time are evaluated based on material, annealing temperature, soak time and cooling method.',
      },
      {
        title: 'Solution Treatment of Stainless-Steel Small Parts',
        text: 'Can be assessed as a preliminary project direction; material grade, solution temperature, cooling rate and atmosphere conditions must be confirmed.',
      },
      {
        title: 'Continuous Production Line for Job-Shop Heat Treaters',
        text: 'The focus is on multi-product changeover, charging/discharging integration, maintenance windows and room for future expansion.',
      },
    ],
    scenarioIntro:
      'The following combines parameters from an authorized, anonymized mesh-belt furnace project with common applications. Throughput, speed, and dimensions apply only to the corresponding workpiece, loading method, and process conditions; they are not fixed model guarantees.',
    faq: [
      {
        question: 'Q1: What kinds of workpieces are mesh-belt furnaces suited to?',
        answer:
          'Mesh-belt furnaces are well suited to standard parts, fasteners, hardware, stampings, small metal components and high-volume parts requiring continuous heat treatment. They are especially appropriate for products that are relatively light per piece, dimensionally consistent and can be spread out and conveyed continuously. Selection should be based on workpiece dimensions, unit weight, layer thickness on the belt, required throughput and the intended heat-treatment process.',
      },
      {
        question: 'Q2: Can a mesh-belt furnace perform annealing, tempering or solution treatment?',
        answer:
          'A mesh-belt furnace can be used for continuous annealing, continuous tempering, quench heating, aging and stress relief. Solution treatment can also be evaluated on a project basis, but it requires careful confirmation of the material grade, temperature schedule, cooling rate, atmosphere conditions and the heat resistance demanded of the belt. We do not recommend specifying a configuration in isolation from the actual workpiece and process.',
      },
      {
        question: 'Q3: Which parameters mainly drive the price of a mesh-belt furnace?',
        answer:
          'The price of a mesh-belt furnace is mainly driven by belt width, furnace chamber length, the number of temperature zones, maximum temperature, throughput, belt material, heating method, atmosphere requirements, cooling method, the control system, and integration with charging and discharging. A mesh-belt furnace is typically a custom-engineered unit, so we need the parameters first before we can assess the proposal and price range.',
      },
      {
        question:
          'Q4: What is the difference between a mesh-belt furnace and a bogie-hearth furnace?',
        answer:
          'A mesh-belt furnace emphasizes continuous conveying and a steady cycle, which suits high-volume heat treatment of small parts, standard parts and fasteners. A bogie-hearth furnace uses batch charging and is better suited to large, heavy or irregularly shaped workpieces. When choosing between them, compare workpiece weight, charging method, throughput and the on-site loading and unloading conditions.',
      },
      {
        question: 'Q5: Can a mesh-belt furnace run continuously?',
        answer:
          'The mesh-belt furnace is a common continuous heat-treatment furnace type and can be configured on a project basis for continuous feeding, heating, soaking, cooling, tempering, or washing and drying. That said, its continuous-running capability depends on the belt material, drive system, refractory lining, heating system, maintenance windows and on-site management, and should be confirmed against the actual operating conditions.',
      },
      {
        question: 'Q6: How is temperature uniformity ensured in a mesh-belt furnace?',
        answer:
          'Temperature uniformity depends on furnace chamber length, zone layout, the arrangement of heating elements or the combustion system, refractory insulation, belt speed, layer thickness, atmosphere circulation and the control system. The target figures should be set during the proposal stage in line with the effective heating zone, process temperature and acceptance criteria; fixed values should not be guaranteed in isolation from the operating conditions.',
      },
      {
        question: 'Q7: Can an old mesh-belt furnace be retrofitted or overhauled?',
        answer:
          'An assessment can be carried out first. Common upgrade directions for an old mesh-belt furnace include relining the refractory, servicing the belt and drive system, upgrading the heating system, retrofitting zone temperature control, optimizing the cooling section and improving the safety interlocks. Whether a retrofit is worthwhile depends on the condition of the furnace body, the available downtime window, spare-parts availability and the retrofit cost taken together.',
      },
      {
        question:
          'Q8: What information should be prepared before requesting a quotation for a mesh-belt furnace?',
        answer:
          'We recommend preparing the workpiece material, dimensions and unit weight, the required throughput per hour, the belt width or existing line speed, the maximum temperature, the heat-treatment process, atmosphere requirements, the cooling method, the loading and unloading method, on-site photos and the supporting site conditions. You are welcome to get in touch even if the information is incomplete, and our engineers will advise on what still needs to be added.',
      },
    ],
    geoSections: [
      {
        title: 'Applicable Workpieces',
        text: 'Mesh-belt furnaces are suited to fasteners, small parts, stampings, standard parts and high-volume parts that require continuous heat treatment. Workpiece dimensions, unit weight, layer thickness, belt width, running speed and cooling method all affect the furnace chamber length, the temperature-zone configuration and the stability of continuous production.',
      },
      {
        title: 'Typical Processes',
        text: 'Common processes include quenching, tempering, annealing and normalizing. Where continuous quench-and-temper or protective-atmosphere operation is required, the whole line should be evaluated together with the material grade, the heat-treatment curve, the cooling medium, the washing and drying stages and the tempering-section configuration.',
      },
      {
        title: 'Selection Considerations',
        items: [
          'Belt width and load-carrying capacity',
          'Running speed and soaking time',
          'Heating-zone length and temperature-control zoning',
          'Cooling method and integrated quenching',
          'Atmosphere requirements and sealing structure',
          'Continuous-production stability and maintenance intervals',
        ],
      },
    ],
    relatedLinks: [
      {
        title: 'Which Parameters Are Needed to Quote an Industrial Furnace',
        description:
          'Organize the furnace type, dimensions, temperature, throughput, process curve and site conditions to make your mesh-belt furnace inquiry more efficient.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title: 'Energy-Saving Retrofits and Heat-Treatment Furnace Overhaul Services',
        description:
          'Learn how the refractory lining, belt drive, heating and control systems of aging mesh-belt and continuous heat-treatment furnaces are assessed.',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: 'Heat-Treatment Furnace Manufacturer',
        description:
          "Learn about Suneng's product range, manufacturing capability and custom-engineering process as a heat-treatment furnace manufacturer.",
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: 'Bogie-Hearth Furnace',
        description:
          'Compare bogie-hearth furnace solutions for large workpieces, batch charging and custom car load-bearing requirements.',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        title: 'Box (Chamber) Furnace',
        description:
          'Learn about box (chamber) furnace solutions for small and medium workpieces, small batches and trial production.',
        href: '/zh/products/detail/box-furnace',
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
          'Submit your mesh-belt furnace parameters, request a proposal or schedule further technical discussion.',
        href: '/zh/contact',
      },
    ],
  };

export default detail;
