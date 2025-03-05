import { createClientTokenAuthentication } from 'alova/client';
import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import VueHook from 'alova/vue';
import { refreshToken } from './user/user';
import { ElMessage } from 'element-plus';
const { onAuthRequired, onResponseRefreshToken } = createClientTokenAuthentication<
  typeof VueHook
>({
  assignToken: method => {
    method.config.headers.Authorization = 'Bearer '+localStorage.getItem('token');
  },
  async login(response: any, method) {
    const data =  await response.clone().json()   
 
    if (data.code==0) {

      ElMessage.success(data.message)
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('refresh_token', data.data.refresh_token);
      console.log(data.data.refresh_token)
      localStorage.setItem('tokenExpireTime', data.data.tokenExpireTime);
      location.href = '/dashboard';

    } else {
      console.log(data)
      ElMessage.error(data.message||data.params.message)
    }
 

  },
  logout(response, method) {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('tokenExpireTime');
    location.href = '/login';

  },
  refreshToken: {
    // 在请求前触发，将接收到method参数，并返回boolean表示token是否过期
    isExpired: method => {
    
      
      const tokenExpireTime = localStorage.getItem('tokenExpireTime');
      if (!tokenExpireTime) return true;
      // return true
      return parseInt(tokenExpireTime) < Math.floor(Date.now() / 1000);
    },

    // 当token过期时触发，在此函数中触发刷新token
    handler: async method => {
      try {
        const  data = await refreshToken({ refreshToken: localStorage.getItem('refresh_token') });
        if (data.code==0) {
          localStorage.setItem('token', data.data.token);
          localStorage.setItem('refresh_token', data.data.refresh_token);
          localStorage.setItem('tokenExpireTime', data.data.tokenExpireTime);
        } else {
          ElMessage.error(data.message||data.params.message)
        }
     

      } catch (error) {
        console.log(error)
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
  responded: onResponseRefreshToken( (response, method) => {
    //...原响应成功拦截器
    return  response.json();
  }),
  // timeout: 10000

});