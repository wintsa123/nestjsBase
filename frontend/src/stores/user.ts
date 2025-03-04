import { defineStore } from 'pinia';

import { userInfo } from '@/api/user/user';
import { useRequest } from 'alova/client';
export const useUserStore = defineStore('user', {
    state: () => ({
       data : {} as any
    }),
    getters: {
        getUserFirstName:(state)=> {

            if (state.data.realname) {
                return state.data.realname.substring(0,1)

            }else{
                return null
            }
        }
    },
    actions: {

        SetUserInfo() {
            if (Object.keys(this.data).length === 0) {

                const { data, onSuccess } = useRequest(userInfo, {
                    // 请求响应前，data的初始值
                    initialData: [],


                });

                onSuccess(() => {
                    if (data.value.code != 0) {
                        throw data.value.message
                    }
                    this.data = data.value.data
                })

            }

        }


    },

});


