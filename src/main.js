import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入初始化样式
import './assets/css/base.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
Vue.config.productionTip = false

//时间转换
Vue.filter('toFixed', function(value, decimal = 2) {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  return value && value.toFixed(decimal)
})
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
