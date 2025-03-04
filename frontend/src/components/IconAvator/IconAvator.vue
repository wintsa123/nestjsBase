<template>

    <el-avatar v-if="!userStore.data" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
    <el-avatar v-else-if="userStore.data.avator" :src="user.avator" />
    <el-avatar v-else>{{ userStore.getUserFirstName }}</el-avatar>

</template>
<script setup>

import { useUserStore } from '@/stores/user';

const userStore = useUserStore()

onMounted( () => {
     userStore.SetUserInfo();
});
</script>