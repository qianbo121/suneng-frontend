import type { RcFile } from 'antd/es/upload';

import { http, unwrapResponse } from '@/services/http';
import { ApiResponse } from '@/types/http';
import { UploadResponse } from '@/types/product';

export async function uploadSingleFile(file: RcFile | File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await http.post<ApiResponse<UploadResponse>>('/admin/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return unwrapResponse(response).urls[0] || '';
}

export async function uploadBatchFiles(files: Array<RcFile | File>) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const response = await http.post<ApiResponse<UploadResponse>>('/admin/upload/batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return unwrapResponse(response).urls;
}
