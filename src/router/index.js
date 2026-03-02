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
    path: '/game',
    component: () => import('@/views/game/GameView.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: 'dodge'
      },
      {
        path: 'dodge',
        name: 'dodge',
        component: () => import('@/views/game/DodgeView.vue')
      },
      {
        path: 'grid-rush',
        name: 'grid-rush',
        component: () => import('@/views/game/GridRushView.vue')
      },
    ]
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
  if (to.name === 'signin' && isAuthenticated) {
    return next('/chat')
  }

  // 인증 필요한 라우트 접근 시
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/signin')
  }

  next()
})

export default router