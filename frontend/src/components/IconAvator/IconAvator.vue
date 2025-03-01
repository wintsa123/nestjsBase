<template>

    <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />

</template>
<script setup> 

import { useUserStore } from '@/stores/user';

const userStore = useUserStore()
userStore.SetUserInfo()
</script>