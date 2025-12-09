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
                {{ group.title }}
                <span class="group-toggle-icon" :class="{ 'is-collapsed': collapsedGroups[group.key] }">
                  <i class="h-icon-angle_up"></i>
                </span>
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
                  <template v-if="$scopedSlots.label" #label="{ item }">
                    <slot name="label" :item="item"></slot>
                  </template>
                </ConversationItem>
              </div>
            </div>
          </template>

          <!-- 模式 B: 扁平展示 -->
          <template v-else>
            <ConversationItem
              v-for="item in processedItems"
              :key="item.id"
              :item="item"
              :active="activeKey === item.id"
              @click="handleItemClick(item)"
              @menu-command="handleMenuCommand"
            >
              <template v-if="$scopedSlots.label" #label="{ item }">
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
    },
    // 是否自动按时间分组（当 groupable 为 true 时生效）
    autoGroupByTime: {
      type: Boolean,
      default: true
    },
    // 使用哪个时间字段进行分组
    timeField: {
      type: String,
      default: 'updateTime',
      validator: (v) => ['createTime', 'updateTime'].includes(v)
    },
    // 是否启用置顶功能
    enableTop: {
      type: Boolean,
      default: true
    },
    // 置顶字段名
    topField: {
      type: String,
      default: 'top'
    }
  },
  data() {
    return {
      collapsedGroups: {}
    };
  },
  computed: {
    // 处理后的数据（添加时间分组和置顶标记）
    processedItems() {
      return this.items.map(item => {
        // 如果外部已经传了 group，优先使用；否则自动计算
        const group = item.group || (this.autoGroupByTime ? this.calculateTimeGroup(item) : null);
        const isTop = this.enableTop && item[this.topField] === true;
        
        return {
          ...item,
          group: group || this.ungroupedTitle,
          _isTop: isTop,
          _sortTime: this.getTimeValue(item)
        };
      });
    },
    
    groupedItems() {
      if (!this.groupable) return [];
      
      // 分组标题映射
      const groupTitleMap = {
        'pinned': '置顶',
        'today': '今天',
        'yesterday': '昨天',
        'within30days': '30天内',
        'more': '更多',
        'earlier': '更早',
        'week': '本周',
        'month': '本月'
      };
      
      const groups = {};
      
      // 先按置顶和时间排序
      const sortedItems = [...this.processedItems].sort((a, b) => {
        // 1. 置顶优先
        if (a._isTop && !b._isTop) return -1;
        if (!a._isTop && b._isTop) return 1;
        // 2. 同组内按时间倒序（最新的在前）
        return (b._sortTime || 0) - (a._sortTime || 0);
      });
      
      // 如果有置顶项，创建置顶分组（置顶项按时间倒序）
      const pinnedItems = sortedItems
        .filter(item => item._isTop)
        .sort((a, b) => (b._sortTime || 0) - (a._sortTime || 0));
      if (pinnedItems.length > 0 && this.enableTop) {
        groups['pinned'] = {
          key: 'pinned',
          title: '置顶',
          children: pinnedItems
        };
      }
      
      // 按组分类非置顶项，每个分组内按时间倒序
      const nonPinnedItems = sortedItems.filter(item => !item._isTop);
      const itemsByGroup = {};
      nonPinnedItems.forEach(item => {
        const groupKey = item.group || this.ungroupedTitle;
        if (!itemsByGroup[groupKey]) {
          itemsByGroup[groupKey] = [];
        }
        itemsByGroup[groupKey].push(item);
      });
      
      // 为每个分组创建结构，并确保组内按时间倒序
      Object.keys(itemsByGroup).forEach(groupKey => {
        const groupTitle = groupTitleMap[groupKey] || groupKey || this.ungroupedTitle;
        groups[groupKey] = {
          key: groupKey,
          title: groupTitle,
          children: itemsByGroup[groupKey].sort((a, b) => (b._sortTime || 0) - (a._sortTime || 0))
        };
      });

      // 分组排序：置顶 > 今天 > 昨天 > 30天内 > 更多 > 其他
      const sortOrder = ['pinned', 'today', 'yesterday', 'within30days', 'more', 'earlier'];
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
    /**
     * 计算时间分组
     * @param {Object} item - 会话项
     * @returns {string} 分组 key
     */
    calculateTimeGroup(item) {
      const timeValue = this.getTimeValue(item);
      if (!timeValue) return this.ungroupedTitle;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const itemTime = new Date(timeValue);
      
      // 今天：00:00:00 之后
      if (itemTime >= today) {
        return 'today';
      }
      
      // 昨天：昨天 00:00:00 到 今天 00:00:00
      if (itemTime >= yesterday && itemTime < today) {
        return 'yesterday';
      }
      
      // 30天内：30天前到昨天之间
      if (itemTime >= thirtyDaysAgo && itemTime < yesterday) {
        return 'within30days';
      }
      
      // 更多：30天之前
      return 'more';
    },
    
    /**
     * 获取时间值（时间戳）
     * @param {Object} item - 会话项
     * @returns {number} 时间戳
     */
    getTimeValue(item) {
      const timeStr = item[this.timeField] || item.createTime || item.updateTime;
      if (!timeStr) return null;
      
      const time = new Date(timeStr);
      return isNaN(time.getTime()) ? null : time.getTime();
    },
    
    handleItemClick(item) {
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

<style lang="scss" scoped>
.ai-conversations {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;

  .conversations-list-wrapper {
    flex: 1;
    overflow: hidden;

    .conversations-content {
      padding: 10px;

      .conversation-group {
        margin-bottom: 16px;

        .group-title {
          font-size: 12px;
          color: #909399;
          padding: 4px 12px;
          margin-bottom: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          user-select: none;

          &:hover {
            color: #606266;
          }

          &.sticky-title {
            position: sticky;
            top: 0;
            z-index: 1;
          }

          .group-toggle-icon {
            display: inline-block;
            margin-right: 4px;
            font-size: 16px;
            transition: transform 0.2s;
            transform: rotate(0deg);

            &.is-collapsed {
              transform: rotate(-180deg);
            }
          }
        }
      }
    }
  }
}
</style>

