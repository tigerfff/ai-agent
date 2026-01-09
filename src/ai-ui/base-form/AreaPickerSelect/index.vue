<template>
    <div id="HKMultiSelectTreeView" class="area-select">
      <el-popover
        ref="popover"
        v-model="expand"
        placement="right-end"
        width="620"
        trigger="manual"
        popper-class="area-picker-popover"
        :append-to-body="true"
        @show="handlePopoverShow"
        @hide="handlePopoverHide"
      >
        <!-- 输入框（作为 reference slot） -->
        <div 
          slot="reference"
          class="select-input"
          :class="{ 'is-focus': expand }"
          @click="togglePanel"
        >
          <div class="select-input-inner">
            <el-tag
              v-if="displayTags.length > 0"
              :key="displayTags[0].nodeId"
              :title="displayTags[0].nodeName"
              @close.stop="removeTag(displayTags[0])"
              :closable="true"
              size="small"
              class="select-tag">
              {{displayTags[0].nodeName}}
            </el-tag>
            <el-tag
              v-if="tags.length > 1"
              size="small"
              class="select-tag">
              +{{tags.length - 1}}
            </el-tag>
            <span v-if="tags.length === 0" class="placeholder">请选择区域</span>
          </div>
          
          <!-- 三角形图标 -->
          <div class="select-suffix">
            <span class="triangle-icon" :class="{ 'is-reverse': expand }"></span>
          </div>
        </div>

        <!-- 下拉面板内容 -->
        <div class="expand-pane">
          <div style="padding: 16px;">
            <AreaPicker ref="picker" :checkStrictly="true" @optionLoaded="optionLoaded" @selectionChange="selectionChange" style="height:400px" :needClearAllSelection="needClearAllSelection"></AreaPicker>
          </div>
          <div class="footer">
            <el-button type="info" @click="confirm">确定</el-button>
            <el-button @click="cancel">取消</el-button>
          </div>
        </div>
      </el-popover>
    </div>
  </template>
  <script>
    import AreaPicker from './AreaPicker.vue'
  
    export default {
      name: 'HKMultiSelectTreeView',
      components: {
        AreaPicker,
      },
      
      props: {
        needClearAllSelection: {
          type: Boolean,
          default: false
        },
        limit: {// 1000以内才校验
          type:Number,
          default: 5,
        }
      },
      data () {
        return {
          expand: false,
          tags: [],
        }
      },
      computed: {
        // 用于显示的标签列表，避免切换时闪烁
        displayTags() {
          if (this.tags.length === 0) {
            return []
          }
          // 只返回第一个标签用于显示，避免宽度变化
          return [this.tags[0]]
        }
      },
      watch: {
        expand(v) {
          if (v) {
            // 使用 nextTick 延迟重置，确保弹出框完全显示后再操作，避免闪烁
            this.$nextTick(() => {
              if (this.$refs.picker && this.$refs.picker.setSelectedObjs) {
                this.$refs.picker.setSelectedObjs(this.tags)
              }
            })
          }
        },
      },
      methods: {
        /**
         * 处理 Popover 显示
         */
        handlePopoverShow() {
          // 弹出框显示时的处理
        },

        /**
         * 处理 Popover 隐藏
         */
        handlePopoverHide() {
          // 弹出框隐藏时的处理
        },
        optionLoaded(objs) {
          if (this.tags.length !== 0) return
          this.tags = [...objs]
          this.resetSelection()
          this.popChange()
          this.$emit('optionLoaded', this.tags)
        },
        confirm() {
          let selectOptions = this.$refs.picker.getIds()
          
          if ( this.limit <1000 && selectOptions.length > this.limit) {
            this.$message.error(`至多选择${this.limit}个节点`)
            return
          }
          if (selectOptions.length === 0) {
            this.$message.error('至少选择1个节点')
            return
          }
          this.tags = [...selectOptions]
          this.popChange()
          this.togglePanel(false)
        },
        cancel() {
          this.togglePanel(false)
        },
        resetSelection() {
          // 确保 picker 组件存在后再调用
          if (this.$refs.picker && this.$refs.picker.setSelectedObjs) {
            this.$refs.picker.setSelectedObjs(this.tags)
          }
        },
        togglePanel(expand) {
          if (typeof expand === 'boolean') {
            this.expand = expand
            return
          }
          this.expand = !this.expand
        },
        popChange() {
          this.$emit('onChecked', this.tags)
        },
        selectionChange() {
          // TODO: 5个上限
        },
        removeTag (tag) { // 删除标签
          this.cancel()
          if (this.tags.length === 1) {
            this.$message.error('至少需保留一个区域')
          } else {
            const index = this.tags.findIndex(row => row.nodeId === tag.nodeId )
            if (index !== -1) {
              this.tags.splice(index, 1)
              this.popChange()
            }
          }
        },
        initParams (values) {
          this.tags = values
          this.$refs.picker.setSelectedObjs(this.tags)
          this.popChange()
        }
      },
      beforeDestroy() {
        // el-popover 会自动清理，无需手动处理
      }
    }
  </script>
  <style lang="scss" scoped>
  @use '@/style/mixins.scss' as ai;
  
  .area-select {
    position: relative;
    display: inline-block;
    width: auto;
    max-width: 100%;
    min-width: 80px;
    cursor: pointer;

    .select-input {
      position: relative;
      background-color: rgba(232, 246, 255, 1);
      border: 1px solid rgba(232, 246, 255, 1);
      border-radius: 4px;
      transition: all 0.3s;
      min-height: 24px;
      display: inline-flex;
      align-items: center;
      min-width: 80px;

      &:hover {
        border: 1px solid rgba(56, 142, 255, 1);
      }

      &.is-focus {
        border-color: rgba(56, 142, 255, 1);
      }

      .select-input-inner {
        flex: 0 0 auto;
        padding: 0 30px 0 4px;
        min-height: 24px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 4px;
        font-family: var(--ym-ai-font-family, 'Microsoft YaHei UI', sans-serif);
        font-weight: normal;
        font-size: 14px;
        line-height: 22px;
        letter-spacing: 0px;
        text-align: left;
        color: rgba(56, 142, 255, 1);

        .select-tag {
          background: #fff !important;
          border: none;
          color: rgba(56, 142, 255, 1);
          margin: 0;
          font-family: var(--ym-ai-font-family, 'Microsoft YaHei UI', sans-serif);
          font-weight: normal;
          font-size: 14px;
          line-height: 22px;
          letter-spacing: 0px;
        }

        .placeholder {
          color: rgba(56, 142, 255, 1);
          font-family: var(--ym-ai-font-family, 'Microsoft YaHei UI', sans-serif);
          font-weight: normal;
          font-size: 14px;
          line-height: 22px;
          letter-spacing: 0px;
          text-align: left;
          white-space: nowrap;
        }
      }

      .select-suffix {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;

        .triangle-icon {
          display: inline-block;
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 6px solid rgba(56,142,255,1);
          transition: transform 0.3s;
          vertical-align: middle;

          &.is-reverse {
            transform: rotate(180deg);
          }
        }
      }
    }
  }
  </style>

  <style lang="scss">
  // 下拉面板样式（需要全局样式，因为 popover 是 append-to-body 的）
  .area-picker-popover {
    padding: 0 !important;
    border-radius: 2px;
    box-shadow: 0 0 2px 0 rgba(0,0,0,.2), 0 2px 4px 0 rgba(0,0,0,.12);
    
    .expand-pane {
      width: 620px;
      overflow: hidden;
      background: white;
      border-radius: 2px;
      
      .footer {
        padding: 8px 16px;
        text-align: right;
        background: #f6f6f6;
      }
    }
  }
  </style>
  