import { alovaInstance } from "..";

export const refreshToken: any = (data: {refreshToken:string}) => {
    const method = alovaInstance.Post('/refresh',data);
    method.meta = {
        authRole: 'refreshToken'
    };
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