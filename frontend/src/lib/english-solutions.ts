/** English adaptations of the existing Chinese engineering guides.
 * Keep project design examples separate from measured delivery results.
 * The Chinese source pages remain the technical source of record.
 */
export type EnglishSolution = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  answer: string;
  sections: { title: string; intro?: string; items: { title: string; text: string }[] }[];
  checklist: string[];
  faqs: { question: string; answer: string }[];
  products: { title: string; slug: string }[];
};

export const ENGLISH_SOLUTIONS_UPDATED = '2026-09-12';
const repairImage = '/images/services/selection-guide/hero-engineers.png';

export const englishSolutions: EnglishSolution[] = [
  {
    slug: 'continuous-heat-treatment-line',
    title: 'Continuous Heat Treatment Line Planning',
    summary: 'Match the workpiece, process and target output with heating, cooling, handling and control systems.',
    image: '/images/products/annealing-solution-line/gallery/line-01.jpg',
    imageAlt: 'Reference equipment for a continuous strip annealing and solution treatment line',
    answer: 'Start with the material, workpiece dimensions, required treatment and target output. Then coordinate loading, heating and holding, cooling or quenching, downstream treatment and controls. Capacity must be checked against the actual workpiece, loading pattern, process time and upstream and downstream equipment.',
    sections: [
      { title: 'Is a continuous line the right starting point?', items: [
        { title: 'Stable workpieces and sustained output', text: 'A continuous line is worth evaluating when the product mix and process route are relatively stable and production is sustained.' },
        { title: 'Frequent process changes', text: 'For varied products, small batches or frequent recipe changes, compare batch furnaces as well. Loading constraints and available floor space also affect the choice.' },
        { title: 'Automation is a separate decision', text: 'Continuous furnaces move workpieces at a set speed or indexed cycle; batch furnaces process one load at a time. Either type can use automatic loading and unloading and form part of a production line.' },
      ] },
      { title: 'Build the process around the required treatment', intro: 'These are process examples. Cleaning and drying depend on the medium and process; the final route depends on the material and handling method.', items: [
        { title: 'Annealing', text: 'Load or uncoil → heat and hold → cool as required by the process → unload or recoil.' },
        { title: 'Quenching and tempering', text: 'Load → heat and hold → quench → clean and dry where required → temper → cool and unload.' },
        { title: 'Solution treatment of coilable strip', text: 'Uncoil → heat and hold for the specified solution treatment → cool at the rate required by the material and process → recoil. Confirm the material grade, strip width and thickness, holding conditions and cooling requirements.' },
      ] },
      { title: 'Coordinate the line, including its interfaces', items: [
        { title: 'Loading and throughput', text: 'Confirm dimensions, weight, loading pattern, required hourly output and shifts. Check heating time and the ability of upstream and downstream equipment to keep pace; furnace size alone does not establish capacity.' },
        { title: 'Heating, cooling and handling', text: 'Select heating and temperature zones, cooling or quenching, and conveying around the workpiece and process. Coordinate transfer timing and downstream treatment.' },
        { title: 'Controls and safety', text: 'Define automation interfaces, process records and protective functions together with the equipment configuration. Agree how each interface will be checked.' },
      ] },
      { title: 'Define supply and acceptance before ordering', items: [
        { title: 'Equipment and site responsibilities', text: 'List the furnace, conveyors, cooling and controls included in supply. Identify site utilities and the responsibilities of each party. Suneng participates as an equipment supplier or equipment subcontractor within the agreed contract scope.' },
        { title: 'Quality and production capability', text: 'Agree the workpiece, material, loading pattern and process used to verify product quality and throughput. A design capacity or proposal value is not a measured production result.' },
        { title: 'Tests and handover documents', text: 'Agree temperature measurement, trial operation and applicable acceptance items, together with drawings and operating documentation. Civil works, pressure vessels, regulated equipment and wider environmental or general contracting work require appropriately qualified parties.' },
      ] },
    ],
    checklist: ['Workpiece photographs or drawings, dimensions and weight', 'Material grade and required heat treatment', 'Quality, hardness and surface requirements', 'Target hourly output, loading method and shifts', 'Workshop space, electricity, fuel and water', 'Required supply scope and site responsibilities'],
    faqs: [
      { question: 'Can I ask for a proposal without a complete process specification?', answer: 'Yes. Start with workpiece photographs, the known material, target output and treatment requirements. Mark unknown items as unknown so they can be clarified.' },
      { question: 'How is production capacity determined?', answer: 'By checking workpiece dimensions and weight, loading pattern, process time, and upstream and downstream equipment. It cannot be determined from furnace dimensions alone.' },
      { question: 'Does a continuous furnace always suit a production line?', answer: 'No. Batch furnaces can also form automated lines. Compare the product mix, process changes, loading method and site conditions before choosing.' },
    ],
    products: [
      { title: 'Copper Wire Annealing Line', slug: 'copper-wire-annealing-line' },
      { title: 'Strip Annealing & Solution Treatment Line', slug: 'annealing-solution-line' },
      { title: 'Mesh Belt Annealing & Tempering Line', slug: 'roller-mesh-belt-line' },
    ],
  },
  {
    slug: 'rechuli-lu-wendu-bujun-zhenggai',
    title: 'Correcting Furnace Temperature Non-uniformity',
    summary: 'Establish comparable test conditions, locate the cause and verify the correction under the agreed load.',
    image: repairImage, imageAlt: 'Illustration of engineers reviewing an industrial furnace project',
    answer: 'Do not begin by adjusting the controller alone. First fix the test conditions, then check measurement circuits, heating zones, circulation and flow guides, door seals, the lining and loading pattern. Verify the correction using comparable project conditions and retain the original measurement records.',
    sections: [
      { title: 'Make the measurements comparable', items: [
        { title: 'Empty furnace or loaded furnace', text: 'Record the workpiece, loading arrangement and load used in the test. Empty-furnace results cannot replace loaded production verification.' },
        { title: 'Measurement points and timing', text: 'Agree the number and location of test points, holding period and sampling method. Without consistent conditions, before-and-after temperature differences may not show the effect of a correction.' },
        { title: 'Instruments and calibration', text: 'Check sensor placement, the measurement circuit, instruments and calibration records before treating a displayed temperature as reliable evidence.' },
      ] },
      { title: 'Use the symptom to narrow the investigation', items: [
        { title: 'Sensor trends disagree', text: 'Check measurement circuits, sensor locations and calibration. A single stable display does not establish uniform temperature throughout the working zone.' },
        { title: 'Hot or cold locations repeat', text: 'Check heating zones, heating capacity, circulation, flow guides, door sealing and lining condition in relation to those locations.' },
        { title: 'Empty and loaded tests differ', text: 'Review the workpiece, loading density and arrangement, airflow obstruction and process conditions. Evaluate the furnace and its load together.' },
      ] },
      { title: 'Document the correction and the retest', items: [
        { title: 'A traceable test record', text: 'Retain the test conditions, point locations, time series, instruments and calibration status. Record the corrective work and any remaining deviations.' },
        { title: 'Project acceptance criteria', text: 'Specify whether acceptance uses an empty or loaded furnace, measurement locations, holding time, instruments and the applicable standard and edition. Temperature accuracy and uniformity limits must be agreed for the project.' },
        { title: 'Comparable verification', text: 'Repeat the agreed test after correction. Controller settings, configuration changes or an isolated reading do not by themselves prove improved uniformity.' },
      ] },
    ],
    checklist: ['Furnace type and process temperature', 'Workpiece, load and loading arrangement', 'Hot and cold locations and original temperature records', 'Empty or loaded test conditions and holding time', 'Sensor positions, instruments and calibration records', 'Heating zones, circulation, seals and lining condition', 'Required acceptance method and available shutdown window'],
    faqs: [
      { question: 'Can controller tuning alone solve uneven furnace temperature?', answer: 'It may be part of the work, but the measurement, heating, circulation, sealing, lining and loading conditions must also be checked.' },
      { question: 'What if the temperature is still uneven after a retrofit?', answer: 'First check that the earlier and later tests used comparable instruments, measurement locations, loads and process conditions. Then investigate the remaining physical and control causes.' },
      { question: 'What should the acceptance specification include?', answer: 'State empty or loaded conditions, measurement points, holding time, instruments and calibration, applicable standards and project limits. Keep the raw test records and correction results.' },
    ], products: [],
  },
  {
    slug: 'rechuli-lu-kongzhi-xitong-shengji',
    title: 'Heat Treatment Furnace Control System Upgrades',
    summary: 'Review measurement, actuators, interlocks, software and data interfaces before choosing what to retain or replace.',
    image: repairImage, imageAlt: 'Illustration of engineers reviewing an industrial furnace project',
    answer: 'Restore the drawings, input/output list, programs, parameters and software versions first. Check measurement circuits, actuators and safety interlocks, then choose a partial upgrade or a new architecture according to control complexity, data interfaces and maintenance capability. Validate the change through cold, hot and loaded tests.',
    sections: [
      { title: 'Look beyond the controller', items: [
        { title: 'Obsolete parts or missing programs', text: 'Inventory controllers, modules and operator panels. Check whether readable programs, passwords, backups, versions and documentation are available for fault recovery.' },
        { title: 'Stable display, unstable process', text: 'Inspect sensor positions, calibration, actuators, heating capacity, circulation and furnace condition. Controller tuning alone may not address the cause.' },
        { title: 'Missing alarms or traceability', text: 'Check event records, historical trends, recipe versions and external interfaces so abnormal operation can be investigated.' },
      ] },
      { title: 'Choose an architecture for the application', items: [
        { title: 'Programmable logic controller (PLC)', text: 'Review the number of inputs and outputs, sequence control, temperature zones, communications and maintenance skills. A brand or model does not guarantee temperature accuracy or uniformity. Listing a process PLC alone does not establish that the safety functions are suitable; verify the safety architecture, components and logic against the project requirements.' },
        { title: 'Distributed control system (DCS)', text: 'Evaluate coordination between systems, redundancy, access permissions, historical data and plant interfaces. A more complex system is not automatically a better choice for one furnace.' },
        { title: 'Retain and upgrade selectively', text: 'Confirm readable programs, available spare parts and usable circuits before adding interfaces. Unclear safety logic, drawings or data foundations require resolution first.' },
        { title: 'Operator screens and plant data', text: 'For operator interfaces, supervisory software and manufacturing systems, define point mapping, timestamps, retention, permissions and network security. A new dashboard does not establish that the underlying controls have been upgraded.' },
      ] },
      { title: 'Plan the changeover and prove the result', items: [
        { title: 'Backup and recovery', text: 'Archive the original programs, parameters, versions, input/output lists, communications tables and drawings. Record the changes, shutdown conditions and the conditions for returning to the previous configuration.' },
        { title: 'Factory tests', text: 'Use the agreed test plan to simulate inputs and outputs, alarms, interlock sequences and fail-safe actions. Record deviations and their resolution.' },
        { title: 'Site tests and loaded verification', text: 'Check circuits, actuators, interlocks, process curves and loaded results on site. Passing cold logic tests cannot replace hot or loaded verification.' },
        { title: 'Configuration example, not a universal specification', text: 'One existing project proposal lists an S7-1200 PLC, an operator panel described as 14-inch, and two proportional–integral–derivative temperature-control zones per chamber. The panel description still needs confirmation against the exact model and manufacturer documentation. These are proposal entries, not a verified bill of materials, universal requirements or measured upgrade performance.' },
      ] },
    ],
    checklist: ['Furnace type, process and fault history', 'Electrical drawings and input/output list', 'Controller and operator-panel models, programs and versions', 'Sensors, calibration and actuators', 'Interlock and alarm logic', 'Historical data and external interfaces', 'Shutdown window and recovery conditions'],
    faqs: [
      { question: 'Is a control upgrade simply a PLC replacement?', answer: 'No. Measurement circuits, actuators, safety interlocks, programs, drawings, historical data, interfaces and the changeover plan also need review.' },
      { question: 'Should the furnace use a PLC or a DCS?', answer: 'Choose according to the control objects, interlock complexity, redundancy, plant interfaces, data requirements and maintenance capability. The system name or price alone cannot decide.' },
      { question: 'How is an upgrade priced?', answer: 'Separate inputs and outputs, cabinets, instruments, actuators, safety systems, software, interfaces, site work and shutdown changeover. A generic controller-replacement price cannot cover an undefined scope.' },
    ], products: [],
  },
  {
    slug: 'rechuli-lu-luchen-fanxin',
    title: 'Furnace Lining Repair and Relining',
    summary: 'Inspect the hot face, shell, anchors and interfaces before deciding between local repair and wider relining.',
    image: repairImage, imageAlt: 'Illustration of engineers reviewing an industrial furnace project',
    answer: 'Do not decide the repair scope from furnace age or visible damage alone. Local repair may be appropriate where damage is isolated, the cold face is unaffected, surrounding anchors remain sound and the old and new lining can be joined reliably. Roof sagging, abnormal shell temperatures or through-cracks call for wider inspection. Final scope depends on the shutdown inspection.',
    sections: [
      { title: 'Check the support system as well as the surface', items: [
        { title: 'Sagging, bulging or displacement', text: 'Inspect suspension, anchors and backing insulation. Covering the visible hot face alone can leave supporting defects unresolved.' },
        { title: 'Abnormal cold-face temperature', text: 'After checking seal leakage, investigate through-cracks, thermal bridges and missing insulation. Record where and under what operating conditions the temperatures were measured.' },
        { title: 'Repeated repairs or changed operation', text: 'Review overheating, water ingress, atmosphere attack and repeated patching. A fuel change, higher temperature, greater loading or changed pressure and flow can require a new lining assessment.' },
      ] },
      { title: 'Choose materials and define the interfaces', items: [
        { title: 'Local repair or wider opening-up', text: 'Confirm the cause of failure and the continuity of anchors and joints. Use drawings, temperature records and the opened lining to determine the inspection and repair extent.' },
        { title: 'Material and installation design', text: 'Confirm fiber, castable or brick materials together with burner openings, doors and thermocouple penetrations. Material grade, compression and dry-out requirements are project-specific.' },
        { title: 'Keep proposal values within their scope', text: 'A 2018 proposal specifies type 1140 refractory fiber modules with compression of at least 40% for repairs around burner openings and the furnace opening. The product designation does not establish a service-temperature rating. Confirm the grade, compression calculation, installation direction and applicability against the product documentation and installation design before using these values for another repair.' },
      ] },
      { title: 'Retain evidence for acceptance and future comparison', items: [
        { title: 'Structure and materials', text: 'Keep photographs before and after removal, shell and anchor inspection records, joint and penetration details, material certificates and installation records.' },
        { title: 'Dry-out record', text: 'Where the installed material and repair design require curing or dry-out, follow the specified schedule and record the measured time–temperature curve, holding periods, moisture outlet condition, observed vapor release, abnormal events and ambient conditions. Do not transfer a generic dry-out curve between different material systems.' },
        { title: 'Surface temperature and temperature rise', text: 'A 2018 proposal uses the expression “ambient temperature + 40°C” under a wall-temperature-rise label, with 800°C steady operation stated in the lining section and thermal bridges excluded in the parameter table. A surface temperature 40°C above ambient corresponds to a 40 K rise; it is different from a 40°C absolute surface-temperature limit. The acceptance specification must resolve the source wording and define the measured quantity, operating conditions, points and exclusions before this example is used as a test limit.' },
        { title: 'Energy comparison', text: 'Compare wall temperature, heat-up time, holding power or fuel use and seals under comparable environment, load and process conditions over a complete measurement period. No universal energy-saving percentage follows from relining alone.' },
      ] },
    ],
    checklist: ['Furnace type, temperature and atmosphere', 'Lining and anchor drawings', 'Damage photographs and locations', 'Cold-face temperature and abnormal-operation records', 'Overheating, water ingress and repair history', 'Planned changes in process or loading', 'Shutdown window and required verification'],
    faqs: [
      { question: 'Can a small damaged area simply be patched?', answer: 'Only after checking the cold face, anchors, failure cause and old-to-new joints. Sagging, abnormal shell temperatures or through-cracks require wider inspection.' },
      { question: 'Is more fiber-module compression always better?', answer: 'No. Compression must match the material, structure, calculation basis and installation direction stated in the product documentation and installation design.' },
      { question: 'Can a fixed energy-saving percentage be promised?', answer: 'Not without comparable before-and-after data covering the environment, load, process and measurement period. Agree the measurement scope first.' },
    ], products: [],
  },
  {
    slug: 'rechuli-lu-tingchan-chongqi-banqian-fuchan',
    title: 'Furnace Restart and Relocation Planning',
    summary: 'Establish the equipment condition, complete corrective work and define the conditions for cold, hot and loaded verification.',
    image: repairImage, imageAlt: 'Illustration of engineers reviewing an industrial furnace project',
    answer: 'First establish why the furnace stopped, what records remain and its present condition. Inspect the structure, lining, energy supply, electrics, temperature measurement, interlocks and mechanical systems. Define cold, hot and loaded checks, their prerequisites and any required test media in the project verification plan. The equipment documents and repair scope determine whether no-load heating is suitable and the order of testing. Meet the prerequisites for each test before starting it; a successful start does not prove readiness for stable production.',
    sections: [
      { title: 'Establish the condition before energizing or firing', items: [
        { title: 'Shutdown history', text: 'Recover the last operating conditions, failure causes, unusual repairs and information about residual process media. Unknown shutdown history requires investigation before restoring the old operating sequence.' },
        { title: 'Drawings, programs and identification', text: 'Reconstruct missing drawings, program versions, circuits, nameplate information and safety logic. Establish a usable equipment record before testing.' },
        { title: 'Disassembly and relocation records', text: 'Review component identification, transport deformation, foundations, alignment, pipework and wiring. The previous installation and acceptance records cannot replace verification at the new site.' },
      ] },
      { title: 'Match the inspection to the work', items: [
        { title: 'Restart in the same location', text: 'Check shutdown history, insulation, seals, actuators, interlocks and energy supply. Original design capacity is not evidence of current loaded performance.' },
        { title: 'Relocation and recommissioning', text: 'Restore component locations, alignment, foundations, piping and interfaces, then verify the new installation. Old process settings are a starting point for review, not automatic approval to use them.' },
        { title: 'Remanufacturing or mechanical overhaul', text: 'Assess structural integrity, recoverable safety systems, key spare parts, energy and emission boundaries, and suitability for the new process. Inspect pushers, rollers, chains and hydraulics for wear, alignment and loaded movement.' },
      ] },
      { title: 'Define the verification scope and retain a new equipment record', intro: 'These groups organise the evidence, not a universal operating sequence. Set the prerequisites, test order and necessary media or representative load for the actual equipment.', items: [
        { title: 'Cold checks', text: 'Check direction of rotation, travel, limits, valves, emergency stops, alarms, insulation and fail-safe actions under the conditions specified in the test plan. Record defects and corrective work.' },
        { title: 'Hot trials and any required dry-out', text: 'Confirm that the lining, equipment state and process permit the planned heating test. Define required media and protective conditions; use a no-load trial only where suitable. Check temperature zones, circulation, furnace pressure, mechanisms and alarms under the approved conditions.' },
        { title: 'Loaded verification', text: 'Fix and record the workpiece, loading arrangement, load, process curve, measurement method and result. Empty operation cannot replace loaded acceptance.' },
        { title: 'Handover', text: 'Archive as-built drawings, program and parameter backups, alarm lists, test records, training documents, spare-parts lists and the follow-up inspection plan.' },
      ] },
    ],
    checklist: ['Furnace type and intended process', 'Shutdown reason and last operating conditions', 'Equipment photographs and nameplate', 'Original drawings and programs', 'Repair and maintenance records', 'Relocation and disassembly records', 'Site energy supply and target workpiece', 'Required restart window'],
    faqs: [
      { question: 'Can a furnace that has been idle be switched on directly?', answer: 'First establish the shutdown reason and inspect insulation, lining, seals, energy piping, actuators, safety interlocks and mechanical condition. The verification plan must define the prerequisites, test order and required media; do not assume every furnace can be heated empty.' },
      { question: 'Can the old process parameters be reused after relocation?', answer: 'Use them as a starting point for review. Foundations, alignment, pipes, wiring, circulation, furnace pressure and measurement conditions may have changed and need verification at the new site.' },
      { question: 'How long does restart or relocation take?', answer: 'Plan records recovery, inspection, repairs, installation, cold tests, no-load trials and loaded acceptance separately. Timing depends on equipment condition, scope, site conditions and the available shutdown window.' },
    ], products: [],
  },
  {
    slug: 'rechuli-lu-dian-gai-ran-yure-huishou',
    title: 'Furnace Energy Conversion and Waste Heat Recovery',
    summary: 'Compare energy options under the same production conditions and check whether recovered heat has a practical use.',
    image: repairImage, imageAlt: 'Illustration of engineers reviewing an industrial furnace project',
    answer: 'Start with a measured heat and energy balance for the existing process. Compare electric and fuel heating using the same workpiece, load, process curve and operating hours, then include utility upgrades, exhaust systems, safety, maintenance and downtime. Waste heat recovery also needs a usable heat demand that matches the available heat in temperature and timing.',
    sections: [
      { title: 'Establish a comparable energy baseline', items: [
        { title: 'Measure the complete operating cycle', text: 'Record useful heat delivered to the workpiece, wall and exhaust losses, ventilation, idle operation and loading. Separate installed heating capacity from actual energy consumption over the measurement period.' },
        { title: 'Compare the whole project cost', text: 'Include energy tariffs, electrical or fuel infrastructure, exhaust treatment, equipment changes, maintenance and production downtime. Electricity and fuel prices alone cannot determine the better option.' },
      ] },
      { title: 'Check what each conversion changes', items: [
        { title: 'Electric heating to fuel heating', text: 'Review required heat input, burner arrangement, furnace pressure, exhaust, fuel supply and protective functions. Confirm that the furnace structure, foundations, atmosphere and site utilities suit the proposed conversion.' },
        { title: 'Fuel heating to electric heating', text: 'Assess electrical supply capacity, heating elements and zones, atmosphere, circulation and tariffs. This guide provides assessment questions; it does not present a verified Suneng fuel-to-electric conversion delivery.' },
        { title: 'Dual-fuel operation', text: 'Define fuel isolation, valve-state verification, mode interlocks and the purge and restart requirements in the approved project safety design. An air-side shutoff does not establish isolation of the fuel supply. These functions need documented verification by the responsible engineering team.' },
      ] },
      { title: 'Match waste heat to a useful demand', items: [
        { title: 'Characterize the source', text: 'Measure exhaust temperature, flow and operating hours, including variations. Check dust, corrosion, pressure loss, maintenance access and the protective functions required by the equipment.' },
        { title: 'Identify where the heat can be used', text: 'Assess combustion-air preheating or other process heating against the temperature and timing of the demand. A hot exhaust stream alone does not establish a worthwhile recovery project.' },
        { title: 'A historical design example', text: 'A 2020 electric-to-natural-gas trolley furnace proposal specifies a 13 × 7.4 × 4.3 m effective heating zone, a 700°C rated and maximum operating temperature, 14 temperature-control zones and fourteen 630 kW-class burners. The combined nominal burner capacity is 8,820 kW. These are proposal values, not measured energy consumption or proof of achieved savings.' },
      ] },
      { title: 'Agree how results will be verified', items: [
        { title: 'Factory and site checks', text: 'Use the approved test plan to verify controls, protective functions and interfaces. Factory checks must be followed by site commissioning and loaded verification under the agreed process conditions.' },
        { title: 'Energy and emissions evidence', text: 'Compare before-and-after consumption over equivalent loads, processes and operating periods. Agree the applicable emissions requirements and site measurement arrangements. Savings, payback and emissions performance require project evidence.' },
      ] },
    ],
    checklist: ['Workpiece, load and process curve', 'Measured electricity or fuel use over a complete cycle', 'Operating hours, idle periods and energy tariffs', 'Existing electrical, fuel and exhaust drawings', 'Exhaust temperature, flow and contaminants', 'Potential heat users and their operating times', 'Site constraints, shutdown window and acceptance requirements'],
    faqs: [
      { question: 'Does switching to gas always reduce cost?', answer: 'No. Compare the same production duty and include tariffs, infrastructure, safety systems, exhaust, maintenance and downtime. The answer depends on the project.' },
      { question: 'Does an air-side valve provide fuel isolation?', answer: 'No. The fuel supply, valves, interlocks and verification method must be evaluated as part of the project safety design.' },
      { question: 'Is a high exhaust temperature enough to justify heat recovery?', answer: 'No. Flow, operating hours, contaminants, pressure loss and a suitable heat demand also affect feasibility.' },
    ], products: [],
  },
  {
    slug: 'rechuli-lu-gaizao-fengxian-zhouqi',
    title: 'Furnace Retrofit Risks and Project Scheduling',
    summary: 'Separate the overall project schedule from the production shutdown and resolve uncertain interfaces before work starts.',
    image: repairImage, imageAlt: 'Illustration of engineers reviewing an industrial furnace project',
    answer: 'Establish the old furnace condition and the scope of work before committing to a shutdown date. Plan diagnosis, design, procurement and prefabrication separately from removal, installation, dry-out, commissioning and loaded acceptance. Hidden damage, unclear interfaces and unavailable test conditions can all extend the production interruption.',
    sections: [
      { title: 'Resolve the main uncertainties early', items: [
        { title: 'Drawings and actual condition', text: 'Compare the drawings with the installed furnace and review maintenance and fault records. Identify concealed areas that can only be checked after shutdown, and define how unexpected findings will be handled.' },
        { title: 'Old and new equipment interfaces', text: 'Check the lining, heating, circulation, controls, mechanisms and loading process together. List utility connections, physical interfaces and the party responsible for each.' },
        { title: 'Change and recovery decisions', text: 'Agree how scope changes are assessed and approved. Where returning to the previous configuration is feasible, define the recovery conditions before the changeover.' },
      ] },
      { title: 'Build the schedule in distinct phases', items: [
        { title: 'Diagnosis and design', text: 'Confirm the required outcome, inspection findings, technical scope, drawings and acceptance conditions. Unresolved site conditions should remain visible in the schedule assumptions.' },
        { title: 'Procurement and prefabrication', text: 'Check component lead times, manufacturing, factory checks and work that can be completed before shutdown. Coordinate access and deliveries with the site team.' },
        { title: 'Shutdown and installation', text: 'Allow for removal, lifting, installation, utility connections and work by other contractors. Include an agreed response to concealed defects discovered during removal.' },
        { title: 'Dry-out and production verification', text: 'Plan any material-specific dry-out, cold and hot commissioning, and loaded acceptance. Reserve suitable workpieces, operators and measurement equipment for the tests.' },
      ] },
      { title: 'Measure completion against the agreed outcome', items: [
        { title: 'Comparable acceptance conditions', text: 'Record the baseline load, process, measurement locations and instruments. Test the modified furnace under the agreed conditions so configuration changes can be distinguished from demonstrated results.' },
        { title: 'Production handover', text: 'Resolve deviations and hand over updated drawings, programs, settings, maintenance information and test records. Installation completion alone does not establish readiness for stable production.' },
      ] },
    ],
    checklist: ['Furnace drawings, photographs and fault history', 'Required process and production outcome', 'Confirmed work scope and concealed inspection areas', 'Utility and equipment interfaces with named responsibilities', 'Procurement constraints and available shutdown window', 'Other site work, access and lifting conditions', 'Test workpieces, acceptance conditions and recovery plan'],
    faqs: [
      { question: 'Can a retrofit be completed without stopping production?', answer: 'Site diagnosis, prefabrication and staged changeovers may reduce disruption where feasible. Zero downtime cannot be promised before the scope, interfaces and operating conditions are established.' },
      { question: 'How many days will the furnace be out of service?', answer: 'Estimate removal, installation, interfaces, concealed work, dry-out and loaded verification for the actual project. An undefined work scope cannot support a reliable fixed shutdown duration.' },
      { question: 'Is the shutdown duration the same as the total project lead time?', answer: 'No. Design, procurement, manufacture and prefabrication can precede the shutdown. The overall schedule must identify these phases separately.' },
    ], products: [],
  },
  {
    slug: 'rechuli-lu-changjia',
    title: 'Choosing a Heat Treatment Furnace Manufacturer',
    summary: 'Evaluate process understanding, manufacturing capability, proposal detail and delivery responsibilities against your actual workpiece.',
    image: '/images/about/about_img_hero_factory_01.png', imageAlt: 'Suneng industrial furnace manufacturing facility',
    answer: 'Begin with the material, workpiece dimensions and weight, treatment, loading and target output. Compare suppliers on their ability to turn those inputs into a defined furnace configuration, test plan and delivery scope. Review evidence for similar equipment and distinguish a proposed configuration from a delivered and accepted project.',
    sections: [
      { title: 'Choose the furnace around the process', items: [
        { title: 'Workpiece and treatment', text: 'Specify the material grade, dimensions, weight, required annealing, tempering, quench heating, solution treatment or aging, and the required quality and surface condition. Treatment names alone do not define the process.' },
        { title: 'Loading and production pattern', text: 'Compare batch and continuous equipment using loading constraints, process changes, target output and available space. Suneng offers trolley, chamber, pit, mesh belt, roller hearth, pusher and bell furnaces, as well as heat treatment lines, subject to project requirements.' },
        { title: 'Utilities and control requirements', text: 'Confirm the operating and maximum temperature, atmosphere, energy source, temperature uniformity, control functions and site utilities. Agree how the required performance will be tested.' },
      ] },
      { title: 'Ask for evidence you can evaluate', items: [
        { title: 'Manufacturing and commissioning', text: 'Review the facilities, fabrication, assembly and testing capabilities relevant to the proposed equipment. Ask how installation, trial operation and support will be delivered for your site.' },
        { title: 'Similar project experience', text: 'Look for comparable furnace types, materials and processes. Confirm whether each example is a design proposal, supplied equipment or an accepted production result, and what evidence supports that status.' },
        { title: 'Technical detail and service', text: 'Check the configuration, supply exclusions, acceptance conditions, documentation, maintenance support and spare parts. A low headline price or a photograph cannot establish that the scope matches your requirements.' },
      ] },
      { title: 'Define supply and delivery responsibilities', items: [
        { title: 'From inputs to an agreed proposal', text: 'Confirm the furnace direction, technical parameters, configuration and quotation scope before manufacture. Agree factory checks, site installation, trial operation and handover in the contract.' },
        { title: 'Equipment scope', text: 'Suneng participates as an industrial furnace equipment supplier or equipment subcontractor. Civil works, pressure vessels and other work requiring specific qualifications must be assigned to appropriately qualified parties; the equipment scope does not constitute general contracting.' },
        { title: 'Delivery timing', text: 'Lead time depends on furnace type, size, temperature, controls, manufacturing complexity and project scheduling. Retrofit work also depends on the existing furnace and shutdown window.' },
      ] },
    ],
    checklist: ['Material grade, workpiece drawings and dimensions', 'Individual weight, load per batch and required output', 'Treatment, temperature curve and atmosphere', 'Quality, surface and temperature-uniformity requirements', 'Energy source, utilities and workshop layout', 'Controls, records and acceptance requirements', 'Supply responsibilities and required delivery window'],
    faqs: [
      { question: 'Can a furnace be priced from its model name alone?', answer: 'The name is only a starting point. Working dimensions, temperature, load, process, heating, uniformity and controls affect the configuration and price.' },
      { question: 'What matters most when comparing manufacturers?', answer: 'Check process understanding, relevant manufacturing capability, comparable project evidence, technical scope, acceptance conditions and after-sales responsibilities.' },
      { question: 'Can Suneng assess an existing furnace for retrofit or overhaul?', answer: 'Yes. The assessment can cover the lining, heating, combustion, controls, mechanical systems and restart or relocation needs. Suitability depends on the existing condition, required process and site constraints.' },
    ], products: [],
  },
  {
    slug: 'jiangsu-gongye-lu-changjia',
    title: 'Planning an Industrial Furnace Project in Jiangsu',
    summary: 'Coordinate equipment supply, transport, site access, installation and commissioning for projects in Jiangsu and East China.',
    image: '/images/about/about_img_hero_factory_01.png', imageAlt: 'Suneng industrial furnace manufacturing facility in Jiangsu',
    answer: 'Suneng is based in Taizhou, Jiangsu. For a new furnace, retrofit or overhaul, confirm the workpiece and process together with the site location, layout, utility supply and installation conditions. Define who will handle transport, unloading, lifting, foundations, utility connections and commissioning before agreeing the delivery plan.',
    sections: [
      { title: 'Establish the site conditions', items: [
        { title: 'Location, access and equipment movement', text: 'Provide the delivery address, access route, entrances and lifting conditions. Use these details to assess complete or sectional transport, unloading and movement to the installation position.' },
        { title: 'Layout and utilities', text: 'Share the workshop layout, equipment photographs, available space and electricity, fuel and other utility information. Confirm foundations and connection points against the proposed equipment.' },
        { title: 'Site survey and shutdown planning', text: 'Use the available drawings and photographs to identify what needs an on-site survey. For an existing furnace, include its condition, production schedule and the work that must take place during shutdown.' },
      ] },
      { title: 'Assign responsibilities before mobilization', items: [
        { title: 'Supply, transport and site preparation', text: 'List equipment supply, packing, transport, unloading, lifting, foundations and utility connections separately, with a responsible party and completion conditions for each.' },
        { title: 'Installation and commissioning', text: 'Agree access, work coordination, site personnel, trial operation and suitable test workpieces. Schedule factory checks and site acceptance as separate activities within the contract scope.' },
        { title: 'Equipment and specialist work', text: 'Suneng handles the industrial furnace equipment scope agreed for the project. Civil works, pressure vessels and other work requiring specific qualifications are assigned to appropriately qualified parties.' },
      ] },
      { title: 'Agree support for the actual location', items: [
        { title: 'Jiangsu and East China projects', text: 'Discuss implementation and service arrangements using the equipment scale, site location, delivery scope and installation requirements. Work outside the region is assessed according to the project.' },
        { title: 'Timing, personnel and cost', text: 'Confirm the support method, personnel, response arrangements and charges in the project agreement. Proximity alone does not establish a fixed response time or a universal service commitment.' },
        { title: 'Handover and ongoing maintenance', text: 'Include commissioning records, operating documentation, maintenance information and spare-parts arrangements in the handover scope. Identify the site contact and how technical questions will be handled.' },
      ] },
    ],
    checklist: ['Site address and project contact', 'Workpiece, process, load and target output', 'New furnace, retrofit or overhaul scope', 'Layout, equipment photographs and access route', 'Foundations, lifting and utility conditions', 'Transport, unloading and installation responsibilities', 'Shutdown window, test workpieces and support requirements'],
    faqs: [
      { question: 'Where is Suneng based?', answer: 'Suneng is based in Taizhou, Jiangsu, China. Share the project location and requirements to discuss delivery and site coordination.' },
      { question: 'Can projects outside Jiangsu be considered?', answer: 'Yes. Delivery, installation, commissioning and support arrangements are assessed according to the equipment, location and agreed scope.' },
      { question: 'How is site installation scheduled?', answer: 'Confirm equipment dimensions, foundations, electricity and fuel supply, lifting, access, personnel and contract responsibilities first. The schedule then follows the project conditions and readiness of the site.' },
    ], products: [],
  },
];

export function solutionAlternates(slug?: string) {
  const path = `/solutions${slug ? `/${slug}` : ''}`;
  return { 'zh-CN': `/zh${path}`, 'en-US': `/en${path}`, 'x-default': `/zh${path}` };
}

export function getEnglishSolution(slug: string) {
  const solution = englishSolutions.find((item) => item.slug === slug);
  if (!solution) throw new Error(`Missing English solution: ${slug}`);
  return solution;
}
