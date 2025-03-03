import { defineStore } from 'pinia';

import { userInfo } from '@/api/user/user';
import { useRequest } from 'alova/client';
export const useUserStore = defineStore('user', {
    state: () => ({
        data: '',
    }),
    actions: {

        async SetUserInfo() {
            const { data, onSuccess, send } = useRequest(userInfo, {
                // 请求响应前，data的初始值
                initialData: [],
                immediate: false


            });
            await send()

            if (data.value.code != 0) {
                throw data.value.message
            }
            this.data = data.value.data


        },

        // 检查并自动获取数据
        async getUserInfo() {
            if (!this.data) {
                await this.SetUserInfo(); // 如果数据为空且未获取过，则自动获取
            }


            return this.data
        },
    },

});


