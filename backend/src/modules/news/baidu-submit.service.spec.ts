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
      new ConfigService({ baiduSite: 'jssngyl.cn', baiduToken: 'test-token' }),
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
    await expect(submitSingleUrlToBaidu('site', 'test-token', url)).rejects.toThrow('timeout');
    expect(timeout).toHaveBeenCalledWith(5000);
  });
  it('skips missing configuration without calling fetch', async () => {
    const missing = new BaiduSubmitService(new ConfigService());
    await expect(missing.submitUrl(url)).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
