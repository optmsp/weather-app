import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import MainLayout from '../layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/weather/FavoritesView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'favorites',
          name: 'favorites',
          component: () => import('@/views/weather/FavoritesView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'history',
          name: 'history',
          component: () => import('@/views/weather/HistoryView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/components/profile/ProfileForm.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('@/components/auth/LoginForm.vue'),
          meta: { requiresAuth: false }
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/components/auth/RegisterForm.vue'),
          meta: { requiresAuth: false }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (!requiresAuth && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
