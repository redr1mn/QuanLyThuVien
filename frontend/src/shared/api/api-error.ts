import axios from 'axios';

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.errors?.[0]?.message;
    if (typeof message === 'string') return message;
    if (error.response?.status === 401) return 'Bạn cần đăng nhập để tiếp tục.';
    if (error.response?.status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
    const isViteProxyFailure = error.response?.status === 500 && typeof error.response.data === 'string';
    if (isViteProxyFailure || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      return 'Không kết nối được API. Hãy khởi động backend tại cổng 5194 rồi tải lại trang.';
    }
  }
  return error instanceof Error ? error.message : 'Không thể kết nối máy chủ.';
}
