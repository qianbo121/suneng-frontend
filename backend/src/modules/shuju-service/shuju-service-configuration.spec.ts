import {
  parseNonNegativeInteger,
  parseStrictBoolean,
  validateShujuServiceConfiguration,
} from '@/config/configuration';

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

  it('uses a third independent secret for publishing', () => {
    const admin = 'administrator-secret-that-is-long-enough';
    const read = 'read-secret-that-is-independent-and-long';
    const write = 'write-secret-that-is-independent-and-long';
    expect(() => validateShujuServiceConfiguration(true, read, admin, true, '')).toThrow(
      'SHUJU_NEWS_PUBLISH_JWT_SECRET must be at least 32 characters',
    );
    expect(() => validateShujuServiceConfiguration(true, read, admin, true, read)).toThrow(
      'must use an independent trust domain',
    );
    expect(() => validateShujuServiceConfiguration(true, read, admin, true, admin)).toThrow(
      'must use an independent trust domain',
    );
    expect(() => validateShujuServiceConfiguration(true, read, admin, true, write)).not.toThrow();
  });

  it('uses a fourth independent secret for inquiry PII and a strict cutover id', () => {
    const admin = 'administrator-secret-that-is-long-enough';
    const newsRead = 'read-secret-that-is-independent-and-long';
    const newsWrite = 'write-secret-that-is-independent-and-long';
    const inquiryRead = 'inquiry-secret-that-is-independent-and-long';
    expect(() =>
      validateShujuServiceConfiguration(true, newsRead, admin, false, newsWrite, true, ''),
    ).toThrow('SHUJU_INQUIRY_READ_JWT_SECRET must be at least 32 characters');
    expect(() =>
      validateShujuServiceConfiguration(true, newsRead, admin, false, newsWrite, true, newsRead, 4),
    ).toThrow('must use an independent trust domain');
    expect(() =>
      validateShujuServiceConfiguration(
        true,
        newsRead,
        admin,
        false,
        newsWrite,
        true,
        inquiryRead,
        0,
      ),
    ).toThrow('SHUJU_INQUIRY_READ_MIN_ID must be between 1 and 2147483647');
    expect(() =>
      validateShujuServiceConfiguration(
        true,
        newsRead,
        admin,
        false,
        newsWrite,
        true,
        inquiryRead,
        2_147_483_648,
      ),
    ).toThrow('SHUJU_INQUIRY_READ_MIN_ID must be between 1 and 2147483647');
    expect(() =>
      validateShujuServiceConfiguration(
        true,
        newsRead,
        admin,
        false,
        newsWrite,
        true,
        inquiryRead,
        4,
      ),
    ).not.toThrow();
    expect(parseNonNegativeInteger('SHUJU_INQUIRY_READ_MIN_ID', '0')).toBe(0);
    expect(parseNonNegativeInteger('SHUJU_INQUIRY_READ_MIN_ID', ' 4 ')).toBe(4);
    expect(() => parseNonNegativeInteger('SHUJU_INQUIRY_READ_MIN_ID', '-1')).toThrow(
      'must be a non-negative integer',
    );
  });
});
