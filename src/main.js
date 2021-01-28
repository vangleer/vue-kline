import Vue from 'vue'
import App from './App.vue'
// 导入初始化样式
import './assets/css/base.css'
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
