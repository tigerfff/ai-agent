import { TinyColor } from '@ctrl/tinycolor';

const root = document.documentElement;
function setPrimaryColor(primaryColor) {
    const color = new TinyColor(primaryColor);
    // 验证颜色是否合法
    if (!color.isValid) {
        // eslint-disable-next-line
        console.error('主题色值不正确');
        return;
    }
    const whiteColor = new TinyColor('#ffffff');
    // 注入主色
    setVar('--ym-primary', color.toHexString());
    // 生成色阶：--ym-primary-90（深）到 --ym-primary-10（浅）
    setVar('--ym-primary-90', mixColor(color, whiteColor, 10));
    setVar('--ym-primary-80', mixColor(color, whiteColor, 20));
    setVar('--ym-primary-70', mixColor(color, whiteColor, 30));
    setVar('--ym-primary-60', mixColor(color, whiteColor, 40));
    setVar('--ym-primary-50', mixColor(color, whiteColor, 50));
    setVar('--ym-primary-40', mixColor(color, whiteColor, 60));
    setVar('--ym-primary-30', mixColor(color, whiteColor, 70));
    setVar('--ym-primary-20', mixColor(color, whiteColor, 80));
    setVar('--ym-primary-10', mixColor(color, whiteColor, 90));
}
function mixColor(color1, color2, ratio) {
    const mixed = color1.mix(color2, ratio);
    return mixed.isValid ? mixed.toHexString().toUpperCase() : undefined;
}
// 设置 CSS 变量
function setVar(name, value) {
    if (value && typeof value === 'string' && value.startsWith('#')) {
        root.style.setProperty(name, value);
    }
}

const DEFAULT_PRIMARY_COLOR = '#FF5E34';

export { DEFAULT_PRIMARY_COLOR, setPrimaryColor };
