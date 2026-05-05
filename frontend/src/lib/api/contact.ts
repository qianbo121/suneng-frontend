import { apiPost, safeApiPost } from '@/lib/api/client';
import { ContactMessagePayload } from '@/types/contact';

export function submitContactMessage(payload: ContactMessagePayload) {
  return apiPost<null, ContactMessagePayload>('/v1/contact', {
    body: payload,
    cache: 'no-store',
  });
}

export function safeSubmitContactMessage(payload: ContactMessagePayload) {
  return safeApiPost<null, ContactMessagePayload>('/v1/contact', {
    body: payload,
    cache: 'no-store',
  });
}

