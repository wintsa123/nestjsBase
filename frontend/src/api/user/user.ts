import { alovaInstance } from "..";

export const refreshToken: any = (refreshToken: string) => {
    const method = alovaInstance.Post('/user/refresh', { refreshToken });
    method.meta = {
        authRole: 'refreshToken'
    };
    return method;
};

export const userInfo: any = () => {
    const method = alovaInstance.Get('/user/userInfo', {
        // cacheFor: {
        //     // 设置缓存模式为持久化模式,增删改查的时候需要触发钩子清空缓存
        //     mode: 'restore',
        //     // 缓存时间
        //     expire: Infinity
        // },
        hitSource: ['login','logout']

    });

    return method;
};
export const login = (data: { phone?: number, password: string, email?: string }) => {
    const method = alovaInstance.Post('/user/login', data,{name:'login'});
    method.meta = {
        authRole: 'login'
    };
    return method;
};
export const register = (data: { phone?: number, password: string, email?: string }) => {
    const method = alovaInstance.Post('/user/register', data);
    method.meta = {
        authRole: 'login'
    };
    return method;
};
export const logout = () => {
    const method = alovaInstance.Post('/user/logout',{},{name:'logout'});
    method.meta = {
        authRole: 'logout'
    };
    return method;
};
