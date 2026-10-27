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
    path: '/files',
    component: () => import('@/views/files/FilesView.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'files-empty',
        component: () => import('@/views/files/FolderEmptyView.vue')
      },
      {
        path: ':folderId',
        name: 'folder-detail',
        component: () => import('@/views/files/FolderDetailView.vue')
      },
    ]
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/views/admin/UserManageView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
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

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const isAuthenticated = !!authStore.token

  // 로그인 상태에서 /signin 접근 차단
  if (to.name === 'signin' && isAuthenticated) {
    return '/chat'
  }

  // 인증 필요한 라우트 접근 시
  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/signin'
  }

  // 내 정보(id/role)가 없는 기존 세션은 화면 진입 전에 다시 조회
  // (내 메시지 판별, 관리자 메뉴 노출 등에 필요)
  if (to.meta.requiresAuth && authStore.needsProfile) {
    try {
      await authStore.fetchMe()
    } catch {
      // 인증 오류였다면 axios 인터셉터가 이미 로그아웃 처리함
      if (!authStore.isAuthenticated) return '/signin'
    }
  }

  // 관리자 전용 라우트 (실제 권한 검사는 서버에서 수행)
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return '/chat'
  }
})

export default router