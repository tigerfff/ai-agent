/**
 * Widget 数据解析工具
 * 用于从消息内容中提取 widget 标签的数据
 */
import { StreamMessageParser } from '@/ai-core/parser/StreamMessageParser';

const parser = new StreamMessageParser();

/**
 * 修复格式错误的闭合标签
 * 例如：<ymform:train_plan> 应该修复为 </ymform:train_plan>
 * @param {string} content - 原始内容
 * @param {string} widgetType - widget 类型
 * @returns {string} 修复后的内容
 */
function fixClosingTag(content, widgetType) {
  const openingTag = `<${widgetType}>`;
  const wrongClosingTag = `<${widgetType}>`; // 错误的闭合标签（缺少 /）
  const correctClosingTag = `</${widgetType}>`; // 正确的闭合标签
  
  // 查找开始标签的位置
  const openingIndex = content.indexOf(openingTag);
  if (openingIndex === -1) return content;
  
  // 查找正确的闭合标签
  let closingIndex = content.indexOf(correctClosingTag, openingIndex);
  
  // 如果找不到正确的闭合标签，尝试查找错误的闭合标签
  if (closingIndex === -1) {
    // 从后往前查找最后一个错误的闭合标签（应该是真正的闭合标签）
    const lastWrongIndex = content.lastIndexOf(wrongClosingTag);
    if (lastWrongIndex > openingIndex) {
      // 这确实是一个闭合标签，修复它
      return content.slice(0, lastWrongIndex) + correctClosingTag + content.slice(lastWrongIndex + wrongClosingTag.length);
    }
  }
  
  return content;
}

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
  let content = typeof data === 'string' ? data : (data?.content || '');
  if (!content) {
    console.warn(`[widgetParser] No content to parse for widget: ${widgetType}`);
    return {};
  }

  try {
    // 先尝试修复格式错误的闭合标签
    const fixedContent = fixClosingTag(content, widgetType);
    
    // 使用 StreamMessageParser 解析
    const tokens = parser.parse(fixedContent);
    const widgetToken = tokens.find(
      token => token.type === 'widget' && token.widgetType === widgetType
    );

    if (widgetToken && widgetToken.data) {
      return typeof widgetToken.data === 'object' 
        ? widgetToken.data 
        : {};
    }
    
    // 如果 StreamMessageParser 无法解析，尝试直接提取 JSON
    // 这种情况可能是标签格式有问题，但内容可能是有效的 JSON
    if (fixedContent !== content) {
      // 如果修复了标签，重新尝试解析
      const retryTokens = parser.parse(fixedContent);
      const retryToken = retryTokens.find(
        token => token.type === 'widget' && token.widgetType === widgetType
      );
      if (retryToken && retryToken.data) {
        return typeof retryToken.data === 'object' 
          ? retryToken.data 
          : {};
      }
    }
    
    // 如果还是无法解析，尝试直接从标签中提取 JSON
    const directResult = extractJsonDirectly(content, widgetType);
    if (Object.keys(directResult).length > 0) {
      return directResult;
    }
    
    console.warn(`[widgetParser] Widget token not found or no data for: ${widgetType}`);
    return {};
  } catch (e) {
    console.error(`[widgetParser] Parse data failed for ${widgetType}:`, e);
    // 出错时也尝试直接提取
    return extractJsonDirectly(content, widgetType);
  }
}

/**
 * 直接从内容中提取 JSON（备用方案）
 * 当 StreamMessageParser 无法解析时使用
 * @param {string} content - 原始内容
 * @param {string} widgetType - widget 类型
 * @returns {Object} 解析后的数据对象
 */
function extractJsonDirectly(content, widgetType) {
  const openingTag = `<${widgetType}>`;
  const correctClosingTag = `</${widgetType}>`;
  const wrongClosingTag = `<${widgetType}>`;
  
  const startIndex = content.indexOf(openingTag);
  if (startIndex === -1) return {};
  
  const tagEndIndex = content.indexOf('>', startIndex);
  if (tagEndIndex === -1) return {};
  
  // 查找闭合标签（先找正确的，再找错误的）
  let endIndex = content.indexOf(correctClosingTag, tagEndIndex);
  if (endIndex === -1) {
    // 尝试错误的闭合标签
    const wrongEndIndex = content.lastIndexOf(wrongClosingTag);
    if (wrongEndIndex > tagEndIndex) {
      endIndex = wrongEndIndex;
    }
  }
  
  if (endIndex === -1) return {};
  
  // 提取中间的内容
  const rawContent = content.slice(tagEndIndex + 1, endIndex).trim();
  
  // 尝试解析 JSON
  try {
    if ((rawContent.startsWith('{') && rawContent.endsWith('}')) || 
        (rawContent.startsWith('[') && rawContent.endsWith(']'))) {
      return JSON.parse(rawContent);
    }
  } catch (e) {
    console.warn(`[widgetParser] Direct JSON parse failed:`, e);
  }
  
  return {};
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

