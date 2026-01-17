import { StreamMessageParser } from '@/ai-core/parser/StreamMessageParser';

const parser = new StreamMessageParser();

export function parseWidgetData(data, widgetType) {
  let content = typeof data === 'string' ? data : (data?.content || '');
  if (!content) return {};

  try {
    const tokens = parser.parse(content);
    const widgetToken = tokens.find(t => t.type === 'widget' && t.widgetType === widgetType);
    return widgetToken?.data || {};
  } catch (e) {
    console.error('Parse data failed:', e);
    return {};
  }
}