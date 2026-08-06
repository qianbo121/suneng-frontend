export const BAIDU_ANALYTICS_HOSTNAME = 'www.jssngyl.cn';

export function isBaiduAnalyticsHostname(hostname: string | null | undefined): boolean {
  return hostname?.trim().toLowerCase() === BAIDU_ANALYTICS_HOSTNAME;
}
