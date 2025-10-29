<template>

  <el-container style="height: 100vh">
    <!-- 左侧边栏 -->
    <el-aside :width="!isCollapse ? '64px' : '200px'" style="  overflow: hidden; /* 允许滚动 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE 和 Edge */">
      <el-container style=" height:100vh">
        <el-header style="   padding: 1rem 0 ;height:auto;flex:1">
          <div>
            <RouterLink to="/">

              <div class="flex items-center justify-center">

                <img src="../../assets/logo.svg" alt="Logo" class=" h-auto mr-2" :style="{ width: '4em' }">
                <transition name="fade">

                  <h2 :class="{ 'fade-in': !isRender }" class="  font-bold text-xl m-0" v-if="isRender">
                    众为Ai文档
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

        <el-header style=" padding: 1rem  
">
  <el-space wrap :size="5">

          <el-button :icon="Search" size="large" circle />


          <el-dropdown @command="handleCommand">
            <IconAvator v-once />

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item class="user-menu-item">
                  <!-- 图标缓存优化 -->
                  <IconAvator class="user-avatar" v-once />

                  <!-- 使用计算属性减少模板逻辑 -->
                  <div class="user-info">
                    <div class="role-text">
                      {{ roleDisplayName }}
                    </div>
                    <div class="username-text">
                      {{ data.realname }}
                    </div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item icon="User" divided command="user">
                  <div class="dropdownInfo">
                    <div>个人信息</div>
                  </div>


                </el-dropdown-item>
                <el-dropdown-item icon="QuestionFilled" command="help">
                  <div class="dropdownInfo">
                    帮助文档 </div>
                </el-dropdown-item>
                <el-dropdown-item divided command="logout"> <el-button type="danger">退出登录 <el-icon>
                      <SwitchButton />
                    </el-icon>
                  </el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          </el-space>
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
import IconAvator from '@/components/IconAvator/IconAvator.vue'; // 引入递归组件
import { storeToRefs } from 'pinia';
import { logout, userInfo } from "@/api/user/user";
import { useUserStore } from '@/stores/user';

const { data, onSuccess, loading } = useRequest(userInfo, {
  initialData() {
    // 设置上一次的响应数据
    const storedData = localStorage.getItem('userInfo');
    return JSON.parse(storedData == '' || `{"avator":null,"realname":""}`);


  }


}).onSuccess(({ data, method }) => {
  console.log(data, 'userInfo')
  localStorage.setItem('userInfo', JSON.stringify(data));

})
// 计算属性优化
const roleDisplayName = computed(() =>
  data.role === 'ADMIN' ? '一家之主' : '用户'
)
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
const { menuItems, isCollapse } = storeToRefs(menuStore);
// 动态设置当前激活的菜单项
const activeMenu = computed(() => route.path);
const isRender = ref(isCollapse.value);    // 控制是否渲染 h2
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

});

const handleCommand = async (command) => {
  switch (command) {
    case 'user':

      break;
    case 'help':

      break;
    case 'logout':
      await logout()
      break;

    default:
      break;
  }
}
</script>

<style scoped>
.user-menu-item {
  min-width: 160px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  /* 现代浏览器间距方案 */
}

.user-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  /* 防止图标被压缩 */
}

.user-info {
  flex: 1;
  min-width: 0;
  /* 防止文本溢出 */
}

.role-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-color-primary);
  text-align: center;
  line-height: 1.4;
}

.username-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
  line-height: 1.4;
  opacity: 0.9;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .user-avatar {
    width: 32px;
    height: 32px;
  }

  .role-text {
    font-size: 13px;
  }
}

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

.el-menu-item.is-active {
  background: linear-gradient(-72.47deg, rgb(var(--v-theme-primary)) 22.16%, rgba(var(--v-theme-primary), .7) 76.47%) !important;
  /* background-color: var(--el-menu-active-color); */
  color: var(--elcolor-on-primary);
  border-radius: 0 3.125rem 3.125rem 0 !important;
  box-shadow: 0 4px 14px -4px var(--v-shadow-key-umbra-opacity), 0 4px 8px -4px var(--v-shadow-key-penumbra-opacity), 0 4px 8px -4px var(--v-shadow-key-ambient-opacity);
}

.el-menu.el-menu--vertical .el-menu-item {
  block-size: 2.825rem !important;
  border-end-end-radius: 3.125rem !important;
  border-end-start-radius: 0 !important;
  border-start-end-radius: 3.125rem !important;
  border-start-start-radius: 0 !important;
  transition: margin-inline .15sease-in-out;
  will-change: margin-inline;
}

.dropdownInfo {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-dropdown-menu__item) {
  padding: 5px 25px;

}
</style>