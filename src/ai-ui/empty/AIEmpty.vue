<template>
  <div class="ai-empty" :class="{ 'is-mini': isMini }">
    <div class="empty-content">
      <div class="empty-icon">
        <img v-if="displayIcon" :src="displayIcon" :alt="displayTitle" />
        <img v-else :src="trainingDefaultIcon" :alt="displayTitle"> 
      </img>
      </div>
      <div class="empty-title">{{ displayTitle }}</div>
      <div class="empty-description" v-if="displayDescription">{{ displayDescription }}</div>
      <div class="empty-action" v-if="showAction || type === 'no-service'">
        <slot name="action">
          <el-popover
            v-if="type === 'no-service'"
            ref="qrPopover"
            placement="top"
            width="320"
            trigger="click"
            popper-class="qr-code-popover"
          >
            <el-button 
              slot="reference"
              type="primary"
            >
              {{ actionText || '扫码联系' }}
            </el-button>
            <div class="qr-code-popover-content">
              <div class="qr-code-wrapper">
                <img :src="scanContactImage" alt="扫码联系" class="qr-code-image" />
              </div>
              <div class="qr-code-tip">
                <p>使用手机扫描二维码</p>
                <p>联系商务咨询</p>
              </div>
            </div>
          </el-popover>
          <el-button 
            v-else-if="actionText" 
            type="primary" 
            @click="handleAction"
          >
            {{ actionText }}
          </el-button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
// 导入图片资源
import trainingDefaultIcon from '@/assets/images/training-default@3x.png';
import noPurchaseIcon from '@/assets/images/no-purchase@3x.png';
import scanContactImage from '@/assets/images/scan-contact@3x.png';

export default {
  name: 'AIEmpty',
  props: {
    // 空状态类型：'default' | 'building' | 'no-service'
    type: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'building', 'no-service'].includes(value)
    },
    // 标题（如果设置了 type，会自动覆盖）
    title: {
      type: String,
      default: '暂无数据'
    },
    // 描述（如果设置了 type，会自动覆盖）
    description: {
      type: String,
      default: ''
    },
    // 图标（图片 URL，如果设置了 type，会自动覆盖）
    icon: {
      type: String,
      default: ''
    },
    // 默认图标（emoji 或文本）
    defaultIcon: {
      type: String,
      default: '📭'
    },
    // 是否显示操作按钮
    showAction: {
      type: Boolean,
      default: false
    },
    // 操作按钮文本
    actionText: {
      type: String,
      default: ''
    },
    // 是否为小窗模式
    isMini: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      trainingDefaultIcon,
      noPurchaseIcon,
      scanContactImage
    };
  },
  computed: {
    /**
     * 根据 type 自动确定显示的图标
     */
    displayIcon() {
      if (this.type === 'building') {
        return this.trainingDefaultIcon;
      } else if (this.type === 'no-service') {
        return this.noPurchaseIcon;
      }
      return this.icon || '';
    },
    /**
     * 根据 type 自动确定显示的标题
     */
    displayTitle() {
      if (this.type === 'building') {
        return '该智能体正在建设中...';
      } else if (this.type === 'no-service') {
        return this.title || '未购买服务';
      }
      return this.title;
    },
    /**
     * 根据 type 自动确定显示的描述
     */
    displayDescription() {
      if (this.type === 'building') {
        return this.description || '';
      } else if (this.type === 'no-service') {
        return this.description || '您尚未购买相关服务，请联系管理员开通';
      }
      return this.description;
    }
  },
  methods: {
    handleAction() {
      this.$emit('action');
    }
  }
};
</script>

<style lang="scss" scoped>
.ai-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 400px;
  padding: 40px 20px;

  &.is-mini {
    min-height: 300px;
    padding: 20px;
  }

  .empty-content {
    text-align: center;
    max-width: 400px;
  }

  .empty-icon {
    margin-bottom: 16px;
    display: flex;
    justify-content: center;

    
    img {
      width: 200px;
      height: auto;
      object-fit: contain;
    }

    .default-icon {
      font-size: 80px;
      line-height: 1;
    }
  }

  .empty-title {
    font-size: 16px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.9);
    margin-bottom: 8px;
  }

  .empty-description {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.5);
    line-height: 20px;
    margin-bottom: 24px;
  }

  .empty-action {
    margin-top: 24px;
  }

  &.is-mini {
    .empty-icon {
      margin-bottom: 12px;
      
      img {
        width: 120px;
        height: auto;
      }

      .default-icon {
        font-size: 60px;
      }
    }

    .empty-title {
      font-size: 14px;
      margin-bottom: 6px;
    }

    .empty-description {
      font-size: 12px;
      margin-bottom: 16px;
    }
  }
}

// 二维码弹窗样式
::v-deep .qr-code-popover {
  padding: 16px;

  .qr-code-popover-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .qr-code-wrapper {
      width: 280px;
      height: 280px;
      padding: 10px;
      background: #fff;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      .qr-code-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .qr-code-tip {
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
      font-size: 13px;
      line-height: 18px;

      p {
        margin: 2px 0;
      }
    }
  }
}
</style>

