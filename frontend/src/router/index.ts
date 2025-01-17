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
    // {
    //   path: '/family-tree',
    //   component: () => import('../views/FamilyTree.vue'),
    //   meta: { requiresAuth: true }
    // }
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
