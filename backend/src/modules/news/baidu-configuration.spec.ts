describe('Baidu submission configuration', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.replaceProperty(process, 'env', { NODE_ENV: 'test' });
  });
  afterEach(() => jest.restoreAllMocks());

  async function configuration() {
    return (await import('../../config/configuration')).default();
  }

  it('defaults to manual mode with HTTP disabled', async () => {
    expect(await configuration()).toMatchObject({
      baiduSubmissionMode: 'manual',
      baiduAllowHttp: false,
    });
  });
  it.each(['automatic', 'manual', 'AUTOMATIC', ' automatic ', 'invalid'])(
    'only literal automatic enables mode %s',
    async (mode) => {
      process.env.BAIDU_SUBMISSION_MODE = mode;
      expect((await configuration()).baiduSubmissionMode).toBe(
        mode === 'automatic' ? 'automatic' : 'manual',
      );
    },
  );
  it.each(['true', 'false', 'TRUE', ' true ', '1', 'invalid'])(
    'only literal true grants HTTP permission %s',
    async (permission) => {
      process.env.BAIDU_ALLOW_HTTP = permission;
      expect((await configuration()).baiduAllowHttp).toBe(permission === 'true');
    },
  );
});
