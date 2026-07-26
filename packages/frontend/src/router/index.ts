import Chat from '@/pages/Chat.vue'
import Home from '@/pages/Home.vue'
import Result from '@/pages/Result.vue'
import Circle from '@/pages/Circle.vue'
import Profile from '@/pages/Profile.vue'
import Admin from '@/pages/Admin.vue'
import Mbti from '@/pages/Mbti.vue'
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
    },
    {
      name: "交友圈",
      path: "/circle",
      component: Circle
    },
    {
      name: "个人资料",
      path: "/profile",
      component: Profile
    },
    {
      name: "管理控制台",
      path: "/admin",
      component: Admin
    },
    {
      name: "MBTI详解",
      path: "/mbti",
      component: Mbti
    }
  ],
})

export default router
