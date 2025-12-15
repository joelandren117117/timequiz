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
      path: '/play',
      name: 'PlayView',  // you may rename based on your logic
      component: () => import('../views/PlayView.vue'),
    },
    {
      path: '/lobby',
      name: 'LobbyView',
      component: () => import('../views/LobbyView.vue'),
    },
    {
      path: '/create',
      name: 'CreateQuizView',
      component: () => import('../views/CreateQuizView.vue'),
    },
    {
      path: '/result',
      name: 'ResultView',
      component: () => import('../views/ResultView.vue'),
    },
    {
      path: '/game',
      name: 'GameView',
      component: () => import('../views/GameView.vue'),
    },
    {
      path: '/host',
      name: 'HostView',
      component: () => import('../views/HostView.vue'),
    },
    {
      path: '/maps-preview',
      name: 'MapsPreview',
      component: () => import('../views/MapsPreviewView.vue'),
    },
  ]
})

export default router
