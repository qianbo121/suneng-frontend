type ApiEnvelope<T> = {
  code: number;
  data: T;
  message: string;
};

type ApiRequestOptions = {
  revalidate?: number;
  cache?: RequestCache;
  searchParams?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
};

type ApiMutationOptions<TBody> = {
  body?: TBody;
  headers?: Record<string, string>;
};

class ApiRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

function getApiBaseUrl() {
  if (typeof window === 'undefined') {
    return (
      process.env.API_BASE_URL_INTERNAL ||
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      ''
    );
  }

  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
}

function getSiteOrigin() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

function getRequestTimeoutMs(timeoutMs?: number) {
  if (timeoutMs && timeoutMs > 0) return timeoutMs;

  const configuredTimeout =
    Number(process.env.API_REQUEST_TIMEOUT_MS) || Number(process.env.NEXT_PUBLIC_API_REQUEST_TIMEOUT_MS);

  if (configuredTimeout > 0) return configuredTimeout;

  return process.env.NODE_ENV === 'development' ? 800 : 3000;
}

function buildApiUrl(path: string, searchParams?: ApiRequestOptions['searchParams']) {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    throw new ApiRequestError('API base URL is not configured');
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = /^https?:\/\//i.test(normalizedBase)
    ? new URL(`${normalizedBase}${normalizedPath}`)
    : new URL(`${normalizedBase}${normalizedPath}`, getSiteOrigin());

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

function getApiOrigin() {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return '';
  const siteOrigin = getSiteOrigin();

  if (baseUrl.startsWith('/')) {
    return siteOrigin;
  }

  if (
    typeof window === 'undefined' &&
    process.env.API_BASE_URL_INTERNAL &&
    baseUrl === process.env.API_BASE_URL_INTERNAL
  ) {
    return siteOrigin;
  }

  try {
    return new URL(baseUrl).origin;
  } catch {
    return siteOrigin;
  }
}

export function toAssetUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const origin = getApiOrigin();
  if (url.startsWith('/') && origin) {
    return `${origin}${url}`;
  }

  return url;
}

async function parseResponsePayload<T>(response: Response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return (await response.json()) as ApiEnvelope<T> | T;
  }

  return null;
}

function unwrapEnvelope<T>(payload: ApiEnvelope<T> | T) {
  if (
    payload &&
    typeof payload === 'object' &&
    'code' in payload &&
    'data' in payload &&
    'message' in payload
  ) {
    const envelope = payload as ApiEnvelope<T>;

    if (envelope.code !== 0) {
      throw new ApiRequestError(envelope.message);
    }

    return envelope.data;
  }

  return payload as T;
}

async function apiRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  options: ApiRequestOptions & ApiMutationOptions<unknown> = {},
) {
  const timeoutSignal =
    typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
      ? AbortSignal.timeout(getRequestTimeoutMs(options.timeoutMs))
      : undefined;

  const response = await fetch(buildApiUrl(path, options.searchParams), {
    method,
    headers: {
      ...(method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
    ...(method !== 'GET' && 'body' in options ? { body: JSON.stringify(options.body ?? {}) } : {}),
    ...(timeoutSignal ? { signal: timeoutSignal } : {}),
    ...(options.cache ? { cache: options.cache } : {}),
    ...(!options.cache && method === 'GET'
      ? {
          next: {
            revalidate: options.revalidate ?? 3600,
          },
        }
      : {}),
  });

  const payload = await parseResponsePayload<T>(response);

  if (!response.ok) {
    if (
      payload &&
      typeof payload === 'object' &&
      'message' in payload &&
      typeof payload.message === 'string'
    ) {
      throw new ApiRequestError(payload.message, response.status);
    }

    throw new ApiRequestError(`Request failed with status ${response.status}`, response.status);
  }

  return unwrapEnvelope((payload ?? null) as ApiEnvelope<T> | T);
}

async function apiGet<T>(path: string, options: ApiRequestOptions = {}) {
  return apiRequest<T>('GET', path, options);
}

export async function apiPost<T, TBody = Record<string, unknown>>(
  path: string,
  options: ApiMutationOptions<TBody> & Pick<ApiRequestOptions, 'cache'> = {},
) {
  return apiRequest<T>('POST', path, options);
}

export async function safeApiGet<T>(path: string, options: ApiRequestOptions = {}) {
  try {
    const data = await apiGet<T>(path, options);
    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null as T | null,
      error: error instanceof Error ? error.message : 'Unknown request error',
    };
  }
}
