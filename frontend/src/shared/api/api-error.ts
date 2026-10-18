import axios from 'axios';

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.errors?.[0]?.message;
    if (typeof message === 'string') return message;
    if (error.response?.status === 401) return 'Bạn cần đăng nhập để tiếp tục.';
    if (error.response?.status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
  }
  return error instanceof Error ? error.message : 'Không thể kết nối máy chủ.';
}
