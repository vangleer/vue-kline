<template>
  <div class="k-tab-bar" :style="{backgroundColor,color}" :class="{border:border}">
    <div class="k-tab-bar-item" 
      v-for="(item,index) in list" :key="index" 
      :style="{color:index===parseInt(value) ? activeColor:color}"
      @click="handleItemClick(item,index)"
    >
      <img class="k-tab-icon" :src="index===parseInt(value)?item.activeImg:item.img" alt="">
      <span class="k-tab-text">{{item.cnName}}</span>
    </div>
  </div>
</template>

<script>
export default {
 
  props:{
      value:{
        type: [String, Number],
        default: 0
      },
      backgroundColor:{
        type:String,
        default:'#fff'
      },
      color:{
        type:String,
        default:'#131f31'
      },
      list:{
        type:Array,
        default:()=>[]
      },
      activeColor: {
        type:String,
        default:'#1989fa'
      },
      border:{
        type:Boolean
      }
  },
  data() {
    return {
    }
  },
  methods:{
    handleItemClick(item,index) {
      this.$emit('input',index)
    }
  }
}
</script>

<style lang="less" scoped>
  .k-tab-bar {
    position: fixed;
    right: 0;
    bottom: 0;
    display: flex;
    width: 100vw;
    height: 50px;
  }
  .k-tab-bar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .k-tab-icon {
    width: 22px;
    height: 22px;
  }
  .k-tab-text {
    font-size: 15px;
    margin-top: 4px;
  }
  .border {
    border-top: 1px solid #eee;
  }
</style>