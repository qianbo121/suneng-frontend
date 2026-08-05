export type TrafficSource = {
  sourceType: '直接访问' | '外部链接' | 'AI引流';
  sourceDetail?: string;
};

const AI_SOURCE_RULES: Array<{ label: string; domains: string[]; aliases: string[] }> = [
  {
    label: '豆包',
    domains: ['doubao.com'],
    aliases: ['doubao', '豆包'],
  },
  {
    label: 'Kimi',
    domains: ['kimi.com', 'kimi.moonshot.cn'],
    aliases: ['kimi', 'moonshot', '月之暗面'],
  },
  {
    label: '腾讯元宝',
    domains: ['yuanbao.tencent.com'],
    aliases: ['yuanbao', '腾讯元宝', '元宝'],
  },
  {
    label: 'DeepSeek',
    domains: ['deepseek.com'],
    aliases: ['deepseek'],
  },
  {
    label: '通义千问',
    domains: ['tongyi.aliyun.com', 'qianwen.com', 'qwen.ai'],
    aliases: ['tongyi', 'qianwen', 'qwen', '通义', '千问'],
  },
  {
    label: '秘塔AI',
    domains: ['metaso.cn'],
    aliases: ['metaso', '秘塔'],
  },
  {
    label: 'ChatGPT',
    domains: ['chatgpt.com', 'chat.openai.com'],
    aliases: ['chatgpt', 'openai'],
  },
  {
    label: 'Perplexity',
    domains: ['perplexity.ai'],
    aliases: ['perplexity'],
  },
  {
    label: '文心一言',
    domains: ['yiyan.baidu.com'],
    aliases: ['yiyan', 'ernie', '文心'],
  },
  {
    label: '夸克AI',
    domains: ['quark.cn'],
    aliases: ['quark', '夸克'],
  },
];

function normalizedHost(value: string) {
  if (!value) return '';
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function matchesDomain(host: string, domain: string) {
  return host === domain || host.endsWith(`.${domain}`);
}

function aiSourceFromAlias(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return AI_SOURCE_RULES.find((rule) =>
    rule.aliases.some((alias) => normalized === alias.toLowerCase() || normalized.includes(alias.toLowerCase())),
  )?.label;
}

export function classifyTrafficSource(referrer: string, utmSource = ''): TrafficSource {
  const aiFromUtm = aiSourceFromAlias(utmSource);
  if (aiFromUtm) return { sourceType: 'AI引流', sourceDetail: aiFromUtm };

  const host = normalizedHost(referrer);
  if (!host) return { sourceType: '直接访问' };

  const aiFromReferrer = AI_SOURCE_RULES.find((rule) =>
    rule.domains.some((domain) => matchesDomain(host, domain)),
  )?.label;

  if (aiFromReferrer) return { sourceType: 'AI引流', sourceDetail: aiFromReferrer };
  return { sourceType: '外部链接', sourceDetail: host };
}
