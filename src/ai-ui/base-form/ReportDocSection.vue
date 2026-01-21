<template>
  <div class="report-doc-section" :class="{ 'is-mini-mode': isMini }">
    <div class="section-header">
      <div class="doc-icon-wrapper" :class="iconWrapperClass">
        <img v-if="iconType" :src="iconImage" class="doc-icon-image" />
        <i v-else :class="[iconClass, 'doc-icon']"></i>
      </div>
      <div class="doc-content">
        <p class="doc-title" :title="title">{{ title }}</p>
        <p class="doc-desc">{{ description }}</p>
      </div>
    </div>
    <div class="action-buttons">
      <hik-cloud-sync-export
        v-if="exportFunction"
        :export-function="exportFunction"
        :export-label="exportLabel"
      ></hik-cloud-sync-export>
      <el-button size="mini" icon="h-icon-details" @click="$emit('show-detail')">{{ showDetailLabel }}</el-button>
    </div>
  </div>
</template>

<script>
import excelIcon from '@/assets/images/excel_40.png';
import pdfIcon from '@/assets/images/pdf_40.png';

export default {
  name: 'ReportDocSection',
  props: {
    title: String,
    description: String,
    iconClass: {
      type: String,
      default: 'h-icon-tip_info'
    },
    iconType: {
      type: String,
      default: 'excel', // 'excel' 或 'pdf'
      validator: (value) => ['excel', 'pdf'].includes(value)
    },
    iconWrapperClass: String, // 用于扩展背景色，如 'green-bg'
    exportFunction: Function,
    exportLabel: {
      type: String,
      default: '导出明细'
    },
    showDetailLabel: {
      type: String,
      default: '详情'
    },
    isMini: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    iconImage() {
      return this.iconType === 'pdf' ? pdfIcon : excelIcon;
    }
  }
};
</script>

<style lang="scss" scoped>
.report-doc-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fb;
  border-radius: 8px;
  padding: 12px 16px;
  
  &.is-mini-mode {
    flex-direction: column;
    align-items: flex-start;

    .action-buttons {
      margin-top: 4px;
      margin-left: 44px; // 32px (icon) + 12px (gap)
      justify-content: flex-start;
      width: calc(100% - 44px);
      ::v-deep .el-button {
        font-weight: 400 !important;
        color: rgba(0,0,0,0.7);
      }
    }
  }

  .section-header {
    margin-bottom: 0;
    display: flex;
    align-items: center;

    .doc-content {
      margin-left: 12px;
    }
  }

  .doc-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    &.green-bg {
      .doc-icon {
        color: #52c41a;
      }
    }

    .doc-icon {
      color: #ff4d4f;
      font-size: 18px;
    }

    .doc-icon-image {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }
  }

  .doc-title {
    font-weight: 500;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.9);
    margin: 0;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
  }

  .doc-desc {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    margin: 2px 0 0 0;
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: flex-end;
    margin-left: 48px;
  }
}
</style>

