import { ConflictException } from '@nestjs/common';

export type NewsPublicationText = {
  titleZh?: string | null;
  titleEn?: string | null;
  summaryZh?: string | null;
  summaryEn?: string | null;
  contentZh?: string | null;
  contentEn?: string | null;
  seoTitleZh?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionZh?: string | null;
  seoDescriptionEn?: string | null;
  seoKeywordsZh?: string | null;
  seoKeywordsEn?: string | null;
};

type NewsPublicationRule = {
  code: string;
  test: (text: string) => boolean;
};

const CLAUSE_BREAK = '[^。；;！!？?\\n]';
const NEGATED_CLAIM_PREFIX =
  /(?:(?:不|未|无|非|没有|并未|尚未|从未|不曾|未曾|并不|并无)|(?:does?\s+not|do\s+not|did\s+not|has\s+not|have\s+not|is\s+not|are\s+not|not|no|non[-\s]?|without))[^。；;！!？?\n]{0,12}$/i;

function regexRule(code: string, pattern: RegExp): NewsPublicationRule {
  return { code, test: (text) => pattern.test(text) };
}

function affirmativeClaimRule(code: string, pattern: RegExp): NewsPublicationRule {
  return {
    code,
    test: (text) => {
      const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
      const matcher = new RegExp(pattern.source, flags);

      for (const match of text.matchAll(matcher)) {
        const index = match.index ?? 0;
        const prefix = text.slice(Math.max(0, index - 12), index);
        if (!NEGATED_CLAIM_PREFIX.test(prefix)) return true;
      }

      return false;
    },
  };
}

// This list mirrors the company fact-card red lines. It deliberately does not
// block boundary statements such as "不承接 EPC" or "合同金额不公开".
// A blocked fact can be re-enabled only after its evidence is verified and the
// fact card plus this policy are updated together.
export const NEWS_PUBLICATION_REDLINE_RULES: readonly NewsPublicationRule[] = [
  regexRule('unverified_iso_14001', /(?:ISO\s*)?14001/i),
  regexRule('unverified_iso_45001', /(?:ISO\s*)?45001/i),
  regexRule('unverified_three_system_certification', /三体系认证/i),
  regexRule(
    'unverified_employee_count',
    /(?:(?:员工人数|员工总数|在职人数|职工人数|职工总数)[^。；;！!？?\n<]{0,8}\d+(?:\.\d+)?\s*(?:\+|余|多)?\s*(?:人|名)?|(?:公司|苏能|本公司|我司)[^。；;！!？?\n<]{0,8}(?:现有|拥有|共有|配备|雇有)[^。；;！!？?\n<]{0,8}(?:(?:员工|在职人员|职工)[^。；;！!？?\n<]{0,4})?\d+(?:\.\d+)?\s*(?:(?:\+|余|多)\s*(?:员工|职工)|(?:\+|余|多)?\s*(?:人|名)(?:员工|职工)?)|(?:公司|苏能|本公司|我司)[^。；;！!？?\n<]{0,4}(?:员工|在职人员|职工)[^。；;！!？?\n<]{0,4}\d+(?:\.\d+)?\s*(?:\+|余|多)?\s*(?:人|名)|\d+(?:\.\d+)?\s*(?:(?:\+|余|多)\s*(?:人|名)?|(?:人|名))[^。；;！!？?\n<]{0,4}(?:员工|在职人员|职工)|(?:company|suneng|we|our\s+company)[^.;!?。；！？，,\n<]{0,12}(?:has|have|employs?|with)[^.;!?。；！？，,\n<]{0,8}(?:over|more\s+than|about|approximately)?\s*\d+(?:\.\d+)?\s*(?:\+|plus)?\s*(?:employees?|staff|workers?)|\d+(?:\.\d+)?\s*(?:\+|plus|over|more\s+than)?\s*(?:employees?|staff|workers?))/i,
  ),
  regexRule('unverified_invention_patent_classification', /发明专利/i),
  regexRule(
    'unverified_contract_amount',
    /(?:(?:合同金额|合同额|合同总额|项目合同额|项目金额|签约金额)[^。；;！!？?\n<]{0,20}(?:人民币|[\uffe5¥]|\d+(?:\.\d+)?\s*(?:亿元|亿|万元|万|元))|(?:人民币|[\uffe5¥]|\d+(?:\.\d+)?\s*(?:亿元|亿|万元|万|元))[^。；;！!？?\n<]{0,20}(?:合同金额|合同额|合同总额|项目合同额|项目金额|签约金额))/i,
  ),
  regexRule(
    'unverified_heat_efficiency_range',
    /(?:(?:35\s*[-–—~～至]\s*40)\s*[%％]?[^。；\n<]{0,12}热效率|热效率[^。；\n<]{0,12}(?:35\s*[-–—~～至]\s*40)\s*[%％]?)/i,
  ),
  regexRule('unverified_work_safety_standardization', /安全生产标准化/i),
  affirmativeClaimRule(
    'unverified_aaa_credit',
    /(?:AAA\s*(?:级|等级)?[^。；;！!？?\n]{0,12}(?:信用|信誉|credit(?:\s+rating)?)|(?:信用|信誉|credit(?:\s+rating)?)[^。；;！!？?\n]{0,12}AAA\s*(?:级|等级)?)/i,
  ),
  affirmativeClaimRule(
    'unverified_special_process_certification',
    new RegExp(
      `(?:(?:通过|获得|取得|持有|具备|是|为|系|拥有|属于)${CLAUSE_BREAK}{0,12}(?:AMS\\s*2750|Nadcap|CQI\\s*[-－]?\\s*9|军工(?:产品)?(?:资质|认证)|军品资质|航空航天特殊工艺认证)|(?:AMS\\s*2750|Nadcap|CQI\\s*[-－]?\\s*9|军工(?:产品)?资质|军品资质)${CLAUSE_BREAK}{0,12}(?:认证企业|认证供应商|资质单位|认证单位|持证企业)|(?:holds?|has|possesses?|certified(?:\\s+to)?|accredited(?:\\s+for)?)${CLAUSE_BREAK}{0,20}(?:AMS\\s*2750|Nadcap|CQI\\s*[-－]?\\s*9|military(?:-product)?\\s+(?:qualification|certification)|aerospace\\s+special-process\\s+certification)|(?:AMS\\s*2750|Nadcap|CQI\\s*[-－]?\\s*9)${CLAUSE_BREAK}{0,12}(?:certified|accredited|certification|accreditation|qualification))`,
      'i',
    ),
  ),
  affirmativeClaimRule(
    'unverified_epc_scope',
    new RegExp(
      `(?:(?:承接|提供|开展|具备|作为|担任|是|为|系|拥有|属于)${CLAUSE_BREAK}{0,12}(?:EPC|工程总承包)|(?:EPC|工程总承包)${CLAUSE_BREAK}{0,12}(?:总承包单位|总承包商|承包单位|资质单位|服务商)|(?:undertakes?|provides?|offers?|acts?\\s+as|serves?\\s+as)${CLAUSE_BREAK}{0,20}(?:EPC|engineering,?\\s+procurement\\s+and\\s+construction)|(?:EPC|engineering,?\\s+procurement\\s+and\\s+construction)${CLAUSE_BREAK}{0,12}(?:contractor|services?|capability))`,
      'i',
    ),
  ),
  affirmativeClaimRule(
    'unverified_heat_treatment_processing_scope',
    new RegExp(
      `(?:(?:承接|提供|开展|具备|从事|是|为|系|拥有|属于)${CLAUSE_BREAK}{0,14}(?:来料加工|按件(?:收费|计费)?(?:的)?热处理加工|热处理加工服务)|(?:热处理加工服务|来料加工)(?:(?!不|未|无|非)${CLAUSE_BREAK}){0,12}(?:按件收费|按件计费|欢迎咨询)|(?:provides?|offers?|undertakes?|performs?|handles?)${CLAUSE_BREAK}{0,20}(?:toll\\s+heat\\s+treatment|contract\\s+heat\\s+treatment|heat-treatment\\s+processing\\s+services?))`,
      'i',
    ),
  ),
];

const PUBLICATION_TEXT_FIELDS: readonly (keyof NewsPublicationText)[] = [
  'titleZh',
  'titleEn',
  'summaryZh',
  'summaryEn',
  'contentZh',
  'contentEn',
  'seoTitleZh',
  'seoTitleEn',
  'seoDescriptionZh',
  'seoDescriptionEn',
  'seoKeywordsZh',
  'seoKeywordsEn',
];

export function findNewsPublicationPolicyViolations(input: NewsPublicationText): string[] {
  const text = PUBLICATION_TEXT_FIELDS.map((field) => input[field] ?? '').join('\n');
  return NEWS_PUBLICATION_REDLINE_RULES.filter((rule) => rule.test(text)).map((rule) => rule.code);
}

export function assertNewsPublicationPolicy(input: NewsPublicationText): void {
  const violations = findNewsPublicationPolicyViolations(input);
  if (!violations.length) return;

  throw new ConflictException(`News publication blocked by fact policy: ${violations.join(', ')}`);
}
