// TrainingX 智能体 API 定义

export const TrainingApi = {
  /**
   * 模拟获取欢迎语配置
   */
  getWelcomeConfig() {
    return Promise.resolve({
      icon: '🎓',
      title: '你好，我是 Training-X 助手',
      description: '我可以帮你制定学习计划、解答技术难题，或者只是陪你聊聊最新的技术趋势。',
      prompts: [
        { icon: '📅', title: '制定学习计划', desc: '根据我的基础定制 Python 学习路线', text: '请帮我制定一份 Python 学习计划' },
        { icon: '🐍', title: 'Python 基础语法', desc: '讲解一下 Python 的装饰器', text: '请讲解 Python 装饰器的用法' },
        { icon: '🐛', title: '代码调试助手', desc: '帮我查找这段代码的 bug', text: '帮我看看这段代码有什么问题' },
        { icon: '📝', title: '生成表单演示', desc: '测试流式组件渲染能力', text: '请生成一个采购申请单表单' }
      ]
    });
  },

  /**
   * 模拟 SSE 对话
   * 这里只是演示 API 定义，实际 TrainingX 内部用 setTimeout 模拟了
   */
  chatStream(client, { prompt }) {
    // 实际项目中会调用 client.send({ stream: true ... })
    console.log('TrainingApi: sending prompt', prompt);
  }
};

