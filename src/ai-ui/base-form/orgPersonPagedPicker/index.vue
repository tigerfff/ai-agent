<template>
  <div class="person-select-wrapper" @mousedown="handleWrapperMouseDown">
    <el-select
      ref="selectRef"
      v-model="selectedUserIds"
      multiple
      :disabled="disabled"
      :placeholder="placeholder"
      :collapseTags="collapseTags"
      :max-collapse-tags="maxCollapseTags"
      class="person-select"
      popper-class="person-select-popper-hidden"
      @remove-tag="handleRemoveTag"
      @focus="handleSelectFocus"
      @visible-change="handleVisibleChange"
    >
      <el-option
        v-for="user in selectedUsers"
        :key="getUserId(user)"
        :label="getUserName(user)"
        :value="getUserId(user)"
      />
    </el-select>
    
    <!-- 人员选择弹框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      :area="[900,600]"
      :close-on-click-modal="false"
      append-to-body
    >
      <orgPersonPagedPicker
        ref="pickerRef"
        :value="tempSelectedUsers"
        :select-limit="selectLimit"
        :default-page-size="defaultPageSize"
        :filter-admin="filterAdmin"
        :max-list-limit="maxListLimit"
        :value-key="valueKey"
        :label-key="labelKey"
        :selectable="selectable"
        @input="handlePickerChange"
      />
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="info" @click="handleConfirm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import orgPersonPagedPicker from './orgPersonPagedPicker.vue';

export default {
  name: 'PersonSelect',
  components: {
    orgPersonPagedPicker
  },
  props: {
    // v-model 绑定的值，数组格式
    value: {
      type: Array,
      default: () => []
    },
    // 禁用状态
    disabled: {
      type: Boolean,
      default: false
    },
    // 占位符
    placeholder: {
      type: String,
      default: '请选择人员'
    },
    // 是否折叠标签
    collapseTags: {
      type: Boolean,
      default: false
    },
    // 折叠标签的最大数量
    maxCollapseTags: {
      type: Number,
      default: 2
    },
    // 最大选择数量限制
    selectLimit: {
      type: Number,
      default: 0
    },
    // 默认分页大小
    defaultPageSize: {
      type: Number,
      default: 50
    },
    // 是否过滤管理员
    filterAdmin: {
      type: Boolean,
      default: false
    },
    // 最大列表限制
    maxListLimit: {
      type: Number,
      default: 2000
    },
    // 输出值的 key
    valueKey: {
      type: String,
      default: 'userName'
    },
    // 输出标签的 key
    labelKey: {
      type: String,
      default: 'userId'
    },
    dialogTitle: {
      type: String,
      default: '选择人员'
    },
    selectable: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: false,
      selectedUsers: [], // 选中的用户列表
      tempSelectedUsers: [] // 临时选中的用户（用于取消操作）
    };
  },
  computed: {
    // 选中的用户 ID 列表（用于 el-select 的 v-model）
    selectedUserIds: {
      get() {
        return this.selectedUsers.map(user => this.getUserId(user));
      },
      set(val) {
        // 当通过 el-select 删除标签时，会触发这个 setter
        // 但我们已经通过 @remove-tag 处理了，这里可以留空
      }
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (Array.isArray(newVal)) {
          this.selectedUsers = [...newVal];
        } else {
          this.selectedUsers = [];
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 获取用户 ID
    getUserId(user) {
      return user?.userId || user?.roleId || user?.[this.valueKey] || '';
    },
    
    // 获取用户名称
    getUserName(user) {
      return user?.userName || user?.roleName || user?.[this.labelKey] || '';
    },
    
    // 处理 wrapper 的 mousedown 事件（捕获整个区域的点击）
    handleWrapperMouseDown(e) {
      // 如果点击的是删除按钮，不处理
      if (e.target.closest('.el-tag__close')) {
        return;
      }
      // 如果点击的是标签本身，也不处理（让删除按钮可以工作）
      if (e.target.closest('.el-tag') && !e.target.closest('.el-tag__close')) {
        return;
      }
      if (!this.disabled && !this.dialogVisible) {
        e.preventDefault();
        e.stopPropagation();
        this.openDialog();
      }
    },
    
    // 处理 select 聚焦（阻止下拉菜单显示，改为打开弹框）
    handleSelectFocus() {
      if (!this.disabled && !this.dialogVisible) {
        // 阻止下拉菜单显示，改为打开弹框
        this.$nextTick(() => {
          if (this.$refs.selectRef) {
            // 通过设置 visible 属性来关闭下拉菜单
            if (this.$refs.selectRef.visible !== undefined) {
              this.$refs.selectRef.visible = false;
            }
            // 尝试通过内部 reference 来 blur input
            if (this.$refs.selectRef.$refs && this.$refs.selectRef.$refs.reference) {
              const input = this.$refs.selectRef.$refs.reference.$el.querySelector('input');
              if (input) {
                input.blur();
              }
            }
          }
        });
        this.openDialog();
      }
    },
    
    // 处理下拉菜单显示/隐藏（阻止显示）
    handleVisibleChange(visible) {
      if (visible && !this.disabled && !this.dialogVisible) {
        // 立即关闭下拉菜单
        this.$nextTick(() => {
          if (this.$refs.selectRef) {
            // 通过设置 visible 属性来关闭下拉菜单
            if (this.$refs.selectRef.visible !== undefined) {
              this.$refs.selectRef.visible = false;
            }
            // 尝试通过内部 reference 来 blur input
            if (this.$refs.selectRef.$refs && this.$refs.selectRef.$refs.reference) {
              const input = this.$refs.selectRef.$refs.reference.$el.querySelector('input');
              if (input) {
                input.blur();
              }
            }
          }
        });
        // 打开弹框
        this.openDialog();
      }
    },
    
    // 打开选择弹框
    openDialog() {
      // 保存当前选中的用户作为临时值
      this.tempSelectedUsers = this.cloneDeep(this.selectedUsers);
      this.dialogVisible = true;
      // 等待弹框渲染完成后，更新选择器的值
      this.$nextTick(() => {
        if (this.$refs.pickerRef) {
          // 选择器组件会自动通过 value prop 接收值
        }
      });
    },
    
    // 处理选择器变化（临时值）
    handlePickerChange(users) {
      console.log('handlePickerChange', users);
      this.tempSelectedUsers = users;
    },
    
    // 确认选择
    handleConfirm() {
      this.selectedUsers = this.cloneDeep(this.tempSelectedUsers);
      this.dialogVisible = false;
      this.$emit('input', this.selectedUsers);
      this.$emit('change', this.selectedUsers);
    },
    
    // 取消选择
    handleCancel() {
      // 恢复为原来的值
      this.tempSelectedUsers = this.cloneDeep(this.selectedUsers);
      this.dialogVisible = false;
    },
    
    // 处理删除标签
    handleRemoveTag(tag) {
      // el-select 的 remove-tag 事件传递的 tag 是 selected 数组中的项
      // selected 项包含 value 和 currentLabel 等属性
      let userId;
      if (typeof tag === 'string') {
        userId = tag;
      } else if (tag && typeof tag === 'object') {
        // tag 对象包含 value 属性（就是用户 ID）
        userId = tag.value || tag.userId || tag.roleId || this.getUserId(tag);
      } else {
        userId = tag;
      }
      
      // 从 selectedUsers 中移除对应的用户
      const beforeLength = this.selectedUsers.length;
      this.selectedUsers = this.selectedUsers.filter(
        user => {
          const uid = this.getUserId(user);
          return uid !== userId && uid !== String(userId) && String(uid) !== String(userId);
        }
      );
      
      // 如果确实删除了，触发事件
      if (this.selectedUsers.length < beforeLength) {
        // 触发事件通知父组件
        this.$emit('input', this.selectedUsers);
        this.$emit('change', this.selectedUsers);
      }
    },
    
    // 深拷贝工具方法
    cloneDeep(obj) {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj.getTime());
      if (obj instanceof Array) return obj.map(item => this.cloneDeep(item));
      if (typeof obj === 'object') {
        const copy = {};
        Object.keys(obj).forEach(key => {
          copy[key] = this.cloneDeep(obj[key]);
        });
        return copy;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.person-select-wrapper {
  width: 100%;
  position: relative;
  
  .person-select {
    width: 100%;
    
    // 让整个 select 区域可点击
    ::v-deep .el-input__inner {
      cursor: pointer;
      user-select: none;
    }
    
    // 让 tags 区域可点击
    ::v-deep .el-select__tags {
      cursor: pointer;
      user-select: none;
    }
    
    // 让箭头图标可点击
    ::v-deep .el-input__suffix {
      cursor: pointer;
    }
    
    // 确保删除按钮可点击
    ::v-deep .el-tag__close {
      cursor: pointer;
      pointer-events: auto;
    }
  }
}
</style>

<style lang="scss">
// 隐藏 select 的下拉菜单
.person-select-popper-hidden {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

// 阻止 select 内部元素的默认点击行为
.person-select-wrapper {
  .person-select {
    // 阻止 tags 区域的点击事件触发下拉菜单
    ::v-deep .el-select__tags {
      pointer-events: auto;
      
      // 删除按钮保持可点击
      .el-tag__close {
        pointer-events: auto;
        cursor: pointer;
      }
    }
    
    // 阻止 input 区域的点击事件
    ::v-deep .el-input {
      pointer-events: auto;
    }
    
    // 阻止箭头图标的点击事件
    ::v-deep .el-input__suffix {
      pointer-events: auto;
    }
  }
}
</style>

<style lang="scss">
// 全局样式：确保弹框中的选择器正常显示
.person-select-dialog {
  .org-person-picker-container {
    margin: 0;
  }
}
</style>

