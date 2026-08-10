import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const backendRoot = process.cwd();
const repoRoot = resolve(backendRoot, '..');

function read(relativePath: string) {
  return readFileSync(resolve(repoRoot, relativePath), 'utf8');
}

describe('Shuju service security boundary', () => {
  it('has a GET-only controller and a Prisma read-only repository', () => {
    const controller = read('backend/src/modules/shuju-service/shuju-news-read.controller.ts');
    const service = read('backend/src/modules/shuju-service/shuju-news-read.service.ts');

    expect(controller).toContain("@Controller('svc/news')");
    expect(controller).toContain("@Get('read')");
    expect(controller).toContain("@Get('categories')");
    expect(controller).toContain("event: 'shuju_service_news_read'");
    expect(controller).toContain('requestId: request.shujuService?.jti');
    expect(controller).not.toMatch(/@(Post|Patch|Put|Delete)\b/);
    expect(service).not.toMatch(/prisma\.news\.(create|update|updateMany|delete|upsert)\b/);
    expect(service).not.toContain('NewsService');
    expect(service).not.toContain('AdminUser');
  });

  it('uses a separate secret and never falls back to the administrator JWT', () => {
    const configuration = read('backend/src/config/configuration.ts');
    const compose = read('docker-compose.prod.yml');

    expect(configuration).toContain('SHUJU_SERVICE_JWT_SECRET must not reuse JWT_SECRET');
    expect(configuration).toContain("shujuServiceSubject: 'shuju-engine'");
    expect(configuration).toContain("shujuServiceAudience: 'corp-site-news-read'");
    expect(compose).toContain('SHUJU_SERVICE_ENABLED: ${SHUJU_SERVICE_ENABLED:-false}');
    expect(compose).toContain('SHUJU_SERVICE_JWT_SECRET: ${SHUJU_SERVICE_JWT_SECRET:-}');
    expect(configuration).toContain(
      'SHUJU_NEWS_PUBLISH_JWT_SECRET must use an independent trust domain',
    );
    expect(compose).toContain('SHUJU_NEWS_PUBLISH_ENABLED: ${SHUJU_NEWS_PUBLISH_ENABLED:-false}');
    expect(compose).toContain('SHUJU_NEWS_PUBLISH_JWT_SECRET: ${SHUJU_NEWS_PUBLISH_JWT_SECRET:-}');
  });

  it('exposes only narrow POST publish operations and no delete route', () => {
    const controller = read('backend/src/modules/shuju-service/shuju-news-publish.controller.ts');
    const service = read('backend/src/modules/shuju-service/shuju-news-publish.service.ts');

    expect(controller).toContain("@Post('media')");
    expect(controller).toContain("@Post('publish')");
    expect(controller).toContain("@Post('offline')");
    expect(controller).not.toMatch(/@(Patch|Put|Delete)\b/);
    expect(service).not.toContain('AdminUser');
    expect(service).not.toMatch(/\.news\.delete\b/);
    expect(service).toContain('Idempotency key was already used for another payload');
  });

  it('exposes inquiry PII through an independent GET-only cutover service', () => {
    const controller = read('backend/src/modules/shuju-service/shuju-inquiry-read.controller.ts');
    const service = read('backend/src/modules/shuju-service/shuju-inquiry-read.service.ts');
    const configuration = read('backend/src/config/configuration.ts');
    const compose = read('docker-compose.prod.yml');

    expect(controller).toContain("@Controller('svc/inquiries')");
    expect(controller).toContain("@Get('head')");
    expect(controller).toContain("@Get('read')");
    expect(controller).not.toMatch(/@(Post|Patch|Put|Delete)\b/);
    expect(service).toContain('id: { gt: effectiveAfterId }');
    expect(service).not.toMatch(/customRequirement\.(create|update|delete|upsert)\b/);
    expect(configuration).toContain(
      'SHUJU_INQUIRY_READ_JWT_SECRET must use an independent trust domain',
    );
    expect(configuration).toContain(
      'SHUJU_INQUIRY_READ_MIN_ID must be between 1 and 2147483647 when inquiry reading is enabled',
    );
    expect(configuration).toContain("shujuInquiryReadAudience: 'corp-site-inquiries-read'");
    expect(compose).toContain('SHUJU_INQUIRY_READ_ENABLED: ${SHUJU_INQUIRY_READ_ENABLED:-false}');
    expect(compose).toContain('SHUJU_INQUIRY_READ_MIN_ID: ${SHUJU_INQUIRY_READ_MIN_ID:-0}');
  });

  it('blocks service routes on both production public hosts and local nginx', () => {
    const productionNginx = read('nginx.prod.conf.template');
    const localNginx = read('nginx.conf');
    const productionBlocks = productionNginx.match(
      /location \^~ \/api\/svc\/ \{\s*return 404;\s*\}/g,
    );

    expect(productionBlocks).toHaveLength(2);
    expect(localNginx).toMatch(/location \^~ \/api\/svc\/ \{\s*return 404;\s*\}/);
  });

  it('publishes Shuju only through the protected desktop edge route', () => {
    const productionNginx = read('nginx.prod.conf.template');
    const logrotate = read('ops/logrotate/corp-site-nginx');
    const deploy = read('deploy.sh');
    const shujuSection = productionNginx
      .split('# 数炬引擎：桌面端工作台')[1]
      .split('# 智能工厂系统')[0];

    expect(productionNginx.match(/server_name shuju\.jssngyl\.cn;/g)).toHaveLength(2);
    expect(productionNginx).toContain(
      'limit_req_zone $binary_remote_addr zone=shuju_login:10m rate=5r/m;',
    );
    expect(productionNginx).toContain('resolver 127.0.0.11 valid=10s ipv6=off;');
    expect(productionNginx).toContain('server shuju:18321 resolve;');
    expect(productionNginx).toContain('limit_req zone=shuju_login burst=3 nodelay;');
    expect(productionNginx).toContain('limit_req_status 429;');
    expect(productionNginx).toMatch(/location \^~ \/api\/internal\/ \{\s*return 404;\s*\}/);
    expect(productionNginx).toMatch(/location = \/api\/ready \{\s*return 404;\s*\}/);
    expect(productionNginx).toContain('proxy_set_header X-Request-ID $request_id;');
    expect(shujuSection).toContain('proxy_set_header X-Forwarded-For $remote_addr;');
    expect(shujuSection).not.toContain('$proxy_add_x_forwarded_for');
    expect(productionNginx).toContain('error_log /var/log/nginx/shuju.error.log warn;');
    expect(productionNginx).toContain('add_header Content-Security-Policy');
    expect(productionNginx).toContain('add_header Permissions-Policy');
    expect(productionNginx).toContain('add_header Cache-Control "no-store" always;');
    expect(logrotate).toContain('/data/nginx-logs/*.log');
    expect(deploy).toContain('missing the protected Shuju route');
    expect(deploy).toContain('SHUJU_EXPECTED_PUBLIC_IP is missing');
    expect(deploy).toContain('getent is required for Shuju DNS verification');
    expect(deploy).toContain('Shuju DNS does not match SHUJU_EXPECTED_PUBLIC_IP');
    expect(deploy).toContain('openssl x509 -in "$shuju_edge_cert" -noout -checkend 604800');
    expect(deploy).toContain('grep -Fxq "DNS:$shuju_public_domain"');
    expect(deploy).toContain('shared edge certificate is not ready for Shuju');
  });
});
