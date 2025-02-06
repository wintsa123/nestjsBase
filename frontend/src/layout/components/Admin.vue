<template>

  <el-container style="height: 100vh">
    <!-- 左侧边栏 -->
    <el-aside width="200px" style="  overflow: hidden; /* 允许滚动 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 和 Edge */">
      <RouterLink to="/">
        <div class="flex items-center">
          <img src="../../assets/logo.svg" alt="Logo" class="w-[100px] h-auto mr-2">
          <h2 class="font-bold text-xl m-0">
            电子族谱
          </h2>
        </div>

      </RouterLink>

      <el-scrollbar max-height="100vh">

        <el-menu :default-active="activeMenu" router unique-opened style="height: 100vh" :collapse="isCollapse"
    @open="handleOpen"
    @close="handleClose">
          <!-- 递归渲染菜单项 -->
          <menu-item v-for="item in menuItems" :key="item.path" :item="item" />
        </el-menu>
      </el-scrollbar>
    </el-aside>
    <el-container>

      <el-header>Header</el-header>

      <!-- 主内容区域 -->
      <el-main style="  overflow: hidden; /* 允许滚动 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 和 Edge */">
          <el-scrollbar max-height="100vh">

        <router-view />
      </el-scrollbar>

      </el-main>
    </el-container>

  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMenuStore } from '@/stores/nav';
import { useRoute } from 'vue-router';
import MenuItem from '@/components/MenuItem/MenuItem.vue'; // 引入递归组件

// 获取当前路由
const route = useRoute();
const isCollapse = ref(false)
const handleOpen = (key , keyPath) => {
  console.log(key, keyPath)
}
const handleClose = (key , keyPath) => {
  console.log(key, keyPath)
}
// 获取 Pinia Store 中的菜单数据
const menuStore = useMenuStore();
const { menuItems } = toRefs(menuStore);

// 动态设置当前激活的菜单项
const activeMenu = computed(() => route.path);

// 在组件挂载时生成菜单
onMounted(() => {
  menuStore.generateMenuFromRoutes();
  console.log(menuItems);
});
</script>

<style scoped>
/* .el-aside {
    background-color: #304156;
    color: #fff;
  }


  .el-menu {
    border-right: none;
  } */
.el-aside ul {
  border-right: none;
  background-color: var(--background-color);
}
</style>