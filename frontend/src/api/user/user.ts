import { alovaInstance } from "..";

export const refreshToken: any = () => {
    const method = alovaInstance.Get('/refresh_token');
    method.meta = {
        authRole: 'refreshToken'
    };
    return method;
};

export const login = () => {
    const method = alovaInstance.Get('/login');
    method.meta = {
        authRole: 'login'
    };
    return method;
};
export const signin = () => {
    const method = alovaInstance.Get('/signin');
    method.meta = {
        authRole: 'login'
    };
    return method;
};
export const logout = () => {
    const method = alovaInstance.Get('/logout');
    method.meta = {
        authRole: 'logout'
    };
    return method;
};