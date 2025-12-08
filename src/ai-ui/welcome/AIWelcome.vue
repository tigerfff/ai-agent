<template>
  <div class="ai-welcome">
    <div class="welcome-content">
      <!-- 图标区域 -->
      <div class="welcome-icon">
        <slot name="icon">
          <span class="default-icon">{{ icon }}</span>
        </slot>
      </div>

      <!-- 标题区域 -->
      <h2 class="welcome-title">{{ title }}</h2>
      <p class="welcome-desc" v-if="description">{{ description }}</p>

      <!-- 快捷指令区域 -->
      <div class="welcome-prompts" v-if="prompts.length > 0">
        <div 
          v-for="(item, index) in prompts" 
          :key="index"
          class="prompt-card"
          @click="handleClick(item)"
        >
          <div class="prompt-header">
            <span class="prompt-icon" v-if="item.icon">{{ item.icon }}</span>
            <span class="prompt-title">{{ item.title }}</span>
          </div>
          <div class="prompt-desc" v-if="item.desc">{{ item.desc }}</div>
          <div class="prompt-arrow">→</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIWelcome',
  props: {
    icon: {
      type: String,
      default: '👋'
    },
    title: {
      type: String,
      default: '欢迎使用'
    },
    description: {
      type: String,
      default: ''
    },
    // 快捷指令列表: [{ title, desc, icon, text }]
    prompts: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleClick(item) {
      // 传递整个 item 对象，以便父组件可以访问所有属性（如 needsFile）
      // 同时保持向后兼容：如果父组件只期望字符串，可以通过 item.text || item.title 获取
      this.$emit('select', item);
    }
  }
};
</script>

<style lang="scss" scoped>
.ai-welcome {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #E2ECF9;
  max-width: 1200px;

  .welcome-content {
    max-width: 680px;
    width: 100%;
    text-align: center;
  }

  .welcome-icon {
    margin-bottom: 24px;

    .default-icon {
      font-size: 64px;
      display: inline-block;
      background: #f0f2f5;
      width: 100px;
      height: 100px;
      line-height: 100px;
      border-radius: 50%;
    }
  }

  .welcome-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px 0;
  }

  .welcome-desc {
    font-size: 14px;
    color: #909399;
    margin: 0 0 40px 0;
    line-height: 1.6;
  }

  .welcome-prompts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    text-align: left;

    .prompt-card {
      background: #fff;
      border: 1px solid #e4e7ed;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      display: flex;
      flex-direction: column;

      &:hover {
        border-color: #c0c4cc;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);

        .prompt-arrow {
          opacity: 1;
        }
      }

      .prompt-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .prompt-icon {
          font-size: 18px;
        }

        .prompt-title {
          font-weight: 500;
          color: #303133;
          font-size: 15px;
        }
      }

      .prompt-desc {
        font-size: 13px;
        color: #909399;
        line-height: 1.5;
        margin-right: 24px;
      }

      .prompt-arrow {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #c0c4cc;
        font-family: monospace;
        opacity: 0;
        transition: opacity 0.2s;
      }
    }
  }
}
</style>

