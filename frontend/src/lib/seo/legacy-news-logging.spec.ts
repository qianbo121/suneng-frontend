import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../../../../', import.meta.url);
const config = readFileSync(new URL('nginx.prod.conf.template', root), 'utf8');
const dedicated = '    access_log /var/log/nginx/legacy-news-detail.access.json legacy_news_detail_json if=$log_legacy_news_detail;';

describe('old news request evidence', () => {
  it('adds evidence on all three public origins while retaining their existing access logs', () => {
    expect(config.split(dedicated)).toHaveLength(4);
    for (const host of ['jssngyl.cn ${DOMAIN}', 'jssngyl.cn']) {
      expect(config).toContain('    server_name ' + host + ';\n'
        + '    access_log /var/log/nginx/redirect.access.json analytics_json_site;\n' + dedicated);
    }
    expect(config).toContain('    access_log /var/log/nginx/www.access.json analytics_json_site;\n'
      + '    access_log /var/log/nginx/baidu-public-list.access.json baidu_public_list_json if=$log_baidu_public_list;\n'
      + dedicated);
  });

  it('records a bounded article identifier and correlation data, excluding arbitrary query data', () => {
    const format = config.match(/log_format legacy_news_detail_json escape=json\s+([\s\S]*?);/)?.[1];
    expect(format).toBeDefined();
    expect(format).not.toMatch(/\$(?:request_uri|args|query_string|request_body|http_cookie|http_authorization|http_referer)\b/);
    for (const field of ['time', 'request_id', 'scheme', 'host', 'remote_addr', 'method', 'path',
      'id_present', 'article_id', 'status', 'mapped_path', 'location', 'crawler_family', 'monitoring_probe', 'user_agent']) {
      expect(format).toContain('"' + field + '":');
    }
    expect(config).toContain('map $arg_id $legacy_news_article_id {\n'
      + '    default "[redacted]";\n    "" "";\n    "~^[A-Za-z0-9%._~-]{0,64}$" $arg_id;\n  }');
    expect(config).toContain('map $args $legacy_news_id_present {\n'
      + '    default 0;\n    ~*(^|&)id= 1;\n  }');
  });

  it('limits the extra log to reads of the exact old detail path and keeps daily rotation', () => {
    expect(config).toContain('map "$request_method:$uri" $log_legacy_news_detail {\n'
      + '    default 0;\n    ~^(GET|HEAD):/news/shownews\\.php$ 1;\n  }');
    const rotation = readFileSync(new URL('ops/logrotate/corp-site-nginx', root), 'utf8');
    expect(rotation).toContain('/data/nginx-logs/*.json');
    expect(rotation).toContain('daily');
    expect(rotation).toContain('compress');
  });
});
