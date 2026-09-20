import type { StaticProductDetail } from '@/constants/static-products';
import { imagesBySlug } from '@/constants/static-products';

const detail: Partial<StaticProductDetail> = {
    series: 'Copper Wire Annealing Line Series',
    title:
      'Automated Copper Wire Annealing Line | Custom Continuous Copper Wire Annealing Equipment',
    breadcrumbSeries: 'Heat-Treatment Lines',
    summary:
      'The automated copper wire annealing line is built for continuous annealing, softening annealing, bright annealing and stress relief of bare copper and suitable copper-alloy wire. Suneng configures custom-engineered continuous copper wire annealing equipment around the wire material, wire-diameter range, annealing temperature, line speed, tension control, protective atmosphere and pay-off / take-up arrangement.',
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
      'company-reported approx. 14,700 m² production site',
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
          'Bare copper and suitable copper-alloy wire; provide grade and surface condition. Coated or tin-plated wire requires separate process evaluation.',
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
          'The automated copper wire annealing line is suited for continuous annealing, softening, and stress-relief treatment of bare copper and suitable copper-alloy wire. The specific solution is defined by the wire diameter range, incoming wire condition, surface quality targets, pay-off and take-up arrangement, and tension control requirements.',
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
        text: 'The automated copper wire annealing line is suited for continuous annealing or softening of bare copper and suitable copper-alloy wire. The wire diameter range, wire material, surface condition, pay-off/take-up arrangement, and tension control requirements directly affect the furnace length, speed synchronization, and protective atmosphere configuration.',
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
  };

export default detail;
