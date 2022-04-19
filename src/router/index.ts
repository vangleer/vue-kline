import { createRouter, Router, RouteRecordRaw, createWebHashHistory } from 'vue-router'
import Index from '../views/index.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path:'/',
    component: Index
  }
]
const router: Router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router