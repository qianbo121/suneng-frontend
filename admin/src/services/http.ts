import axios, { AxiosError, AxiosResponse } from 'axios';
import { notification } from 'antd';

import { emitUnauthorizedEvent, getStoredToken, clearAuthSession } from '@/services/storage';
import { startGlobalLoading, stopGlobalLoading } from '@/services/loading';
import { ApiResponse } from '@/types/http';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

function isAuthLoginRequest(url?: string) {
  return (url || '').includes('/admin/auth/login');
}

export function extractApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }

    return error.message || '请求失败';
  }

  return error instanceof Error ? error.message : '未知错误';
}

export function unwrapResponse<T>(response: AxiosResponse<ApiResponse<T>>) {
  const payload = response.data;

  if (payload.code !== 0) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload.data;
}

http.interceptors.request.use(
  (config) => {
    if (!config.meta?.skipGlobalLoading) {
      startGlobalLoading();
      config._loadingTracked = true;
    }

    const token = getStoredToken();

    if (token && !config.meta?.skipAuth) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    stopGlobalLoading();
    return Promise.reject(error);
  },
);

http.interceptors.response.use(
  (response) => {
    if (response.config._loadingTracked) {
      stopGlobalLoading();
    }

    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const config = error.config;

    if (config?._loadingTracked) {
      stopGlobalLoading();
    }

    const status = error.response?.status;
    const message = extractApiErrorMessage(error);

    if (status === 401 && !isAuthLoginRequest(config?.url)) {
      clearAuthSession();
      emitUnauthorizedEvent();

      if (!config?.meta?.silentError) {
        notification.error({
          message: '登录状态已失效',
          description: '请重新登录后台系统。',
        });
      }

      return Promise.reject(error);
    }

    if (!config?.meta?.silentError) {
      notification.error({
        message: '请求失败',
        description: message,
      });
    }

    return Promise.reject(error);
  },
);
