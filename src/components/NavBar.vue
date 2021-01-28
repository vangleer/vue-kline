<template>
  <div class="k-nav-bar" :style="{backgroundColor,color}">
    <div class="k-nav-left">左</div>
    <div class="k-nav-title">K线图</div>
    <div class="k-nav-right">右</div>
  </div>
</template>

<script>
  export default {
    name: 'NavBar',
    props: {
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
    },
    mounted() {
      console.log(this.$slots)
    },
    methods: {
      handleLeftClick() {
        this.$emit('click-left')
      },
      handleRightClick() {
        this.$emit('click-right')
      }
    }
  }

</script>

<style lang="less" scoped>
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
</style>
