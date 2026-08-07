import { parseStrictBoolean, validateShujuServiceConfiguration } from '@/config/configuration';

describe('Shuju service configuration', () => {
  it('accepts only explicit true or false feature flags', () => {
    expect(parseStrictBoolean('SHUJU_SERVICE_ENABLED', undefined)).toBe(false);
    expect(parseStrictBoolean('SHUJU_SERVICE_ENABLED', ' true ')).toBe(true);
    expect(parseStrictBoolean('SHUJU_SERVICE_ENABLED', 'FALSE')).toBe(false);
    expect(() => parseStrictBoolean('SHUJU_SERVICE_ENABLED', '1')).toThrow(
      'SHUJU_SERVICE_ENABLED must be true or false',
    );
  });

  it('fails closed when enabled without a strong independent secret', () => {
    const administratorSecret = 'administrator-secret-that-is-long-enough';
    expect(() => validateShujuServiceConfiguration(true, '', administratorSecret)).toThrow(
      'must be at least 32 characters',
    );
    expect(() =>
      validateShujuServiceConfiguration(true, administratorSecret, administratorSecret),
    ).toThrow('must not reuse JWT_SECRET');
    expect(() =>
      validateShujuServiceConfiguration(
        true,
        'service-secret-that-is-independent',
        administratorSecret,
      ),
    ).not.toThrow();
  });
});
