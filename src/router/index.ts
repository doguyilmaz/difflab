import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/compare',
      name: 'compare',
      component: () => import('@/views/CompareView.vue'),
      children: [
        {
          path: '',
          redirect: '/compare/key'
        },
        {
          path: 'key',
          name: 'compare-key',
          component: () => import('@/views/KeyComparisonView.vue')
        },
        {
          path: 'diff',
          name: 'compare-diff', 
          component: () => import('@/views/DiffComparisonView.vue')
        }
      ]
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue')
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/views/HistoryView.vue')
    }
  ],
})

export default router
