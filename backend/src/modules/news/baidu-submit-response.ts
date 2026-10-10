const SAFE_CODES = new Set([
  'ERR_TLS_CERT_ALTNAME_INVALID',
  'CERT_HAS_EXPIRED',
  'CERT_NOT_YET_VALID',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'ENOTFOUND',
  'EAI_AGAIN',
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_BODY_TIMEOUT',
  'ABORT_ERR',
]);

type FailureCategory =
  | 'invalid_response'
  | 'invalid_site'
  | 'not_accepted'
  | 'api_error'
  | 'http_error'
  | 'timeout'
  | 'tls_certificate'
  | 'dns'
  | 'connection'
  | 'network';

export class BaiduSubmitError extends Error {
  constructor(
    readonly category: FailureCategory,
    readonly safeCode?: string,
  ) {
    super(`Baidu submit failed (${category}${safeCode ? `: ${safeCode}` : ''})`);
    this.name = 'BaiduSubmitError';
  }
}

function requestFailure(error: unknown): BaiduSubmitError {
  let current = error;
  for (let depth = 0; depth < 5 && current && typeof current === 'object'; depth += 1) {
    const value = current as { name?: unknown; code?: unknown; cause?: unknown };
    if (value.name === 'TimeoutError' || value.name === 'AbortError') {
      return new BaiduSubmitError('timeout');
    }
    if (typeof value.code === 'string' && SAFE_CODES.has(value.code)) {
      const code = value.code;
      const category =
        code.includes('CERT') || code.includes('TLS')
          ? 'tls_certificate'
          : code === 'ENOTFOUND' || code === 'EAI_AGAIN'
            ? 'dns'
            : code.includes('TIMEOUT') || code === 'ETIMEDOUT' || code === 'ABORT_ERR'
              ? 'timeout'
              : 'connection';
      return new BaiduSubmitError(category, code);
    }
    current = value.cause;
  }
  return new BaiduSubmitError('network');
}

export function safeBaiduFailureMessage(error: unknown): string {
  return error instanceof BaiduSubmitError ? error.message : 'Baidu operation failed (unknown)';
}

export function assertSingleUrlAccepted(text: string): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BaiduSubmitError('invalid_response');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new BaiduSubmitError('invalid_response');
  }
  const response = parsed as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(response, 'error')) {
    throw new BaiduSubmitError('api_error');
  }
  if (response.success !== 1) throw new BaiduSubmitError('not_accepted');
  if (
    response.remain !== undefined &&
    (!Number.isSafeInteger(response.remain) || (response.remain as number) < 0)
  ) {
    throw new BaiduSubmitError('invalid_response');
  }
  for (const key of ['not_valid', 'not_same_site']) {
    if (
      response[key] !== undefined &&
      (!Array.isArray(response[key]) || (response[key] as unknown[]).length > 0)
    ) {
      throw new BaiduSubmitError('not_accepted');
    }
  }
}

function normalizedBaiduSite(site: string, articleUrl: string): string {
  const value = site.trim();
  const hasProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(value);
  const rootOnly = hasProtocol ? /^https?:\/\/[^/?#\\\s]+\/?$/i : /^[^/?#\\\s]+\/?$/;
  if (!rootOnly.test(value) || value.includes('@')) throw new BaiduSubmitError('invalid_site');
  try {
    const configured = new URL(hasProtocol ? value : `https://${value}`);
    const article = new URL(articleUrl);
    if (
      !['http:', 'https:'].includes(configured.protocol) ||
      !['http:', 'https:'].includes(article.protocol) ||
      configured.username ||
      configured.password ||
      article.username ||
      article.password ||
      configured.search ||
      configured.hash ||
      configured.pathname !== '/' ||
      !configured.hostname ||
      configured.hostname !== article.hostname
    ) {
      throw new BaiduSubmitError('invalid_site');
    }
    return hasProtocol ? configured.origin : configured.hostname;
  } catch {
    throw new BaiduSubmitError('invalid_site');
  }
}

export async function submitSingleUrlToBaidu(
  site: string,
  token: string,
  url: string,
  allowHttp = false,
): Promise<void> {
  // HTTP requires an explicit configuration choice, never a TLS-error fallback.
  const normalizedSite = normalizedBaiduSite(site, url);
  const base =
    allowHttp === true ? 'http://data.zz.baidu.com/urls' : 'https://data.zz.baidu.com/urls';
  // Baidu expects the registered site's protocol separators as literal characters.
  // Validate site before interpolation; keep credentials encoded and redirects blocked.
  const endpoint = new URL(`${base}?site=${normalizedSite}&token=${encodeURIComponent(token)}`);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: url,
      signal: AbortSignal.timeout(5_000),
      redirect: 'error',
    });
    if (!response.ok) throw new BaiduSubmitError('http_error');
    assertSingleUrlAccepted(await response.text());
  } catch (error) {
    throw error instanceof BaiduSubmitError ? error : requestFailure(error);
  }
}
