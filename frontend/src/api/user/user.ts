import { alovaInstance } from "..";

export const refreshToken: any = (data:{refreshToken: string}) => {
    const method = alovaInstance.Post('/user/refresh',data);
    method.meta = {
        authRole: 'refreshToken'
    };
    return method;
};

export const userInfo: any = () => {
    const method = alovaInstance.Get('/user/userInfo',{ cacheFor: {
        // 设置缓存模式为持久化模式
        mode: 'restore',
        // 缓存时间
        expire: 60 * 10 * 1000
      }});
   
    return method;
};
export const login = (data: {phone?: number, password: string, email?: string}) => {
    const method = alovaInstance.Post('/user/login',data);
    method.meta = {
        authRole: 'login'
    };
    return method;
};
export const register = (data: {phone?: number, password: string, email?: string}) => {
    const method = alovaInstance.Post('/user/register',data);
    method.meta = {
        authRole: 'login'
    };
    return method;
};
export const logout = () => {
    const method = alovaInstance.Post('/user/logout');
    method.meta = {
        authRole: 'logout'
    };
    return method;
};
export const test = () => {
    const method = alovaInstance.Post('/user/test',{});
  
    return method;
};