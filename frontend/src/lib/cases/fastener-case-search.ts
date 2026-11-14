import { FASTENER_CASE_PATH, FASTENER_CASE_TITLE } from './fastener-case-entry';
import { FASTENER_CASE_DESCRIPTION, FASTENER_CASE_IMAGE_ALT, FASTENER_CASE_QUESTIONS } from './fastener-case-content';
import type { CaseSearchContent } from './search-metadata';

export const fastenerCaseSearchContent: CaseSearchContent = {
  title: FASTENER_CASE_TITLE, description: FASTENER_CASE_DESCRIPTION,
  path: FASTENER_CASE_PATH, locale: 'zh',
  image: '/images/cases/fastener-mesh-belt/line-panorama.webp', imageAlt: FASTENER_CASE_IMAGE_ALT,
  languages: { 'zh-CN': FASTENER_CASE_PATH, 'x-default': FASTENER_CASE_PATH },
  questions: FASTENER_CASE_QUESTIONS,
};
