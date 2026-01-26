/**
 * 埋点事件追踪器
 * 组件库内部使用统一的埋点标识，通过映射表转换为实际埋点代码
 */

// 组件库内部的埋点标识（基于“位置 + 动作”命名，颗粒度精确到按钮级）
export const TRACK_EVENTS = {
  // --- 1. 外部/入口 (Entry) ---
  AVATAR_CLICK: 'agent.entry.avatar.click',                 // 点击云小智头像进入

  // --- 2. 智能体选择页面 (Agent Select Page) ---
  SELECT_PAGE_ENTER: 'agent.select_page.enter',             // 进入智能体选择页
  SELECT_PAGE_CLOSE: 'agent.select_page.close',             // 关闭/缩小云小智
  SELECT_PAGE_FULL: 'agent.select_page.fullscreen',         // 全屏
  SELECT_AGENT_CARD: 'agent.select_page.agent_card.click', // 点击具体的智能体卡片 (如: 智慧巡查卡片)

  // --- 3. 左侧导航菜单 (Sidebar/Nav) ---
  // 三级菜单：左侧菜单 -> 四级菜单：功能导航
  NAV_AGENT_SWITCH: 'agent.nav.sidebar.agent.switch',      // 点击功能导航中的智能体 (如: 智慧巡查、数据分析)
  
  // 三级菜单：左侧菜单 -> 四级菜单：对话列表
  NAV_CONVERSATION_NEW: 'agent.nav.conversation.new',      // 新建对话按钮
  NAV_CONVERSATION_ITEM: 'agent.nav.conversation.click',   // 点击单个对话记录
  NAV_CONVERSATION_PIN: 'agent.nav.conversation.pin',      // 记录操作-置顶
  NAV_CONVERSATION_UNPIN: 'agent.nav.conversation.unpin',  // 记录操作-取消置顶
  NAV_CONVERSATION_RENAME: 'agent.nav.conversation.rename',// 记录操作-重命名
  NAV_CONVERSATION_DELETE: 'agent.nav.conversation.delete',// 记录操作-删除

  // --- 4. 对话页面顶部 (Chat Header) ---
  CHAT_HEADER_NAV_TOGGLE: 'agent.chat_header.nav.toggle',  // 展开/收起左侧导航
  CHAT_HEADER_RENAME: 'agent.chat_header.rename',          // 对话重命名
  CHAT_HEADER_FULL: 'agent.chat_header.fullscreen',        // 放大
  CHAT_HEADER_MIN: 'agent.chat_header.minimize',          // 缩小
  CHAT_HEADER_EXIT: 'agent.chat_header.exit',              // 退出

  // --- 5. 输入框相关 (Input) ---
  INPUT_SEND: 'agent.input.send',                          // 发送消息
  INPUT_VOICE_ON: 'agent.input.voice.on',                  // 语音开启
  INPUT_VOICE_OFF: 'agent.input.voice.off',                // 语音关闭
  INPUT_ATTACH_IMAGE: 'agent.input.attach.image',         // 附件-图片
  INPUT_ATTACH_VIDEO: 'agent.input.attach.video',         // 附件-视频
  INPUT_ATTACH_SNAPSHOT: 'agent.input.attach.snapshot',   // 附件-抓图

  // --- 6. 消息反馈相关 (Message/Bubble) ---
  MESSAGE_COPY_USER: 'agent.message.user.copy',            // 用户发送语-复制
  MESSAGE_RETRY: 'agent.message.ai.retry',                 // AI回复语-重试
  MESSAGE_COPY_AI: 'agent.message.ai.copy',                // AI回复语-复制
  MESSAGE_LIKE: 'agent.message.ai.like',                  // AI回复语-点赞
  MESSAGE_UNLIKE: 'agent.message.ai.unlike',              // AI回复语-取消点赞
  MESSAGE_DISLIKE: 'agent.message.ai.dislike',            // AI回复语-点踩
  MESSAGE_UNDISLIKE: 'agent.message.ai.undislike',        // AI回复语-取消点踩

  // --- 7. 业务卡片内部操作 (Widgets) ---
  // 智慧巡查相关
  WIDGET_INSPECT_SCOPE_CHANGE: 'agent.widget.inspect.scope.change',        // 智慧巡查-巡检范围修改
  WIDGET_INSPECT_TIME_ADD: 'agent.widget.inspect.time.add',                // 智慧巡查-巡检时间添加
  WIDGET_INSPECT_TIME_EDIT: 'agent.widget.inspect.time.edit',               // 智慧巡查-巡检时间修改
  WIDGET_INSPECT_PUSH_ENABLE: 'agent.widget.inspect.push.enable',          // 智慧巡查-门店整改推送开关-开启
  WIDGET_INSPECT_PUSH_DISABLE: 'agent.widget.inspect.push.disable',        // 智慧巡查-门店整改推送开关-关闭
  WIDGET_INSPECT_CONFIRM: 'agent.widget.inspect.confirm',                  // 智慧巡查-确认执行
  WIDGET_INSPECT_CANCEL: 'agent.widget.inspect.cancel',                    // 智慧巡查-取消计划
  WIDGET_INSPECT_EDIT: 'agent.widget.inspect.edit',                        // 智慧巡查-参数修改（通用）
  
  // 培训助手相关
  WIDGET_TRAIN_PROJECT_CHANGE: 'agent.widget.train.project.change',  // 培训助手-学习项目修改
  WIDGET_TRAIN_USERS_CHANGE: 'agent.widget.train.users.change',     // 培训助手-培训学员调整
  WIDGET_TRAIN_CONFIRM: 'agent.widget.train.confirm',                // 培训助手-确认执行
  WIDGET_TRAIN_EDIT: 'agent.widget.train.edit',                      // 培训助手-参数修改（通用）

  // AI试用相关
  WIDGET_AITRY_IMAGE_ADD: 'agent.widget.aitry.image.add',        // AI试用-添加图片（welcome页面）
  WIDGET_AITRY_VIDEO_ADD: 'agent.widget.aitry.video.add',        // AI试用-添加视频（welcome页面或弹框录制）
  WIDGET_AITRY_SNAPSHOT_ADD: 'agent.widget.aitry.snapshot.add',  // AI试用-添加视频截图（弹框抓图）

  // 数据分析相关
  WIDGET_DATA_STORE_DETAIL: 'agent.widget.data.store.detail',    // 数据分析-门店详情
  WIDGET_DATA_REPORT_EXPORT: 'agent.widget.data.report.export',  // 数据分析-报告导出
  WIDGET_DATA_REPORT_DETAIL: 'agent.widget.data.report.detail',  // 数据分析-报告详情
  WIDGET_DATA_PLAN_CREATE: 'agent.widget.data.plan.create',      // 数据分析-生成自检计划
  
  // --- 8. 意图引导 (Suggestions) ---
  SUGGESTION_CLICK: 'agent.suggestion.click',              // 点击意图引导快捷语
};

class EventTracker {
  constructor() {
    this.sendClickMessage = null;
    this.eventMap = {};
    this.defaultEty = 'aac';
  }

  init(options = {}) {
    this.sendClickMessage = options.sendClickMessage;
    this.eventMap = options.eventMap || {};
    this.defaultEty = options.defaultEty || 'aac';
  }

  track(eventKey, params = {}) {
    // 打印调试信息

    if (!this.sendClickMessage) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[EventTracker] sendClickMessage not configured.`);
      }
      return;
    }

    const config = this.eventMap[eventKey];
    if (!config) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[EventTracker] No mapping for: ${eventKey}`);
      }
      return;
    }

    // 解析配置：支持字符串 (LC) 或 对象 ({ lc, a1, a2, biz })
    const isObjectConfig = typeof config === 'object';
    const lc = isObjectConfig ? config.lc : config;
    
    // 支持 biz 作为一个函数，动态生成埋点参数
    let presetBiz = {};
    if (isObjectConfig) {
      if (typeof config.biz === 'function') {
        presetBiz = config.biz(params);
      } else {
        presetBiz = { a1: config.a1, a2: config.a2, ...config.biz };
      }
    }

    const trackData = {
      lc,
      ety: params.ety || this.defaultEty,
      biz: Object.fromEntries(
        Object.entries({
          ...presetBiz,
          ...params.extraBiz,
        }).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      ),
    };


    try {
      this.sendClickMessage(trackData);
    } catch (e) {
      console.error(`[EventTracker] Failed:`, e);
    }
  }
}

export const eventTracker = new EventTracker();
