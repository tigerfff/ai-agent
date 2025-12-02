import Vue from 'vue';

// 它天然支持 $on, $emit, $off
export const EventBus = new Vue();

/**
 * 事件名称常量定义，避免魔法字符串
 */
export const EVENTS = {
  SWITCH_AGENT: 'switch-agent', // 切换智能体
  SEND_MESSAGE: 'send-message', // 发送消息
  CLEAR_HISTORY: 'clear-history' // 清空历史
};

