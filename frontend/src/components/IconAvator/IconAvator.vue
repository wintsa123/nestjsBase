<template>

    <el-avatar v-if="!Object.keys(data).length>0" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
    <el-avatar v-else-if="data.avator" :src="user.avator" />
    <el-avatar v-else>{{ userStore.getUserFirstName }}</el-avatar>

</template>
<script setup>

import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const {data}=storeToRefs(userStore)
console.log(data)
onMounted( () => {
     userStore.SetUserInfo();
});
</script>