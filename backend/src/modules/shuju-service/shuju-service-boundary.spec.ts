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

  it('blocks service routes on both production public hosts and local nginx', () => {
    const productionNginx = read('nginx.prod.conf.template');
    const localNginx = read('nginx.conf');
    const productionBlocks = productionNginx.match(
      /location \^~ \/api\/svc\/ \{\s*return 404;\s*\}/g,
    );

    expect(productionBlocks).toHaveLength(2);
    expect(localNginx).toMatch(/location \^~ \/api\/svc\/ \{\s*return 404;\s*\}/);
  });
});
