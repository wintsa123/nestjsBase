import { createRouter, createWebHistory } from 'vue-router'
import { Connection, EditPen, Link, Menu } from '@element-plus/icons-vue'; // 导入 Element Plus 图标组件

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
      path: '/admin',
      component: () => import('../layout/components/Admin.vue'),
      
        children: [
          {
            path: '/dashboard',
            name: 'Dashboard',
            component: () => import('../views/Dashboard.vue'),
            meta: {
              nav: true, // 表示该路由需要显示在导航菜单中
              title: '仪表盘', // 菜单名称
              icon: Menu , // 菜单图标
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
              icon: Connection , // 菜单图标
              sortid: 2,
      
            },
          },
          {
            path: '/development-plan',
            component: () => import('../views/DevelopmentPlan.vue'),
            meta: {
              nav: true, // 表示该路由需要显示在导航菜单中
              title: '开发计划', // 菜单名称
              icon: EditPen , // 菜单图标
              sortid: 4,
      
            },
          },
        ]
      
      // meta: { requiresAuth: true }
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
