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

