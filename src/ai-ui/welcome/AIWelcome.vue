<template>
  <div class="ai-welcome">
    <div class="welcome-content">
      <!-- 图标区域 -->
      <div class="welcome-icon">
        <slot name="icon">
          <img :src="icon" alt="icon" width="44px">
        </slot>
      </div>

      <!-- 标题区域 -->
      <h2 class="welcome-title">{{ title }}</h2>
      <p class="welcome-desc" v-if="description">{{ description }}</p>
      <!-- 默认值 -->
      <slot>
        <div class="welcome-prompts" v-if="prompts.length > 0">
        <div 
          v-for="(item, index) in prompts" 
          :key="index"
          class="prompt-card"
          @click="handleClick(item)"
        >
          <div class="prompt-desc" v-if="item.desc">{{ item.desc }}</div>
        </div>
        <div>
          <span></span>
        </div>
      </div>
      </slot>
      <!-- 快捷指令区域 -->
      <div class="welcome-footer">
        <slot name="footer">
          <span>
          </span>
        </slot>
      </div>
    </div>  
  </div>
</template>

<script>
import trainingSquareIcon from '@/assets/images/training-square@3x-1.png';
export default {
  name: 'AIWelcome',
  props: {
    icon: {
      type: String,
      default: trainingSquareIcon
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
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #E2ECF9;
  max-width: 1200px;

  .welcome-content {
    max-width: 680px;
    padding: 32px 0;
    width: 100%;
    text-align: left;
  }

  .welcome-icon {
    margin-bottom: 12px;

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
    color: rgba(0,0,0,0.7);
    font-weight: bold;
    font-size: 28px;
    line-height: 36px;
    letter-spacing: 0px;
    text-align: left;
    margin-bottom: 8px;
  }

  .welcome-desc {
    font-size: 14px;
    color: #909399;
    margin-bottom: 24px;
    line-height: 1.6;
  }

  .welcome-prompts {
    display: flex;
    
    gap: 16px;
    text-align: left;

    .prompt-card {
      background: #fff;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
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

      .prompt-desc {
        color: rgba(0,0,0,0.7);
        font-size: 14px;
        line-height: 22px;
        letter-spacing: 0px;
        text-align: left;
      }
    }
  }
}
</style>

