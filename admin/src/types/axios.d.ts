import 'axios';

import { RequestMeta } from '@/types/http';

declare module 'axios' {
  export interface AxiosRequestConfig {
    meta?: RequestMeta;
    _loadingTracked?: boolean;
  }
}
