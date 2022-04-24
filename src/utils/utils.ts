import dayjs from 'dayjs'

export default {
  postSelect(params, colors) {
    let _this: any = { datas: {}, ma: {}, vol: {} }
    let result: any = {}
    for (let i = 0; i < params.length; i++) {
      var el = params[i];
      switch (el.seriesIndex) {
        case 0:
          _this.datas = {
            date: {
              name: '时间',
              value: el.name
            },
            open: {
              name: '开',
              value: el.value[1]
            },
            close: {
              name: '收',
              value: el.value[2]
            },
            low: {
              name: '低',
              value: el.value[3]
            },
            heigh: {
              name: '高',
              value: el.value[4]
            },
            zhangd: {
              name: '涨跌额',
              value: (parseFloat(el.value[2]) - parseFloat(el.value[1])).toFixed(2),
              color: el.color
            },
            zhenf: {
              name: '涨跌幅',
              value: (((parseFloat(el.value[2]) - parseFloat(el.value[1])) / parseFloat(el.value[1])).toFixed(4)) * 100
            }
          };
          break
        case 1:
          _this.ma.ma5 = {
            name: el.seriesName,
            value: el.value,
            color: el.color
          };
          break
        case 2:
          _this.ma.ma10 = {
            name: el.seriesName,
            value: el.value,
            color: el.color
          }
          break
        case 3:
          _this.ma.ma20 = {
            name: el.seriesName,
            value: el.value,
            color: el.color
          };
          break
        case 4:
          _this.vol.ma5 = {
            name: el.seriesName,
            value: el.value,
            color: colors[5]
          }

          break
        case 5:
          _this.vol.ma10 = {
            name: el.seriesName,
            value: el.value,
            color: colors[0]
          };
          break
        case 6:
          _this.vol.vol = {
            name: el.seriesName,
            value: el.value,
            color: colors[4]
          };
          break
        default:
          break
      }
    }

    // 工具框里的数据
    let ak = []
    for (let j in _this.datas) {
      ak.push({
        name: _this.datas[j].name,
        value: _this.datas[j].value
      })
    }
    ak.push(_this.vol.vol)
    result.toolList1 = ak

    var objma = Object.keys(_this.ma)
    var at = []
    for (let j = 0; j < objma.length; j++) {
      at.push({
        name: _this.ma[objma[j]].name,
        value: _this.ma[objma[j]].value,
        color: _this.ma[objma[j]].color
      })
    }
    // 上面的数据
    result.postTop = at;

    // 交易量
    result.chengJiao = {
      name: _this.vol.name,
      value: _this.vol.value,
      color: _this.vol.color
    }
    let objvol = Object.keys(_this.vol)
    let maVols = []
    for (let j = objvol.length - 1; j >= 0; j--) {
      maVols.push({
        name: _this.vol[objvol[j]].name,
        value: _this.vol[objvol[j]].value,
        color: _this.vol[objvol[j]].color
      })
      break
    }
    result.chengJiao = maVols
    result.toolList1.push(result.chengJiao)
    return result
  },
  calculateMA(data, dayCount) {
    let result = [];
    for (let i = 0, len = data.datas.length; i < len; i++) {
      if (i < dayCount) {
        result.push('-')
        continue
      }
      let sum = 0;
      for (let j = 0; j < dayCount; j++) {
        sum += data.datas[i - j][1]
      }
      result.push(sum / dayCount)
    }
    return result
  },
  splitData(rawData) {
    let datas = []
    let times = []
    let vols = []
    for (let i = 0; i < rawData.length; i++) {
      datas.push([rawData[i][1], rawData[i][2], rawData[i][3], rawData[i][4]])
      times.push(rawData[i][0])
      vols.push(rawData[i][5])
    }
    return {
      datas: datas,
      times: times,
      vols: vols
    }
  }
}

export function toFixed(value, decimal = 2) {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  return value && value.toFixed(decimal)
}
// 格式化时间方法
export function getFormatDate(value, formatter = 'MM-DD HH:mm') {
  if (!value) return '';
  const date: any = new Date(value * 1000)
  return dayjs(date).format(formatter)
}