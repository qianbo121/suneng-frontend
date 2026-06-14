import { safeApiGet } from '@/lib/api/client';
import { AboutApiData } from '@/types/about';

// CMS read for the About page. ISR-cached like other read paths; safeApiGet
// returns { data: null, error } on failure so callers can fall back to static.
export function getAboutContent() {
  return safeApiGet<AboutApiData>('/v1/about', { revalidate: 600 });
}
