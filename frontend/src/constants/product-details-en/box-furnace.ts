import type { StaticProductDetail } from '@/constants/static-products';
import { imagesBySlug } from '@/constants/static-products';

const detail: Partial<StaticProductDetail> = {
    series: 'Box (Chamber) Furnace Series',
    title: 'Box (Chamber) Furnace | Custom-Engineered Box Heat-Treatment Furnaces',
    breadcrumbSeries: 'Box (Chamber) Furnace Series',
    summary:
      'Box (chamber) furnaces are built for batch heat treatment of small to medium workpieces, dies and molds, machined parts, prototype parts and small production runs. Suneng delivers custom-engineered box heat-treatment furnaces tailored to your workpiece dimensions, unit weight, charge weight, maximum temperature, process curves and on-site conditions.',
    sellingPoints: [
      'Heat treatment of small to medium workpieces',
      'Custom chamber dimensions',
      'Selectable temperature ratings',
      'Custom-built electric resistance box furnaces',
    ],
    quickTags: [
      'Heat treatment of small to medium workpieces',
      'Annealing / tempering / normalizing',
      'Custom-built electric resistance box furnaces',
      'Selectable temperature ratings',
      'Custom chamber dimensions',
      'PLC control system',
    ],
    ctaHighlights: [
      'Founded in 2006',
      'company-reported approx. 14,700 m² production site',
      'Custom-engineered box furnaces',
    ],
    heroCtas: [
      {
        title: 'Get a Quote',
        description: 'Scroll to the inquiry form and submit your box furnace specifications.',
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
        title: 'Chamber Sized to the Workpiece',
        text: 'We set the effective chamber dimensions based on the largest workpiece envelope, loading clearances, and your fixturing or charge-basket arrangement.',
      },
      {
        title: 'Materials Matched to Temperature',
        text: 'We match the refractory lining and heating elements to your maximum temperature, typical operating temperature, and heat-up / cool-down schedule.',
      },
      {
        title: 'Load Capacity Matched to Batch Size',
        text: 'We engineer the hearth plate, charge baskets, and support structure around unit weight, charge weight per load, and loading method.',
      },
      {
        title: 'Controls Configured to the Process',
        text: 'We can configure multi-zone temperature control, recording, and alarm protection for annealing, tempering, normalizing, aging, and similar processes.',
      },
      {
        title: 'Delivery Defined by Site Conditions',
        text: 'We define the scope of manufacturing, commissioning, and after-sales service around your shop-floor space, power supply, lifting capacity, and installation boundaries.',
      },
    ],
    workpieceCards: [
      {
        title: 'Small to Medium Machined Parts',
        text: 'Suited to annealing, tempering, or stress relief of machined parts, small structural components, and general metal parts.',
      },
      {
        title: 'Dies and Molds',
        text: 'Suited to heat treatment of small to medium dies, molds, tooling, and thick-walled parts, where support method and temperature uniformity matter.',
      },
      {
        title: 'Prototype Parts',
        text: 'Suited to small-batch heat treatment during new-product trials, material validation, and process development.',
      },
      {
        title: 'Small Production Runs',
        text: 'Suited to batch heat treatment with limited volumes, frequent specification changes, and relatively simple loading and unloading.',
      },
      {
        title: 'Castings and Forgings',
        text: 'Applicable to annealing, normalizing, or stress relief of selected small to medium castings and forgings.',
      },
      {
        title: 'Welded Parts',
        text: 'Commonly used for post-weld stress relief or tempering of small to medium weldments, where distortion control must be confirmed.',
      },
      {
        title: 'Structural Components',
        text: 'Suited to through-heating of small to medium structural parts that can be loaded manually or with simple fixturing.',
      },
      {
        title: 'Test or Process-Validation Parts',
        text: 'Suited to heat-treatment parameter validation, material comparison, and small-batch trial production.',
      },
    ],
    workpieceTitle: 'Which Workpieces Suit a Box Furnace?',
    processCards: [
      {
        title: 'Annealing',
        text: 'Suited to softening or microstructure adjustment of small to medium parts, dies, molds, castings, and forgings; confirm material grade, annealing temperature, soak time, and cooling method.',
      },
      {
        title: 'Tempering',
        text: 'Suited to tempering of quenched parts, dies, molds, and machined components; confirm tempering temperature, charge weight, soak time, and recording requirements.',
      },
      {
        title: 'Normalizing',
        text: 'Suited to microstructure refinement of selected steel parts, castings, and forgings; confirm maximum temperature, unloading method, cooling conditions, and part spacing.',
      },
      {
        title: 'Quench Heating',
        text: 'Applicable to the pre-quench heating stage; confirm heating temperature, transfer method, downstream quench medium, and safety interlocks.',
      },
      {
        title: 'Aging',
        text: 'Suited to aging of selected alloy parts or prototype parts; confirm temperature range, soak time, and batch-to-batch consistency requirements.',
      },
      {
        title: 'Stress Relief',
        text: 'Commonly used for weldments, machined parts, and small structural components; confirm heat-up / cool-down rates, in-chamber support, and distortion-control requirements.',
      },
    ],
    processCardsTitle: 'Which Heat-Treatment Processes Can a Box Furnace Cover?',
    customSpecs: [
      {
        key: 'Workpiece Material',
        value:
          'Provide material grades, heat-treatment objectives, and surface-quality requirements.',
      },
      {
        key: 'Workpiece Dimensions',
        value:
          'Provide maximum envelope dimensions, common specifications, and clamping or fixturing method.',
      },
      {
        key: 'Unit Weight',
        value: 'Provide unit weight, maximum weight, and support contact method.',
      },
      {
        key: 'Charge Weight per Load',
        value: 'State pieces per load, total weight, stacking method, and production cycle time.',
      },
      {
        key: 'Effective Chamber Dimensions',
        value:
          'Determined from workpiece size, loading clearances, charge baskets, and working space.',
      },
      {
        key: 'Maximum Temperature',
        value:
          'Provide the design maximum temperature and the process-required maximum temperature.',
      },
      {
        key: 'Typical Operating Temperature',
        value:
          'Provide the routine process temperature range to guide refractory lining and heating-element selection.',
      },
      {
        key: 'Heat-Treatment Process',
        value:
          'Annealing, tempering, normalizing, quench heating, aging, stress relief, and similar.',
      },
      {
        key: 'Temperature Uniformity Requirement',
        value:
          'Determined by the process and effective working zone; specific targets to be defined in the technical proposal.',
      },
      {
        key: 'Heating Method',
        value:
          'Electric resistance heating / gas-fired heating, selectable based on energy supply and process requirements.',
      },
      {
        key: 'Furnace Door Design',
        value:
          'Side-opening door, vertical-lift door, sealing structure, and safety interlocks confirmed per project.',
      },
      {
        key: 'Heating-Element Type',
        value:
          'Resistance wire, radiant tubes, silicon carbide (SiC) rods, molybdenum disilicide (MoSi2) rods, and similar, selected to suit the temperature rating.',
      },
      {
        key: 'Control-System Requirements',
        value:
          'Standard temperature control, PLC, touchscreen HMI, chart recorder, multi-zone control, data traceability, and similar.',
      },
      {
        key: 'Site Space and Installation Conditions',
        value:
          'Provide shop-floor space, power-supply capacity, lifting conditions, fume extraction, and installation boundaries.',
      },
    ],
    configurations: [
      {
        title: 'Box Furnace for Prototyping and Process Validation',
        image: imagesBySlug['box-furnace'].configs[0],
        specs: [
          'Chamber dimensions: customized to prototype parts, sample parts, and fixturing method',
          'Temperature rating: confirmed per material and process requirements',
          'Control system: configurable temperature controller, chart recorder, or PLC',
          'Application: prototype parts, test parts, small-batch validation',
        ],
      },
      {
        title: 'Production-Grade Box Heat-Treatment Furnace',
        image: imagesBySlug['box-furnace'].configs[1],
        specs: [
          'Charge weight: engineered to unit weight, pieces per load, and charge-basket design',
          'Heating system: heating elements selected per temperature rating',
          'Furnace door design: confirmed per loading method and sealing requirements',
          'Application: heat treatment of machined parts, dies and molds, and small production runs',
        ],
      },
    ],
    processSteps: [
      {
        title: 'Submit Parameters',
        text: 'Provide workpiece material, dimensions, weight, charge weight, temperature, and process requirements.',
      },
      {
        title: 'Determine the Chamber',
        text: 'Set the effective dimensions from workpiece envelope, charge baskets, loading clearances, and working space.',
      },
      {
        title: 'Confirm the Configuration',
        text: 'Define heating elements, refractory lining structure, furnace door type, and control-system requirements.',
      },
      {
        title: 'Proposal and Quote',
        text: 'Develop the technical proposal, main configuration, quote scope, and delivery boundaries.',
      },
      {
        title: 'Manufacturing Inspection',
        text: 'Complete inspection of the furnace body, refractory lining, heating elements, furnace door, and electrical control system.',
      },
      {
        title: 'Installation and After-Sales',
        text: 'Carry out on-site installation and commissioning, operator training, and ongoing service support.',
      },
    ],
    processes: [
      'Annealing',
      'Tempering',
      'Normalizing',
      'Quench heating',
      'Aging',
      'Stress relief',
    ],
    industries: [
      'Machining',
      'Die and mold making',
      'Castings and forgings',
      'Automotive components',
      'R&D and prototyping',
      'Job-shop heat treaters',
      'Energy equipment',
    ],
    leadBullets: [
      'Chamber sized to the workpiece',
      'Refractory lining and heating elements matched to the temperature rating',
      'Load-bearing structure designed to the charge weight',
      'Delivery boundaries defined by site conditions',
    ],
    parameterTitle: 'Which Parameters Must Be Confirmed for a Custom Box Furnace?',
    parameterLink: {
      title: 'See What Parameters a Quote Needs',
      description: 'View the quote-parameter reference page.',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    parameterNote:
      'A box furnace cannot be quoted from the furnace type name alone. The price depends on workpiece material, dimensions, charge weight, maximum temperature, temperature uniformity requirements, heating-element type, control system, and site conditions, with the mutually confirmed technical proposal taking precedence.',
    structureTitle: 'Main Structural Components of a Box Furnace',
    structureComponents: [
      {
        title: 'Furnace Body Structure',
        text: 'Comprises the furnace shell, chamber, insulation layer, and steel structure, designed to the chamber dimensions, temperature rating, and duty frequency.',
      },
      {
        title: 'Refractory Lining System',
        text: 'Refractory materials, ceramic fiber, castables, or composite insulation structures selected to suit temperature, heat-up / cool-down schedule, and maintenance requirements.',
      },
      {
        title: 'Heating System',
        text: 'Heating elements such as resistance wire, radiant tubes, silicon carbide (SiC) rods, and molybdenum disilicide (MoSi2) rods selected to suit the temperature rating and process requirements.',
      },
      {
        title: 'Furnace Door System',
        text: 'Side-opening door, vertical-lift door, sealing structure, and safety interlocks confirmed per loading method, working space, and heat-loss control.',
      },
      {
        title: 'In-Chamber Load-Bearing System',
        text: 'Hearth plate, charge baskets, support structure, and loading method designed to workpiece weight, charge weight, and high-temperature strength.',
      },
      {
        title: 'Control System',
        text: 'Configurable temperature controller, PLC, touchscreen HMI, chart recorder, multi-zone control, and alarm protection, with specific targets confirmed in the proposal.',
      },
    ],
    priceFactorsTitle: 'Which Factors Affect the Price of a Box Furnace?',
    priceFactorsIntro:
      'Box furnaces are typically custom-engineered equipment, and a fixed price cannot be given in isolation from the workpiece, temperature, and configuration. The following factors significantly affect the furnace structure, material configuration, control system, and delivery scope.',
    priceFactors: [
      'Chamber dimensions',
      'Maximum temperature',
      'Refractory lining material',
      'Heating-element type',
      'Charge weight',
      'Temperature uniformity requirement',
      'Control-system configuration',
      'Furnace door design',
      'Whether air circulation is required',
      'Whether installation and commissioning are involved',
      'Whether it is a retrofit or overhaul of an existing furnace',
    ],
    comparisonTitle: 'Box Furnace or Bogie-Hearth Furnace: How to Choose?',
    comparisonHeaders: ['A Box Furnace Suits', 'A Bogie-Hearth Furnace Suits'],
    comparisonRows: [
      {
        left: 'Small to medium workpieces with relatively simple loading and unloading',
        right: 'Large workpieces or heavy single pieces',
      },
      {
        left: 'Small-batch processing or multi-variety prototyping',
        right: 'Applications needing a bogie to carry the load in and out',
      },
      {
        left: 'Prototyping, process validation, and test tasks',
        right: 'Applications needing crane lifting or fixtured loading',
      },
      {
        left: 'A more compact furnace body with relatively manageable site space',
        right: 'Larger chamber dimensions requiring track and foundation provisions',
      },
      {
        left: 'A relatively manageable investment budget, with configuration customized to the process',
        right:
          'Batch heat treatment of large castings, forgings, dies and molds, and welded structures',
      },
    ],
    processStepsTitle: 'Box Furnace Customization Process',
    industryCards: [
      {
        title: 'Machining',
        text: 'Commonly used for annealing, tempering, normalizing, and stress relief of small to medium machined parts and small structural components.',
      },
      {
        title: 'Die and Mold Making',
        text: 'Suited to heat treatment of small to medium dies, molds, tooling, and thick-walled parts, with a focus on support method and temperature uniformity.',
      },
      {
        title: 'Castings and Forgings',
        text: 'Applicable to microstructure adjustment, annealing, or stress relief of selected small to medium castings and forgings.',
      },
      {
        title: 'Automotive Components',
        text: 'Suited to batch heat treatment of small-run components, prototype parts, and multi-specification parts.',
      },
      {
        title: 'R&D and Prototyping',
        text: 'Suited to small-batch heat treatment during material testing, process validation, and new-product development.',
      },
      {
        title: 'Job-Shop Heat Treaters',
        text: 'Suited to multi-variety, small-batch processing, where changeover efficiency and process coverage matter.',
      },
      {
        title: 'Energy Equipment',
        text: 'Applicable to annealing, tempering, or stress relief of selected small to medium equipment parts and supporting components.',
      },
    ],
    scenarioCards: [
      {
        title: 'Authorized Project: Chamber Electric Annealing Furnaces for Copper-Alloy Wire',
        text: 'One copper-processing project used four furnace bodies, each rated at about 200 kW, with a 700°C rated temperature, an operating range of about 550–700°C, an effective charge envelope of about Φ1710 × 1600 mm, and PLC control.',
      },
      {
        title: 'Tempering of Small to Medium Mechanical Parts',
        text: 'Set the chamber, heating, and control configuration around tempering temperature, charge weight, soak time, and recording requirements.',
      },
      {
        title: 'Stress Relief of Dies and Molds',
        text: 'Focus on confirming die and mold dimensions, support method, heat-up / cool-down curve, and temperature uniformity requirements.',
      },
      {
        title: 'Heat Treatment of Prototype Parts',
        text: 'Suited to small-batch material validation or process development; define temperature range, recording method, and changeover needs.',
      },
      {
        title: 'Annealing of Small-Batch Parts',
        text: 'Assess chamber dimensions and the heating system based on material, part spacing, annealing temperature, and cooling method.',
      },
    ],
    scenarioIntro:
      'The following combines parameters from an authorized, anonymized chamber-furnace project with common applications. Project figures apply only to the corresponding workpiece, loading method, and process conditions; they are not fixed specifications for the entire series.',
    faq: [
      {
        question: 'Q1: What workpieces are box (chamber) furnaces suited to?',
        answer:
          'Box (chamber) furnaces suit batch heat-treatment of small and medium mechanical parts, dies and molds, prototype pieces, small-batch workpieces, castings and forgings, weldments, and structural components. Their relatively compact design works well for workpieces that are straightforward to load and unload, run in modest batch sizes, or vary widely in specification. The specific chamber size and configuration should be determined together with the workpiece dimensions, weight, and charge weight.',
      },
      {
        question: 'Q2: Can a box (chamber) furnace perform annealing, tempering, and normalizing?',
        answer:
          'Yes. Box (chamber) furnaces are commonly used for annealing, tempering, normalizing, quench heating, aging, and stress relief. Each process has different requirements for maximum temperature, heating and cooling curves, soak time, charging method, and temperature uniformity, so these should be confirmed item by item during the proposal stage against the material grade and workpiece condition.',
      },
      {
        question: 'Q3: Which parameters mainly drive the price of a box (chamber) furnace?',
        answer:
          'The price of a box (chamber) furnace is mainly influenced by the furnace chamber size, maximum temperature, refractory lining material, heating-element type, charge weight, temperature-uniformity requirements, control system, door structure, whether forced air circulation is required, and the scope of installation and commissioning. Box (chamber) furnaces are largely custom-engineered equipment, so parameters need to be submitted first before a proposal and price range can be assessed.',
      },
      {
        question:
          'Q4: What is the difference between a box (chamber) furnace and a bogie-hearth furnace?',
        answer:
          'A box (chamber) furnace has a more compact structure and suits small and medium workpieces, small-batch processing, and prototype or process-validation work; a bogie-hearth furnace has a movable bogie and is better suited to large, heavier workpieces or those that require crane handling. The choice should be based on a comparison of workpiece dimensions, weight, loading and unloading method, furnace chamber size, and available floor space.',
      },
      {
        question: 'Q5: How high a temperature can a box (chamber) furnace reach?',
        answer:
          'The temperature rating of a box (chamber) furnace depends on the heat-treatment process, refractory lining material, heating-element type, furnace chamber size, and frequency of use, and cannot be promised against a single fixed maximum temperature. Typical configurations select solutions such as resistance wire, radiant tubes, silicon carbide (SiC) rods, or molybdenum disilicide (MoSi2) rods according to the process temperature, with the final scope governed by the technical proposal.',
      },
      {
        question: 'Q6: How is temperature uniformity ensured in a box (chamber) furnace?',
        answer:
          'Temperature uniformity is related to the furnace chamber size, heating-element layout, refractory lining structure, door sealing, charging method, air circulation, and control zoning. During the proposal stage the target figures should be set together with the effective working zone, workpiece arrangement, process temperature, and acceptance criteria; fixed values cannot be promised independently of the furnace type and operating conditions.',
      },
      {
        question: 'Q7: Can an old box (chamber) furnace be retrofitted or overhauled?',
        answer:
          'It can be assessed first. Common retrofit directions for an old box (chamber) furnace include refractory lining renewal, door-seal repair, heating-element replacement, control-system upgrades, completing safety interlocks, and optimizing zone control. Whether a retrofit is worthwhile should be judged together with the condition of the furnace body, fault history, energy consumption, spare-parts availability, and the production shutdown window.',
      },
      {
        question:
          'Q8: What information should be prepared before requesting a quote for a box (chamber) furnace?',
        answer:
          'We recommend preparing the workpiece material, dimensions, weight per piece, charge weight per cycle, maximum temperature, typical operating temperature, heat-treatment process, temperature-uniformity requirements, heating method, door structure, on-site space, and installation conditions. Even if the information is incomplete you can begin the discussion, and our engineers will advise on what still needs to be supplemented.',
      },
    ],
    geoSections: [
      {
        title: 'Applicable Workpieces',
        text: 'Box (chamber) furnaces are well suited to small and medium parts, die and mold components, prototype pieces, small-batch workpieces, and multi-variety heat-treatment tasks. Workpiece dimensions, charging method, batch frequency, door-opening arrangement, and whether the unit serves laboratory or production use all influence the furnace chamber size, heating-element layout, and control-system configuration.',
      },
      {
        title: 'Typical Processes',
        text: 'Common processes include annealing, tempering, normalizing, pre-quench heating, aging, and stress relief. Each process calls for different temperature ranges, ramp rates, soak times, and atmosphere requirements, so the chamber structure and heating method should be confirmed against the specific process conditions.',
      },
      {
        title: 'Selection Considerations',
        items: [
          'Furnace chamber size and effective working zone',
          'Charge weight per cycle and fixturing approach',
          'Maximum temperature and typical process temperatures',
          'Heating-element type and ease of maintenance',
          'Temperature control accuracy and temperature uniformity',
          'Door-opening arrangement and operating clearance',
        ],
      },
    ],
    relatedLinks: [
      {
        title: 'What Parameters Are Needed to Quote an Industrial Furnace',
        description:
          'Organize furnace type, dimensions, temperature, charge weight, process curves, and site conditions to make box (chamber) furnace inquiries more efficient.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title:
          'Industrial Furnace Energy-Saving Retrofit and Heat-Treatment Furnace Overhaul Services',
        description:
          'Learn how to assess the refractory lining, door seals, heating elements, and control systems of aging box (chamber) furnaces and heat-treatment furnaces.',
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
          'Compare bogie-hearth furnace solutions for large workpieces, batch charging, and load-rated bogie customization.',
        href: '/zh/products/detail/trolley-furnace',
      },
      {
        title: 'Mesh-Belt Furnace Page',
        description:
          'Learn about mesh-belt furnace solutions for continuous heat treatment of small parts and standard components.',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: 'Product Center',
        description:
          "Browse Suneng's publicly listed heat-treatment furnaces, industrial furnaces, and heat-treatment lines.",
        href: '/zh/products',
      },
      {
        title: 'Contact Us',
        description:
          'Submit box (chamber) furnace parameters, consult on a solution, or arrange further technical discussion.',
        href: '/zh/contact',
      },
    ],
  };

export default detail;
