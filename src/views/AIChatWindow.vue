<template>
  <AIDrawer 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    :width="drawerWidth"
    :modal="false"
    :wrapperClosable="false"
    append-to-body
    @close="handleClose"
  >
    <AgentContainer
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
    }
  },
  mounted() {
    console.log('AIChatWindow mounted');
  },
  computed: {
    drawerWidth() {
      // isMini 为 true 时宽度 600px
      // isMini 为 false 时宽度自适应（占据大部分屏幕）
      // AIDrawer 内部有 right: 16px 的样式，所以设为 calc(100% - 32px) 可以保持左右对称
      return this.isMini ? '600px' : 'calc(100% - 32px)'; 
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
    open() {
      this.$emit('update:visible', true);
    }
  }
};
</script>
