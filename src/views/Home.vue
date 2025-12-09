<template>
  <div class="ai-home" :class="{ 'is-mini': isMini }">
    <div class="home-header-bar">
      <div class="header-right">
        <div class="toggle-btn" @click="toggleWindowSize" :title="isMini ? '最大化' : '还原'">
          <img v-if="isMini" src="@/assets/svg/expand.svg" alt="最大化" class="icon-svg" />
          <img v-else src="@/assets/svg/collapse.svg" alt="还原" class="icon-svg" />
        </div>
        <div class="toggle-btn" title="关闭" @click="closeWindow">
          <img src="@/assets/svg/close-window.svg" alt="关闭" class="icon-svg" />
        </div>
      </div>
    </div>
    
    <div class="home-scrollable-content">
      <div class="home-header">
        <h2>海康云眸-AI试用</h2>
        <p>AI试用具备多个智能场景的 AI技能，可以帮你提高工作效率，快来试试吧～</p>
      </div>
      <div class="agent-grid">
      <div 
        v-for="agent in agents" 
        :key="agent.id" 
        class="agent-card"
        @click="$emit('select', agent)"
      >
        <div class="card-header-row">
          <div class="card-icon">
            <img :src="agent.icon" :alt="agent.name" />
          </div>
          <div class="go-use-btn">去使用 ></div>
        </div>
        
        <div class="card-info">
          <div class="card-name">{{ agent.name }}</div>
          <div class="card-tag">
            <el-tag type="primary" v-for="(item,index) in agent.tags" :key="index">{{ item }}</el-tag>
          </div>
          <div class="card-desc">{{ agent.description || '暂无描述' }}</div>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIHome',
  props: {
    agents: {
      type: Array,
      default: () => []
    },
    isMini: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    toggleWindowSize() {
      this.$emit('toggle-size');
    },
    closeWindow() {
      this.$emit('close');
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/style/mixins.scss' as *;

.ai-home {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: 
    radial-gradient(circle at 50% 50%, #C5CEFF 0%, rgba(255, 255, 255, 0) 100%),
    radial-gradient(circle at 50% 50%, #388EFF 0%, rgba(56, 142, 255, 0) 100%),
    #E2ECF9;
  position: relative;
  

  .home-header-bar {
    flex-shrink: 0;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 16px;
    background: transparent;
    z-index: 10;

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toggle-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      .icon-svg {
        width: 20px;
        height: 20px;
      }
      
      .icon-text {
        font-size: 18px;
        color: #606266;
        line-height: 1;
      }
    }
  }

  .home-scrollable-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 32px;
    @extend %scrollbar;
  }

  .home-header {
    margin-top: 18px;
    text-align: center;

    h2 {
      color: rgba(0, 0, 0, 0.9);
      font-weight: bold;
      font-size: 28px;
      line-height: 36px;
      letter-spacing: 0px;
      text-align: center;
      margin-bottom: 24px;
    }

    p {
      color: rgba(0, 0, 0, 0.5);
      font-size: 16px;
      line-height: 24px;
      text-align: center;
      margin-bottom: 40px;
    }
  }
  
  &.is-mini .home-header {
    margin-top: 18px;
  }

  .agent-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(368px, 1fr));
    gap: 16px;
    max-width: 1200px;
    padding: 0 32px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  // 小窗模式适配
  &.is-mini .agent-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 600px;
    gap: 16px;
  }

  .agent-card {
    box-sizing: border-box;
    background: #fff;
    width: 368px;
    height: 196px;
    border-radius: 8px;
    padding: 24px;
    cursor: pointer;
    border: 1px solid #eee;
    display: flex;
    flex-direction: column;

    &:hover {
      box-shadow: 0 8px 24px rgba(56, 142, 255, 0.2);
      background: linear-gradient(135deg, #9D83FF 0%, #388EFF 100%);
      border-color: transparent;

      .go-use-btn {
        opacity: 1;
        transform: translateX(0);
      }

      .card-name {
        color: #fff;
      }

      .card-tag {
        .el-tag {
          background-image: none !important;
          background-color: #fff !important;
          color: #388EFF !important;
          -webkit-background-clip: border-box !important;
          background-clip: border-box !important;
          -webkit-text-fill-color: currentColor !important;

          &::before {
            display: none;
          }
        }
      }

      .card-desc {
        color: rgba(255, 255, 255, 0.9);
      }
    }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
    }

    .go-use-btn {
      font-size: 14px;
      color: #fff;
      opacity: 0;
      transform: translateX(-10px);
    }

    .card-icon {
      font-size: 32px;
      width: 44px;
      height: 44px;
      background: #f0f7ff;
      border-radius: 8px;
      line-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      span {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .card-info {
      flex: 1;
    }

    .card-name {
      font-size: 16px;
      font-weight: bold;
      color: #000;
      margin-bottom: 6px;
    }

    .card-tag {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;

      .el-tag {
        border: none;
        border-radius: 4px;
        font-size: 12px;
        height: 20px;
        line-height: 20px;

        &:nth-child(2n + 1) {
          background-color: rgba(#388EFF, 0.1);
          color: #388EFF;
        }

        &:nth-child(2n) {
          position: relative;
          background-image: linear-gradient(89.21deg, rgba(157, 131, 255, 1) 0%, rgba(56, 142, 255, 1) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          z-index: 1;

          &::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            inset: 0;
            background-image: linear-gradient(90deg, rgba(157, 131, 255, 1) 0%, rgba(56, 142, 255, 1) 100%);
            border-radius: 4px;
            z-index: 0;
            opacity: 0.3;
          }
        }
      }
    }

    .card-desc {
      color: rgba(0, 0, 0, 0.4);
      font-weight: regular;
      font-size: 12px;
      line-height: 20px;
      text-align: left;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  // 小窗模式适配
  &.is-mini .agent-card {
    width: 100%;
    max-width: 260px;
    height: 196px;
    min-width: 250px;
  }
}
</style>


