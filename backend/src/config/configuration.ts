const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';

function getRequiredProductionEnv(name: string) {
  const value = process.env[name]?.trim();

  if (isProduction && !value) {
    throw new Error(`${name} is required in production`);
  }

  return value;
}

const jwtSecret = getRequiredProductionEnv('JWT_SECRET') ?? 'change-me';

if (isProduction && jwtSecret === 'change-me') {
  throw new Error('JWT_SECRET must not use the default value in production');
}

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
  allowedOrigins: getRequiredProductionEnv('ALLOWED_ORIGINS') ?? '',
  uploadRoot: process.env.UPLOAD_ROOT ?? 'uploads',
  uploadMaxFileSizeMb: Number(process.env.UPLOAD_MAX_FILE_SIZE_MB ?? 10),
  adminLoginMaxAttempts: Number(process.env.ADMIN_LOGIN_MAX_ATTEMPTS ?? 5),
  adminLoginLockMinutes: Number(process.env.ADMIN_LOGIN_LOCK_MINUTES ?? 15),
});
