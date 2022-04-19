<template>
  <div class="app-container" :style="{ backgroundColor: state.bgColor }">
    <!-- 头部 -->
    <NavBar :title="state.title" :background-color="state.bgColor"/>

    <!-- 路由组件 -->
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <!-- 底部导航 -->
    <TabBar v-model="state.active" :list="state.tabList" :background-color="state.bgColor" />
  </div>
</template>

<script setup lang="ts">
import { watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import TabBar from './components/TabBar.vue'
import { bgColors } from './config/index'
const state = reactive({
  tabList:[
    { id:0, cnName:'比特币', name:'btcusdt', enName:'BTC', icon:'k-icon-btc-o', activeIcon:'k-icon-btc' },
    { id:1, cnName:'以太坊', name:'ethusdt', enName:'ETH', icon:'k-icon-eth-o', activeIcon:'k-icon-eth' },
    { id:2, cnName:'柚子币', name:'eosusdt', enName:'EOS', icon:'k-icon-eos-o', activeIcon:'k-icon-eos' }
  ],
  active: 0,
  bgColor: bgColors[0],
  title: 'K线图-BTC/USDT'
})
const router = useRouter()
const route = useRoute()
watch(() => router.currentRoute.value, to => {
  let index = +to.query.type || 0
  state.active = index
  state.title = `K线图-${ to.query.enName || 'BTC' }/USDT`
  state.bgColor = bgColors[index]
})

</script>

<style lang="less">
.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
