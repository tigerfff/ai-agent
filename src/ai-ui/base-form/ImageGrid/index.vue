<template>
  <div class="image-grid-container">
    <div 
      class="image-grid" 
      :style="{
        'grid-template-columns': gridTemplateColumns,
        'grid-template-rows': gridTemplateRows
      }"
    >
      <div 
        v-for="(image, index) in getImages"
        :key="index"
        class="grid-item"
        :style="gridItemStyle(index)"
        @click="handleClickImage(image, index)"
      >
       <LazyComponent>
          <imgCanvas 
            class="img-canvas" 
            :url="image.picUrl"  
            :aiInfo="image.aiPicCoordinate"
            :ruleInfo="image.multiAnalysisAreaPolygon"
            :info="image.picCoordinate"
            :width="gridItemWidth(index)"
            :height="gridItemHeight"
            v-bind="$attrs"
          ></imgCanvas>
        </LazyComponent>
      </div>
    </div>
    <div class="image-grid-count" v-show="count > 1">
      {{ count }} 张
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'ImageGrid',
  components: {
  },
  props: {
    images: {
      type: Array,
      default: () => [],
      required: true,
    },
    thumbnail: {
      type: Boolean,
      default: false
    },
    size: {
      type: [Number, Array],
      default: 100
    },
    containerWidth: {
      type: Number,
      default: 100
    },
    parentIndex: {
      type: Number,
      default: 0
    }
  },
  watch:{
    images: {
      handler(newVal) {
        
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    count() {
      return [...this.images].length
    },
    getImages() {
      const images = _.cloneDeep(this.images)
      let width, height
      if (Array.isArray(this.size)) {
        [width, height] = this.size
      } else {
        width = height = this.size
      }
      if(this.thumbnail) {
        return images.map(image => `${image}?x-oss-process=image/resize,m_lfit,w_${width},h_${height}`)
      }
      return images.slice(0, 4).map(image => {
        return {
          ...image,
          aiPicCoordinate: this.checkStringToJson(image.aiPicCoordinate),
          multiAnalysisAreaPolygon: this.checkStringToJson(image.multiAnalysisAreaPolygon),
          picCoordinate: this.checkStringToJson(image.picCoordinate)
        }
      })
    },
   
    gridItemHeight() {
      if (!this.containerWidth) return '100%';
      
      const count = this.getImages.length;
      let rows = 1;
      
      if (count === 1) {
        rows = 1;
      } else if (count === 2) {
        rows = 1;
      } else if (count === 3 || count === 4) {
        rows = 2;
      }
      
      return Math.floor((this.containerWidth - (rows - 1)) / rows);
    },
    gridTemplateColumns() {
      const count = this.images.length;
      if (count === 1) return '1fr';
      if (count === 2) return '1fr 1fr';
      return '1fr 1fr';
    },
    gridTemplateRows() {
      const count = this.images.length;
      if (count <= 2) return '1fr';
      if (count === 3) return '1fr 1fr'; // 三张图片时两行
      return '1fr 1fr';
    }
  },
  methods: {
    gridItemWidth(index) {
      if (!this.containerWidth) return '100%';
    
      const count = this.getImages.length;
      let columns = 1;
      
      if (count === 1) {
        columns = 1;
      } else if (count === 2) {
        columns = 2;
      } else if (count === 3) {
        columns = 2; // 最大列数
        if(index === 0){
           columns = 1;
        }
      } else if (count === 4) {
        columns = 2;
      }
      
      // 考虑间隔（gap为1px）
      return Math.floor((this.containerWidth - (columns - 1)) / columns);
    },
     handleClickImage(image, index) {
       this.$emit('handleClickImage', image, index, this.parentIndex)
     },
     checkStringToJson(val) {
      if(typeof val === 'string') {
        return JSON.parse(val)
      }
      return val
    },
     gridItemStyle(index) {
      const count = this.images.length;
      
      if (count === 1) {
        return {
          'grid-column': '1 / -1',
          'grid-row': '1 / -1'
        };
      }
      
      if (count === 2) {
        return {
          'grid-column': `${index + 1} / span 1`,
          'grid-row': '1 / -1'
        };
      }
      
      if (count === 3) {
        if (index === 0) {
          return {
            'grid-column': '1 / -1',  // 第一张图片占满第一行
            'grid-row': '1 / span 1'
          };
        } else {
          return {
            'grid-column': `${index} / span 1`,  // 第二、三张图片各占第二行的1/2
            'grid-row': '2 / span 1'
          };
        }
      }
      
      if (count === 4) {
        const row = index < 2 ? 1 : 2;
        const col = index % 2 + 1;
        return {
          'grid-column': `${col} / span 1`,
          'grid-row': `${row} / span 1`
        };
      }
      
      return {};
    }
  }
}
</script>

<style lang="scss" scoped>
.image-grid-container {
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  background: #FFF;
  
  .image-grid-count {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 20px;
    padding: 0 8px;
    background-image: linear-gradient(180deg, rgba(0,0,0,0.00) 0%, #000000 100%);
    color: #fff;
    font-size: 12px;
    text-align: right;
    line-height: 20px;
  }
}


.image-grid {
  display: grid;
  gap: 0px;
  width: 100%;
  aspect-ratio: 1/1;
  background: #f0f0f0;
  
  .grid-item {
    background: #FFF;
    overflow: hidden;
    position: relative;
    cursor: pointer;

    .img-canvas {
      width: 100%;
      height: 100%;
      transition: transform 0.3s ease;
      object-fit: cover;
    }

    &:hover .img-canvas {
      transform: scale(1.1);
    }

    &:hover .img-canvas::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.1);
    }
  }
}
</style>

