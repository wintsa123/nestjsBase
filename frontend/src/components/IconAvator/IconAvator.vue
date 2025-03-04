<template>

    <el-avatar v-if="!user" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
    <el-avatar v-else-if="user.avator" :src="user.avator" />
    <el-avatar v-else>{{ user.realname.substr(0, 1) }}</el-avatar>

</template>
<script setup>

import { useUserStore } from '@/stores/user';

let user
onMounted(async () => {
    const userStore = useUserStore()
    user = await userStore.getUserInfo()
    console.log(user)
});
</script>