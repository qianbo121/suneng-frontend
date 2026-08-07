const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';

export function parseStrictBoolean(name: string, rawValue: string | undefined): boolean {
  const normalized = (rawValue ?? 'false').trim().toLowerCase();
  if (!['true', 'false'].includes(normalized)) {
    throw new Error(`${name} must be true or false`);
  }
  return normalized === 'true';
}

export function validateShujuServiceConfiguration(
  enabled: boolean,
  serviceSecret: string,
  administratorSecret: string,
): void {
  if (enabled && serviceSecret.length < 32) {
    throw new Error('SHUJU_SERVICE_JWT_SECRET must be at least 32 characters when enabled');
  }
  if (serviceSecret && serviceSecret === administratorSecret) {
    throw new Error('SHUJU_SERVICE_JWT_SECRET must not reuse JWT_SECRET');
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

if (isProduction && jwtSecret === 'change-me') {
  throw new Error('JWT_SECRET must not use the default value in production');
}

validateShujuServiceConfiguration(shujuServiceEnabled, shujuServiceJwtSecret, jwtSecret);

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
});
