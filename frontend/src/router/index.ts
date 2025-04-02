import { createRouter, createWebHistory } from 'vue-router'
import { Connection, EditPen, Link, Menu } from '@element-plus/icons-vue'; // 导入 Element Plus 图标组件
import { refreshToken as refreshTokenFn } from "@/api/user/user.ts";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/Home.vue')
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
          path: '/familyTree',
          name: 'familyTree',
          component: () => import('../views/familyTree.vue'),
          meta: {
            nav: true, // 表示该路由需要显示在导航菜单中
            title: '族谱', // 菜单名称
            icon: Connection, // 菜单图标
            sortid: 2,

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
  const refreshToken = localStorage.getItem('refreshToken'); // 获取 Refresh Token

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
          const { data } = await refreshTokenFn(refreshToken);
          if (data.code == 0) {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('refresh_token', data.data.refresh_token);
            localStorage.setItem('tokenExpireTime', data.data.tokenExpireTime);
            next(); // 继续导航

          } else {
            next('/login');
          }
        } catch (error) {
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
