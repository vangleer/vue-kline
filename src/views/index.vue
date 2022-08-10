<template>
<div class="content">
  <div class="data-box">
    <div class="left">
      <!-- 仅供展示 -->
      <h3>{{ toFixed(state.titleCal.end_price, 4) }}</h3>
      <div class="rate">≈{{ toFixed(state.titleCal.end_price, 4) }}CNY</div>
    </div>
  </div>
  <!-- 导航按钮 -->
  <div class="nav-box">
    <div 
      class="item" 
      :class="state.currentNav === index ? 'active' : ''" 
      v-for="(item, index) in navList" :key="index"
      @click="handleNavClick(index, item.opt)">
      {{ item.text }}
    </div>
  </div>

  <div 
    class="chart-box" 
    :style="{ backgroundImage:'url('+ bgImg +')' }" 
    @click.stop="handleChartClick($event)">

      <div class="top">
        <span 
          class="yellow-color" 
          :style="{ color: item.color }" 
          v-for="(item, index) in state.postTop"
          :key="index">
          {{ item.name }}:{{ toFixed(item.value) }}
        </span>
      </div>

      <div class="middle">
        <span 
          class="base-color" 
          v-for="(item, index) in state.chengJiao" 
          :key="index"
          :style="{ color: item.color }">
          {{ item.name }}:{{ toFixed(item.value) }}
        </span>
      </div>

      <!-- 数据显示栏 -->
      <div 
        v-show="state.showTool" 
        class="tool-box" 
        :class="state.dataPos ? 'pos-right' : 'pos-left'">
        <p v-for="(item, index) in state.toolList1" :key="index">
          <template v-if="index===5">
            <span>{{ item.name }}</span>
            <span :class="item.value >= 0 ? 'color_green' : 'color_red'">{{ toFixed(item.value) }}</span>
          </template>
          <template v-else-if="index===6">
            <span>{{ item.name }}</span>
            <span :class="item.value >= 0 ? 'color_green' : 'color_red'">{{ toFixed(item.value) }}%</span>
          </template>
          <template v-else>
            <span>{{ item.name }}</span>
            <span>{{ toFixed(item.value) }}</span>
          </template>
        </p>
      </div>
      <!-- 图表 -->
      <div class="chart"  ref="chartBoxRef"></div>
    </div>
</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import pako from 'pako'
import { navList, huobiWsUrl, colors } from '../config'
import { toFixed, getFormatDate } from '../utils/utils'
import utils from '../utils/utils'
import bgImg from '../assets/imgs/bg2.png'
import * as echarts from 'echarts'
const state = reactive({
  usdtPrice: 8, // https://api.huobiasia.vip/market/tickers 可以调用这个借口获取，这里默认为8
  currentNav: 0,
  currencyInfo: { name: 'btcusdt', enName: 'BTC' } as any,
  showFenshiBox: false,
  dataPos: false,
  toolList1: [],
  postTop: [],
  postMiddle: [],
  chengJiao: [],
  showTool: false,
  chartData: [],
  titleCal: {} as any,
  interval: null,
  flag: false,
    // K 线相关
  haurl: huobiWsUrl,
  requestK: {req: 'market.eosusdt.kline.1min'},
  subK:{sub: 'market.eosusdt.kline.1min'},
  socketK: {} as any,
  chartOtherData:[],
  Zstart: 100,
  Zend: 90
})
const chartBoxRef = ref(null)
const route = useRoute()
watch(() => route.query, query => {
  // 离开页面关闭连接
  if(state.socketK.close) state.socketK.close()
  window.clearInterval(state.interval)
  state.currencyInfo = query
    // 更改k线图请求接口
  state.requestK.req = `market.${state.currencyInfo.name}.kline.1min`
  state.subK.sub = `market.${state.currencyInfo.name}.kline.1min`
  // 异步展示k线图
  setTimeout(()=>{
    // 初始化websoket
    // K线图websoket连接
    handleInitWebsoket()
    handleNavClick(0,'1min')
  }, 1000)
})

const handleNavClick = (index, opt) => {
  const { name } = state.currencyInfo
  console.log(name, 'namenamenamenamenamename')
  if(index !== 0) {
    state.Zstart = 90
    state.Zend = 80
  }
  state.chartData = []
  state.chartOtherData = []
  if(state.socketK.close) {
    state.socketK.close()
  }
  clearTimeout(state.interval)
  state.currentNav = index;
  state.requestK.req = `market.${name}.kline.${opt}`
  state.subK.sub = `market.${name}.kline.${opt}`
  handleInitWebsoket()
  setTimeout(()=>{
    draw()
  },1000)
}

function handleInitWebsoket() {
  let self = state
  self.socketK = new WebSocket(self.haurl)
  self.socketK.onopen = function() {
    self.socketK.send(JSON.stringify(self.subK))
    self.socketK.send(JSON.stringify(self.requestK))
  }
  self.socketK.onmessage = function(event) {
    let blob = event.data
    let reader: any = new FileReader()
    reader.onload = function(e: any) {
      let ploydata = new Uint8Array(e.target.result)
      let msg = pako.inflate(ploydata, { to: 'string' })
      handleData(msg)
    }
    reader.readAsArrayBuffer(blob, 'utf-8')
  }
}

function handleData(msg) {
  let data = JSON.parse(msg)

  if(data.ping) {
    state.socketK.send(JSON.stringify({pong: data.ping}))
  }else if(data.status=='ok' && data.data) {
    if(state.chartOtherData.length < 10) {
        state.chartOtherData = data.data
        let arr = []
        const info = state.chartOtherData
        for (let i = 0; i < info.length-1 ; i++) {
          if (i === info.length-1) {
            let el = info[i]
            state.titleCal = {
              cny:8*el.close,
              end_price:el.close,
              max_price:el.high,
              min_price:el.low,
              num:el.count,
              per:(el.close-el.open)/el.open,
              start_price:el.open,
              ud_price:8
            }
          }
          let el: any = info[i]
          el.time = getFormatDate(el.id)
          let arr2 = [el.time, el.open, el.close, el.low, el.high, el.vol]
          arr.push(arr2)
        }
        state.chartData = arr
    }
  }else if(data.tick) {
    const el = data.tick
    state.titleCal = {
      cny:8,
      end_price:el.close,
      max_price:el.high,
      min_price:el.low,
      num:el.count,
      per:(el.close-el.open)/el.open,
      start_price:el.open,
      ud_price:8
    }
    el.time = getFormatDate(el.id)
    let arr2 = [el.time, el.open, el.close, el.low, el.high, el.vol]
    let lastDate = state.chartData[state.chartData.length - 1] && state.chartData[state.chartData.length-1][0]
    let flag = arr2[0] && arr2[0] == lastDate
    if(flag) {
      state.chartData.splice(state.chartData.length-1,1,arr2)
    }
    if (!flag) {
      state.chartOtherData.push(data.tick)
      state.chartData.push(arr2)
      state.chartData.shift()
    }
  }
}
// 发送pong
function sendHeartMessage(ping) {
  state.socketK.send(JSON.stringify({ pong: ping }))
}

// 点击k线图
function handleChartClick(e) {
  state.showTool = true
  const chartBox = chartBoxRef.value
  const pos = chartBox.offsetWidth / e.clientX
  if (pos > 2) {
    state.dataPos = true
  } else {
    state.dataPos = false
  }
}

function draw() {
  const self = state
  let myChart = echarts.init(chartBoxRef.value)
  // 绿色、红色、紫色、浅蓝、深蓝、黄色
  let data = utils.splitData(state.chartData)
  console.log(data, 'datadatadata')
  let Zstart = self.Zstart
  let Zend = self.Zend

  const option = {
    tooltip: {
      show: true,
      trigger: "axis",
      triggerOn: "mousemove|click",
      confine: true,
      axisPointer:{
        type:'line',
          crossStyle: {
          color: '#6b809b',
          width:1
        },
        lineStyle: {
          width: 6,
          color: 'rgba(201,219,246,0.3)'
        },
      },
      formatter: function (params) {
        if (params.length > 0) {
          // 格式化数据
          const {toolList1,postTop,chengJiao} = utils.postSelect(params,colors)
          self.toolList1 = toolList1
          self.postTop = postTop
          self.chengJiao = chengJiao
        }
      }
    },
    xAxis: [
      {
        show: false,
        scale: true,
        nameGap: 15,
        gridIndex: 0,
        splitNumber: 0,
        axisLine: {
          lineStyle: {
            color: "#4a657a"
          }
        },
        splitLine: {
          show: false,
          lineStyle: {
            color: colors[4],
            width: 1,
            type: "solid"
          }
        },
        axisLabel: {
          show: false
        },
        axisTick: {
          show: false
        },
        data: data.times,
        axisPointer: {
          label: {
            show: false
          }
        } //主图禁用下标显示
      },
      {
        show: false,
        scale: false,
        nameGap: 15,
        gridIndex: 1,
        splitNumber: 5,
        axisLabel: {
          show: false
        },
        axisTick: {
          show: false
        },
        data: data.times,
        axisPointer: {
          label: {
            show: false
          }
        } //附图1禁用下标显示
      },
      {
        show: true,
        scale: true,
        gridIndex: 2,
        axisLine: {
          lineStyle: {
            color: "transparent"
          }
        },
        axisLabel: {
          textStyle: {
            color: "#4a657a",
          }
        },
        data: data.times
      },
      {
        gridIndex: 3,
        show: false,
        type: "value"
      }
    ],
    yAxis: [{
        position: "right",
        show: true,
        scale: true,
        gridIndex: 0,
        axisLine: {
          lineStyle: {
            color: "rgba(0,0,0,0)",
          }
        },
        axisTick: {
          show: false
        },
        minorTick: {
          show: false
        },
        nameTextStyle:{
          width:'200px'
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: colors[4]
          }
        },
        //网格样式
        splitLine: {
          show: false,
          lineStyle: {
            color: colors[4],
            width: 1,
            type: "solid"
          }
        }
      },
      {
        position: "right",
        gridIndex: 1,
        show: false,
        splitNumber: 2,
        axisLine: {
          lineStyle: {
            color: "#4a657a"
          }
        },
        axisLabel: {
          textStyle: {
            color: "#4a657a"
          }
        },
        splitLine: {
          show: false
        }
      },
      {
        position: "right",
        gridIndex: 2,
        show: false,
        splitNumber: 3,
        offset:10,
        max: function (value) {
          return value.max + 0.0096;
        },
        axisLine: {
          lineStyle: {
            color: "#4a657a"
          }
        },
        axisLabel: {
          textStyle: {
            color: "#4a657a"
          }
        },
        splitLine: {
          "show": false,
          "lineStyle": {
            "color": '4a657a',
            "type": 'dashed'
          }
        }
      },
    ],
    dataZoom: [{
        show: false,
        type: "inside",
        start: Zstart,
        end: Zend,
        xAxisIndex: [0, 0]
      },
      {
        show: false,
        type: "slider",
        start: Zstart,
        end: Zend,
        xAxisIndex: [0, 1]
      },
      {
        show: false
      }
    ],
    axisPointer: {
      show: true,
      type: "line",
      label: {
        show: true
      },
      link: [{
        xAxisIndex: [0,1],
      }]
    },
    series: [{
        type: "candlestick",
        name: "K",
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: data.datas,
        markLine: {
          "symbol": "",
          data: [{
            "yAxis": data.datas && data.datas.length ? data.datas[data.datas.length - 1][1] : [],
            label: {
              position: "end",
              padding: 0,
            },
            lineStyle: {
              type: "dashed",
              color: "#347bef",
            }
          }]
        },
        itemStyle: {
          color: colors[0],
          color0: colors[1],
          borderColor: colors[0],
          borderColor0: colors[1]
        }
      },
      {
        type: "line",
        name: 'MA5',
        data: utils.calculateMA(data,5),
        "smooth": 0.5,
        symbol: "circle",
        showSymbol: false,
        lineStyle: {
          color: colors[5],
          width: 1.5
        },
        itemStyle: {
          color: colors[5],
          borderWidth: 12,
          borderColor: "rgba(255,255,255,0.3)"
        }
      },
      {
        type: "line",
          "smooth": 0.9,
        symbol: "circle",
          name: 'MA10',
        data: utils.calculateMA(data,10),
        showSymbol: false,
        symbolSize: 2,
        lineStyle: {
          color: colors[0],
          width: 1.5
        },
        itemStyle: {
          color: colors[0],
          borderWidth: 12,
          borderColor: "rgba(255,255,255,0.3)"
        },
      },
      {
        type: "line",
        name: 'MA15',
        data: utils.calculateMA(data,15),
          "smooth": 0.9,
        symbol: "circle",
        showSymbol: false,
        symbolSize: 2,
        lineStyle: {
          color: colors[2],
          width: 1.5
        },
        tooltip: {
          backgroundColor: "transparent"
        },
        itemStyle: {
          color: colors[2],
          borderWidth: 12,
          borderColor: "rgba(255,255,255,0.3)"
        }
      },
      {
        type: "line",
        name: 'MA10',
          xAxisIndex: 1,
        yAxisIndex: 1,
        data: utils.calculateMA(data,10),
        symbol:'none',
        lineStyle:{
            color:'rgba(0,0,0,0)'
        }
      },
        {
        type: "line",
        name: 'MA5',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: utils.calculateMA(data,5),
        symbol:'none',
        lineStyle:{
          color:'rgba(0,0,0,0)'
        }
      },
      {
        type: "bar",
        name: '成交量',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: data.vols,
        barCategoryGap: '20%',
        itemStyle: {
          "normal": {
              "color": function(params) {
                  var colorList;
                  if (data.datas[params.dataIndex][1] >= data.datas[params.dataIndex][0]) {
                      colorList = colors[0]
                  } else {
                      colorList = colors[1]
                  }
                  return colorList
              },
          }
        }
      }
    ],
    grid: [
      {
        top: "8%",
        left: 5,
        right: "12%",
        bottom: "25%",
      },
      {
        left: 5,
        right: "12%",
        top: "75%",
        bottom: "6%",
      },
      {
        left: 5,
        top: "80%",
        right: "12%",
        bottom: "5%",
      },
      {
        left: "88",
        right: "0",
      }
    ]
  }
  myChart.setOption(option)
  // 定时
  setTimeoutFn()
  // 刷新数据
  refreshData()
  function setTimeoutFn() {
    self.interval = setTimeout(() => {
      clearTimeout(self.interval)
      refreshData()
      setTimeoutFn()
    }, 3000);
  }
  function refreshData() {
    data = utils.splitData(self.chartData)
    data.datas.shift()
    data.times.shift()
    data.vols.shift()
    myChart.setOption({
      xAxis: [
        {data: data.times},
        {data: data.times}, 
        {data: data.times}
      ],
      series: [{data: data.datas}]
    })
  }
  window.addEventListener("resize", function () {
    myChart.resize()
  })
}

onMounted(() => {
  state.requestK.req = `market.${state.currencyInfo.name}.kline.1min`
  state.subK.sub = `market.${state.currencyInfo.name}.kline.1min`
  // 异步展示k线图
  setTimeout(()=>{
    // 初始化websoket
    // K线图websoket连接
    handleInitWebsoket()
    handleNavClick(0,'1min')
  }, 1000)
})

</script>

<style lang="less">
@import '../assets/css/index.less';
</style>
