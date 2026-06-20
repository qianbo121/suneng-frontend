// AUTO-ASSEMBLED — English (/en) overrides for product detail pages.
// Each entry is a Partial<StaticProductDetail>; missing fields fall back to the
// Chinese source at render time via pickDetail(). The Chinese source of truth
// (constants/static-products.ts) is NOT modified except for `export imagesBySlug`.
import type { StaticProductDetail } from '@/constants/static-products';
import { imagesBySlug } from '@/constants/static-products';
import type { Locale } from '@/types/site';

export type ProductDetailEnOverride = Partial<StaticProductDetail>;

export const productDetailEn: Partial<Record<string, ProductDetailEnOverride>> = {
  'box-furnace': {
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
      '14,700 m² manufacturing base',
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
      'This page does not fabricate customer cases. The following serves only to illustrate common box furnace applications; specifics for a given project can be further confirmed during commercial discussions based on authorized materials.',
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
          'Learn about mesh-belt furnace solutions for continuous batch heat treatment of small parts and standard components.',
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
  },
  'trolley-furnace': {
    series: 'Bogie-Hearth Furnace Series',
    title: 'Bogie-Hearth Furnace | Custom Bogie-Hearth Heat-Treatment Furnaces',
    breadcrumbSeries: 'Bogie-Hearth Furnace Series',
    summary:
      'Bogie-hearth furnaces are built for batch (cyclic) heat treatment of large workpieces, castings, weldments, dies, and structural parts. Based on workpiece dimensions, single-piece weight, charge weight, maximum temperature, the process curve, and on-site conditions, Suneng delivers custom-engineered bogie-hearth heat-treatment furnaces.',
    sellingPoints: [
      'Heat treatment of large workpieces',
      'Custom bogie load capacity',
      'Refractory lining and structural design',
      'Electric or gas-fired options',
    ],
    quickTags: [
      'Heat treatment of large workpieces',
      'Annealing / tempering / normalizing',
      'Custom bogie load capacity',
      'Refractory lining and structural design',
      'Electric or gas-fired options',
      'PLC control system',
    ],
    ctaHighlights: [
      'Founded in 2006',
      '14,700 m² manufacturing base',
      'Custom-engineered bogie-hearth furnaces',
    ],
    heroCtas: [
      {
        title: 'Get a Quote',
        description: 'Scroll to the inquiry form and submit your bogie-hearth furnace parameters.',
        href: '#product-lead-form',
      },
      {
        title: 'See What Parameters a Quote Requires',
        description:
          'Learn what information to prepare before requesting an industrial furnace quote.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
    ],
    reasons: [
      {
        title: 'Chamber sized to the workpiece',
        text: 'The effective working zone and furnace structure are determined from maximum overall dimensions, loading method, and lifting conditions.',
      },
      {
        title: 'Bogie designed for the load',
        text: 'Bogie load capacity, rail, and foundation requirements are assessed from single-piece weight, per-charge weight, and the support arrangement.',
      },
      {
        title: 'Heating matched to the process',
        text: 'Electric or gas-fired heating is matched to the process — annealing, tempering, normalizing, quench heating, and more.',
      },
      {
        title: 'Controls built to spec',
        text: 'PLC, touchscreen HMI, chart recorder, multi-zone temperature control, and alarm/protection can be configured to project requirements.',
      },
      {
        title: 'Delivery suited to the site',
        text: 'The manufacturing and commissioning plan is finalized around workshop space, lifting conditions, the production-shutdown window, and installation boundaries.',
      },
    ],
    workpieceCards: [
      {
        title: 'Large castings',
        text: 'Suited to castings with large single-piece dimensions that require full-charge loading/unloading and slow heat-up and cool-down.',
      },
      {
        title: 'Welded structural parts',
        text: 'Commonly used for post-weld stress relief, tempering, and through-heating; distortion control and the loading method should be confirmed.',
      },
      {
        title: 'Dies and molds',
        text: 'Suited to heat treatment of large dies, tooling, and heavy-wall parts, with a focus on temperature uniformity and the support arrangement.',
      },
      {
        title: 'Machined parts',
        text: 'Suited to annealing, tempering, normalizing, or stress relief after machining.',
      },
      {
        title: 'Shafts / bars',
        text: 'A bogie-hearth or pit-furnace solution can be evaluated based on length, diameter, fixturing, and lifting conditions.',
      },
      {
        title: 'Steel structures',
        text: 'Suited to heating large, irregularly shaped structural parts that require bogie-based loading and unloading.',
      },
      {
        title: 'Job-shop heat-treatment work',
        text: 'Suited to multi-specification, multi-batch cyclic processing, where charging efficiency and chamber utilization matter.',
      },
      {
        title: 'Batch-loaded workpieces',
        text: 'Suited to batch parts that are unsuitable for continuous conveying and require consolidated charging and discharging.',
      },
    ],
    processCards: [
      {
        title: 'Annealing',
        text: 'For microstructure improvement or softening of castings, forgings, structural parts, and dies; confirm material, heat-up curve, soak time, and cooling method.',
      },
      {
        title: 'Tempering',
        text: 'For quenched parts, dies, and structural components; confirm tempering temperature, charge weight, soak time, and temperature-uniformity requirements.',
      },
      {
        title: 'Normalizing',
        text: 'For microstructure adjustment of certain steel parts and cast/forged components; confirm maximum temperature, discharge method, cooling conditions, and how workpieces are stacked.',
      },
      {
        title: 'Quench heating',
        text: 'For the pre-quench heating step; confirm heating temperature, transfer time, the subsequent cooling method, and safety-interlock requirements.',
      },
      {
        title: 'Aging',
        text: 'For aging of certain alloy or structural parts; confirm the temperature range, soak time, and batch-stability requirements.',
      },
      {
        title: 'Stress relief',
        text: 'Commonly used for weldments, castings, and machined parts; confirm workpiece dimensions, the source of residual stress, heat-up/cool-down rates, and the loading/support arrangement.',
      },
    ],
    customSpecs: [
      {
        key: 'Workpiece dimensions',
        value:
          'Provide maximum overall dimensions, typical batch dimensions, and the fixturing method.',
      },
      {
        key: 'Single-piece weight',
        value: 'Provide single-piece weight, maximum weight, and the support-contact arrangement.',
      },
      {
        key: 'Charge weight per load',
        value:
          'Specify pieces per load, total weight, stacking arrangement, and production cycle time.',
      },
      {
        key: 'Effective chamber dimensions',
        value:
          'Determined together from workpiece dimensions, loading clearances, and operating space.',
      },
      {
        key: 'Maximum temperature',
        value:
          'Provide the design maximum temperature and the maximum temperature required by the process.',
      },
      {
        key: 'Typical operating temperature',
        value:
          'Provide the routine process temperature range to guide selection of the refractory lining and heating system.',
      },
      {
        key: 'Heat-treatment process',
        value: 'Annealing, tempering, normalizing, quench heating, aging, stress relief, and more.',
      },
      {
        key: 'Temperature-uniformity requirement',
        value:
          'Determined by the process and effective working zone; the specific target is defined in the technical proposal.',
      },
      {
        key: 'Heating method',
        value:
          'Electric or gas-fired heating, selectable based on energy conditions and process requirements.',
      },
      {
        key: 'Bogie load capacity',
        value:
          'Determined from single-piece weight, total charge weight, heat-resistant support blocks, and bogie structure.',
      },
      {
        key: 'Furnace-door design',
        value:
          'Lift-up door, sealing structure, door drive, and safety interlocks confirmed to site conditions.',
      },
      {
        key: 'Rail and foundation conditions',
        value:
          'Workshop floor, rail layout, foundation load capacity, and bogie travel must be confirmed.',
      },
      {
        key: 'Control-system requirements',
        value:
          'Basic temperature control, PLC, touchscreen HMI, chart recorder, multi-zone temperature control, data traceability, and more.',
      },
      {
        key: 'Site space and lifting conditions',
        value:
          'Provide workshop dimensions, lifting capacity, load/unload direction, and installation boundaries.',
      },
    ],
    configurations: [
      {
        title: 'Large-workpiece bogie-hearth furnace',
        image: imagesBySlug['trolley-furnace'].configs[0],
        specs: [
          'Chamber size: custom to maximum workpiece dimensions and loading method',
          'Bogie load capacity: designed to single-piece weight and total charge weight',
          'Heating method: electric or gas-fired, selected per project',
          'Applications: heat treatment of large castings, structural parts, and dies',
        ],
      },
      {
        title: 'Batch heat-treatment bogie-hearth furnace',
        image: imagesBySlug['trolley-furnace'].configs[1],
        specs: [
          'Process range: annealing, tempering, normalizing, stress relief, and more',
          'Control system: multi-zone temperature control and chart recorder configurable',
          'Furnace-door design: built to the loading/unloading and sealing requirements',
          'Applications: machined parts, weldments, and job-shop heat-treatment work',
        ],
      },
      {
        title: 'Retrofit/replacement bogie-hearth furnace',
        image: imagesBySlug['trolley-furnace'].configs[2],
        specs: [
          'Project scope: new custom furnace, retrofit of an existing furnace, or overhaul can be evaluated',
          'Site conditions: confirmed together with rails, foundation, lifting, and the shutdown window',
          'Energy type: electric, natural gas, and more, matched to site conditions',
          'Applications: replacing aging bogie-hearth furnaces, throughput upgrades, and process changes',
        ],
      },
    ],
    processSteps: [
      {
        title: 'Submit parameters',
        text: 'Provide workpiece dimensions, weight, charge weight, temperature, and process requirements.',
      },
      {
        title: 'Determine the chamber',
        text: 'Define the effective dimensions from workpiece geometry, load capacity, rail/foundation, and the loading/unloading method.',
      },
      {
        title: 'Confirm the configuration',
        text: 'Finalize the temperature rating, heating method, control system, and furnace-door design.',
      },
      {
        title: 'Proposal and quote',
        text: 'Produce the technical proposal, key configuration, quote range, and delivery scope.',
      },
      {
        title: 'Manufacturing inspection',
        text: 'Complete inspection of the furnace body, bogie, refractory lining, heating, and electrical control systems.',
      },
      {
        title: 'Installation and after-sales',
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
      'Castings and forgings',
      'Die and mold manufacturing',
      'Steel structures',
      'Automotive components',
      'Energy equipment',
      'Job-shop heat treaters',
    ],
    leadBullets: [
      'Chamber determined by workpiece dimensions',
      'Bogie designed for the charge weight',
      'Heating and controls matched to the process curve',
      'Delivery scope defined by site conditions',
    ],
    parameterTitle: 'Which parameters need to be confirmed for a custom bogie-hearth furnace?',
    parameterLink: {
      title: 'See What Parameters a Quote Requires',
      description: 'View the quote-parameters reference page.',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    parameterNote:
      'A bogie-hearth furnace quote cannot be estimated from the furnace type alone. It depends on workpiece dimensions, charge weight, process temperature, temperature-uniformity requirements, heating method, bogie load capacity, production cycle time, and on-site conditions, with the mutually confirmed technical proposal being authoritative.',
    structureComponents: [
      {
        title: 'Furnace body structure',
        text: 'Includes the shell, chamber, insulation layer, and steel structure, designed to the chamber size, temperature rating, and long-term operating conditions.',
      },
      {
        title: 'Refractory lining system',
        text: 'Refractory materials, ceramic fiber, and composite insulation are selected based on temperature, the heat-up / cool-down schedule, and maintenance requirements.',
      },
      {
        title: 'Bogie system',
        text: 'Bogie load capacity, travel mechanism, rail/foundation, and charging method are determined from single-piece weight, total charge weight, and on-site rails.',
      },
      {
        title: 'Furnace-door system',
        text: 'A lift-up door, sealing structure, and door drive can be configured, with a focus on heat loss, operating safety, and ease of maintenance.',
      },
      {
        title: 'Heating system',
        text: 'Electric or gas-fired heating, selected together with energy conditions, temperature range, heat-up requirements, and on-site safety requirements.',
      },
      {
        title: 'Control system',
        text: 'Temperature controller, PLC, touchscreen HMI, chart recorder, multi-zone temperature control, and alarm/protection can be configured, with specifics confirmed in the proposal.',
      },
    ],
    priceFactors: [
      'Chamber size',
      'Bogie load capacity',
      'Maximum temperature',
      'Refractory lining material',
      'Heating method',
      'Temperature uniformity',
      'Control-system configuration',
      'Whether air circulation is required',
      'Whether installation and commissioning are included',
      'Whether it involves retrofit or overhaul of an existing furnace',
    ],
    comparisonRows: [
      {
        trolley: 'Large workpieces requiring full-charge loading/unloading',
        box: 'Small to medium workpieces with relatively simple loading/unloading',
      },
      {
        trolley: 'Heavy single pieces requiring bogie support',
        box: 'Lighter single pieces or small batches',
      },
      {
        trolley: 'Requires an overhead crane for loading/unloading',
        box: 'Loading/unloading achievable by hand or with simple tooling',
      },
      {
        trolley: 'Large chamber; rails and foundation must be reserved on site',
        box: 'More compact body with relatively manageable installation space',
      },
      {
        trolley:
          'Suited to batch heat treatment of large structural parts, dies, castings, and forgings',
        box: 'Suited to small-batch parts, prototypes, and small to medium workpieces',
      },
    ],
    processStepsTitle: 'Bogie-Hearth Furnace Customization Process',
    industryCards: [
      {
        title: 'Machining',
        text: 'Commonly used for annealing, tempering, normalizing, and stress relief of machined parts, structural parts, and large components.',
      },
      {
        title: 'Castings and forgings',
        text: 'Suited to batch heat treatment of large castings, forgings, and heavy-wall parts; charge weight and the heat-up/cool-down curve need attention.',
      },
      {
        title: 'Die and mold manufacturing',
        text: 'Commonly used for heat treatment of large dies, tooling, and complex-section parts, with a focus on the support arrangement and temperature uniformity.',
      },
      {
        title: 'Steel structures',
        text: 'Suited to stress relief or tempering of weldments, frame parts, and large steel structures.',
      },
      {
        title: 'Automotive components',
        text: 'Suited to heat treatment of components that are non-continuous in batch, larger in size, or require bogie-based loading and unloading.',
      },
      {
        title: 'Energy equipment',
        text: 'Suited to heat-treatment projects supporting large structural parts, heat-resistant components, and equipment manufacturing.',
      },
      {
        title: 'Job-shop heat treaters',
        text: 'Suited to processing of multiple part types and batches, balancing chamber utilization, charging efficiency, and process coverage.',
      },
    ],
    scenarioCards: [
      {
        title: 'Annealing of large castings and forgings',
        text: 'Chamber, bogie, and refractory-lining configuration are set around workpiece dimensions, single-piece weight, soak time, and cooling method.',
      },
      {
        title: 'Stress relief of welded structural parts',
        text: 'Focus on confirming heat-up/cool-down rates, workpiece support, furnace-door sealing, and on-site lifting conditions.',
      },
      {
        title: 'Tempering of dies and machined parts',
        text: 'Heating and control systems are configured based on die dimensions, charge weight, temperature uniformity, and recording requirements.',
      },
    ],
    faq: [
      {
        question: 'Q1: What workpieces are bogie-hearth furnaces suited to?',
        answer:
          'Bogie-hearth furnaces suit large castings, welded structural parts, dies and molds, machined parts, steel structures, and other workpieces that are large in size or heavy as single pieces. The bogie-based charging method makes crane lifting and whole-load loading and unloading straightforward. Whether one is suitable should be judged together with the workpiece dimensions, weight, charging method, and heat-treatment process.',
      },
      {
        question: 'Q2: Can a bogie-hearth furnace perform annealing, tempering, and normalizing?',
        answer:
          'Yes. Bogie-hearth furnaces are commonly used for batch heat-treatment processes such as annealing, tempering, normalizing, quench heating, aging, and stress relief. Each process has different requirements for maximum temperature, heating and cooling curves, soak time, charging method, and temperature uniformity, which should be confirmed item by item during the proposal stage.',
      },
      {
        question: 'Q3: Which parameters mainly drive the price of a bogie-hearth furnace?',
        answer:
          'The price of a bogie-hearth furnace is mainly influenced by the furnace chamber size, bogie load capacity, maximum temperature, refractory lining material, heating method, control system, temperature uniformity, whether forced air circulation is required, and the scope of installation and commissioning. Bogie-hearth furnaces are largely custom-engineered equipment, so parameters usually need to be submitted first before a proposal and price range can be assessed.',
      },
      {
        question:
          'Q4: What is the difference between a bogie-hearth furnace and a box (chamber) furnace?',
        answer:
          'A bogie-hearth furnace has a movable bogie and suits large, heavier workpieces or those that require crane lifting; a box (chamber) furnace has a more compact structure and suits small to medium workpieces, small-batch, or prototype work. Both can be custom-engineered; the choice should compare workpiece dimensions, weight, charge weight, and available floor space.',
      },
      {
        question: 'Q5: Can a bogie-hearth furnace use gas-fired heating?',
        answer:
          'Either electric resistance heating or gas-fired heating can be assessed according to project conditions. A gas-fired bogie-hearth furnace requires consideration of the combustion system, gas piping, safety interlocks, flue extraction, and local emission requirements; an electric resistance furnace focuses more on power-supply capacity, heating elements, and control zoning. The choice should be determined by the energy supply and process requirements.',
      },
      {
        question: 'Q6: How is temperature uniformity ensured in a bogie-hearth furnace?',
        answer:
          'Temperature uniformity is related to the furnace chamber size, heating-element layout, combustion system, refractory lining structure, door sealing, air circulation, and control zoning. During the proposal stage the target figures should be set together with the effective working zone, process temperature, and acceptance criteria; fixed values cannot be promised independently of the furnace type and workpiece condition.',
      },
      {
        question: 'Q7: Can an old bogie-hearth furnace be retrofitted or overhauled?',
        answer:
          'It can be assessed first. Common retrofit directions for an old bogie-hearth furnace include refractory lining renewal, door-seal repair, heating-system upgrades, bogie and track servicing, and control-system retrofits. Whether a retrofit is worthwhile should be judged together with the condition of the furnace body, safety risks, energy-consumption data, the production shutdown window, and the retrofit cost.',
      },
      {
        question:
          'Q8: What information should be prepared before requesting a quote for a bogie-hearth furnace?',
        answer:
          'We recommend preparing the workpiece dimensions, single-piece weight, charge weight per load, maximum temperature, typical operating temperature, heat-treatment process, temperature-uniformity requirements, heating method, bogie load capacity, site photos, lifting conditions, and workshop space. Even if the information is incomplete you can begin the discussion, and our engineers will advise on what still needs to be supplemented.',
      },
    ],
    relatedLinks: [
      {
        title: 'What Parameters Are Needed to Quote an Industrial Furnace',
        description:
          'Organize furnace type, dimensions, temperature, charge weight, process curves, and site conditions to make inquiries more efficient.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title:
          'Industrial Furnace Energy-Saving Retrofit and Heat-Treatment Furnace Overhaul Services',
        description:
          'Learn how to assess the refractory lining, seals, heating, and control systems of aging bogie-hearth furnaces and heat-treatment furnaces.',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: 'Heat-Treatment Furnace Manufacturer Page',
        description:
          "Explore Suneng's product range, manufacturing capability, and customization process as a heat-treatment furnace manufacturer.",
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: 'Box (Chamber) Furnace Page',
        description:
          'Compare box (chamber) furnace solutions for small to medium workpieces, small batches, and prototyping.',
        href: '/zh/products/detail/box-furnace',
      },
      {
        title: 'Mesh-Belt Furnace Page',
        description:
          'Learn about mesh-belt furnace solutions for continuous batch heat treatment of small parts and standard components.',
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
          'Submit bogie-hearth furnace parameters, consult on a solution, or arrange further technical discussion.',
        href: '/zh/contact',
      },
    ],
  },
  'pit-furnace': {
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
      '14,700 m² manufacturing base',
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
          'Learn about mesh-belt furnace solutions for small parts, standard parts, and continuous batch heat treatment.',
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
  },
  'bell-furnace': {
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
      '14,700 m² manufacturing base',
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
  },
  'pusher-furnace': {
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
      '14,700 m² manufacturing base',
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
          'Explore mesh-belt furnace solutions for small parts, standard parts and continuous batch heat treatment.',
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
  },
  'mesh-belt-furnace': {
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
      '14,700 m² manufacturing base',
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
        right: 'Continuous conveying of plates, bars or fairly regular workpieces',
      },
      {
        left: 'Stable throughput requiring continuous production',
        right: 'Defined line cycle time with high demands on in-furnace conveying stability',
      },
      {
        left: 'Lightweight parts that can be spread across the mesh belt',
        right: 'Workpieces better suited to roller-table support and straight-line conveying',
      },
      {
        left: 'A focus on mesh-belt speed, layer thickness and charging/discharging integration',
        right: 'A focus on furnace roller material, load, drive and roller-table maintenance',
      },
      {
        left: 'Suited to continuous annealing, tempering, quench heating and other batch processes for small parts',
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
      'This page does not fabricate customer cases. The following serves only to illustrate common mesh-belt furnace applications; specific projects can be further confirmed during commercial discussions based on authorized materials.',
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
  },
  'roller-hearth-furnace': {
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
      '14,700 m² manufacturing base',
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
  },
  'rotary-hearth-furnace': {
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
      '14,700 m² manufacturing base',
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
  },
  'roller-mesh-belt-line': {
    series: 'Mesh-Belt Heat-Treatment Furnace Series',
    title:
      'Roller-Supported Mesh-Belt Electric Resistance Furnace Line | Custom-Engineered Continuous Heat-Treatment Equipment',
    breadcrumbSeries: 'Heat-Treatment Lines',
    summary:
      'The roller-supported mesh-belt electric resistance furnace line is built for the continuous annealing, tempering, normalizing, solution treatment, pre-heating and drying of standard parts, hardware, bearing components, stampings, powder-metallurgy parts and small-to-medium workpieces. Based on workpiece material, dimensions, layer thickness, throughput and cycle time, mesh-belt width, roller-support arrangement and site conditions, Suneng delivers custom-engineered continuous heat-treatment equipment.',
    sellingPoints: [
      'Continuous heat treatment',
      'Roller-supported mesh belt',
      'Multi-zone temperature control',
      'Upstream/downstream integration can be assessed',
    ],
    quickTags: [
      'Roller-supported mesh-belt furnace',
      'Continuous annealing / tempering / normalizing',
      'Custom mesh-belt width',
      'Roller-support arrangement to be confirmed',
      'Electric resistance heating',
      'PLC control system',
    ],
    ctaHighlights: [
      'Founded in 2006',
      '14,700 m² manufacturing base',
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
          'Continuous annealing, tempering, normalizing, solution treatment, pre-heating, drying, etc.',
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
      'Normalizing',
      'Solution treatment',
      'Pre-heating',
      'Drying',
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
          'Q3: Can a roller-supported mesh-belt furnace perform continuous annealing, tempering and normalizing?',
        answer:
          'Yes. Depending on the project, a roller-supported mesh-belt furnace can be used for continuous annealing, tempering, normalizing, solution treatment, preheating and drying. Each process has different requirements for maximum temperature, holding time, cooling method, belt speed, number of temperature zones and auxiliary sections, all of which should be confirmed item by item during the proposal stage.',
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
        text: 'The roller-supported mesh-belt furnace line is suited to small parts, fasteners, standard parts, stampings, powder-metallurgy parts and batch continuous heat-treatment parts. Workpiece dimensions, unit weight, the way parts are stacked and the batch cycle affect belt width, roller structure, chamber length and the loading/unloading method, all of which must be confirmed against the on-site line conditions.',
      },
      {
        title: 'Typical Processes',
        text: 'This type of line is commonly used for continuous quenching, tempering, normalizing, annealing and batch continuous heat treatment. Whether to include a quench tank, tempering section, washing and drying or a protective atmosphere should be evaluated together with the material grade, heat-treatment curve, cooling method and surface-quality requirements.',
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
          'Explore mesh-belt furnace solutions for small parts, standard parts and continuous batch heat treatment.',
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
  },
  'copper-wire-annealing-line': {
    series: 'Copper Wire Annealing Line Series',
    title:
      'Automated Copper Wire Annealing Line | Custom Continuous Copper Wire Annealing Equipment',
    breadcrumbSeries: 'Heat-Treatment Lines',
    summary:
      'The automated copper wire annealing line is built for continuous annealing, softening annealing, bright annealing and stress relief of copper wire, copper conductors, copper-alloy wire, tin-plated copper wire and similar wire products. Suneng configures custom-engineered continuous copper wire annealing equipment around the wire material, wire-diameter range, annealing temperature, line speed, tension control, protective atmosphere and pay-off / take-up arrangement.',
    sellingPoints: [
      'Continuous copper wire annealing',
      'Tension control assessed per project',
      'Protective atmosphere available on assessment',
      'Custom pay-off / take-up arrangement',
    ],
    quickTags: [
      'Copper wire / copper conductors / copper-alloy wire',
      'Continuous annealing / softening annealing',
      'Bright annealing on assessment',
      'Tension control',
      'Protective atmosphere',
      'PLC control system',
    ],
    ctaHighlights: [
      'Founded in 2006',
      '14,700 m² manufacturing base',
      'Custom-engineered copper wire annealing lines',
    ],
    heroCtas: [
      {
        title: 'Get a Quotation',
        description:
          'Scroll to the inquiry form and submit your copper wire annealing line parameters.',
        href: '#product-lead-form',
      },
      {
        title: 'See What Parameters a Quote Requires',
        description:
          'Learn what information to prepare before requesting an industrial furnace quotation.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
    ],
    reasons: [
      {
        title: 'Matched to your wire-process requirements',
        text: 'Based on the copper wire material, wire-diameter range, annealing temperature, degree of softening and surface-quality requirements, we assess annealing furnace length, heating zones, speed interlocking and the process curve.',
      },
      {
        title: 'Aligned with your production cycle time',
        text: 'Based on your throughput, line speed, pay-off / take-up arrangement and floor layout, we match automatic pay-off, continuous annealing, cooling and drying, automatic take-up and the tension control system.',
      },
      {
        title: 'Improved annealing consistency',
        text: 'Through zoned heating, speed interlocking and tension control, there is room to improve annealing consistency; the actual results depend on the wire, line speed and operating conditions.',
      },
      {
        title: 'Surface-quality solutions assessed',
        text: 'The protective atmosphere, cooling and cleaning, drying and anti-oxidation design can be assessed against your surface-quality requirements; actual results depend on the operating conditions.',
      },
      {
        title: 'Reduced manual workload',
        text: 'Automatic pay-off, automatic take-up, tension control, speed interlocking and a centralized electrical control system can be configured to reduce manual intervention.',
      },
      {
        title: 'Safety measures configured per project',
        text: 'Electrical protection, tension control, alarm interlocks and operational safety measures are configured on a per-project basis.',
      },
    ],
    customSpecs: [
      {
        key: 'Wire material',
        value:
          'Pure copper wire, brass wire, copper-alloy wire, tin-plated copper wire and similar; please provide the material grade and surface condition.',
      },
      {
        key: 'Wire-diameter range',
        value:
          'Provide the minimum and maximum wire diameter, common gauges and how often gauges change.',
      },
      {
        key: 'Single-wire / multi-wire mode',
        value:
          'Specify single-strand continuous annealing, multi-wire parallel running or another threading arrangement.',
      },
      {
        key: 'Target process',
        value:
          'Softening annealing, bright annealing, stress relief or another wire-annealing objective.',
      },
      {
        key: 'Annealing temperature',
        value: 'Confirmed by wire material, wire diameter, annealing objective and line speed.',
      },
      {
        key: 'Maximum temperature',
        value:
          'Provide the maximum temperature required by the process and the safety-margin requirements.',
      },
      {
        key: 'Line speed',
        value:
          'Calculated from wire diameter, furnace body length, dwell time, throughput requirements and pay-off / take-up capacity.',
      },
      {
        key: 'Throughput requirements',
        value:
          'Specify output per hour or per shift, continuous run time and how often the line is changed over.',
      },
      {
        key: 'Pay-off method',
        value:
          'Spools, reels, driven or passive pay-off, to be confirmed against the site and tension requirements.',
      },
      {
        key: 'Take-up method',
        value:
          'Take-up reels, spools, coiling or another method, confirmed against the product specification.',
      },
      {
        key: 'Tension control requirements',
        value:
          'The control scheme is set by wire diameter, line speed, wire-break risk and pay-off / take-up arrangement.',
      },
      {
        key: 'Protective atmosphere required?',
        value:
          'Plain softening annealing, bright annealing or anti-oxidation objectives are each assessed separately.',
      },
      {
        key: 'Atmosphere type',
        value:
          'Nitrogen, hydrogen-nitrogen mixed gas, inert gas or another atmosphere, to be confirmed for safety and process.',
      },
      {
        key: 'Cooling method',
        value:
          'Natural cooling, air cooling, water cooling or protective-atmosphere cooling, confirmed by the process.',
      },
      {
        key: 'Cleaning / drying requirements',
        value:
          'Whether pre/post cleaning, drying, surface treatment or auxiliary sections are required.',
      },
      {
        key: 'Surface-quality requirements',
        value:
          'Specify brightness, oxidation control, residue limits and any subsequent tinning or drawing requirements.',
      },
      {
        key: 'Wire-break protection requirements',
        value:
          'Wire-break detection, alarm shutdown, tension interlock and safety protection, to be confirmed for the line.',
      },
      {
        key: 'Control-system requirements',
        value:
          'PLC, touchscreen HMI, temperature control, speed interlocking, tension control, recording and alarm protection, etc.',
      },
      {
        key: 'Site space and upstream/downstream equipment conditions',
        value:
          'Provide workshop space, power supply, gas supply, cooling water, pay-off / take-up area and upstream/downstream equipment conditions.',
      },
    ],
    configurations: [
      {
        title: 'Automated Fine Copper Wire Annealing Line',
        image: imagesBySlug['copper-wire-annealing-line'].configs[0],
        specs: [
          'Wire-diameter range: confirmed by fine-wire gauge and wire-break risk',
          'Annealing temperature: confirmed by material, softening objective and line speed',
          'Line speed: calculated from furnace body length, dwell time and pay-off / take-up capacity',
          'Suitable products: fine copper wire, electronic lead wire, precision copper wire',
        ],
      },
      {
        title: 'Continuous Annealing Line for Medium-Gauge Copper Wire',
        image: imagesBySlug['copper-wire-annealing-line'].configs[1],
        specs: [
          'Wire range: confirmed by copper wire, copper-alloy wire or cable-conductor specification',
          'Tension control: designed by wire diameter, spools and pay-off / take-up arrangement',
          'Atmosphere configuration: assessed by surface quality and bright-annealing objective',
          'Suitable products: copper wire, copper-alloy wire, cable conductors',
        ],
      },
      {
        title: 'Continuous Annealing Line for Large-Gauge Copper Wire',
        image: imagesBySlug['copper-wire-annealing-line'].configs[0],
        specs: [
          'Wire range: confirmed by continuous-annealing needs for large-gauge and heavy copper wire',
          'Furnace body length: calculated from annealing dwell time and line speed',
          'Cooling method: confirmed by surface quality, exit-wire temperature and downstream processes',
          'Suitable products: large-gauge copper wire, continuous annealing of heavy wire',
        ],
      },
    ],
    processes: [
      'Continuous annealing',
      'Softening annealing',
      'Bright annealing',
      'Stress-relief annealing',
      'Copper wire annealing',
      'Copper conductor annealing',
      'Protective-atmosphere annealing',
      'Continuous wire heat treatment',
    ],
    industries: [
      'Wire and cable',
      'Copper processing',
      'Electronic lead wire',
      'Enameled-wire pretreatment',
      'New-energy wiring harnesses',
      'Copper-alloy wire',
      'Precision metal wire',
      'Cable-conductor manufacturing',
    ],
    leadBullets: [
      'Initial solution discussion',
      'Configuration assessed against process requirements',
      'Configuration boundaries confirmed against parameters',
      'After-sales support per the contract terms',
    ],
    parameterTitle: 'What Parameters Does a Custom Automated Copper Wire Annealing Line Require?',
    parameterLink: {
      title: 'See What Parameters a Quote Requires',
      description: 'View the quotation parameters reference page.',
      href: '/zh/articles/gongye-lu-baojia-canshu',
    },
    comparisonTitle:
      'Copper Wire Annealing Line, Mesh-Belt Furnace or Annealing & Solution-Treatment Line: How to Choose?',
    comparisonHeaders: [
      'The automated copper wire annealing line suits',
      'The mesh-belt furnace suits',
      'The annealing & solution-treatment line suits',
    ],
    comparisonRows: [
      {
        left: 'Copper wire, copper conductors, copper-alloy wire and similar wire products',
        middle: 'Small parts, standard parts, fasteners and hardware',
        right: 'Strip, plate and relatively uniform metal materials',
      },
      {
        left: 'Continuous production of pay-off, annealing, cooling and take-up',
        middle: 'Workpieces that can be laid on a mesh belt for continuous conveying',
        right: 'Continuous annealing, solution-treatment or heat-treatment lines',
      },
      {
        left: 'Requirements on tension control, line speed and surface quality',
        middle: 'Focus on mesh-belt width, layer thickness and zone configuration',
        right: 'Focus on material width, line speed, heating zones and cooling method',
      },
      {
        left: 'Suited to softening annealing, bright annealing and stress relief',
        middle: 'Suited to continuous annealing, tempering and quench heating of small parts',
        right:
          'Suited to continuous production of stainless steel, non-ferrous metals and the like',
      },
      {
        left: 'Key items to confirm: wire diameter, line speed, atmosphere and pay-off / take-up arrangement',
        middle: 'Key items to confirm: workpiece size, loading method and throughput cycle time',
        right: 'Key items to confirm: material specification, strip width and process curve',
      },
    ],
    faq: [
      {
        question: 'Q1: What types of wire is the automated copper wire annealing line suited for?',
        answer:
          'The automated copper wire annealing line is suited for continuous annealing, softening, and stress-relief treatment of bare copper wire, brass wire, copper alloy wire, tin-plated copper wire, and related copper wires. The specific solution is defined by the wire diameter range, incoming wire condition, surface quality targets, pay-off and take-up arrangement, and tension control requirements.',
      },
      {
        question: 'Q2: How is copper wire annealing temperature related to wire diameter?',
        answer:
          'Annealing temperature, wire diameter, and line speed must be considered together. A larger wire diameter generally requires a longer soak time to heat through; for finer wire, tension, surface oxidation, and the risk of wire breakage also need attention. The final temperature curve should be confirmed against the material grade, annealing target, furnace length, and line speed.',
      },
      {
        question: 'Q3: How is the line speed of a continuous annealing line determined?',
        answer:
          'The speed of a continuous annealing line is determined jointly by wire diameter, wire material, annealing temperature, the effective heated length inside the furnace, the cooling method, and pay-off/take-up capacity. The design must calculate the dwell time of the wire inside the furnace and match it to tension control, surface quality targets, and take-up cycle time.',
      },
      {
        question: 'Q4: Does a copper wire annealing line require a protective atmosphere?',
        answer:
          'Whether a protective atmosphere is required depends on the wire surface quality, oxidation control, bright-annealing targets, and production cost. The sealing, gas, cooling, and safety configurations differ between standard softening annealing and bright annealing, so they should be evaluated case by case against the process targets and site conditions.',
      },
      {
        question:
          'Q5: Which parameters mainly drive the price of an automated copper wire annealing line?',
        answer:
          'Price is mainly influenced by the wire diameter range, wire material, furnace length, number of heating zones, line speed, throughput requirements, tension control, protective atmosphere, cooling method, cleaning and drying configuration, the pay-off/take-up system, the control system, and the installation and commissioning scope. We recommend submitting your parameters first so the solution and price range can be assessed.',
      },
      {
        question: 'Q6: Why is tension control important on a copper wire annealing line?',
        answer:
          'Tension control affects running stability, the risk of wire breakage, take-up quality, and consistency of the annealing process. Fine wire, high-speed operation, and multi-strand running place higher demands on pay-off, capstan, take-up, and speed synchronization. The specific control method should be confirmed against wire diameter, spool type, speed, and the on-site operating conditions.',
      },
      {
        question: 'Q7: Can an aging copper wire annealing line be retrofitted or overhauled?',
        answer:
          'It is advisable to first assess the furnace insulation, heating elements, temperature control system, drive and tension, sealing structure, cooling and drying, the pay-off/take-up system, and energy consumption data. Whether a retrofit or overhaul is worthwhile depends on equipment condition, throughput bottlenecks, product quality targets, spare-parts availability, and the available downtime window.',
      },
      {
        question:
          'Q8: What information should be prepared before requesting a quote for a copper wire annealing line?',
        answer:
          'We suggest preparing the wire material, wire diameter range, single- or multi-strand mode, annealing targets, typical operating temperatures, line speed, throughput requirements, pay-off/take-up arrangement, tension control requirements, whether a protective atmosphere is needed, cooling/cleaning/drying requirements, and the site space and photos.',
      },
    ],
    geoSections: [
      {
        title: 'Applicable Workpieces',
        text: 'The automated copper wire annealing line is suited for continuous annealing or softening of copper wire, copper conductors, copper alloy wire, and certain non-ferrous metal wires. The wire diameter range, wire material, surface condition, pay-off/take-up arrangement, and tension control requirements directly affect the furnace length, speed synchronization, and protective atmosphere configuration.',
      },
      {
        title: 'Typical Processes',
        text: 'Common processes include continuous annealing, softening, and stress relief; bright annealing requires project-specific evaluation of the protective atmosphere, sealing structure, dew-point control, and cooling method. The annealing temperature, dwell time, and surface quality requirements for different wire diameters and materials should be confirmed individually.',
      },
      {
        title: 'Selection Considerations',
        items: [
          'Wire diameter range and material grade',
          'Pay-off/take-up arrangement and tension control',
          'Line speed and annealing dwell time',
          'Heated zone length and temperature-zone control',
          'Protective atmosphere and sealing requirements',
          'Surface quality, cooling, and drying requirements',
        ],
      },
    ],
    relatedLinks: [
      {
        title: 'What Parameters Are Needed for an Industrial Furnace Quote',
        description:
          'Organize furnace type, dimensions, temperature, throughput, process curves, and site conditions to make your inquiry more efficient.',
        href: '/zh/articles/gongye-lu-baojia-canshu',
      },
      {
        title:
          'Industrial Furnace Energy-Saving Retrofit and Heat-Treatment Furnace Overhaul Services',
        description:
          'Learn how we assess the insulation, heating, drive, and control systems of aging annealing furnaces and wire annealing lines.',
        href: '/zh/service/furnace-renovation-overhaul',
      },
      {
        title: 'Heat-Treatment Furnace Manufacturer',
        description:
          'Learn about Suneng’s product range, manufacturing capability, and custom-engineering process as a heat-treatment furnace manufacturer.',
        href: '/zh/solutions/rechuli-lu-changjia',
      },
      {
        title: 'Mesh-Belt Furnace',
        description:
          'Learn about mesh-belt furnace solutions for continuous, high-volume heat treatment of small and standard parts.',
        href: '/zh/products/detail/mesh-belt-furnace',
      },
      {
        title: 'Roller-Supported Mesh-Belt Electric Resistance Furnace Line',
        description:
          'Compare the mesh-belt width, roller support structure, and temperature-zone layout of continuous heat-treatment lines for small parts.',
        href: '/zh/products/detail/roller-mesh-belt-line',
      },
      {
        title: 'Annealing and Solution-Treatment Line',
        description:
          'Learn the solution boundaries of continuous annealing and solution-treatment lines for strip, sheet, and coil material.',
        href: '/zh/products/detail/annealing-solution-line',
      },
      {
        title: 'Product Center',
        description:
          'Browse Suneng’s published heat-treatment furnaces, industrial furnaces, and heat-treatment lines.',
        href: '/zh/products',
      },
      {
        title: 'Contact Us',
        description:
          'Submit your copper wire annealing line parameters, discuss a solution, or schedule further technical communication.',
        href: '/zh/contact',
      },
    ],
    parameterNote:
      'The above are common configuration ranges. The exact specification depends on the wire material, wire-diameter range, annealing objective, line speed, protective atmosphere and site conditions, and is ultimately governed by the technical proposal agreed by both parties.',
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
  },
  'annealing-solution-line': {
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
      '14,700 m² manufacturing base',
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
  },
};

export function getProductDetailEn(slug: string): ProductDetailEnOverride | undefined {
  return productDetailEn[slug];
}

// en fields override zh; any field absent in `en` falls back to zh (whole-field, not deep-merge).
export function pickDetail(
  zh: StaticProductDetail,
  en: ProductDetailEnOverride | undefined,
  locale: Locale,
): StaticProductDetail {
  if (locale !== 'en' || !en) return zh;
  return { ...zh, ...en };
}
