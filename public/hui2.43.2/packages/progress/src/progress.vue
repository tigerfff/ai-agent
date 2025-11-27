<template>
  <div
    :class="[
      'el-progress--' + type,
      status ? 'is-' + status : '',
      verticalAlign ? 'is-text-vertical' : '',
      {
        'el-progress--without-text': !internalShowText,
        'el-progress--text-inside': textInside,
        'el-progress--small': internalSmall
      }
    ]"
    class="el-progress"
  >
    <div v-if="type === 'line'" class="el-progress-bar">
      <div
        :style="{
          height: internalStrokeWidth + 'px',
          'border-radius': strokeLinecap === 'square' ? '0px' : '100px'
        }"
        class="el-progress-bar__outer"
      >
        <div :style="barStyle" class="el-progress-bar__inner">
          <div
            v-if="internalShowText && textInside"
            class="el-progress-bar__innerText"
          >
            {{ percentage }}%
          </div>
          <div
            v-if="internalDynamic"
            :style="`animation-duration:${duration}s;`"
            class="el-progress-bar__dynamic-block"
          />
        </div>
      </div>
    </div>
    <div
      v-else
      :style="{ height: width + 'px', width: width + 'px' }"
      class="el-progress-circle"
    >
      <svg viewBox="0 0 100 100">
        <path
          :d="trackPath"
          :stroke-width="relativeStrokeWidth"
          class="el-progress-circle__track"
          stroke="#ebebeb"
          fill="none"
        />
        <path
          :d="trackPath"
          :stroke="stroke"
          :stroke-width="relativeStrokeWidth"
          :style="circlePathStyle"
          class="el-progress-circle__path"
          fill="none"
        />
      </svg>
    </div>
    <div
      v-if="internalShowText && !textInside"
      :title="!status ? `${percentage}%` : statusText"
      :style="{ fontSize: progressTextSize + 'px' }"
      class="el-progress__text"
    >
      <slot name="text">
        <template v-if="!status">{{ percentage }}%</template>
        <template v-else>
          <i :style="{ fontSize: iconSize + 'px' }" :class="iconClass" />
          <span v-if="type === 'line'" class="el-progress__status-text">
            {{ statusText }}
          </span>
        </template>
      </slot>
    </div>
  </div>
</template>
<script>
const STROKE_WIDTH_SMALL = 8;

export default {
  name: 'ElProgress',
  props: {
    type: {
      type: String,
      default: 'line',
      validator: val => ['line', 'circle'].indexOf(val) > -1
    },
    percentage: {
      type: Number,
      default: 0,
      validator: val => val >= 0 && val <= 100
    },
    status: {
      type: String,
      default: ''
    },
    strokeWidth: {
      type: Number,
      default() {
        return this.type === 'line' ? 12 : 8;
      }
    },
    textInside: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number,
      default: 160
    },
    showText: {
      type: Boolean,
      default: true
    },
    verticalAlign: {
      type: Boolean,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: ''
    },
    background: {
      type: String,
      default: ''
    },
    statusText: {
      type: String,
      default: ''
    },
    strokeLinecap: {
      type: String,
      default: 'square'
    },
    dynamic: {
      type: Boolean,
      default: false
    },
    // 动态进度条一次的播放时间,单位为秒 modify by yangzhini 2019-04-15
    duration: {
      type: Number,
      default: 1.5,
      validator: val => val >= 0
    }
  },
  computed: {
    barStyle() {
      var style = {};
      style.backgroundColor = this.color;
      if (this.background) style.background = this.background;
      // 动态进度条在不知道进度的时候使用, 为配合动效, 将percentage设置为100%
      style.width = this.internalDynamic ? '100%' : this.percentage + '%';
      style.borderRadius = this.strokeLinecap === 'square' ? '0px' : '100px';
      return style;
    },
    relativeStrokeWidth() {
      // 进度圈暂不支持小型模式, 直接使用strokeWidth
      return ((this.strokeWidth / this.width) * 100).toFixed(1);
    },
    trackPath() {
      var radius = parseInt(50 - parseFloat(this.relativeStrokeWidth) / 2, 10);

      return `M 50 50 m 0 -${radius} a ${radius} ${radius} 0 1 1 0 ${radius *
        2} a ${radius} ${radius} 0 1 1 0 -${radius * 2}`;
    },
    perimeter() {
      var radius = 50 - parseFloat(this.relativeStrokeWidth) / 2;
      return 2 * Math.PI * radius;
    },
    circlePathStyle() {
      var perimeter = this.perimeter;
      return {
        strokeDasharray: `${perimeter}px,${perimeter}px`,
        strokeDashoffset: (1 - this.percentage / 100) * perimeter + 'px',
        transition: 'stroke-dashoffset 0.6s ease 0s, stroke 0.6s ease',
        strokeLinecap:
          this.percentage === 0
            ? ''
            : this.strokeLinecap === 'square'
            ? 'butt'
            : 'round'
      };
    },
    stroke() {
      var ret;
      switch (this.status) {
        case 'success':
          ret = this.color || '#02bf0f'; // $--color-success
          break;
        case 'exception':
          ret = this.color || '#fa3239'; // $--color-danger
          break;
        default:
          ret = this.color || '#2196f3'; // $--color-info
      }
      return ret;
    },
    iconClass() {
      if (this.type === 'line') {
        return this.status === 'success'
          ? 'h-icon-tip_right'
          : 'h-icon-tip_error';
      } else {
        return this.status === 'success' ? 'h-icon-done' : 'h-icon-close';
      }
    },
    progressTextSize() {
      return this.type === 'line'
        ? 8 + this.internalStrokeWidth * 0.5
        : this.width * 0.111111;
    },
    iconSize() {
      return this.type === 'line'
        ? 12 + this.internalStrokeWidth * 0.5
        : this.width * 0.2 + 16;
    },
    // '小型'只在线形非内显进度条上生效
    internalSmall() {
      return this.small && this.type === 'line' && !this.textInside;
    },
    // 确定所使用的线宽, 小型进度条优先使用8px线宽, 否则根据strokeWidth来设定线宽
    internalStrokeWidth() {
      return this.internalSmall ? STROKE_WIDTH_SMALL : this.strokeWidth;
    },
    // 动态进度条不显示text
    internalShowText() {
      return this.internalDynamic ? false : this.showText;
    },
    // 动态进度条暂时只支持线形进度条
    internalDynamic() {
      return this.dynamic && this.type === 'line';
    }
  }
};
</script>
