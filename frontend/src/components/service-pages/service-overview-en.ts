import { servicePages } from './service-content';

export const serviceOverviewEn = {
  ...servicePages.overview,
  path: '/en/service',
  title: 'Industrial Furnace Retrofit & Engineering Services',
  breadcrumb: 'Service & Retrofit',
  description: 'Repair and retrofit, relocation and restart, installation and after-sales support: find the service that matches your equipment condition.',
  note: 'Start with equipment photos and a description of the issue. Further documents can follow.',
  secondary: ['View Product Center', '/en/products'],
  faqTitle: 'Before you contact us',
  faqs: [
    { question: 'Can you assess equipment made by other manufacturers?', answer: 'Some third-party equipment can be assessed after reviewing documentation, controls and spare-parts availability.' },
    { question: 'Can I start with photos only?', answer: 'Send an overall equipment photo, the nameplate and a description of the issue. Further information can follow.' },
    { question: 'Should an old furnace be repaired, upgraded or replaced?', answer: 'Assess the structure, safety systems, process requirements and investment together.' },
    { question: 'Can you quote the cost and schedule immediately?', answer: 'First confirm equipment condition, work scope, spare parts and site conditions.' },
  ],
  contactTitle: 'Share the equipment condition to identify the next step',
  contactText: 'Start with overall photos, the nameplate and a description of the issue.',
};
export const serviceEntriesEn = [
  { title: 'Repair & retrofit', text: 'Aging refractory, heating problems or a need to improve equipment performance.', scope: 'Refractory & insulation / Heating / Electrical controls / Mechanical systems', action: 'Repair & retrofit (Chinese)' },
  { title: 'Relocation & restart', text: 'Moving equipment to another factory or returning it to production after a shutdown.', scope: 'Condition checks / Relocation & reinstallation / Trial operation / Restart verification', action: 'Relocation & restart (Chinese)' },
  { title: 'Installation & after-sales', text: 'Installing and handing over new equipment, or arranging repairs and parts for equipment in use.', scope: 'Installation coordination / Commissioning / Operator training / Repair support', action: 'Installation & support (Chinese)' },
  { title: 'Selection & retrofit guide', text: 'Choosing a furnace, or deciding whether existing equipment needs repair, retrofit or replacement.', scope: 'Parts & process / Furnace selection / Retrofit assessment / Inquiry information', action: 'Selection guide (Chinese)' },
];
export const overviewStepsEn = [
  { title: 'Initial review', text: 'Understand the equipment, issue and objectives.' },
  { title: 'Inspection & proposal', text: 'Check equipment, site and safety conditions, then define the work scope.' },
  { title: 'Implementation', text: 'Arrange repair, retrofit or installation to the agreed plan.' },
  { title: 'Verification & handover', text: 'Complete safety checks, applicable trials and performance verification within the service scope, and hand over the records.' },
];
export const consultationItemsEn = [
  { title: 'Overall equipment photos', text: 'Show the furnace, surrounding equipment and site conditions.' },
  { title: 'Equipment nameplate', text: 'Capture the model, manufacturing information and main parameters clearly.' },
  { title: 'Issue & objectives', text: 'Describe the fault or the production requirements you want to achieve.' },
];
