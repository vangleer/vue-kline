<template>
  <div id="app">
    <!-- 头部 -->
    <nav-bar title="K线图"/>

    <!-- 路由组件 -->
    <keep-alive>
      <router-view />
    </keep-alive>
    <!-- 底部导航 -->
    <tab-bar v-model="active" :list="tabList" />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import TabBar from './components/TabBar.vue'
export default {
  name: 'App',
  components: {
    NavBar,
    TabBar
  },
  data() {
    return {
      tabList:[
        {id:0,cnName:'比特币',name:'btcusdt',enName:'BTC',img:require('./assets/imgs/btc_normal.png'),activeImg:require('./assets/imgs/btc_active.png')},
        {id:1,cnName:'以太坊',name:'ethusdt',enName:'ETH',img:require('./assets/imgs/eth_normal.png'),activeImg:require('./assets/imgs/eth_active.png')},
        {id:2,cnName:'柚子币',name:'eosusdt',enName:'EOS',img:require('./assets/imgs/eos_normal.png'),activeImg:require('./assets/imgs/eos_active.png')},
      ],
      active:0
    }
  }
}
</script>

<style lang="less">
  #app {
    overflow: hidden;
  }
</style>
