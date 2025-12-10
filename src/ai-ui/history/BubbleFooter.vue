<template>
  <div class="bubble-footer-actions">
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
    <el-popover
      v-if="actions.includes('edit')"
      v-model="editVisible"
      placement="top"
      width="300"
      trigger="click"
      @show="initEdit"
    >
      <div class="edit-popover-content">
        <el-input
          type="textarea"
          :rows="4"
          placeholder="请输入内容"
          v-model="editContent"
          resize="none"
        ></el-input>
        <div class="edit-footer">
          <el-button size="mini" @click="editVisible = false">取消</el-button>
          <el-button type="info" size="mini" @click="handleEditConfirm">确定</el-button>
        </div>
      </div>
      <div slot="reference" class="action-item" title="编辑">
        <i class="h-icon-edit" style="font-size: 20px;color: #333;"></i>
      </div>
    </el-popover>

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
      editContent: '',
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
    handleCopy() {
      const text = this.item.content || '';
      if (!text) return;
      
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
    
    initEdit() {
      this.editContent = this.item.content || '';
    },

    handleEditConfirm() {
      this.$emit('action', 'edit', { ...this.item, content: this.editContent });
      this.editVisible = false;
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

::v-deep .el-popover{
  border-radius: 8px;
}

// 配合 AIBubble 的 hover 显示
// 注意：这需要 AIBubble 或 AIHistory 的 CSS 支持
// 这里我们假设父级 .ai-bubble:hover 时显示
</style>

<style lang="scss" >
.edit-popover-content {
  border-radius: 8px;
  .edit-footer {
    text-align: right;
    margin-top: 10px;
  }
}
</style>
