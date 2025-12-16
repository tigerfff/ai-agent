<template>
  <div class="ai-load-select" :class="{ 'is-disabled': disabled }">
    <!-- 输入框（显示选中值） -->
    <div 
      ref="inputRef"
      class="select-input"
      :class="{ 'is-focus': visible, 'is-disabled': disabled }"
      @click="handleInputClick"
    >
      <div class="select-input-inner">
        <!-- 多选：显示标签 -->
        <template v-if="multiple">
          <el-tag
            v-for="(tag, index) in selectedTags"
            :key="getOptionKey(tag)"
            closable
            @close="handleTagClose(tag)"
            size="small"
            class="select-tag"
          >
            {{ getOptionLabel(tag) }}
          </el-tag>
          <span v-if="selectedTags.length === 0" class="placeholder">{{ placeholder }}</span>
        </template>
        
        <!-- 单选：显示文本 -->
        <template v-else>
          <span v-if="selectedLabel" class="select-text">{{ selectedLabel }}</span>
          <span v-else class="placeholder">{{ placeholder }}</span>
        </template>
      </div>
      
      <!-- 三角形图标 -->
      <div class="select-suffix">
        <span class="triangle-icon" :class="{ 'is-reverse': visible }"></span>
      </div>
    </div>

    <!-- 下拉框（使用 el-popover） -->
    <el-popover
      ref="popover"
      v-model="visible"
      placement="bottom-start"
      :width="popoverWidth"
      trigger="manual"
      popper-class="ver"
      :reference="referenceElement"
      :append-to-body="true"
      @show="handlePopoverShow"
      @hide="handlePopoverHide"
    >
      <div class="select-dropdown">
        <!-- 搜索框（第一行） -->
        <div class="search-input-wrapper" v-if="showSearch">
          <el-input
            v-model="searchKeyword"
            :placeholder="searchPlaceholder"
            size="small"
            clearable
            @input="handleSearchInput"
            @clear="handleSearchClear"
            class="search-input"
          >
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div>

        <!-- 选项列表 -->
        <div 
          ref="optionsWrapper"
          class="options-wrapper"
          @scroll="handleScroll"
        >
          <div
            v-for="item in allOptions"
            :key="getOptionKey(item)"
            class="select-option"
            :class="{
              'is-selected': isSelected(item),
              'is-disabled': isOptionDisabled(item)
            }"
            @click="handleOptionClick(item)"
          >
            <span class="option-label">{{ getOptionLabel(item) }}</span>
            <i v-if="isSelected(item)" class="el-icon-check option-check"></i>
          </div>
          
          <!-- 加载更多提示 -->
          <div v-if="loading" class="loading-more">
            <i class="el-icon-loading"></i>
            <span>加载中...</span>
          </div>
          
          <!-- 没有更多数据 -->
          <div v-if="!hasMore && allOptions.length > 0 && !loading" class="no-more">
            没有更多数据了
          </div>
          
          <!-- 空状态 -->
          <div v-if="!loading && allOptions.length === 0" class="empty-state">
            {{ searchKeyword ? '暂无匹配数据' : '暂无数据' }}
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'AILoadSelect',
  props: {
    // v-model 绑定值
    value: {
      type: [String, Number, Array],
      default: null
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: false
    },
    // 占位符
    placeholder: {
      type: String,
      default: '请选择'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否显示搜索框（第一行）
    showSearch: {
      type: Boolean,
      default: true
    },
    // 搜索框占位符
    searchPlaceholder: {
      type: String,
      default: '请输入关键词搜索'
    },
    // 远程搜索方法：function(query, page, pageSize) => Promise<{ list, total, hasMore }>
    remoteMethod: {
      type: Function,
      required: true
    },
    // 已选中的选项数据（用于显示标签，多选时需要）
    selectedOptions: {
      type: Array,
      default: () => []
    },
    // 获取选项的 key（用于 v-for :key）
    getOptionKey: {
      type: Function,
      default: (item) => item.value || item.id || item.code
    },
    // 获取选项的 label（显示文本）
    getOptionLabel: {
      type: Function,
      default: (item) => item.label || item.name || item.text || String(item.value || item.id || '')
    },
    // 获取选项的 value（实际值）
    getOptionValue: {
      type: Function,
      default: (item) => item.value || item.id || item.code
    },
    // 判断选项是否禁用
    isOptionDisabled: {
      type: Function,
      default: () => false
    },
    // 每页数量
    pageSize: {
      type: Number,
      default: 20
    },
    // 下拉框宽度
    popoverWidth: {
      type: [String, Number],
      default: 'auto'
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      searchKeyword: '',
      currentPage: 1,
      hasMore: true,
      allOptions: [], // 所有已加载的选项
      scrollDebounceTimer: null,
      searchDebounceTimer: null,
      popoverWidthValue: 0
    };
  },
  computed: {
    currentValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    },
    // 选中的标签（多选）
    selectedTags() {
      if (!this.multiple || !Array.isArray(this.currentValue)) {
        return [];
      }
      return this.selectedOptions.filter(opt => {
        const val = this.getOptionValue(opt);
        return this.currentValue.includes(val);
      });
    },
    // 选中的文本（单选）
    selectedLabel() {
      if (this.multiple || !this.currentValue) {
        return '';
      }
      const selected = this.selectedOptions.find(opt => {
        return this.getOptionValue(opt) === this.currentValue;
      });
      return selected ? this.getOptionLabel(selected) : '';
    },
    // 获取 reference 元素
    referenceElement() {
      return this.$refs.inputRef;
    }
  },
  watch: {
    visible(val) {
      if (val) {
        // 打开时，如果没有数据，执行初始搜索
        if (this.allOptions.length === 0) {
          this.doSearch(this.searchKeyword, 1);
        }
        
        // 计算下拉框宽度（与输入框一致）
        this.$nextTick(() => {
          this.updatePopoverWidth();
          if (this.$refs.optionsWrapper) {
            this.$refs.optionsWrapper.scrollTop = 0;
          }
        });
      }
    },
    // 监听 value 变化，如果有值但列表为空，自动加载
    value: {
      immediate: true,
      handler(newVal) {
        // 如果有默认值但列表为空，预加载数据
        if (this.hasValue(newVal) && this.allOptions.length === 0 && !this.loading) {
          this.doSearch('', 1);
        }
      }
    }
  },
  mounted() {
    // 点击外部关闭
    document.addEventListener('click', this.handleClickOutside);
    
    // 如果组件挂载时就有值，预加载数据
    if (this.hasValue(this.currentValue) && this.allOptions.length === 0 && !this.loading) {
      this.doSearch('', 1);
    }
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    if (this.scrollDebounceTimer) {
      clearTimeout(this.scrollDebounceTimer);
    }
  },
  methods: {
    /**
     * 判断是否有值（非空）
     */
    hasValue(val) {
      if (val === null || val === undefined || val === '') {
        return false;
      }
      if (Array.isArray(val)) {
        return val.length > 0;
      }
      return true;
    },
    /**
     * 更新下拉框宽度
     */
    updatePopoverWidth() {
      if (this.$el) {
        const inputWidth = this.$el.querySelector('.select-input').offsetWidth;
        this.popoverWidthValue = inputWidth;
        // 更新 popover 宽度
        if (this.$refs.popover && this.$refs.popover.popperJS) {
          const popper = this.$refs.popover.popperJS;
          if (popper.popper) {
            popper.popper.style.width = inputWidth + 'px';
          }
        }
      }
    },

    /**
     * 处理输入框点击
     */
    handleInputClick(e) {
      if (this.disabled) return;
      e.stopPropagation();
      this.visible = !this.visible;
    },

    /**
     * 处理点击外部
     */
    handleClickOutside(e) {
      if (!this.visible) return;
      
      // 检查点击是否在输入框内
      const inputEl = this.$refs.inputRef;
      if (inputEl && inputEl.contains(e.target)) {
        return;
      }
      
      // 检查点击是否在下拉框内（因为 append-to-body，需要查找 popover 的 DOM）
      const popover = this.$refs.popover;
      if (popover && popover.$refs && popover.$refs.popper) {
        const popperEl = popover.$refs.popper;
        if (popperEl && popperEl.contains(e.target)) {
          return;
        }
      }
      
      // 如果都不在，则关闭
      this.visible = false;
    },

    /**
     * 处理 Popover 显示
     */
    handlePopoverShow() {
      this.updatePopoverWidth();
    },

    /**
     * 处理 Popover 隐藏
     */
    handlePopoverHide() {
      // 可选：关闭时清空搜索
      // this.searchKeyword = '';
    },

    /**
     * 处理搜索框输入
     */
    handleSearchInput() {
      // 防抖处理
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }
      
      this.searchDebounceTimer = setTimeout(() => {
        this.currentPage = 1;
        this.hasMore = true;
        this.allOptions = [];
        this.doSearch(this.searchKeyword, 1);
      }, 300);
    },

    /**
     * 处理搜索框清空
     */
    handleSearchClear() {
      this.searchKeyword = '';
      this.currentPage = 1;
      this.hasMore = true;
      this.allOptions = [];
      this.doSearch('', 1);
    },

    /**
     * 执行搜索
     */
    async doSearch(query, page) {
      if (this.loading) return;
      
      this.loading = true;
      try {
        const result = await this.remoteMethod(query, page, this.pageSize);
        
        if (result && Array.isArray(result.list)) {
          if (page === 1) {
            this.allOptions = result.list;
          } else {
            // 加载更多时，需要去重
            // 使用 Set 存储已存在的 key，避免重复添加
            const existingKeys = new Set(
              this.allOptions.map(item => this.getOptionKey(item))
            );
            
            // 过滤掉已存在的项
            const newItems = result.list.filter(item => {
              const key = this.getOptionKey(item);
              return !existingKeys.has(key);
            });
            
            // 追加新数据
            this.allOptions = [...this.allOptions, ...newItems];
          }
          
          this.hasMore = result.hasMore !== false && result.list.length >= this.pageSize;
          this.currentPage = page;
        } else {
          console.warn('[AILoadSelect] remoteMethod should return { list, hasMore }');
          this.allOptions = [];
          this.hasMore = false;
        }
      } catch (e) {
        console.error('[AILoadSelect] Search failed:', e);
        this.$message && this.$message.error('搜索失败，请重试');
        this.allOptions = [];
        this.hasMore = false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 处理下拉框滚动（实现分页）
     */
    handleScroll(e) {
      if (this.scrollDebounceTimer) {
        clearTimeout(this.scrollDebounceTimer);
      }
      
      this.scrollDebounceTimer = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const scrollBottom = scrollHeight - scrollTop - clientHeight;
        
        // 距离底部 50px 时加载更多
        if (scrollBottom < 50 && this.hasMore && !this.loading) {
          this.loadMore();
        }
      }, 100);
    },

    /**
     * 加载更多
     */
    loadMore() {
      if (!this.hasMore || this.loading) return;
      this.doSearch(this.searchKeyword, this.currentPage + 1);
    },

    /**
     * 处理选项点击
     */
    handleOptionClick(item) {
      if (this.isOptionDisabled(item)) return;
      
      const value = this.getOptionValue(item);
      console.log('[AILoadSelect] handleOptionClick:', { value, item, currentValue: this.currentValue });
      
      if (this.multiple) {
        // 多选
        const currentValues = Array.isArray(this.currentValue) ? [...this.currentValue] : [];
        const index = currentValues.indexOf(value);
        
        if (index > -1) {
          // 取消选中
          currentValues.splice(index, 1);
        } else {
          // 选中
          currentValues.push(value);
        }
        
        // 通过 emit input 来更新 v-model
        this.$emit('input', currentValues);
        this.$emit('change', currentValues, item);
      } else {
        // 单选：直接 emit input 来更新 v-model
        console.log('[AILoadSelect] Emitting input:', value);
        this.$emit('input', value);
        // 延迟关闭，确保 change 事件先触发
        this.$nextTick(() => {
          this.visible = false;
          this.$emit('change', value, item);
        });
      }
    },

    /**
     * 处理标签关闭（多选）
     */
    handleTagClose(tag) {
      const value = this.getOptionValue(tag);
      const currentValues = Array.isArray(this.currentValue) ? [...this.currentValue] : [];
      const index = currentValues.indexOf(value);
      
      if (index > -1) {
        currentValues.splice(index, 1);
        this.currentValue = currentValues;
        this.$emit('change', this.currentValue);
      }
    },

    /**
     * 判断选项是否已选中
     */
    isSelected(item) {
      const value = this.getOptionValue(item);
      
      if (this.multiple) {
        return Array.isArray(this.currentValue) && this.currentValue.includes(value);
      } else {
        return this.currentValue === value;
      }
    },

    /**
     * 聚焦
     */
    focus() {
      this.visible = true;
    },

    /**
     * 失焦
     */
    blur() {
      this.visible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/style/mixins.scss' as ai;
.ai-load-select {
  position: relative;
  display: inline-block;
  width: 100%;

  .select-input {
    position: relative;
    background-color: rgba(232, 246, 255, 1);
    border: 1px solid rgba(232, 246, 255, 1);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    min-height: 32px;
    display: flex;
    align-items: center;

    &:hover {
      border-color: rgba(232, 246, 255, 1);
    }

    &.is-focus {
      border-color: rgba(56, 142, 255, 1);
    }

    &.is-disabled {
      background-color: #f5f7fa;
      border-color: #e4e7ed;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .select-input-inner {
      flex: 1;
      padding: 0 30px 0 4px;
      min-height: 32px;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;

      .select-tag {
        background: #fff !important;
        border: none;
        color: rgba(56, 142, 255, 1);
        margin: 0;
      }

      .select-text {
        color: rgba(56, 142, 255, 1);
        font-size: 14px;
        line-height: 32px;
        word-break: break-all;
        @include ai.ellipsis(1);
      }

      .placeholder {
        color: #c0c4cc;
        font-size: 14px;
        line-height: 32px;
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
        border-top: 6px solid #909399;
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
// 下拉框样式（需要全局样式，因为 popover 是 append-to-body 的）
.ver {
  width: 250px;
  padding: 0 !important;
  position: fixed !important;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 0px !important;

  .select-dropdown {
    .search-input-wrapper {
      padding: 8px;
      border-bottom: 1px solid #ebeef5;
      background: #fff;
      border-radius: 4px 4px 0 0;

      .search-input {
        .el-input__inner {
          background-color: val(--ym-ai-light-primary-color);
          border-color: val(--ym-ai-primary-color);
          color: val(--ym-ai-primary-color);
          border-radius: 4px;

          &:focus {
            border-color: rgba(56, 142, 255, 1);
          }
        }
      }
    }

    .options-wrapper {
      max-height: 300px;
      overflow-y: auto;
      padding: 4px 0;

      .select-option {
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: #606266;
        transition: background-color 0.2s;

        &:hover {
          background-color: #f5f7fa;
        }

        &.is-selected {
          color: rgba(56, 142, 255, 1);
          font-weight: 500;
          background-color: rgba(232, 246, 255, 0.5);

          .option-check {
            color: rgba(56, 142, 255, 1);
          }
        }

        &.is-disabled {
          color: #c0c4cc;
          cursor: not-allowed;

          &:hover {
            background-color: transparent;
          }
        }

        .option-label {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .option-check {
          margin-left: 8px;
          font-size: 16px;
        }
      }

      // 自定义滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;

        &:hover {
          background: #a8a8a8;
        }
      }
    }

    .loading-more,
    .no-more,
    .empty-state {
      padding: 12px;
      text-align: center;
      color: #909399;
      font-size: 12px;

      .el-icon-loading {
        margin-right: 4px;
        animation: rotating 1s linear infinite;
      }
    }

    .no-more {
      color: #c0c4cc;
    }

    .empty-state {
      color: #909399;
    }
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
