<template>
  <AIDrawer 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    :width="drawerWidth"
    :modal="false"
    :wrapperClosable="false"
    :class="{ 'fullscreen': !isMini }"
    append-to-body
    @close="handleClose"
  >
      <AgentContainer
        v-if="visible"
        ref="agentContainer"
        :is-mini="isMini"
        v-bind="$attrs"
        v-on="$listeners"
        @close="handleClose"
        @toggle-size="handleToggleSize"
      >
        <!-- 透传插槽 -->
        <template v-for="(_, slot) in $scopedSlots" v-slot:[slot]="scope">
          <slot :name="slot" v-bind="scope" />
        </template>
      </AgentContainer>
  </AIDrawer>
</template>

<script>
import AIDrawer from '@/ai-ui/layout/AIDrawer.vue';
import AgentContainer from './AgentContainer.vue';

export default {
  name: 'AIChatWindow',
  inheritAttrs: false, // 禁用默认的属性继承，让 $attrs 包含所有非 prop 属性
  components: {
    AIDrawer,
    AgentContainer
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isMini: true   // 默认小窗模式
    };
  },
  watch: {
    visible(val) {
      console.log('AIChatWindow visible changed:', val);
      // 每次打开窗口时，执行周期重置逻辑
      if (val && this.$refs.agentContainer) {
        if (typeof this.$refs.agentContainer.resetCycle === 'function') {
          this.$refs.agentContainer.resetCycle();
        }
        
        this.$nextTick(() => {
          if (this.$refs.agentContainer && typeof this.$refs.agentContainer.fetchAgentTips === 'function') {
            this.$refs.agentContainer.fetchAgentTips();
          }
        });
      }
    }
  },
  mounted() {
    console.log('AIChatWindow mounted');
  },
  computed: {
    drawerWidth() {
      // isMini 为 true 时宽度 600px（小屏，有边距）
      // isMini 为 false 时宽度 100%（大屏，铺满屏幕）
      return this.isMini ? '600px' : '100%'; 
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
      this.$emit('close');
    },
    handleToggleSize() {
      this.isMini = !this.isMini;
    },
    // 对外暴露的 open 方法
    open(params) {
      this.$emit('update:visible', true);
      // 等待 DOM 更新后调用子组件的初始化方法
      this.$nextTick(() => {
        if (this.$refs.agentContainer) {
          this.$refs.agentContainer.initializeState(params);
        }
      });
    }
  }
};
</script>
