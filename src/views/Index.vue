<template>
  <div class="content">
      <div class="data-box">
        <div class="left">
          <!-- 仅供展示 -->
          <h3>{{titleCal.end_price|toFixed(4)}}</h3>
          <div class="rate">≈{{titleCal.end_price|toFixed(4)}}CNY</div>
        </div>
      </div>
      <!-- 导航按钮 -->
      <div class="nav-box">
        <div 
          class="item" 
          :class="currentNav === index ? 'active' : ''" 
          v-for="(item, index) in navList" :key="index"
          @click="handleNavClick(index,item.opt)">
          {{ item.text }}
        </div>
      </div>

      <div 
        class="chart-box" 
        :style="{backgroundImage:'url('+bgImg+')'}" 
        @click.stop="handleChartClick($event)">

          <div class="top">
            <span 
              class="yellow-color" 
              :style="{color:item.color}" 
              v-for="(item, index) in postTop"
              :key="index">
              {{ item.name }}:{{ item.value|toFixed }}
            </span>
          </div>

          <div class="middle">
            <span 
              class="base-color" 
              v-for="(item,index) in chengJiao" 
              :key="index"
              :style="{ color: item.color }">
              {{ item.name }}:{{ item.value|toFixed }}
            </span>
          </div>

          <!-- 数据显示栏 -->
          <div 
            v-show="showTool" 
            class="tool-box" 
            :class="dataPos ? 'pos-right' : 'pos-left'">
            <p v-for="(item,index) in toolList1" :key="index">
              <template v-if="index===5">
                <span>{{ item.name }}</span>
                <span :class="item.value>=0?'color_green':'color_red'">{{ item.value|toFixed(2) }}</span>
              </template>
              <template v-else-if="index===6">
                <span>{{ item.name }}</span>
                <span :class="item.value>=0?'color_green':'color_red'">{{ item.value|toFixed(2) }}%</span>
              </template>
              <template v-else>
                <span>{{ item.name }}</span>
                <span>{{ item.value|toFixed(2) }}</span>
              </template>
            </p>
          </div>
          <!-- 图表 -->
          <div class="chart"  ref="chartBox"></div>
        </div>
  </div>
</template>

<script>
import echarts from "echarts"
import pako from 'pako'
import utils from '../utils/utils.js'
import { colors, huobiWsUrl } from '../config/index'
export default {
  data() {
    return {
        navList: [
          { text: '1分钟', opt: '1min' },
          { text: '5分钟',opt: '5min' },
          { text: '15分钟',opt: '15min' },
          { text: '30分钟',opt: '30min' },
          { text: '1小时',opt: '60min' },
          { text: '4小时',opt: '4hour' }
        ],
        usdtPrice:8, // https://api.huobiasia.vip/market/tickers 可以调用这个借口获取，这里默认为8
        currentNav:0,
        currencyInfo: {name:'btcusdt',enName:'BTC'},
        bgImg: require("../assets/imgs/bg2.png"),
        showFenshiBox: false,
        dataPos: false,
        toolList1: [],
        postTop: [],
        postMiddle: [],
        chengJiao: [],
        showTool: false,
        chartData: [],
        titleCal: {},
        interval: null,
        flag: false,
         // K 线相关
        haurl: huobiWsUrl,
        requestK: {req: 'market.eosusdt.kline.1min'},
        subK:{sub: 'market.eosusdt.kline.1min'},
        socketK:{},
        chartOtherData:[],
        Zstart: 100,
        Zend: 90
    }
  },
  watch:{
    '$route':function(to) {
      // 离开页面关闭连接
      if(this.socketK.close) this.socketK.close()
      window.clearInterval(this.interval)
      this.currencyInfo = to.query
       // 更改k线图请求接口
      this.requestK.req = `market.${this.currencyInfo.name}.kline.1min`
      this.subK.sub = `market.${this.currencyInfo.name}.kline.1min`
      // 异步展示k线图
      setTimeout(()=>{
        // 初始化websoket
        // K线图websoket连接
        this.handleInitWebsoket()
        this.handleNavClick(0,'1min')
      },1000)
    }
  },
  created() {
    this.requestK.req = `market.${this.currencyInfo.name}.kline.1min`
    this.subK.sub = `market.${this.currencyInfo.name}.kline.1min`
    // 异步展示k线图
    setTimeout(()=>{
      // 初始化websoket
      // K线图websoket连接
      this.handleInitWebsoket()
      this.handleNavClick(0,'1min')
    },1000)
  },
  methods:{
      // 点击切换时间
      handleNavClick(index,opt) {
        const {name} = this.currencyInfo
        if(index!==0) {
          this.Zstart = 90
          this.Zend = 80
        }
        this.chartData = []
        this.chartOtherData = []
        if(this.socketK.close) this.socketK.close()
        clearTimeout(this.interval)
        this.currentNav = index;
        this.requestK.req = `market.${name}.kline.${opt}`
        this.subK.sub = `market.${name}.kline.${opt}`
        this.handleInitWebsoket()
        setTimeout(()=>{
          this.draw()
        },1000)
      },
      // 初始化K线图websoket连接
      handleInitWebsoket() {
        let self = this
        self.socketK = new WebSocket(self.haurl)
        self.socketK.onopen = function() {
          self.socketK.send(JSON.stringify(self.subK))
          self.socketK.send(JSON.stringify(self.requestK))
        }
        self.socketK.onmessage = function(event) {
          let blob = event.data
          let reader = new FileReader()
          reader.onload = function(e) {
            let ploydata = new Uint8Array(e.target.result)
            console.log(ploydata, 'ploydata')
            let msg = pako.inflate(ploydata, { to: 'string' })
            console.log(msg, 'msgmsgmsgmsg')
            self.handleData(msg)
          }
          reader.readAsArrayBuffer(blob, 'utf-8')
        }
      },
      // 处理k线图数据
      handleData(msg) {
        let data = JSON.parse(msg)
        if(data.ping) {
          this.socketK.send(JSON.stringify({pong: data.ping}))
        }else if(data.status=='ok' && data.data) {
          if(this.chartOtherData.length<10) {
             this.chartOtherData = data.data
             let arr = []
             const info = this.chartOtherData
             for (let i = 0; i < info.length-1 ; i++) {
               if (i === info.length-1) {
                 let el = info[i]
                 this.titleCal = {
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
               let el = info[i]
               el.time = this.getFormatDate(el.id)
               let arr2 = [el.time, el.open, el.close, el.low, el.high, el.vol]
               arr.push(arr2)
             }
             this.chartData = arr
          }
        }else if(data.tick) {
          const el = data.tick
          this.titleCal = {
            cny:8,
            end_price:el.close,
            max_price:el.high,
            min_price:el.low,
            num:el.count,
            per:(el.close-el.open)/el.open,
            start_price:el.open,
            ud_price:8
          }
          el.time = this.getFormatDate(el.id)
          let arr2 = [el.time, el.open, el.close, el.low, el.high, el.vol]
          let lastDate = this.chartData[this.chartData.length-1] && this.chartData[this.chartData.length-1][0]
          let flag = arr2[0] && arr2[0] == lastDate
          if(flag) {
            this.chartData.splice(this.chartData.length-1,1,arr2)
          }
          if (!flag) {
            this.chartOtherData.push(data.tick)
            this.chartData.push(arr2)
            this.chartData.shift()
          }
        }
      },
      // 格式化时间方法
      getFormatDate(value,formatter = 'MM-dd HH:mm') {
          if (!value) return '';
          const date = new Date(value*1000);
          return formatter
            .replace('MM', (date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1))
            .replace('dd', (date.getDate()) >= 10 ? (date.getDate()) : '0' + (date.getDate()))
            .replace('HH', (date.getHours()) >= 10 ? (date.getHours()) : '0' + (date.getHours()))
            .replace('mm', (date.getMinutes()) >= 10 ? (date.getMinutes()) : '0' + (date.getMinutes()))
      },
       // 发送pong
      sendHeartMessage(ping) {
        this.socketK.send(JSON.stringify({ pong: ping }))
      },
 
      // 点击k线图
      handleChartClick(e) {
        this.showTool = true
        const chartBox = this.$refs.chartBox
        const pos = chartBox.offsetWidth / e.clientX
        if (pos > 2) {
          this.dataPos = true
        } else {
          this.dataPos = false
        }
      },
      draw() {
        const self = this
        let myChart = echarts.init(this.$refs.chartBox)
        // 绿色、红色、紫色、浅蓝、深蓝、黄色
        let data = utils.splitData(this.chartData)
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
                  "yAxis": data.datas[data.datas.length - 1][1],
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
  }
}
</script>

<style lang="less" scoped>
  .content {
    margin: 50px 0px;
    color: #6b809b;
    overflow-y: auto;
  }
  span {
    font-size: 13px;
  }
  .data-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    padding: 0 12px;
    color: #707f9c;
    font-weight: 700;

    .left {
      width: 60%;
      h3 {
        font-size: 20px;
        font-weight: 700;
        height: 30px;
        color: #0ca589;
        margin: 0;
      }
    }
  }
    // 导航按钮
  .nav-box {
    display: flex;
    justify-content: space-between;
    padding: 0 12px;
    width: 100%;
    height: 40px;

    .item {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      height: 100%;
    }

    .active {
      color: #0563e1;

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: #0563e1;
      }
    }
  }
    // 图表部分
  .chart-box {
    position: relative;
    width: 100%;
    height: 420px;
    background-size: 100% 88%;
    border-top: 1px solid rgba(185,192,202,0.2);
    border-bottom: 1px solid rgba(185,192,202,0.2);

    .top {
      position: absolute;
      z-index: 900;
      top: 5px;
      left: 5px;

      span {
        margin-right: 10px;
      }
    }

    .middle {
      position: absolute;
      z-index: 900;
      top: 74%;
      left: 5px;

      span {
        margin-right: 10px;
      }
    }

    .bom {
      position: absolute;
      z-index: 900;
      top: 75%;
      left: 5px;

      span {
        margin-right: 10px;
      }
    }
    .tool-box {
      position: absolute;
      z-index: 900;
      top: 6px;
      right: 10px;
      width: 120px;
      border: 1px solid #6c7c93;
      background-color: rgba(8, 24, 37, 0.7);

      p {
        display: flex;
        justify-content: space-between;
        margin: 0;
        margin: 2px 2px;
      }
    }

    .pos-left {
      left: 5px;
    }

    .pos-right {
      right: 5px;
    }

    .chart {
      width: 100%;
      height: 100%;
    }
  }
  .yellow-color {
    color: #f2daaf;
  }
</style>