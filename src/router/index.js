import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
    path: '/signin',
    name: 'signin',
    component: () => import('@/views/auth/SignInView.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router