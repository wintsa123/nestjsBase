import { createRouter, createWebHistory } from 'vue-router'
import { EditPen, DocumentCopy, Menu } from '@element-plus/icons-vue'; // 导入 Element Plus 图标组件
import { refreshToken as refreshTokenFn } from "@/api/user/user.ts";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      component: () => import('../views/Register.vue')
    },

    {
      path: '/dashboard',
      //@ts-ignore
      component: () => import('../layout/components/Admin.vue'),

      children: [
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue'),
          meta: {
            nav: true, // 表示该路由需要显示在导航菜单中
            title: '仪表盘', // 菜单名称
            icon: Menu, // 菜单图标
            sortid: 1,
          },
        },
        {
          path: '/fileManager',
          name: 'fileManager',
          component: () => import('../views/FileManager.vue'),
          meta: {
            nav: true, // 表示该路由需要显示在导航菜单中
            title: '文档管理', // 菜单名称
            icon: DocumentCopy, // 菜单图标
            sortid: 1,
          },
        },
        {
          path: '/development-plan',
          component: () => import('../views/DevelopmentPlan.vue'),
          meta: {
            nav: true, // 表示该路由需要显示在导航菜单中
            title: '开发计划', // 菜单名称
            icon: EditPen, // 菜单图标
            sortid: 4,

          },
        },
      ],

      meta: { requiresAuth: true }
    },


    // {
    //   path: '/settings',
    //   name: 'Settings',
    //   component: () => import('@/views/Settings.vue'),
    //   meta: {
    //     nav: true,
    //     title: 'Settings',
    //     icon: 'el-icon-setting',
    //   },

    // },
  ]
})

// Navigation guard
router.beforeEach(async (to: any, _from: any, next: any) => {
  const accessToken = localStorage.getItem('token'); // 获取 Access Token
  const refreshToken = localStorage.getItem('refresh_token'); // 获取 Refresh Token

  if (to.meta.requiresAuth) {
    if (!accessToken) {
      // 如果没有 Access Token，跳转到登录页
      next('/login');
    } else {
      // 检查 Access Token 是否过期
      const tokenExpireTime = localStorage.getItem('tokenExpireTime');
      if (!tokenExpireTime || parseInt(tokenExpireTime) < Math.floor(Date.now() / 1000)) {
        try {
          // 使用 Refresh Token 获取新的 Access Token
          const data = await refreshTokenFn(refreshToken);
          debugger
          localStorage.setItem('token', data.token);
          localStorage.setItem('refresh_token', data.refresh_token);
          localStorage.setItem('tokenExpireTime', data.tokenExpireTime);

          next(); // 继续导航


        } catch (error) {
          debugger
          // 刷新 Token 失败，跳转到登录页
          next('/login');
        }
      } else {
        next(); // Access Token 有效，放行
      }
    }
  } else {
    next()
  }
})

export default router
