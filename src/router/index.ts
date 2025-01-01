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
          meta: { requiresAuth: true },
        },
        {
          path: 'favorites',
          name: 'favorites',
          component: () => import('@/views/weather/FavoritesView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'history',
          name: 'history',
          component: () => import('@/views/weather/HistoryView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/components/profile/ProfileForm.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/auth/LoginView.vue'),
          meta: { requiresAuth: false },
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/auth/RegisterView.vue'),
          meta: { requiresAuth: false },
        },
        {
          path: 'auth/login',
          redirect: '/login',
        },
        {
          path: 'auth/register',
          redirect: '/register',
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  console.log('Navigation Guard:', {
    to: to.fullPath,
    from: from.fullPath,
    requiresAuth,
    isAuthenticated: authStore.isAuthenticated,
  })

  if (requiresAuth && !authStore.isAuthenticated) {
    console.log('Redirecting to login: Auth required')
    next('/login')
  } else if (!requiresAuth && authStore.isAuthenticated) {
    console.log('Redirecting to home: Already authenticated')
    next('/')
  } else {
    console.log('Proceeding with navigation')
    next()
  }
})

export default router
