<template>
  <div class="ai-home">
    <div class="home-header">
      <h2>欢迎使用 AI 助手</h2>
      <p>请选择一个智能体开始对话</p>
    </div>
    
    <div class="agent-grid">
      <div 
        v-for="agent in agents" 
        :key="agent.id" 
        class="agent-card"
        @click="$emit('select', agent)"
      >
        <div class="card-icon">{{ agent.icon || '🤖' }}</div>
        <div class="card-info">
          <div class="card-name">{{ agent.name }}</div>
          <div class="card-desc">{{ agent.description || '暂无描述' }}</div>
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
    }
  }
};
</script>

<style scoped>
.ai-home {
  padding: 40px;
  height: 100%;
  overflow-y: auto;
  background: #f9f9f9;
}

.home-header {
  text-align: center;
  margin-bottom: 40px;
}

.home-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.home-header p {
  color: #666;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.agent-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #eee;
}

.agent-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.card-icon {
  font-size: 32px;
  margin-right: 16px;
  width: 48px;
  height: 48px;
  background: #f0f7ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-info {
  flex: 1;
}

.card-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}

.card-desc {
  font-size: 13px;
  color: #999;
  line-height: 1.4;
}
</style>

