import { defineStore } from 'pinia';

import { userInfo } from '@/api/user/user';
import { useRequest } from 'alova/client';
export const useUserStore = defineStore('user', {
    state: () => ({
        realname: '',
    }),
    actions: {

        SetUserInfo() {
            const { data } = useRequest(userInfo, {
                // 请求响应前，data的初始值
                initialData: []

            });
            console.log(data,'data')
            // this.realname = res.data.info.realname;
        }


    },

});


