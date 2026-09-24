import { describe, expect, it } from 'vitest';
import { isLocalPreviewHostname } from './local-preview';

describe('local preview analytics boundary', () => {
  it.each(['localhost', 'LOCALHOST.', 'preview.localhost', '127.0.0.1', '127.0.0.2', '::1', '[::1]'])(
    'recognizes %s as local',
    (hostname) => expect(isLocalPreviewHostname(hostname)).toBe(true),
  );

  it.each(['www.jssngyl.cn', 'jssngyl.cn', 'localhost.example.com', undefined])(
    'preserves existing tracking behavior on %s',
    (hostname) => expect(isLocalPreviewHostname(hostname)).toBe(false),
  );
});
