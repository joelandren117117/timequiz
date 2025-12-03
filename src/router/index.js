import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
    },
    {
      path: '/poll/:id',
      name: 'PlayView',  // you may rename based on your logic
      component: () => import('../views/PlayView.vue'),
    },
    {
      path: '/lobby/:id',
      name: 'LobbyView',
      component: () => import('../views/LobbyView.vue'),
    },
    {
      path: '/create/',
      name: 'CreateQuizView',
      component: () => import('../views/CreateQuizView.vue'),
    },
    {
      path: '/result/:id',
      name: 'ResultView',
      component: () => import('../views/ResultView.vue'),
    },
    {
      path: '/game/:id',
      name: 'GameView',
      component: () => import('../views/GameView.vue'),
    },
    {
      path: '/host/:id',
      name: 'HostView',
      component: () => import('../views/HostView.vue'),
    }
  ]
})

export default router
