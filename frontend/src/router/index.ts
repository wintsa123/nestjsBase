import { createRouter, createWebHistory } from 'vue-router'

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
      path: '/development-plan',
      component: () => import('../views/DevelopmentPlan.vue'),
      // meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      component: () => import('../layout/components/Admin.vue'),
      // meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: {
        nav: true, // 表示该路由需要显示在导航菜单中
        title: '仪表盘', // 菜单名称
        icon: 'el-icon-menu', // 菜单图标
      },
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
router.beforeEach((to:any, _from:any, next:any) => {
  const isAuthenticated = localStorage.getItem('token')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
