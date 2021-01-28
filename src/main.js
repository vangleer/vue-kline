import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueI18n from 'vue-i18n'
// 导入初始化样式
import './assets/css/base.css'
Vue.config.productionTip = false
Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'zh',
  messages: {
    'zh': require('./config/zh.js'),
    'en': require('./config/en.js')
  }
})
//时间转换
Vue.filter('toFixed', function(value, decimal = 2) {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  return value && value.toFixed(decimal)
})
new Vue({
  router,
  i18n,
  render: h => h(App),
}).$mount('#app')
