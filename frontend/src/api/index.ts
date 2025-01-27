import { createClientTokenAuthentication } from '@alova/scene-vue';
import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import VueHook from 'alova/vue';
import { refreshToken } from './user/user';
const { onAuthRequired, onResponseRefreshToken } = createClientTokenAuthentication<
  typeof VueHook
>({
  assignToken: method => {
    method.config.headers.Authorization = localStorage.getItem('token');
  },
  login(response, method) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('tokenExpireTime', response.tokenExpireTime);


  },
  logout(response, method) {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('tokenExpireTime');

  },
  refreshToken: {
    // 在请求前触发，将接收到method参数，并返回boolean表示token是否过期
    isExpired: method => {
      let tokenExpireTime=localStorage.get('tokenExpireTime');

      return tokenExpireTime < Date.now();
    },

    // 当token过期时触发，在此函数中触发刷新token
    handler: async method => {
      try {
        const { token, refresh_token ,tokenExpireTime } = await refreshToken();
        localStorage.setItem('token', token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('tokenExpireTime', tokenExpireTime);

      } catch (error) {
        // token刷新失败，跳转回登录页
        location.href = '/login';
        // 并抛出错误
        throw error;
      }
    }
  }
});
export const alovaInstance = createAlova({
  baseURL: import.meta.env.VITE_API_URL,
  requestAdapter: adapterFetch(),

  statesHook: VueHook,
  beforeRequest: onAuthRequired(method => {
    // ...原请求前拦截器
  }),
  responded: onResponseRefreshToken({
    onSuccess: (response: any, method: any) => {

      //...原响应成功拦截器
      return response.json();
    },
    onError: (error: any, method: any) => {
      //...原响应错误拦截器
      throw error;

    },
    onComplete: (method: any) => {
      //...原响应完成拦截器
      return method.json();

    }
  })
});