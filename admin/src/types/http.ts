export type ApiResponse<T> = {
  code: number;
  data: T;
  message: string;
};

export type ApiPaginationResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type RequestMeta = {
  skipAuth?: boolean;
  skipGlobalLoading?: boolean;
  silentError?: boolean;
};
