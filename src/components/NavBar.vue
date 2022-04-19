<template>
  <div class="k-nav-bar" :style="{ backgroundColor, color }">
    <div class="k-nav-left"></div>
    <div class="k-nav-title">{{title}}</div>
    <div class="k-nav-right" @click="handleUrlClick">
      <img class="img-icon" src="../assets/imgs/github_icon.png">
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
defineProps({
  title: {
    type: String,
    default: ''
  },
  backgroundColor:{
    type:String,
    default:'#131f31'
  },
  color:{
    type:String,
    default:'#c8cee4'
  }
})

const handleLeftClick = () => this.$emit('click-left')

const handleRightClick = () => this.$emit('click-right')

const handleUrlClick = () => window.open('https://github.com/java0088/vue-kline')

</script>

<style lang="less">
.k-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  height: 50px;
  width: 100vw;
  padding: 0px 50px;
}
.k-nav-title {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
}
.k-nav-left, .k-nav-right {
  position: absolute;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  font-size: 15px;
  font-weight: 500;
}
.k-nav-left {
  left: 0px;
}
.k-nav-right {
  right: 0px;
}
.img-icon {
  width: 22px;
  height: 22px;
}
</style>
