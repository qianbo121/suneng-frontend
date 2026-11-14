import { FASTENER_CASE_PATH, FASTENER_CASE_TITLE } from './fastener-case-entry';
import { FASTENER_CASE_DESCRIPTION, FASTENER_CASE_QUESTIONS } from './fastener-case-content';
import type { CaseSearchContent } from './search-metadata';
import record from '../../../content/cases/fastener-mesh-belt-quenching-carburizing.json';

export const fastenerCaseSearchContent: CaseSearchContent = {
  title: FASTENER_CASE_TITLE, description: FASTENER_CASE_DESCRIPTION,
  path: FASTENER_CASE_PATH, locale: 'zh',
  datePublished: record.datePublished,
  image: record.cover.src, imageAlt: record.cover.alt,
  languages: { 'zh-CN': FASTENER_CASE_PATH, 'x-default': FASTENER_CASE_PATH },
  questions: FASTENER_CASE_QUESTIONS,
};
