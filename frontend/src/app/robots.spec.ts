import { describe, expect, it } from 'vitest';

import buildRobots from '@/app/robots';

describe('robots AI crawler access', () => {
  it('explicitly allows search and answer crawlers used by major AI platforms', () => {
    const result = buildRobots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const allowedAgents = new Set(
      rules
        .filter((rule) => rule.allow === '/')
        .flatMap((rule) => (Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent])),
    );

    const requiredAgents = [
      'OAI-SearchBot',
      'ChatGPT-User',
      'Claude-SearchBot',
      'Claude-User',
      'PerplexityBot',
      'Perplexity-User',
      'Bytespider',
    ];

    for (const agent of requiredAgents) {
      expect(allowedAgents.has(agent), agent).toBe(true);
    }
  });
});
