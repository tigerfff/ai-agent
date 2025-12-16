<template>
  <div class="bubble-footer-actions">
    <slot name="before-custom-actions"></slot>
    <!-- 1. 复制 -->
    <div 
      v-if="actions.includes('copy')" 
      class="action-item" 
      @click="handleCopy"
      title="复制"
    >
      <img src="@/assets/svg/copy.svg" alt="复制" class="action-icon" />
    </div>

    <!-- 2. 编辑 -->
    <div 
      v-if="actions.includes('edit')"
      class="action-item" 
      title="编辑"
      @click="openEditDialog"
    >
      <i class="h-icon-edit" style="font-size: 20px;color: #333;"></i>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      title="编辑"
      :visible.sync="editVisible"
      :area=[680,480]
      :close-on-click-modal="false"
      custom-class="ai-edit-dialog"
      append-to-body
    >
      <el-form
        ref="editForm"
        :model="editForm"
        :rules="editRules"
        label-width="0"
        style="margin-top: 20px;"
        @submit.native.prevent="handleEditConfirm"
      >
        <el-form-item prop="content">
          <el-input
            type="textarea"
            :rows="14"
            placeholder="请输入内容"
            v-model="editForm.content"
            resize="none"
            :maxlength="2000"
            :count="2000"
            autofocus
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleEditCancel">取消</el-button>
        <el-button type="primary" @click="handleEditConfirm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 3. 点赞 -->
    <div 
      v-if="actions.includes('like')" 
      class="action-item" 
      :class="{ active: localLikeStatus === 'like' }"
      @click="handleLike('like')"
      title="点赞"
    >
      <img 
        :src="likeIconSrc" 
        alt="点赞" 
        class="action-icon" 
      />
    </div>

    <!-- 4. 踩 -->
    <div 
      v-if="actions.includes('dislike')" 
      class="action-item" 
      :class="{ active: localLikeStatus === 'dislike' }"
      @click="handleLike('dislike')"
      title="踩"
    >
      <img 
        :src="dislikeIconSrc" 
        alt="踩" 
        class="action-icon" 
      />
    </div>

    <slot name="after-custom-actions"></slot>
  </div>
</template>

<script>
// 导入 SVG 图标
import likeNormalIcon from '@/assets/svg/like-normal.svg';
import likeSelectedIcon from '@/assets/svg/like-selected.svg';
import dislikeNormalIcon from '@/assets/svg/dislike-normal.svg';
import dislikeSelectedIcon from '@/assets/svg/dislike-selected.svg';

export default {
  name: 'BubbleFooter',
  props: {
    // 当前消息对象
    item: {
      type: Object,
      required: true
    },
    // 需要显示的按钮列表，例如 ['copy', 'edit']
    actions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      editVisible: false,
      editForm: {
        content: ''
      },
      editRules: {
        content: [
          { required: true, message: '请输入内容', trigger: 'blur' }
        ]
      },
      localLikeStatus: '', // '' | 'like' | 'dislike'
      // 图标路径
      likeNormalIcon,
      likeSelectedIcon,
      dislikeNormalIcon,
      dislikeSelectedIcon
    };
  },
  computed: {
    likeIconSrc() {
      return this.localLikeStatus === 'like' 
        ? this.likeSelectedIcon
        : this.likeNormalIcon;
    },
    dislikeIconSrc() {
      return this.localLikeStatus === 'dislike'
        ? this.dislikeSelectedIcon
        : this.dislikeNormalIcon;
    }
  },
  watch: {
    'item.likeStatus': {
      handler(val) {
        this.localLikeStatus = val || '';
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 清理文本，移除所有 widget 标签（如 <ymform:...>...</ymform:...>）
     */
    cleanTextFromWidgets(text) {
      if (!text) return '';
      // 匹配所有 <ymform:xxx>...</ymform:xxx> 标签（包括多行内容）
      // [\s\S]*? 非贪婪匹配任意字符（包括换行）
      return text.replace(/<ymform:[^>]*>[\s\S]*?<\/ymform:[^>]*>/gi, '').trim();
    },
    
    handleCopy() {
      let text = this.item.content || '';
      if (!text) {
        // 如果没有原始内容，静默返回（可能是只有附件的情况）
        return;
      }
      
      // 过滤掉 widget 标签内容
      text = this.cleanTextFromWidgets(text);
      if (!text) {
        // 如果过滤后没有文本内容，静默返回（不显示提示，因为可能用户只是想复制文本）
        return;
      }
      
      // 使用 navigator.clipboard
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message.success('复制成功');
          this.$emit('action', 'copy', this.item);
        }).catch(() => {
          this.$message.error('复制失败');
        });
      } else {
        // Fallback
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          this.$message.success('复制成功');
          this.$emit('action', 'copy', this.item);
        } catch (err) {
          this.$message.error('复制失败');
        }
        document.body.removeChild(textArea);
      }
    },
    
    openEditDialog() {
      this.editForm.content = this.item.content || '';
      this.editVisible = true;
      this.$nextTick(() => {
        if (this.$refs.editForm) {
          this.$refs.editForm.clearValidate();
        }
      });
    },

    handleEditConfirm() {
      if (!this.$refs.editForm) return;
      
      this.$refs.editForm.validate((valid) => {
        if (!valid) return;
        
        const content = this.editForm.content.trim();
        if (!content) {
          this.$message.warning('请输入内容');
          return;
        }
        
        this.$emit('action', 'edit', { ...this.item, content });
        this.editVisible = false;
      });
    },

    handleEditCancel() {
      this.editVisible = false;
      this.editForm.content = '';
      if (this.$refs.editForm) {
        this.$refs.editForm.clearValidate();
      }
    },

    handleLike(type) {
      // 如果已经是当前状态，则取消（设为 null 或 ''）
      const newStatus = this.localLikeStatus === type ? '' : type;
      this.localLikeStatus = newStatus;
      this.$emit('action', newStatus || 'cancel-like', this.item);
    }
  }
};
</script>

<style lang="scss" scoped>
.bubble-footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
  // opacity: 0; // 默认隐藏，hover 时显示
  // transition: opacity 0.2s;

  .action-item {
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }

    &.active {
      opacity: 1;
    }

    .action-icon {
      width: 16px;
      height: 16px;
      display: block;
    }
  }
}

// 配合 AIBubble 的 hover 显示
// 注意：这需要 AIBubble 或 AIHistory 的 CSS 支持
// 这里我们假设父级 .ai-bubble:hover 时显示
</style>

<style lang="scss">
.ai-edit-dialog {
   padding: 0 16px;
  .dialog-footer {
    .el-button--primary {
      background: rgba(56, 142, 255, 1) !important;
      border-color: rgba(56, 142, 255, 1) !important;
      color: #fff !important;
      
      &:hover {
        background: rgba(56, 142, 255, 0.9) !important;
        border-color: rgba(56, 142, 255, 0.9) !important;
      }
      
      &:active,
      &:focus {
        background: rgba(56, 142, 255, 0.8) !important;
        border-color: rgba(56, 142, 255, 0.8) !important;
      }
    }
  }
}
</style>
