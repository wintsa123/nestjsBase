import { alovaInstance } from "..";

export const refreshToken: any = () => {
    const method = alovaInstance.Post('/refresh');
    method.meta = {
        authRole: 'refreshToken'
    };
    return method;
};

export const login = () => {
    const method = alovaInstance.Post('/user/login');
    method.meta = {
        authRole: 'login'
    };
    return method;
};
export const register = () => {
    const method = alovaInstance.Post('/user/register');
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