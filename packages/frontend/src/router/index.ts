import Chat from '@/pages/Chat.vue'
import Home from '@/pages/Home.vue'
import Result from '@/pages/Result.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: "主页",
      path: "/",
      component: Home
    },
    {
      name: "聊天界面",
      path: "/chat",
      component: Chat
    },
    {
      name: "结果",
      path: "/result",
      component: Result
    }
  ],
})

export default router
