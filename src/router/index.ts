import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/Home.vue' // You'll need to create this component

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    }
  ]
})

export default router