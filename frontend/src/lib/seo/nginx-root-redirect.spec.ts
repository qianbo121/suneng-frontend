import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const nginxTemplate = readFileSync(
  new URL('../../../../nginx.prod.conf.template', import.meta.url),
  'utf8',
);
const deployScript = readFileSync(new URL('../../../../deploy.sh', import.meta.url), 'utf8');

describe('public root redirect governance', () => {
  it('keeps exactly one deterministic permanent redirect from www root to Chinese home', () => {
    const matches = nginxTemplate.match(
      /location = \/ \{\s*return 308 https:\/\/\$DOMAIN\/zh;\s*\}/g,
    );

    expect(matches).toHaveLength(1);
  });

  it('preserves the independently deployed Chengwen route', () => {
    expect(nginxTemplate.match(/server_name chengwen\.jssngyl\.cn;/g)).toHaveLength(2);
    expect(nginxTemplate).toContain('upstream chengwen_upstream');
    expect(nginxTemplate).toContain('server chengwen-web:8080;');
    expect(nginxTemplate).toContain('proxy_pass http://chengwen_upstream;');
  });

  it('verifies Chengwen over its real public HTTP route after deployment', () => {
    expect(deployScript).toContain(
      "curl -sS -o /dev/null -w '%{http_code}' https://chengwen.jssngyl.cn/login",
    );
    expect(deployScript).toContain('if [ "$chengwen_login_status" = "200" ]');
    expect(deployScript).toContain('Health check failed: Chengwen route');
  });
});
