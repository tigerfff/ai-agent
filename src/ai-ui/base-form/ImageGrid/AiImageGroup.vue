<template>
  <ul :class="stepByTime ? 'ai-image-group--step' : 'ai-image-group'">
    <template v-if="stepByTime">
      <HikCloudSteps inactiveColor="#2196f3" style="--ym-steps-background: #FFF">
        <HikCloudStep v-for="(group, index) in groupImages" :key="index">
          <!-- 图片组时间 -->
          <slot v-if="showHeader" name="header" :time="getLastTime(group)">
            <div class="step_header">
              <span class="step_header--title">{{ parseTime(getLastTime(group), '{y}-{m}-{d} {h}:{i}') }}</span>
            </div>
          </slot>

          <ImageGrid :images="group" :containerWidth="containerWidth" :style="style" :closeable="closeable"  :parentIndex="index" @handleClickImage="handleClickImage" />

          <!-- 底部 -->
          <slot name="footer" v-if="showFooter" :picItem="group[0]">

          </slot>
           <!-- 其它 -->
          <slot name="other" :picItem="group[0]">
            <el-tag
              v-show="group[0]?.analysisType === 1"
              class="other-tag other-tag-time"
              type="warning"
              size="small">图片不符合
            </el-tag>
          </slot>
          <!-- 删除按钮 -->
          <div v-if="closeable" class="close-icon close-icon-step" @click="handleDeleteImage(group, index) ">
            <i class="h-icon-close_sm"></i>
          </div>
        </HikCloudStep>
      </HikCloudSteps>
    </template>
    <template v-else>
      <li class="ai-image-group--item" :style="style" v-for="(group, index) in groupImages" :key="index"  >
        <ImageGrid :images="group" :containerWidth="containerWidth" :closeable="closeable" :parentIndex="index" @handleClickImage="handleClickImage" />
       
        <!-- 底部 时间 因为这边会分组，所以这个时间是当前组的最后一个 -->
        <slot v-if="showHeader && getLastTime(group)" name="header" :time="getLastTime(group)">
          <span class="footer-time"> {{ parseTime(getLastTime(group), '{h}:{i}:{s}') }} </span>
        </slot>

        <!-- 底部内容 比如AI备注等 -->
        <slot name="footer" v-if="showFooter" :picItem="group[0]">

        </slot>
        <!-- 其它 -->
        <slot name="other" :picItem="group[0]">
          <el-tag
            v-show="group[0]?.analysisType === 1"
            class="other-tag"
            type="warning"
            size="small">图片不符合
          </el-tag>
        </slot>
        <!-- 删除按钮 -->
        <div v-if="closeable" class="close-icon" @click="handleDeleteImage(group, index) ">
          <i class="h-icon-close_sm"></i>
        </div>
      </li>
    </template>
  </ul>
</template>

<script>
/* 
2.47 - 业务组件，实现考评图片分组展示，用于后端接口返回的图片数组，数组格式参考readme

特殊逻辑：分为两个模式，1个是按时间进度分组，分组规则是 按picReId分组，然后组内按captureTime排序。以时间最晚的那张图的时间打包成一组，包括云小智推送，问题统计，考评详情

width\containerWidth 参数是因为canvas那边必须传入固定的宽度，所以这边需要传入固定的宽度
*/
import ImageGrid from './index'
import ImageDrawViewer from '@/components/imageDrawViewer/main.vue'
import { groupPicsByPicId, parseTime } from './utils'

export default {
  components: {
    ImageGrid,
    YmSteps,
    YmStep,
    ImageDrawViewer
  },
  props: {
    // 传入的图片数组
    images: {
      type: Array,
      default: () => []
    },
    stepByTime: {
      type: Boolean,
      default: false
    },
    // li的宽度
    width: {
      type: Number,
      default: 140
    },
    // ImageGrid宽度
    containerWidth: {
      type: Number,
      default: 140
    },
    closeable: {
      type: Boolean,
      default: false
    },
    showHeader: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      viewPicVisible: false,
    }
  },
  computed: {
    style() {
      return {
        width: `${this.width}px`,
      }
    },
    groupImages() {
      return groupPicsByPicId(this.images);
    },
    // 2.47需求，特殊逻辑，如果图片分组了，就只展示时间
    showFooter() {
      return this.groupImages.every(group => group.length === 1);
    }
  },
  mounted(){
  },
  methods: {
    parseTime,

    // 对外暴露方法，提供转换后的数据
    getTranslateImageData() {
      return this.groupImages
    },

    getLastTime(array) {
      if (!array || !array.length) return '';
      const lastItem = array[array.length - 1];
      return lastItem?.captureTime;
    },
   
    handleDeleteImage(group) {
      this.$emit('delete', group)
    },
    handleClickImage(image, index, parentIndex) {
      this.$emit('handleClickImage', {
        image,
        index,
        parentIndex,
        groupImages: this.groupImages
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.step_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  
  &--title {
    font-size: var(--ym-step-title-size);
    line-height: 1.5;
    color: var(--ym-step-title-color);
  }
}
.ai-image-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  &--item {
    position: relative;
    list-style: none;
   
    .footer-time {
      display: inline-block;
      color: rgba(0,0,0,0.40);
      font-size: 12px;
      line-height: 1.5;
      margin-top: 8px;
    }
    .close-icon {
      cursor: pointer;
      position: absolute;
      top: 0;
      right: 0;
      width: 24px;
      height: 24px;
      font-size: 24px;
      color: #fff;
      background: rgba(0,0,0,0.70);
    }

    .close-icon-step{
      top: 26px;
    }

    .close-icon:hover {
      background: rgba(0,0,0,0.40);
    }
  }
  
}

.ai-image-group--step {
  ::v-deep .ym-step__content {
    position: relative;
  }
}

.other-tag {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  font-size: 11px;
  height: 16px;
  box-sizing: border-box;
  background: #FFAD19;
  color: #FFF;
  line-height: 16px;
}

.other-tag-time {
  top: 26px;
}
</style>