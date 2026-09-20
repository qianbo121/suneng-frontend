import descriptions from './english-search-descriptions.json';

// Preserve the reviewed title implementation on main and every later CMS edit.
// These descriptions are search-only: article headings and bodies are unchanged.
export function englishNewsSearchDescription(title: string, description: string) {
  const copy = Object.hasOwn(descriptions, title)
    ? (descriptions as Record<string, { sourceDescription: string; description: string }>)[title]
    : undefined;
  return copy?.sourceDescription === description ? copy.description : description;
}
