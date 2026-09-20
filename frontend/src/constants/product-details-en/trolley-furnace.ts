import type { StaticProductDetail } from '@/constants/static-products';
import { imagesBySlug } from '@/constants/static-products';

const detail: Partial<StaticProductDetail> = {
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
      'company-reported approx. 14,700 m² production site',
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
        title:
          'Authorized Project: Bogie-Hearth Spheroidizing Annealing Furnace for Bearing-Steel Wire',
        text: 'One wire-processing project used a 10 × 3 × 2.2 m bogie-hearth spheroidizing annealing furnace; temperature, charge weight, and the process curve are determined for the corresponding wire specification.',
      },
      {
        title: 'Authorized Project: Extra-Large Gas-Fired Bogie-Hearth Annealing Furnace Retrofit',
        text: 'One heavy-workpiece project had a chamber of about 13 × 7.4 × 4.3 m, a 700°C rated temperature, 14 gas burners, and combustion-air preheating to about 250–300°C. These project figures are not generalized into a fixed energy-saving rate.',
      },
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
    scenarioIntro:
      'The following combines parameters from authorized, anonymized bogie-hearth furnace projects with common applications. Dimensions, temperatures, and combustion configurations apply only to the stated projects; each new project is engineered to its workpiece and site conditions.',
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
          'Submit bogie-hearth furnace parameters, consult on a solution, or arrange further technical discussion.',
        href: '/zh/contact',
      },
    ],
  };

export default detail;
