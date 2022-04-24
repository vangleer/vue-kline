<template>
  <div class="k-tab-bar" :style="{ backgroundColor, color }" :class="{ border: border }">
    <div class="k-tab-bar-item" 
      v-for="(item, index) in list" :key="index" 
      :style="{ color: index === modelValue ? activeColor: color }"
      @click="handleItemClick(item, index)"
    >
      <span class="k-icon" :class="[index === modelValue ? item.activeIcon: item.icon]"></span>
      <span class="k-tab-text">{{ item.cnName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
defineProps({
  modelValue:{
    type: Number,
    default: 0
  },
  backgroundColor:{
    type:String,
    default:'#fff'
  },
  color:{
    type:String,
    default:'#6b809b'
  },
  list:{
    type:Array,
    default:()=>[]
  },
  activeColor: {
    type:String,
    default:'#54c6b7'
  },
  border:{
    type:Boolean
  }
})
const emit = defineEmits(['update:modelValue'])
const router = useRouter()
const handleItemClick = (item, index) => {
  console.log(item, index)
  router.push(`/?type=${ index }&name=${ item.name }&enName=${ item.enName }`)
  emit('update:modelValue', index)
}
</script>

<style lang="less">
.k-tab-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  display: flex;
  width: 100vw;
  height: 50px;
}
.k-icon {
  font-size: 18px;
}
.k-tab-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.k-tab-icon {
  width: 22px;
  height: 22px;
}
.k-tab-text {
  font-size: 14px;
  margin-top: 4px;
}
.border {
  border-top: 1px solid #eee;
}
</style>
