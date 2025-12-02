<template>
  <div class="ai-conversations">
    <slot name="header"></slot>
    
    <div class="conversations-list-wrapper">
      <el-scrollbar ref="scrollbar" wrap-class="conversations-scrollbar">
        <div class="conversations-content">
          
          <!-- 模式 A: 分组展示 -->
          <template v-if="groupable">
            <div 
              v-for="group in groupedItems" 
              :key="group.key" 
              class="conversation-group"
            >
              <div 
                class="group-title sticky-title" 
                @click="toggleGroup(group.key)"
              >
                <span class="group-toggle-icon" :class="{ 'is-collapsed': collapsedGroups[group.key] }">
                  ▼
                </span>
                {{ group.title }}
              </div>
              
              <div class="group-items" v-show="!collapsedGroups[group.key]">
                <ConversationItem
                  v-for="item in group.children"
                  :key="item.id"
                  :item="item"
                  :active="activeKey === item.id"
                  @click="handleItemClick(item)"
                  @menu-command="handleMenuCommand"
                >
                  <template v-if="$slots.label" #label="{ item }">
                    <slot name="label" :item="item"></slot>
                  </template>
                </ConversationItem>
              </div>
            </div>
          </template>

          <!-- 模式 B: 扁平展示 -->
          <template v-else>
            <ConversationItem
              v-for="item in items"
              :key="item.id"
              :item="item"
              :active="activeKey === item.id"
              @click="handleItemClick(item)"
              @menu-command="handleMenuCommand"
            >
              <template v-if="$slots.label" #label="{ item }">
                <slot name="label" :item="item"></slot>
              </template>
            </ConversationItem>
          </template>

        </div>
      </el-scrollbar>
    </div>

    <slot name="footer"></slot>
  </div>
</template>

<script>
import ConversationItem from './ConversationItem.vue';

export default {
  name: 'AIConversations',
  components: {
    ConversationItem
  },
  props: {
    items: {
      type: Array,
      default: () => []
    },
    activeKey: {
      type: [String, Number],
      default: ''
    },
    groupable: {
      type: Boolean,
      default: false
    },
    ungroupedTitle: {
      type: String,
      default: '未分组'
    }
  },
  data() {
    return {
      collapsedGroups: {}
    };
  },
  computed: {
    groupedItems() {
      if (!this.groupable) return [];
      
      // 分组标题映射（将英文 key 转为中文显示）
      const groupTitleMap = {
        'today': '今天',
        'yesterday': '昨天',
        'earlier': '更早',
        'week': '本周',
        'month': '本月'
      };
      
      const groups = {};
      this.items.forEach(item => {
        const groupKey = item.group || this.ungroupedTitle;
        // 如果 groupKey 在映射表中，使用中文标题；否则直接使用原值
        const groupTitle = groupTitleMap[groupKey] || groupKey || this.ungroupedTitle;
        
        if (!groups[groupKey]) {
          groups[groupKey] = {
            key: groupKey,
            title: groupTitle,
            children: []
          };
        }
        groups[groupKey].children.push(item);
      });

      // 排序：今天 > 昨天 > 更早 > 其他
      const sortOrder = ['today', 'yesterday', 'earlier'];
      return Object.values(groups).sort((a, b) => {
        const indexA = sortOrder.indexOf(a.key);
        const indexB = sortOrder.indexOf(b.key);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
      });
    }
  },
  methods: {
    handleItemClick(item) {
      console.log(item,'item')
      this.$emit('update:activeKey', item.id);
      this.$emit('change', item);
    },
    handleMenuCommand(command, item) {
      this.$emit('menu-command', command, item);
    },
    toggleGroup(groupKey) {
      this.$set(this.collapsedGroups, groupKey, !this.collapsedGroups[groupKey]);
    }
  }
};
</script>

<style scoped>
.ai-conversations {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.conversations-list-wrapper {
  flex: 1;
  overflow: hidden;
}

.conversations-content {
  padding: 10px;
}

.conversation-group {
  margin-bottom: 16px;
}

.group-title {
  font-size: 12px;
  color: #909399;
  padding: 4px 12px;
  margin-bottom: 4px;
  background: #fff; /* 确保吸顶时不透明 */
  cursor: pointer;
  display: flex;
  align-items: center;
  user-select: none;
}

.group-title:hover {
  color: #606266;
}

.group-toggle-icon {
  display: inline-block;
  margin-right: 4px;
  font-size: 10px;
  transition: transform 0.2s;
  transform: rotate(0deg);
}

.group-toggle-icon.is-collapsed {
  transform: rotate(-90deg);
}

/* 简单的吸顶效果 (sticky) */
.sticky-title {
  position: sticky;
  top: 0;
  z-index: 1;
}
</style>

