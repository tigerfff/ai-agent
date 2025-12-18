<template>
  <div class="train-result-upload">
    <el-popover
      ref="qrPopover"
      placement="top"
      width="120"
      trigger="hover"
      popper-class="qr2-code-popover"
      :disabled="isDisabled"
    >
      <div class="qr-code-content" slot="reference">
        <div class="qr-btn" :class="{ 'is-disabled': isDisabled }">
          <span class="qr-icon">
            <i class="h-icon-details" style="font-size: 24px; color: rgba(0, 0, 0, 0.7)"></i>
          </span>
          <span>查看实操流程</span>
         
        </div>
      </div>
      
      <div class="qr-code-popover-content">
        <div class="qr-code-wrapper" v-if="qrCodeUrl">
          <img :src="qrCodeUrl" alt="二维码" class="qr-code-image" />
        </div>
        <div class="qr-code-loading" v-else>
          <i class="el-icon-loading"></i>
          <span>生成二维码中...</span>
        </div>
        <div class="qr-code-tip">
          <p>使用手机扫描二维码</p>
          <p>查看实操审核流程</p>
        </div>
      </div>
    </el-popover>
    <span class="divider">|</span>
  </div>
</template>

<script>
import { parseWidgetData } from './widgetParser.js';
import QRCode from 'qrcode';

export default {
  name: 'TrainResultUpload',
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    // 是否为不可操作的历史消息
    isHistoryDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      qrCodeUrl: '',
      parsedData: {}
    };
  },
  computed: {
    isDisabled() {
      return this.isHistoryDisabled;
    },
    projectId() {
      return this.parsedData.projectId || '';
    },
    taskId() {
      return this.parsedData.taskId || '';
    },
    /**
     * 生成二维码链接地址
     */
    qrCodeLink() {
      if (!this.projectId || !this.taskId) {
        return '';
      }
      
      // 根据当前域名动态构建 URL
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.hik-cloud.com';
      return `${origin}/training-h5/index.html#/?canType=operation&id=${this.projectId}&taskId=${this.taskId}`;
    }
  },
  watch: {
    // 监听 parsedData 变化（如果是异步解析的话）
    'parsedData.projectId'() {
      if (this.qrCodeLink && !this.qrCodeUrl) {
        this.generateQRCode();
      }
    }
  },
  created() {
    // 解析 widget 数据
    this.parsedData = parseWidgetData(this.data, 'ymform:train_video_process_check');
    // 如果解析后的数据足够生成链接，立即生成二维码
    if (this.qrCodeLink) {
      this.generateQRCode();
    }
  },
  methods: {
    /**
     * 生成二维码
     * 使用 qrcode 库在本地生成二维码
     */
    async generateQRCode() {
      if (!this.qrCodeLink) {
        this.$message?.error('缺少必要参数：projectId、taskId 或 id');
        return;
      }

      try {
        // 使用 qrcode 库生成二维码 Data URL
        const qrDataUrl = await QRCode.toDataURL(this.qrCodeLink, {
          width: 280,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        this.qrCodeUrl = qrDataUrl;
      } catch (e) {
        console.error('[TrainResultUpload] Generate QR code failed:', e);
        this.$message?.error('生成二维码失败');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.train-result-upload {
  display: inline-flex;
  align-items: center;

  .divider {
    margin: 0 12px;
    color: rgba(0, 0, 0, 0.1);
    line-height: 1;
  }

  .qr-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    background: #FFF;
    // border: 1px solid rgba(232, 246, 255, 1);
    border-radius: 8px;
    color: rgba($color: #000000, $alpha: .7);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;

    &:hover:not(.is-disabled) {
      background: rgba(56, 142, 255, 0.1);
      border-color: rgba(56, 142, 255, 0.3);
    }

    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .qr-icon {
      font-size: 16px;
      line-height: 1;
    }
  }
}

// 二维码 Popover 样式
 
</style>

<style lang="scss">

.qr2-code-popover {
  padding: 16px;

  .qr-code-popover-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .qr-code-wrapper {
      width: 120px;
      height: 120px;
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

    .qr-code-loading {
      width: 280px;
      height: 280px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: rgba(0, 0, 0, 0.5);

      i {
        font-size: 28px;
        color: rgba(56, 142, 255, 1);
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

