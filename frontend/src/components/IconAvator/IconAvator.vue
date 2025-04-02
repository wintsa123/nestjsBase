<template>

    <el-avatar v-if="loading" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
    <el-avatar v-else-if="data.avator" :src="user.avator" />
    <el-avatar v-else>{{ data.realname.substring(0, 1) }}</el-avatar>

</template>
<script setup>

import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia'
import { userInfo } from '@/api/user/user';

// const userStore = useUserStore()
// const {data}=storeToRefs(userStore)
// console.log(data)
// onMounted( () => {
//      userStore.SetUserInfo();
// });
const { data, onSuccess,loading } = useRequest(userInfo, {
    initialData() {
    // 设置上一次的响应数据
    const storedData = localStorage.getItem('userInfo');
    return JSON.parse(storedData ==''|| `{"avator":null,"realname":""}`);

   
  }


}).onSuccess(({ data, method })=>{
    console.log(data,'userInfo')
    localStorage.setItem('userInfo', JSON.stringify(data));

})


</script>