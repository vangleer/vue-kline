import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
// 导入初始化样式
import './assets/css/base.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
createApp(App).use(router).mount('#app')
