<template>
  <div class="watermark" :style="{ background: paint }"></div>
</template>
<script>
/* eslint-disable */
import { mapGetters } from 'vuex'
export default {
  name: 'simpleWaterMark',
  props: {
    width: { // 文字间距
      type: Number,
      default: 20
    },
    color: { // 文字颜色
      type: String,
      default: '#FFFFFF'
    },
    alpha: { // 文字透明度
      type: Number,
      default: 30
    },
    rotate: { // 文字旋转
      type: Number,
      default: 15
    },
    fontSize: { // 文字大小
      type: Number,
      default: 14
    },
    previewWatermarkOpt: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
    }
  },
  methods: {
    htmlEncodeByRegExp (str) {
      var temp = "";
      if (str.length == 0) return "";
      temp = str.replace(/&/g, "&amp;");
      temp = temp.replace(/</g, "&lt;");
      temp = temp.replace(/>/g, "&gt;");
      temp = temp.replace(/\'/g, "&#39;");
      temp = temp.replace(/\"/g, "&quot;");
      return temp
    },
    arrToHtml (arr) {
      let html = ''
      arr.forEach((e, i) => {
        html += `<tspan dy="${i === 0 ? 0 : this.fontSize * 1.2}" x="${this.width}">${this.htmlEncodeByRegExp(e)}</tspan>`
      })
      return html;
    },
  },
  computed: {
    ...mapGetters(['watermarkOpt']),
    paint () {
      const watermarkOpt = this.previewWatermarkOpt || this.watermarkOpt
      const { watermarkArr } = watermarkOpt
      let mark = this.cloneDeep(watermarkArr)
      let arr = []
      let maxLength = 0
      mark.forEach((line, i) => {
        line.forEach((item, index) => {
          if (item === 'date') {
            line[index] = (new Date()).toLocaleDateString()
          } else {
            line[index] = watermarkOpt[item]
          }
        })
        line = line.join('')
        if (line.length > maxLength) maxLength = line.length
        if (line) arr.push(line)
      })
      const width = (this.fontSize * maxLength * 1.2 + this.width).toFixed(1);
      const zjb = (width * Math.sin(this.rotate)).toFixed(1)
      const totalH = this.fontSize * arr.length * 1.2 + this.width
      const height = zjb > totalH ? zjb : totalH
      let svgText = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}px" height="${height}px">
    <text x="50%" y="25%"
        alignment-baseline="middle"
        text-anchor="start"
        stroke="${this.color}"
        opacity="${this.alpha / 100}"
        transform="translate(${width / 2}, ${height / 2}) rotate(${this.rotate
        }) translate(-${width / 2}, -${height / 2})"
        font-weight="80"
        font-size="${this.fontSize}"
        font-family="microsoft yahe"
        >
        ${this.arrToHtml(arr)}
    </text>
    </svg>`;
      // btoa: 将二进制转换成ascii码（这就是base64的编码过程）
      // 但btoa和atob不能编码Unicode字符（中文）
      // encodeURIComponent（中文） -  除了字母、数字、(、)、.、!、~、*、'、-和_之外的所有字符
      // escape()和unescape()是一对编码解码函数，用于非ASCII字符的编码和解码！
      // unescape转换成可以识别的二进制
      return `url(data:image/svg+xml;base64,${btoa(
        unescape(encodeURIComponent(svgText))
      )})`;
    }
  }
};
</script>

<style lang="scss" scoped>
.watermark {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>