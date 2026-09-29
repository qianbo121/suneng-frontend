type BrowserStorageName = 'sessionStorage' | 'localStorage';

export function getBrowserStorage(name: BrowserStorageName): Storage | undefined {
  try {
    // Browsers can throw while accessing the property itself, before getItem is called.
    return typeof window === 'undefined' ? undefined : window[name];
  } catch {
    return undefined;
  }
}
