/**
 * Widget 数据解析工具
 * 用于从消息内容中提取 widget 标签的数据
 */
import { StreamMessageParser } from '@/ai-core/parser/StreamMessageParser';

const parser = new StreamMessageParser();

/**
 * 从消息内容中解析指定 widget 类型的数据
 * @param {string|Object} data - 消息内容字符串或已解析的对象
 * @param {string} widgetType - widget 类型，例如 'ymform:user_train_finish'
 * @returns {Object} 解析后的数据对象
 */
export function parseWidgetData(data, widgetType) {
  // 如果 data 已经是解析好的对象（包含 widget 数据），直接返回
  if (data && typeof data === 'object' && !data.content) {
    // 检查是否已经包含 widget 相关的字段
    if (data.projectId || data.taskId || data.storeId || data.courseProjectId) {
      return { ...data };
    }
  }

  // 如果 data 是 item 对象，需要从 content 中解析
  const content = typeof data === 'string' ? data : (data?.content || '');
  if (!content) {
    console.warn(`[widgetParser] No content to parse for widget: ${widgetType}`);
    return {};
  }

  try {
    // 使用 StreamMessageParser 解析
    const tokens = parser.parse(content);
    const widgetToken = tokens.find(
      token => token.type === 'widget' && token.widgetType === widgetType
    );

    if (widgetToken && widgetToken.data) {
      return typeof widgetToken.data === 'object' 
        ? widgetToken.data 
        : {};
    } else {
      console.warn(`[widgetParser] Widget token not found or no data for: ${widgetType}`);
      return {};
    }
  } catch (e) {
    console.error(`[widgetParser] Parse data failed for ${widgetType}:`, e);
    return {};
  }
}

/**
 * 解析多个 widget 类型的数据
 * @param {string|Object} data - 消息内容字符串或已解析的对象
 * @param {Array<string>} widgetTypes - widget 类型数组
 * @returns {Object} 包含所有解析结果的对象，key 为 widgetType
 */
export function parseMultipleWidgets(data, widgetTypes) {
  const result = {};
  widgetTypes.forEach(type => {
    result[type] = parseWidgetData(data, type);
  });
  return result;
}

