import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/signin',
    name: 'signin',
    component: () => import('@/views/auth/SignInView.vue')
  },
  {
    path: '/',
    redirect: '/chat'
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('@/views/chat/ChatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/chat'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = !!authStore.token

  // 로그인 상태에서 /signin 접근 차단
  if (to.path === '/signin' && isAuthenticated) {
    return next('/chat')
  }

  // 로그인 필요 페이지 접근 시 인증 체크
  if (to.path !== '/signin' && !isAuthenticated) {
    return next('/signin')
  }

  next()
})

export default router