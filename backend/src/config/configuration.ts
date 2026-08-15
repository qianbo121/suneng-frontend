const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';

export function parseStrictBoolean(name: string, rawValue: string | undefined): boolean {
  const normalized = (rawValue ?? 'false').trim().toLowerCase();
  if (!['true', 'false'].includes(normalized)) {
    throw new Error(`${name} must be true or false`);
  }
  return normalized === 'true';
}

export function parseNonNegativeInteger(name: string, rawValue: string | undefined): number {
  const normalized = (rawValue ?? '0').trim();
  if (!/^\d+$/.test(normalized)) {
    throw new Error(`${name} must be a non-negative integer`);
  }
  const value = Number(normalized);
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${name} must be a safe integer`);
  }
  return value;
}

export function validateShujuServiceConfiguration(
  enabled: boolean,
  serviceSecret: string,
  administratorSecret: string,
  publishEnabled = false,
  publishSecret = '',
  inquiryEnabled = false,
  inquirySecret = '',
  inquiryMinId = 0,
  growthEnabled = false,
  growthSecret = '',
): void {
  if (enabled && serviceSecret.length < 32) {
    throw new Error('SHUJU_SERVICE_JWT_SECRET must be at least 32 characters when enabled');
  }
  if (serviceSecret && serviceSecret === administratorSecret) {
    throw new Error('SHUJU_SERVICE_JWT_SECRET must not reuse JWT_SECRET');
  }
  if (publishEnabled && publishSecret.length < 32) {
    throw new Error(
      'SHUJU_NEWS_PUBLISH_JWT_SECRET must be at least 32 characters when publishing is enabled',
    );
  }
  if (publishSecret && (publishSecret === administratorSecret || publishSecret === serviceSecret)) {
    throw new Error('SHUJU_NEWS_PUBLISH_JWT_SECRET must use an independent trust domain');
  }
  if (inquiryEnabled && inquirySecret.length < 32) {
    throw new Error(
      'SHUJU_INQUIRY_READ_JWT_SECRET must be at least 32 characters when inquiry reading is enabled',
    );
  }
  if (inquiryEnabled && (inquiryMinId <= 0 || inquiryMinId > 2_147_483_647)) {
    throw new Error(
      'SHUJU_INQUIRY_READ_MIN_ID must be between 1 and 2147483647 when inquiry reading is enabled',
    );
  }
  if (
    inquirySecret &&
    [administratorSecret, serviceSecret, publishSecret].some(
      (secret) => secret && inquirySecret === secret,
    )
  ) {
    throw new Error('SHUJU_INQUIRY_READ_JWT_SECRET must use an independent trust domain');
  }
  if (growthEnabled && growthSecret.length < 32) {
    throw new Error(
      'SHUJU_GROWTH_READ_JWT_SECRET must be at least 32 characters when growth reading is enabled',
    );
  }
  if (
    growthSecret &&
    [administratorSecret, serviceSecret, publishSecret, inquirySecret].some(
      (secret) => secret && growthSecret === secret,
    )
  ) {
    throw new Error('SHUJU_GROWTH_READ_JWT_SECRET must use an independent trust domain');
  }
}

function getRequiredProductionEnv(name: string) {
  const value = process.env[name]?.trim();

  if (isProduction && !value) {
    throw new Error(`${name} is required in production`);
  }

  return value;
}

const jwtSecret = getRequiredProductionEnv('JWT_SECRET') ?? 'change-me';
const shujuServiceEnabled = parseStrictBoolean(
  'SHUJU_SERVICE_ENABLED',
  process.env.SHUJU_SERVICE_ENABLED,
);
const shujuServiceJwtSecret = process.env.SHUJU_SERVICE_JWT_SECRET?.trim() ?? '';
const shujuNewsPublishEnabled = parseStrictBoolean(
  'SHUJU_NEWS_PUBLISH_ENABLED',
  process.env.SHUJU_NEWS_PUBLISH_ENABLED,
);
const shujuNewsPublishJwtSecret = process.env.SHUJU_NEWS_PUBLISH_JWT_SECRET?.trim() ?? '';
const shujuInquiryReadEnabled = parseStrictBoolean(
  'SHUJU_INQUIRY_READ_ENABLED',
  process.env.SHUJU_INQUIRY_READ_ENABLED,
);
const shujuInquiryReadJwtSecret = process.env.SHUJU_INQUIRY_READ_JWT_SECRET?.trim() ?? '';
const shujuInquiryReadMinId = parseNonNegativeInteger(
  'SHUJU_INQUIRY_READ_MIN_ID',
  process.env.SHUJU_INQUIRY_READ_MIN_ID,
);
const shujuGrowthReadEnabled = parseStrictBoolean(
  'SHUJU_GROWTH_READ_ENABLED',
  process.env.SHUJU_GROWTH_READ_ENABLED,
);
const shujuGrowthReadJwtSecret = process.env.SHUJU_GROWTH_READ_JWT_SECRET?.trim() ?? '';

if (isProduction && jwtSecret === 'change-me') {
  throw new Error('JWT_SECRET must not use the default value in production');
}

validateShujuServiceConfiguration(
  shujuServiceEnabled,
  shujuServiceJwtSecret,
  jwtSecret,
  shujuNewsPublishEnabled,
  shujuNewsPublishJwtSecret,
  shujuInquiryReadEnabled,
  shujuInquiryReadJwtSecret,
  shujuInquiryReadMinId,
  shujuGrowthReadEnabled,
  shujuGrowthReadJwtSecret,
);

export default () => ({
  nodeEnv,
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: getRequiredProductionEnv('DATABASE_URL'),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  adminUrl: process.env.ADMIN_URL ?? 'http://localhost:3002',
  appUrl: process.env.APP_URL ?? 'http://localhost:3001',
  publicSiteUrl: process.env.PUBLIC_SITE_URL ?? 'https://www.jssngyl.cn',
  baiduSite: process.env.BAIDU_SITE,
  baiduToken: process.env.BAIDU_TOKEN,
  feishuInquiryWebhookUrl: process.env.FEISHU_INQUIRY_WEBHOOK_URL,
  allowedOrigins: getRequiredProductionEnv('ALLOWED_ORIGINS') ?? '',
  uploadRoot: process.env.UPLOAD_ROOT ?? 'uploads',
  uploadMaxFileSizeMb: Number(process.env.UPLOAD_MAX_FILE_SIZE_MB ?? 10),
  adminLoginMaxAttempts: Number(process.env.ADMIN_LOGIN_MAX_ATTEMPTS ?? 5),
  adminLoginLockMinutes: Number(process.env.ADMIN_LOGIN_LOCK_MINUTES ?? 15),
  shujuServiceEnabled,
  shujuServiceJwtSecret,
  shujuServiceIssuer: 'shuju-engine',
  shujuServiceAudience: 'corp-site-news-read',
  shujuServiceSubject: 'shuju-engine',
  shujuNewsPublishEnabled,
  shujuNewsPublishJwtSecret,
  shujuNewsPublishAudience: 'corp-site-news-publish',
  shujuNewsPublishSubject: 'shuju-engine',
  shujuInquiryReadEnabled,
  shujuInquiryReadJwtSecret,
  shujuInquiryReadMinId,
  shujuInquiryReadAudience: 'corp-site-inquiries-read',
  shujuInquiryReadSubject: 'shuju-engine',
  shujuGrowthReadEnabled,
  shujuGrowthReadJwtSecret,
  shujuGrowthReadAudience: 'corp-site-growth-read',
  shujuGrowthReadSubject: 'shuju-engine',
});
