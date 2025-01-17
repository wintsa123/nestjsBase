import { createAlova } from 'alova';
import VueHook from '@alova/scene-vue';
import { useUserStore } from '../stores/user';

// 创建alova实例
export const alovaInstance = createAlova({
  baseURL: '/api',
  statesHook: VueHook,
  // 请求拦截器
  beforeRequest: (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  // 响应拦截器
  responded: {
    onSuccess: async (response) => {
      return response.data;
    },
    onError: async (error) => {
      console.error('Request failed:', error);
      throw error;
    },
  },
});
