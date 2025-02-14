<template>

  <el-container style="height: 100vh">
    <!-- 左侧边栏 -->
    <el-aside :width="!isCollapse ? '64px' : '200px'" style="  overflow: hidden; /* 允许滚动 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 和 Edge */">
      <el-container style=" height:100vh">
        <el-header style=" padding: 0;height:auto;flex:1">
          <div>
            <RouterLink to="/">

              <div class="flex items-center justify-center">

                <img src="../../assets/logo.svg" alt="Logo" class=" h-auto mr-2" :style="{ width: '4em' }">
                <transition name="fade">

                  <h2 :class="{ 'fade-in': !isRender }" class="  font-bold text-xl m-0" v-if="isRender">
                    电子族谱
                  </h2>
                </transition>
              </div>

            </RouterLink>
          </div>
        </el-header>
        <el-main style=" padding: 0;overflow: hidden; /* 允许滚动 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;flex:18">
          <el-menu :default-active="activeMenu" router unique-opened style="height: 100%" :collapse="!isCollapse"
            :collapse-transition="false">
            <!-- 递归渲染菜单项 -->
            <menu-item v-for="item in menuItems" :key="item.path" :item="item" />
          </el-menu>
        </el-main>
        <el-footer style=" padding: 0;display: flex;justify-content: center;flex:2">
          <transition name="collapse-transition" mode="out-in">
            <collapse-button-r v-if="!isCollapse" v-model:isCollapse="isCollapse" key="right" />
            <collapse-button-l v-else v-model:isCollapse="isCollapse" key="left" />
          </transition>
        </el-footer>
      </el-container>
    </el-aside>
    <el-container>
      <el-scrollbar max-height="100vh" style="width: 100%;">

        <el-header style="text-align: right">
          <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
        </el-header>
        <!-- 主内容区域 -->
        <el-main style="  overflow: hidden; /* 允许滚动 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 和 Edge */">
          <router-view />
        </el-main>
      </el-scrollbar>

    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useMenuStore } from '@/stores/nav';
import { useRoute } from 'vue-router';
import MenuItem from '@/components/MenuItem/MenuItem.vue'; // 引入递归组件
import CollapseButtonR from '@/components/CollapseButton/CollapseButtonR.vue'; // 引入递归组件
import CollapseButtonL from '@/components/CollapseButton/CollapseButtonL.vue'; // 引入递归组件

// 获取当前路由
const route = useRoute();
const handleOpen = (key, keyPath) => {
  console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}
// 获取 Pinia Store 中的菜单数据
const menuStore = useMenuStore();
const { menuItems, isCollapse } = toRefs(menuStore);

// 动态设置当前激活的菜单项
const activeMenu = computed(() => route.path);
const isRender = ref(isCollapse.value);    // 控制是否渲染 h2
console.log(isRender)
watch(isCollapse, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      isRender.value = true;

    }, 400);  // 延迟 500ms 渲染
  } else {
    isRender.value = false;
  }
});
// 在组件挂载时生成菜单
onMounted(() => {
  menuStore.generateMenuFromRoutes();
  console.log(menuItems);
});
</script>

<style scoped>
.el-aside ul {
  border-right: none;
  background-color: var(--background-color);
}


.fade-leave-active {
  transition: opacity 0.1s, transform 0.1s;
}

.fade-enter-active {
  transition: opacity 1s, transform 1s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
  /* 可选：添加位移效果 */
}

/* 进入/离开过渡 */
.collapse-transition-enter-active,
.collapse-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 进入开始/离开结束状态 */
.collapse-transition-enter-from,
.collapse-transition-leave-to {
  opacity: 0;
  transform: translateX(20px);
  /* 向右偏移 */
}

/* 进入结束/离开开始状态 */
.collapse-transition-enter-to,
.collapse-transition-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.el-menu {
  will-change: auto;
}

.el-aside {
  
  transition: width 0.3s;
  -webkit-transition: width 0.3s;
  -moz-transition: width 0.3s;
  -webkit-transition: width 0.3s;
  -o-transition: width 0.3s;
  will-change: auto;
  

}
</style>