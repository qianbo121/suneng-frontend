import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaiduSubmitService } from './baidu-submit.service';
import { safeBaiduFailureMessage, submitSingleUrlToBaidu } from './baidu-submit-response';

describe('Baidu single-URL acceptance', () => {
  const url = 'https://www.jssngyl.cn/zh/news/test-article';
  let fetchMock: jest.SpyInstance;
  let service: BaiduSubmitService;
  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, 'fetch');
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    service = new BaiduSubmitService(
      new ConfigService({
        baiduSubmissionMode: 'automatic',
        baiduSite: 'www.jssngyl.cn',
        baiduToken: 'test-token',
      }),
    );
  });
  afterEach(() => jest.restoreAllMocks());
  it('accepts only the explicit single-URL receipt and omits the URL from diagnostics', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: 1, remain: 0, not_valid: [], not_same_site: [] })),
    );
    await expect(service.submitUrl(url)).resolves.toBe(true);
    const [endpoint, options] = fetchMock.mock.calls[0];
    expect(endpoint.protocol).toBe('https:');
    expect(options.redirect).toBe('error');
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(Logger.prototype.log).toHaveBeenCalledWith('Baidu accepted one news URL for discovery');
  });
  it.each([
    '',
    'not JSON',
    'null',
    '[]',
    '{}',
    '{"success":0}',
    '{"success":-1}',
    '{"success":2}',
    '{"success":1.5}',
    '{"success":"1"}',
    '{"success":true}',
    '{"success":1,"error":0}',
    '{"success":1,"error":null}',
    '{"success":1,"error":400,"message":"test-token"}',
    '{"success":1,"remain":-1}',
    '{"success":1,"not_valid":["private-url"]}',
    '{"success":1,"not_same_site":["private-url"]}',
  ])('rejects an unconfirmed response: %s', async (text) => {
    fetchMock.mockResolvedValue(new Response(text));
    await expect(service.submitUrl(url)).rejects.toThrow(/^Baidu submit failed/);
    expect(Logger.prototype.log).not.toHaveBeenCalled();
  });
  it('rejects HTTP failure even with success1 in the body', async () => {
    fetchMock.mockResolvedValue(new Response('{"success":1}', { status: 500 }));
    await expect(service.submitUrl(url)).rejects.toThrow('http_error');
  });
  it.each([
    ['ERR_TLS_CERT_ALTNAME_INVALID', 'tls_certificate'],
    ['ENOTFOUND', 'dns'],
    ['ECONNRESET', 'connection'],
    ['UND_ERR_CONNECT_TIMEOUT', 'timeout'],
    ['https://private.test/?token=test-token', 'network'],
  ])('records only whitelisted failure categories for %s', async (code, category) => {
    fetchMock.mockRejectedValue(
      Object.assign(new Error(`raw ${url} test-token`), { cause: { code } }),
    );
    try {
      await service.submitUrl(url);
      throw new Error('Expected rejection');
    } catch (error) {
      const message = safeBaiduFailureMessage(error);
      expect(message).toContain(category);
      expect(message).not.toContain(url);
      expect(message).not.toContain('test-token');
      expect(message).not.toContain('private.test');
    }
  });
  it('sanitizes errors while reading the response body', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => {
        throw new Error(`${url} test-token`);
      },
    });
    await expect(service.submitUrl(url)).rejects.toThrow('network');
  });
  it('uses a finite timeout and sanitizes timeout failures', async () => {
    const timeout = jest.spyOn(AbortSignal, 'timeout');
    fetchMock.mockRejectedValue(Object.assign(new Error('test-token'), { name: 'TimeoutError' }));
    await expect(submitSingleUrlToBaidu('www.jssngyl.cn', 'test-token', url)).rejects.toThrow(
      'timeout',
    );
    expect(timeout).toHaveBeenCalledWith(5000);
  });
  it('skips missing configuration without calling fetch', async () => {
    const missing = new BaiduSubmitService(new ConfigService({ baiduSubmissionMode: 'automatic' }));
    await expect(missing.submitUrl(url)).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([undefined, 'manual', 'AUTOMATIC', ' automatic ', 'other'])(
    'keeps mode %s paused even when credentials and HTTP permission are present',
    async (baiduSubmissionMode) => {
      const paused = new BaiduSubmitService(
        new ConfigService({
          baiduSubmissionMode,
          baiduAllowHttp: true,
          baiduSite: 'www.jssngyl.cn',
          baiduToken: 'test-token',
        }),
      );
      await expect(paused.submitUrl(url)).resolves.toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(Logger.prototype.log).not.toHaveBeenCalled();
    },
  );
  it.each([
    [true, 'http:'],
    [false, 'https:'],
    [undefined, 'https:'],
    ['true', 'https:'],
  ])(
    'uses only the explicitly selected official protocol for %s',
    async (baiduAllowHttp, protocol) => {
      const configured = new BaiduSubmitService(
        new ConfigService({
          baiduSubmissionMode: 'automatic',
          baiduAllowHttp,
          baiduSite: 'www.jssngyl.cn',
          baiduToken: 'test-token',
        }),
      );
      fetchMock.mockResolvedValue(new Response('{"success":1}'));
      await expect(configured.submitUrl(url)).resolves.toBe(true);
      const [endpoint, options] = fetchMock.mock.calls[0];
      expect(endpoint.protocol).toBe(protocol);
      expect(endpoint.hostname).toBe('data.zz.baidu.com');
      expect(endpoint.pathname).toBe('/urls');
      expect(options.redirect).toBe('error');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );
  it.each([
    ['https://www.jssngyl.cn/', 'https://www.jssngyl.cn'],
    ['http://www.jssngyl.cn', 'http://www.jssngyl.cn'],
    ['www.jssngyl.cn/', 'www.jssngyl.cn'],
  ])(
    'preserves the literal registered site in the raw request for %s',
    async (site, expectedSite) => {
      fetchMock.mockResolvedValue(new Response('{"success":1}'));
      const token = 'test&token=+/?#';
      await expect(submitSingleUrlToBaidu(site, token, url, true)).resolves.toBeUndefined();
      const [endpoint, options] = fetchMock.mock.calls[0];
      expect(endpoint.href).toBe(
        `http://data.zz.baidu.com/urls?site=${expectedSite}&token=${encodeURIComponent(token)}`,
      );
      expect(endpoint.searchParams.get('site')).toBe(expectedSite);
      expect(endpoint.searchParams.get('token')).toBe(token);
      expect([...endpoint.searchParams.keys()]).toEqual(['site', 'token']);
      expect(endpoint.href).not.toContain('site=https%3A%2F%2F');
      expect(endpoint.href).not.toContain('site=http%3A%2F%2F');
      expect(options.redirect).toBe('error');
      expect(options.body).toBe(url);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );
  it.each([
    '',
    'https://jssngyl.cn',
    'https://other.test',
    'ftp://www.jssngyl.cn',
    'https://username@www.jssngyl.cn',
    'https://username:password@www.jssngyl.cn',
    'https://www.jssngyl.cn?token=leak',
    'https://www.jssngyl.cn?',
    'https://www.jssngyl.cn#fragment',
    'https://www.jssngyl.cn#',
    'https://www.jssngyl.cn/zh',
    'https://www.jssngyl.cn/.',
    'https://www.jssngyl.cn//',
    'www.jssngyl.cn/?token=leak',
    'www.jssngyl.cn/zh',
    'https://www.jssngyl.cn\\zh',
    'https://www.jssngyl.\tcn',
  ])('rejects unsafe or mismatched site configuration before requesting: %s', async (site) => {
    await expect(submitSingleUrlToBaidu(site, 'test-token', url, true)).rejects.toThrow(
      'invalid_site',
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(Logger.prototype.log).not.toHaveBeenCalled();
  });
  it('does not retry over HTTP when the HTTPS certificate fails', async () => {
    fetchMock.mockRejectedValue(
      Object.assign(new Error('certificate mismatch'), { code: 'ERR_TLS_CERT_ALTNAME_INVALID' }),
    );
    await expect(service.submitUrl(url)).rejects.toThrow('tls_certificate');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0].protocol).toBe('https:');
    expect(Logger.prototype.log).not.toHaveBeenCalled();
  });
});
