<template>
  <div class="right-aside-mock">
    <div class="section">
      <div class="section-title">问题描述</div>
      <div class="section-content">{{ question ? question.questionName : '暂无问题信息' }}</div>
    </div>

    <div class="section">
      <div class="section-title">图片信息</div>
      <div class="section-content" v-if="pic">
        <p>采集时间: {{ formatTime(pic.captureTime) }}</p>
        <p>通道名称: {{ pic.channelName || '未知' }}</p>
      </div>
    </div>

    <div class="actions">
      <el-button v-if="hasChangeQuesBtn" size="mini" @click="$emit('changeQues')">修改问题</el-button>
      <el-button v-if="showEvalBtn" type="primary" size="mini" @click="$emit('goEval')">去考评</el-button>
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
    pic: { type: Object, default: () => ({}) }
  },
  methods: {
    formatTime(ts) {
      if (!ts) return '-';
      const date = new Date(ts);
      return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
    }
  }
};
</script>

<style lang="scss" scoped>
.right-aside-mock {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .section-title {
    font-weight: bold;
    margin-bottom: 8px;
    font-size: 14px;
    border-left: 3px solid #388eff;
    padding-left: 8px;
  }

  .section-content {
    font-size: 13px;
    color: #666;
    line-height: 1.6;
  }

  .actions {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    .el-button { width: 100%; margin-left: 0; }
  }
}
</style>

