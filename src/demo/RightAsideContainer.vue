<template>
  <div class="aside-container">
    <el-scrollbar
      wrap-style="height:100%;overflow-x:hidden;"
      view-style="padding: 20px;"
    >
      <div class="noticeTime">
        推送时间：{{ formatTime(pic ? pic.captureTime : null) }}
      </div>
      <div class="aside-header">
        <div class="aside-header-title">{{ question ? question.questionName : '暂无问题信息' }}</div>
      </div>
      <div class="aside-area">
        <div class="aside-area-item">
          <span class="item-title">门店名称</span>
          <span class="item-value">{{ storeName || "--" }}</span>
        </div>
        <div class="aside-area-item" v-if="pic && pic.channelName">
          <span class="item-title">通道名称</span>
          <span class="item-value">{{ pic.channelName || '--' }}</span>
        </div>
        <div class="aside-area-item" v-if="pic && pic.captureTime">
          <span class="item-title">抓图时间</span>
          <span class="item-value">{{ formatTime(pic.captureTime) }}</span>
        </div>
      </div>
      <div class="aside-opear">
        <el-button
          type="default"
          size="mini"
          class="local-btn-icon-container"
          @click="$emit('watch-video')"
        >
          <i class="h-icon-device-video"></i>
          查看录像
        </el-button>
      </div>
    </el-scrollbar>
    <div class="aside-footer" v-if="hasChangeQuesBtn">
      <div class="page">
        <el-button class="prev" size="mini" @click="$emit('change-ques', 'prev')">上一个问题项</el-button>
        <el-button class="next" size="mini" @click="$emit('change-ques', 'next')">下一个问题项</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RightAsideContainerMock',
  props: {
    hasChangeQuesBtn: { type: Boolean, default: false },
    question: { type: Object, default: () => ({}) },
    showEvalBtn: { type: Boolean, default: false },
    pic: { type: Object, default: () => ({}) },
    storeName: { type: String, default: '' }
  },
  methods: {
    formatTime(ts) {
      if (!ts) return '-';
      const date = new Date(ts);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      return `${y}-${m}-${d} ${h}:${min}:${s}`;
    }
  }
};
</script>

<style lang="scss" scoped>
.aside-container {
  height: 100%;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #fff;
  
  .noticeTime {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.7);
    margin-bottom: 24px;
  }
}

.aside-header {
  &-title {
    font-size: 16px;
    color: rgba(0, 0, 0, 0.9);
    line-height: 24px;
    font-weight: 600;
  }
}

.aside-area {
  margin-top: 16px;
  &-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    
    .item-title {
      font-size: 14px;
      color: rgba(0,0,0,0.40);
      margin-right: 20px;
      white-space: nowrap;
    }
    
    .item-value {
      flex: 1;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.7);
      line-height: 20px;
      text-align: right;
    }
  }
}

.aside-opear {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.aside-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #eee;

  .page {
    display: flex;
    gap: 12px;
  }
}
</style>