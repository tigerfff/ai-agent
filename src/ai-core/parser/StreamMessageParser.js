/**
 * 解析流式消息，识别自定义组件标签
 * 
 * 规则：
 * 1. 默认识别 <type:name>...</type:name> 格式的标签
 * 2. 如果标签未闭合，视为 loading 状态
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
   * @returns {Array} [{ type: 'text'|'widget', content?, widgetType?, data?, loading? }]
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
        // 检查这是否是一个正在输入的、尚未完成的标签，例如 "<form:de"
        // 简单的启发式：如果包含 ':' 且没有空格/换行，可能是一个正在输入的 Widget 标签
        const potentialTag = fullText.slice(tagStartIndex + 1);
        // 排除掉像 "< " 这样的情况
        if (potentialTag.includes(':') && !/\s/.test(potentialTag)) {
           // 这是一个未完成的 Widget Start Tag，我们也标记为 loading
           // 但我们需要知道它大概是什么类型吗？
           // 暂时作为 text 处理比较安全，或者作为一个特殊的 'pending' widget
           // 为了用户体验，直到我们确认它是 valid tag 之前，最好先按 text 显示（或者不显示）
           // 这里选择：如果还没打完，就先当做 text "<form:de" 显示出来，等有了 ">" 再变身
           // 这样可以避免闪烁
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
      // 闭合标签格式: </tagName>
      const closingTag = `</${tagName}>`;
      const closingTagIndex = fullText.indexOf(closingTag, tagNameEndIndex);

      if (closingTagIndex === -1) {
        // --- 情况 A: 标签未闭合 (Loading 状态) ---
        // 这意味着我们收到了 "<form:demo" 或 "<form:demo>..." 但还没收到结束
        tokens.push({ 
            type: 'widget', 
            widgetType: tagName, 
            data: null, 
            loading: true 
        });
        // 既然正在 loading，我们假设剩下的所有内容都属于这个 widget
        // 停止解析
        currentIndex = length;
        break;
      } else {
        // --- 情况 B: 标签已闭合 (Done 状态) ---
        
        // 我们需要找到开始标签的结束位置 '>'，以便提取内容
        const openingTagCloseIndex = fullText.indexOf('>', tagStartIndex);
        
        // 如果开始标签本身都没闭合（这在 closingTagIndex !== -1 的情况下不太可能，除非嵌套错乱）
        if (openingTagCloseIndex === -1 || openingTagCloseIndex > closingTagIndex) {
           // 异常结构，当做文本处理
           tokens.push({ type: 'text', content: '<' });
           currentIndex = tagStartIndex + 1;
           continue;
        }

        // 提取中间的内容
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
            data: parsedData,
            loading: false
        });

        // 移动指针到闭合标签之后
        currentIndex = closingTagIndex + closingTag.length;
      }
    }

    return tokens;
  }
}

