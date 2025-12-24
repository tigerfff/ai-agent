/**
 * 解析流式消息，识别自定义组件标签
 * 
 * 规则：
 * 1. 默认识别 <type:name>...</type:name> 格式的标签
 * 2. 如果标签未闭合，当做普通文本处理
 * 3. 标签内容尝试解析为 JSON，失败则返回字符串
 */
export class StreamMessageParser {
  constructor() {
    // 允许的标签名格式：namespace:name，例如 form:demo, chart:line
    this.widgetTagPattern = /^([a-z0-9\-_]+:[a-z0-9\-_]+)$/i;
  }

  /**
   * 解析文本为 Token 列表
   * @param {string} fullText 完整消息文本
   * @returns {Array} [{ type: 'text'|'widget', content?, widgetType?, data? }]
   */
  parse(fullText) {
    if (!fullText) return [];
    
    const tokens = [];
    let currentIndex = 0;
    const length = fullText.length;

    while (currentIndex < length) {
      // 1. 寻找下一个可能的标签起始 '<'
      const tagStartIndex = fullText.indexOf('<', currentIndex);

      // 如果没找到，剩下的都是文本
      if (tagStartIndex === -1) {
        const remaining = fullText.slice(currentIndex);
        if (remaining) tokens.push({ type: 'text', content: remaining });
        break;
      }

      // 2. 将标签前的部分作为文本 Token
      if (tagStartIndex > currentIndex) {
        tokens.push({ type: 'text', content: fullText.slice(currentIndex, tagStartIndex) });
      }

      // 3. 尝试解析标签名
      // 标签名以 '<' 开始，以 ' ', '>', 或 '\n' 结束
      let tagNameEndIndex = -1;
      // 限制向后查找的长度，避免性能问题
      const searchLimit = Math.min(tagStartIndex + 50, length);
      
      for (let i = tagStartIndex + 1; i < searchLimit; i++) {
        const char = fullText[i];
        if (char === ' ' || char === '>' || char === '\n' || char === '/') { 
          tagNameEndIndex = i;
          break;
        }
      }

      // 如果找不到结束符，或者看起来不像是一个完整的开始标签
      if (tagNameEndIndex === -1) {
        // 检查这是否是一个正在输入的、尚未完成的标签，例如 "<ymform:tra"
        const potentialTag = fullText.slice(tagStartIndex + 1);
        if (potentialTag.includes(':') && !/\s/.test(potentialTag)) {
          // 这是一个未完成的 Widget 标签，隐藏它及其后续所有内容，防止源码闪烁
          currentIndex = length;
          break;
        }
        
        // 当做普通文本处理
        tokens.push({ type: 'text', content: '<' });
        currentIndex = tagStartIndex + 1;
        continue;
      }

      const tagName = fullText.slice(tagStartIndex + 1, tagNameEndIndex);
      
      // 4. 验证是否为合法的 Widget 标签 (必须包含冒号)
      if (!this.widgetTagPattern.test(tagName)) {
        // 不是 Widget 标签，按普通文本处理
        tokens.push({ type: 'text', content: '<' });
        currentIndex = tagStartIndex + 1;
        continue;
      }

      // 5. 是合法的 Widget 标签，寻找闭合标签
      // 闭合标签格式: </tagName> 或错误的格式 <tagName>（缺少 /）
      const correctClosingTag = `</${tagName}>`;
      const wrongClosingTag = `<${tagName}>`; // 错误的闭合标签（缺少 /）
      
      // 先找到开始标签的结束位置 '>'
      const openingTagCloseIndex = fullText.indexOf('>', tagStartIndex);
      if (openingTagCloseIndex === -1) {
        // 开始标签本身都没闭合，当做文本处理
        tokens.push({ type: 'text', content: '<' });
        currentIndex = tagStartIndex + 1;
        continue;
      }
      
      // 从开始标签的 '>' 之后开始查找闭合标签
      let closingTagIndex = fullText.indexOf(correctClosingTag, openingTagCloseIndex + 1);
      let closingTag = correctClosingTag;
      
      // 如果找不到正确的闭合标签，尝试查找错误的闭合标签
      if (closingTagIndex === -1) {
        // 从后往前查找最后一个错误的闭合标签（应该是真正的闭合标签）
        const lastWrongIndex = fullText.lastIndexOf(wrongClosingTag);
        if (lastWrongIndex > openingTagCloseIndex) {
          closingTagIndex = lastWrongIndex;
          closingTag = wrongClosingTag;
        }
      }

      if (closingTagIndex === -1) {
        // --- 情况 A: 标签未闭合 ---
        // 既然是一个合法的 Widget 标签开始但未闭合，隐藏它及其内部所有内容
        // 这样在流式输出时，用户不会看到 XML 源码和中间的 JSON
        currentIndex = length; 
        break;
      } else {
        // --- 情况 B: 标签已闭合 (Done 状态) ---
        
        // 验证开始标签位置的有效性（虽然理论上不会发生，但防御性检查）
        if (openingTagCloseIndex > closingTagIndex) {
          // 异常结构，当做文本处理
          tokens.push({ type: 'text', content: '<' });
          currentIndex = tagStartIndex + 1;
          continue;
        }

        // 提取中间的内容（openingTagCloseIndex 已经在上面找到了）
        const rawContent = fullText.slice(openingTagCloseIndex + 1, closingTagIndex);
        
        // 尝试解析 JSON
        let parsedData = rawContent;
        try {
            // 简单的 trim 防止空格干扰
            const trimmed = rawContent.trim();
            if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
               parsedData = JSON.parse(trimmed);
            }
        } catch (e) {
            // 解析失败，保持原字符串
            console.warn('[StreamMessageParser] JSON Parse Error:', e);
        }

        tokens.push({
            type: 'widget',
            widgetType: tagName,
            data: parsedData
        });

        // 移动指针到闭合标签之后
        currentIndex = closingTagIndex + closingTag.length;
      }
    }

    return tokens;
  }
}

