/**
 * 简单的打字机逻辑封装，支持流式追加
 */
export class Typewriter {
  constructor(onUpdate, onFinish) {
    this.queue = []; // 待打印字符队列
    this.timer = null;
    this.speed = 30; // 打字速度 ms
    this.isTyping = false;
    this.onUpdate = onUpdate; // 更新回调 (text)
    this.onFinish = onFinish; // 完成回调
    this.currentText = '';
  }

  // 追加文本到队列
  append(text) {
    if (!text) return;
    // 将文本拆解为字符数组放入队列
    const chars = text.split('');
    this.queue.push(...chars);
    this.start();
  }

  // 立即显示所有（用于停止生成或快速展示）
  flush() {
    this.stop();
    const remaining = this.queue.join('');
    this.currentText += remaining;
    this.queue = [];
    this.onUpdate(this.currentText);
    if (this.onFinish) this.onFinish();
  }

  start() {
    if (this.isTyping) return;
    this.isTyping = true;
    this._tick();
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.isTyping = false;
  }

  _tick() {
    if (this.queue.length === 0) {
      this.isTyping = false;
      if (this.onFinish) this.onFinish();
      return;
    }

    // --- 🚀 新增：Widget 标签加速逻辑 ---
    // 如果发现队列开头看起来像一个标签开始，尝试一次性吞掉整个闭合标签
    if (this.queue[0] === '<') {
      const remainingText = this.queue.join('');
      // 匹配 <ns:name>内容</ns:name> 格式
      const widgetMatch = remainingText.match(/^(<([a-z0-9\-_]+:[a-z0-9\-_]+)>[\s\S]*?<\/\2>)/i);
      
      if (widgetMatch) {
        const fullTag = widgetMatch[1]; // 拿到整个 XML 块
        this.currentText += fullTag;    // 直接塞进结果
        this.queue.splice(0, fullTag.length); // 从队列里删掉这部分字符
        this.onUpdate(this.currentText); // 触发一次渲染更新
        
        // 既然是“瞬移”，不需要延迟，直接处理剩下的内容
        this._tick(); 
        return;
      }
    }
    // --- 加速逻辑结束 ---

    const char = this.queue.shift();
    this.currentText += char;
    this.onUpdate(this.currentText);

    // 随机速度波动，模拟真实感
    const delay = this.speed + Math.random() * 20; 
    
    this.timer = setTimeout(() => {
      this._tick();
    }, delay);
  }
}

