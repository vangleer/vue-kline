import Vue from 'vue'
import Router from 'vue-router'
import Btc from '../views/Btc.vue'
Vue.use(Router)

export default new Router({
  routes:[
    {
      path:'/',
      component: Btc
    }
  ]
})