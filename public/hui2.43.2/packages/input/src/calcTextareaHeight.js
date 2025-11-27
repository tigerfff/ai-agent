let hiddenTextarea;

const HIDDEN_STYLE = `
  height:0 !important;
  visibility:hidden !important;
  overflow:hidden !important;
  position:absolute !important;
  z-index:-1000 !important;
  top:0 !important;
  right:0 !important
`;

const CONTEXT_STYLE = [
  'letter-spacing',
  'line-height',
  'padding-top',
  'padding-bottom',
  'font-family',
  'font-weight',
  'font-size',
  'text-rendering',
  'text-transform',
  'width',
  'text-indent',
  'padding-left',
  'padding-right',
  'border-width',
  'box-sizing'
];

function calculateNodeStyling(targetElement) {
  const style = window.getComputedStyle(targetElement);

  const boxSizing = style.getPropertyValue('box-sizing');

  const paddingWidth =
    parseFloat(style.getPropertyValue('padding-left')) +
    parseFloat(style.getPropertyValue('padding-right'));

  const paddingHeight =
    parseFloat(style.getPropertyValue('padding-bottom')) +
    parseFloat(style.getPropertyValue('padding-top'));

  const borderWidth =
    parseFloat(style.getPropertyValue('border-left-width')) +
    parseFloat(style.getPropertyValue('border-right-width'));

  const borderHeight =
    parseFloat(style.getPropertyValue('border-bottom-width')) +
    parseFloat(style.getPropertyValue('border-top-width'));

  const lineHeight = parseFloat(style.getPropertyValue('line-height'));

  const contextStyle = CONTEXT_STYLE.map(
    name => `${name}:${style.getPropertyValue(name)}`
  ).join(';');

  return {
    contextStyle,
    paddingWidth,
    paddingHeight,
    borderWidth,
    borderHeight,
    lineHeight,
    boxSizing
  };
}

export default function calcTextareaHeight(
  targetElement,
  rect,
  minRows = null,
  maxRows = null,
  maxWidth = null
) {
  if (!hiddenTextarea) {
    hiddenTextarea = document.createElement('textarea');
    document.body.appendChild(hiddenTextarea);
  }
  const style = {};
  const {
    contextStyle,
    paddingHeight,
    borderHeight,
    boxSizing
  } = calculateNodeStyling(targetElement);

  hiddenTextarea.setAttribute('style', `${contextStyle};${HIDDEN_STYLE}`);
  hiddenTextarea.value = targetElement.value || targetElement.placeholder || '';

  let height = hiddenTextarea.scrollHeight;

  if (boxSizing === 'border-box') {
    height = height + borderHeight;
  } else if (boxSizing === 'content-box') {
    height = height - paddingHeight;
  }

  hiddenTextarea.value = '';
  const singleRowHeight = hiddenTextarea.scrollHeight - paddingHeight;
  if (minRows !== null) {
    let minHeight = singleRowHeight * minRows;
    if (boxSizing === 'border-box') {
      minHeight = minHeight + paddingHeight + borderHeight;
    }
    height = Math.max(minHeight, height);
    style.minHeight = `${minHeight}px`;
  }
  if (maxRows !== null) {
    let maxHeight = singleRowHeight * maxRows;
    if (boxSizing === 'border-box') {
      maxHeight = maxHeight + paddingHeight + borderHeight;
    }
    height = Math.min(maxHeight, height);
    style.maxHeight = `${maxHeight}px`;
  }
  style.height = `${height}px`;
  if (maxWidth) {
    style.maxWidth = `${+maxWidth}px`;
  }
  return style;
}
