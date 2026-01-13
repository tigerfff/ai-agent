<template>
  <div class="ai-suggest-widget">
    <div class="welcome-prompts" v-if="suggestPrompt.length > 0">
      <div 
        v-for="(text, index) in suggestPrompt" 
        :key="index"
        class="prompt-card"
        @click="handleClick(text)"
      >
        <div class="prompt-desc">
          <span>{{ text }}</span>
          <i class="h-icon-angle_right" style="padding: 0 4px; color: #000"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AISuggestWidget',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    suggestPrompt() {
      return this.data.suggestPrompt || [];
    }
  },
  methods: {
    handleClick(text) {
      this.$emit('select', text);
    }
  }
};
</script>

<style lang="scss" scoped>
.ai-suggest-widget {
  margin-top: 8px;
  width: 100%;

  .welcome-prompts {
    display: flex;
    flex-direction: column;
    gap: 16px;
    text-align: left;
    flex-wrap: wrap;

    .prompt-card {
      background: #fff;
      border: none;
      border-radius: 8px;
      padding: 8px 16px 8px 16px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      max-width: 100%;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
      }

      .prompt-desc {
        display: flex;
        align-items: center;
        color: rgba(0, 0, 0, 0.7);
        font-size: 14px;
        line-height: 22px;
        text-align: left;
      }
    }
  }
}
</style>

