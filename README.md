# vue-kline (使用 Vue 对接火币 k 线图数据)

## 使用技术 Vue、Echarts、WebSocket
支持vue2和vue3
master分支默认是vue3的

## 下载说明

- 该项目仅供参考，直接下载到本地运行查看
- 下载项目后，npm install 一下
- npm run serve 运行项目查看效果
- 火币地址可能会有变化，如果页面websocket连接不上，在config/index.ts中列了3个地址，可以换着试试

## 一些文件说明

- src/config/index.js 是 K 线图的颜色（线条、蜡烛）和背景颜色配置
- src/utils/utils.js 是一些计算方法，计算 MA、格式化工具条，和分割数据。网上都能搜索到
- 其它的都是 Vue 的配置，相信大家都属性吧！

## 图片参考

![蓝色主题](https://vangleer.github.io/vue-kline/dist/img/theme1.png)
<br />

![白色主题](https://vangleer.github.io/vue-kline/dist/img/theme2.png)

<br />

![自定义主题](https://vangleer.github.io/vue-kline/dist/img/theme3.png)

## 火币接口参考文档 https://huobiapi.github.io/docs/spot/v1/cn/#websocket

## GitHub Pages https://vangleer.github.io/vue-kline/dist/#/

如果这个能帮助到你, 请点击 star 来支持我噢. ^\_^
