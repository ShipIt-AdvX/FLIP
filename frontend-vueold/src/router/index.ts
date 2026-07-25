import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'match',
      component: () => import('../pages/MatchPage.vue'),
    },
    {
      path: '/chat/:gameId',
      name: 'chat',
      component: () => import('../pages/ChatPage.vue'),
    },
    {
      path: '/result/:gameId',
      name: 'result',
      component: () => import('../pages/ResultPage.vue'),
    },
  ],
})

export default router
