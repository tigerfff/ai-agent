import { mount, config } from '@vue/test-utils';
import moment from 'moment';
import { sleep } from '@/src/utils/test-util';

import DateVue from './unit/date.vue';
import DateSlotVue from './unit/date-slot.vue';
import WeekVue from './unit/week.vue';
import MonthVue from './unit/month.vue';
import YearVue from './unit/year.vue';
import DatesVue from './unit/dates.vue';
// time
import DatetimeVue from './unit/datetime.vue';
import TimeSelectVue from './unit/time-select.vue';
import TimeVue from './unit/time.vue';
// range
import DateRangeVue from './unit/daterange.vue';
import DateTimeRangeVue from './unit/datetimerange.vue';
import MonthRangeVue from './unit/monthrange.vue';
import YearRangeVue from './unit/yearrange.vue';
import TimeRangeVue from './unit/timerange.vue';

config.showDeprecationWarnings = false;

describe('date-picker', () => {
  let wrapper;
  const handleInput = jest.fn();
  const handleChange = jest.fn();
  const handleFocus = jest.fn();
  const handleBlur = jest.fn();
  const formatDate = 'YYYY/MM/DD';
  const formatMonth = 'YYYY/MM';
  const formatYear = 'YYYY';
  const formatDateTime = 'YYYY/MM/DD HH:mm:ss';
  const formatDateTime2 = 'YYYY年MM月DD日 HH时mm分ss秒';
  const formatTime = 'HH:mm:ss';

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  test('snapshot 快照', () => {
    const DateVueWrapper = mount(DateVue);
    const WeekVueWrapper = mount(WeekVue);
    const MonthVueWrapper = mount(MonthVue);
    const YearVueWrapper = mount(YearVue);
    const DatesVueWrapper = mount(DatesVue);
    const DatetimeVueWrapper = mount(DatetimeVue);
    const TimeSelectVueWrapper = mount(TimeSelectVue);
    const TimeVueWrapper = mount(TimeVue);
    const DateRangeVueWrapper = mount(DateRangeVue);
    const DateTimeRangeVueWrapper = mount(DateTimeRangeVue);
    const MonthRangeVueWrapper = mount(MonthRangeVue);
    const YearRangeVueWrapper = mount(YearRangeVue);
    const TimeRangeVueWrapper = mount(TimeRangeVue);

    expect(DateVueWrapper.vm.$el.outerHTML).toMatchSnapshot();
    expect(WeekVueWrapper.vm.$el.outerHTML).toMatchSnapshot();
    expect(MonthVueWrapper.vm.$el.outerHTML).toMatchSnapshot();
    expect(YearVueWrapper.vm.$el.outerHTML).toMatchSnapshot();
    expect(DatesVueWrapper.vm.$el.outerHTML).toMatchSnapshot();
    expect(DatetimeVueWrapper.vm.$el.outerHTML).toMatchSnapshot();
    expect(TimeSelectVueWrapper.vm.$el.outerHTML).toMatchSnapshot();
    expect(TimeVueWrapper.vm.$el.outerHTML).toMatchSnapshot();
    expect(DateRangeVueWrapper.vm.$el.outerHTML).toMatchSnapshot();
    expect(DateTimeRangeVueWrapper.vm.$el.outerHTML).toMatchSnapshot();
    expect(MonthRangeVueWrapper.vm.$el.outerHTML).toMatchSnapshot();
    expect(YearRangeVueWrapper.vm.$el.outerHTML).toMatchSnapshot();
    expect(TimeRangeVueWrapper.vm.$el.outerHTML).toMatchSnapshot();

    DateVueWrapper.destroy();
    WeekVueWrapper.destroy();
    MonthVueWrapper.destroy();
    YearVueWrapper.destroy();
    DatesVueWrapper.destroy();
    DatetimeVueWrapper.destroy();
    TimeSelectVueWrapper.destroy();
    TimeVueWrapper.destroy();
    DateRangeVueWrapper.destroy();
    DateTimeRangeVueWrapper.destroy();
    MonthRangeVueWrapper.destroy();
    YearRangeVueWrapper.destroy();
    TimeRangeVueWrapper.destroy();
  });

  test('date 日期选择', async () => {
    wrapper = mount(DateVue);
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const date = new Date('2019/07/08');
    const input = wrapper.find('input');
    const reference = wrapper.find({ ref: 'reference' }).vm;

    // 测试渲染
    expect(moment(wrapper.vm.value).format(formatDate)).toBe(
      moment(new Date('2019/08/09')).format(formatDate)
    );
    expect(input.element.value).toBe('2019/08/09');

    // 测试回显
    input.trigger('focus');
    await sleep();
    document.querySelector('.el-picker-panel .el-button--primary').click();

    // 测试选择值
    input.trigger('focus');
    await sleep();

    expect(moment(wrapper.vm.value).format(formatDate)).toBe(
      moment(new Date('2019/08/09')).format(formatDate)
    );
    expect(input.element.value).toBe('2019/08/09');
    expect(handleFocus).toBeCalled();

    expect(document.querySelector('.el-picker-panel').style.display).toBe('');
    document.querySelector('.el-picker-panel .selected').nextSibling.click();

    await sleep();
    expect(handleChange).toBeCalled();
    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();
    expect(moment(wrapper.vm.value).format(formatDate)).toBe(
      moment(new Date('2019/08/10')).format(formatDate)
    );
    expect(input.element.value).toBe('2019/08/10');
    expect(handleInput).toBeCalled();

    await sleep(200);
    expect(document.querySelector('.el-picker-panel').style.display).toBe(
      'none'
    );
    expect(handleBlur).toBeCalled();

    // 测试重新赋值
    wrapper.vm.value = date;
    await sleep();
    expect(wrapper.vm.value).toBe(date);
    expect(input.element.value).toBe(moment(date).format(formatDate));

    // 测试清空
    reference.showClose = true;
    reference.handleClickIcon({ stopPropagation: () => null });
    await sleep();
    expect(wrapper.vm.value).toBe('');
    expect(input.element.value).toBe('');

    // 测试今日
    document.querySelector('.el-picker-panel .el-picker-panel__now').click();
    await sleep();
    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();
    expect(moment(wrapper.vm.value).format(formatDate)).toBe(
      moment().format(formatDate)
    );
    expect(input.element.value).toBe(moment().format(formatDate));

    // 测试临界值
    const endDate = new Date('2019/12/31');
    wrapper.vm.value = endDate;
    await sleep();

    input.trigger('focus');
    await sleep();
    document.querySelector('.el-picker-panel .selected').nextSibling.click();
    await sleep();
    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();
    expect(moment(wrapper.vm.value).format(formatDate)).toBe(
      moment(endDate)
        .add(1, 'd')
        .format(formatDate)
    );
    expect(input.element.value).toBe(
      moment(endDate)
        .add(1, 'd')
        .format(formatDate)
    );
  });

  test('week 选择周', async () => {
    wrapper = mount(WeekVue);
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const date = new Date('2019/09/23');
    const input = wrapper.find('input');
    const reference = wrapper.find({ ref: 'reference' }).vm;

    // 测试渲染
    expect(moment(wrapper.vm.value).format(formatDate)).toBe(
      moment(new Date('2019/09/09')).format(formatDate)
    );
    expect(input.element.value).toBe('2019/09/09 - 2019/09/15');

    // 测试选择值
    input.trigger('focus');
    await sleep();

    expect(handleFocus).toBeCalled();
    expect(document.querySelector('.el-picker-panel').style.display).toBe('');
    document
      .querySelector('.el-picker-panel tr.selected')
      .nextSibling.querySelector('td')
      .click();
    await sleep();
    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    expect(moment(wrapper.vm.value).format(formatDate)).toBe(
      moment(new Date('2019/09/16')).format(formatDate)
    );
    expect(input.element.value).toBe('2019/09/16 - 2019/09/22');

    // 测试重新赋值
    wrapper.vm.value = date;
    await sleep();
    expect(wrapper.vm.value).toBe(date);
    expect(input.element.value).toBe('2019/09/23 - 2019/09/29');

    // 测试清空
    reference.showClose = true;
    reference.handleClickIcon({ stopPropagation: () => null });
    await sleep();
    expect(wrapper.vm.value).toBe('');
    expect(input.element.value).toBe('');

    // 测试本周
    document.querySelector('.el-picker-panel .el-picker-panel__now').click();
    await sleep();
    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    // 转化为第一天
    const now = new Date();
    const minus = now.getDay() ? now.getDay() - 1 : 6;
    now.setDate(now.getDate() - minus);
    expect(moment(wrapper.vm.value).format(formatDate)).toBe(
      moment(now).format(formatDate)
    );
  });

  test('month 选择月', async () => {
    wrapper = mount(MonthVue);
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const date = new Date('2018/08/08');
    const input = wrapper.find('input');
    const reference = wrapper.find({ ref: 'reference' }).vm;

    // 测试渲染
    expect(moment(wrapper.vm.value).format(formatMonth)).toBe(
      moment(new Date('2019/09/09')).format(formatMonth)
    );
    expect(input.element.value).toBe('2019/09');

    // 测试选择值
    input.trigger('focus');
    await sleep();

    expect(handleFocus).toBeCalled();

    await sleep();
    expect(document.querySelector('.el-picker-panel').style.display).toBe('');
    document.querySelector('.el-picker-panel .selected').nextSibling.click();
    // 隐藏功能
    // await sleep();
    // document.querySelector('.el-picker-panel .el-button--primary').click();

    await sleep();
    expect(moment(wrapper.vm.value).format(formatMonth)).toBe(
      moment(new Date('2019/10/01')).format(formatMonth)
    );
    expect(input.element.value).toBe('2019/10');

    // 测试重新赋值
    wrapper.vm.value = date;
    await sleep();
    expect(wrapper.vm.value).toBe(date);
    expect(input.element.value).toBe('2018/08');

    // 测试清空
    reference.showClose = true;
    reference.handleClickIcon({ stopPropagation: () => null });
    await sleep();
    expect(wrapper.vm.value).toBe('');
    expect(input.element.value).toBe('');
  });

  test('year 选择年', async () => {
    wrapper = mount(YearVue);
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const date = new Date('2017/08/08');
    const input = wrapper.find('input');
    const reference = wrapper.find({ ref: 'reference' }).vm;

    // 测试渲染
    expect(moment(wrapper.vm.value).format(formatYear)).toBe(
      moment(new Date('2014/09/09')).format(formatYear)
    );
    expect(input.element.value).toBe('2014');

    // 测试选择值
    input.trigger('focus');
    await sleep();

    expect(handleFocus).toBeCalled();
    await sleep();
    expect(document.querySelector('.el-picker-panel').style.display).toBe('');
    document.querySelector('.el-picker-panel .selected').nextSibling.click();
    // 隐藏功能
    // await sleep();
    // document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();
    expect(moment(wrapper.vm.value).format(formatYear)).toBe(
      moment(new Date('2015')).format(formatYear)
    );
    expect(input.element.value).toBe('2015');

    // 测试重新赋值
    wrapper.vm.value = date;
    await sleep();
    expect(wrapper.vm.value).toBe(date);
    expect(input.element.value).toBe('2017');

    // 测试清空
    reference.showClose = true;
    reference.handleClickIcon({ stopPropagation: () => null });
    await sleep();
    expect(wrapper.vm.value).toBe('');
    expect(input.element.value).toBe('');
  });

  test('dates 选择多日期', async () => {
    wrapper = mount(DatesVue);
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const date = [new Date('2019/08/08'), new Date('2019/09/09')];
    const input = wrapper.find('input');
    const reference = wrapper.find({ ref: 'reference' }).vm;

    // 测试渲染
    expect([
      moment(wrapper.vm.value[0]).format(formatDate),
      moment(wrapper.vm.value[1]).format(formatDate)
    ]).toStrictEqual([
      moment(new Date('2019-09-09')).format(formatDate),
      moment(new Date('2019-09-10')).format(formatDate)
    ]);
    expect(input.element.value).toBe('2019/09/09, 2019/09/10');

    // 测试选择值
    input.trigger('focus');
    await sleep();

    expect(handleFocus).toBeCalled();
    await sleep();
    expect(document.querySelector('.el-picker-panel').style.display).toBe('');
    // 普通面板
    document
      .querySelectorAll('.el-picker-panel .selected')[1]
      .nextSibling.click();
    await sleep();
    // 上一个月
    document.querySelectorAll('.el-picker-panel .prev-month')[0].click();
    await sleep();
    // 下一个月
    document.querySelectorAll('.el-picker-panel .next-month')[0].click();
    await sleep();
    // 月翻页
    document.querySelector('.el-picker-panel .h-icon-angle_right_sm').click();
    await sleep();
    document.querySelectorAll('.el-picker-panel .next-month')[0].click();
    await sleep();
    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();
    expect([
      moment(wrapper.vm.value[0]).format(formatDate),
      moment(wrapper.vm.value[1]).format(formatDate),
      moment(wrapper.vm.value[2]).format(formatDate),
      moment(wrapper.vm.value[3]).format(formatDate),
      moment(wrapper.vm.value[4]).format(formatDate),
      moment(wrapper.vm.value[5]).format(formatDate)
    ]).toStrictEqual([
      moment(new Date('2019-09-09')).format(formatDate),
      moment(new Date('2019-09-10')).format(formatDate),
      moment(new Date('2019-09-11')).format(formatDate),
      moment(new Date('2019-08-26')).format(formatDate),
      moment(new Date('2019-10-01')).format(formatDate),
      moment(new Date('2019-11-01')).format(formatDate)
    ]);
    expect(input.element.value).toBe(
      '2019/09/09, 2019/09/10, 2019/09/11, 2019/08/26, 2019/10/01, 2019/11/01'
    );

    // 测试重新赋值
    wrapper.vm.value = date;
    await sleep();
    expect([
      moment(wrapper.vm.value[0]).format(formatDate),
      moment(wrapper.vm.value[1]).format(formatDate)
    ]).toStrictEqual([
      moment(new Date('2019-08-08')).format(formatDate),
      moment(new Date('2019-09-09')).format(formatDate)
    ]);
    expect(input.element.value).toBe('2019/08/08, 2019/09/09');

    // 测试清空
    reference.showClose = true;
    reference.handleClickIcon({ stopPropagation: () => null });
    await sleep();
    expect(wrapper.vm.value).toBe('');
    expect(input.element.value).toBe('');
  });

  test('datetime 选择时间', async () => {
    wrapper = mount(DatetimeVue);
    wrapper.setProps({
      defaultTime: '12:00:00'
    });
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const shortFormat = 'YYYY/MM/DD HH:mm';
    const date = new Date('2019/10/09 02:02:02');
    const date2 = new Date('2021/07/09 02:02:02');
    const input = wrapper.find('input');
    const reference = wrapper.find({ ref: 'reference' }).vm;

    // 测试渲染
    input.trigger('focus');
    await sleep();
    expect(wrapper.vm.value).toBe('');
    const $input = document.querySelector('.el-picker-panel input');
    expect($input.value).toBe('12:00:00');
    await sleep();
    expect(input.element.value).toBe('');
    reference.pickerVisible = false;
    await sleep(200);

    // 测试重新赋值
    wrapper.vm.value = date;
    await sleep();
    expect(moment(wrapper.vm.value).format(formatDateTime)).toBe(
      moment(date).format(formatDateTime)
    );
    await sleep();
    expect(input.element.value).toBe('2019/10/09 02:02:02');

    // 测试中文格式化
    wrapper.vm.value = date2;
    await sleep();
    expect(moment(wrapper.vm.value).format(formatDateTime2)).toBe(
      moment(date2).format(formatDateTime2)
    );
    await sleep();
    expect(input.element.value).toBe('2021/07/09 02:02:02');

    // 测试选择值
    wrapper.vm.value = date;
    await sleep();
    input.trigger('focus');

    await sleep();
    expect(handleFocus).toBeCalled();
    expect(document.querySelector('.el-picker-panel').style.display).toBe('');

    document.querySelector('.el-picker-panel input').focus();
    await sleep();

    document
      .querySelector('.el-picker-panel .el-time-spinner__wrapper .active')
      .nextSibling.click();
    await sleep();
    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();
    expect(moment(wrapper.vm.value).format(formatDateTime)).toBe(
      moment(new Date(2019, 9, 9, 3, 2, 2)).format(formatDateTime)
    );
    expect(input.element.value).toBe('2019/10/09 03:02:02');

    // 测试此刻
    input.trigger('focus');
    await sleep();

    document.querySelector('.el-picker-panel .el-picker-panel__now').click();
    await sleep();
    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();
    expect(moment(wrapper.vm.value).format(shortFormat)).toBe(
      moment().format(shortFormat)
    );
    expect(moment(new Date(input.element.value)).format(shortFormat)).toBe(
      moment().format(shortFormat)
    );

    // 测试手动输入
    input.trigger('focus');
    await sleep();

    input.element.value = '20200421122020';
    input.trigger('input');
    await sleep();

    reference.pickerVisible = false;
    await sleep(200);

    expect(moment(wrapper.vm.value).format(shortFormat)).toBe(
      moment(new Date('2020/04/21 12:20:20')).format(shortFormat)
    );
    expect(input.element.value).toBe('2020/04/21 12:20:20');

    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    // 测试自动补全

    input.trigger('focus');
    await sleep();

    input.element.value = '20200421000000';
    input.trigger('input');
    await sleep();

    reference.pickerVisible = false;
    await sleep(200);

    expect(moment(wrapper.vm.value).format(shortFormat)).toBe(
      moment(new Date('2020/04/21 00:00:00')).format(shortFormat)
    );
    expect(input.element.value).toBe('2020/04/21 00:00:00');

    // 测试清空
    reference.showClose = true;
    reference.handleClickIcon({ stopPropagation: () => null });
    await sleep();
    expect(wrapper.vm.value).toBe('');
    expect(input.element.value).toBe('');

    // 测试先选日期
    input.trigger('focus');
    await sleep();

    document.querySelector('.el-picker-panel .today').click();
    await sleep();
    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    const today = new Date();
    today.setHours(12);
    today.setMinutes(0);
    expect(moment(wrapper.vm.value).format(shortFormat)).toBe(
      moment(today).format(shortFormat)
    );
    expect(moment(new Date(input.element.value)).format(shortFormat)).toBe(
      moment(today).format(shortFormat)
    );

    // 测试其他格式
    wrapper.setProps({
      defaultTime: null
    });

    // 测试先选择时间
    input.trigger('focus');
    await sleep();

    $input.focus();
    await sleep();

    document
      .querySelectorAll('.el-time-panel .el-time-spinner__item')[1]
      .click();
    await sleep();

    expect($input.value).toBe('01:00:00');

    $input.blur();
    await sleep();

    document.querySelector('.el-picker-panel .today').click();
    await sleep();

    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    const now = new Date();
    expect(moment(wrapper.vm.value).format(formatDateTime)).toBe(
      moment(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
        .add(1, 'h')
        .format(formatDateTime)
    );
  });

  test('time-select 固定时间点', async () => {
    wrapper = mount(TimeSelectVue);
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const date = '10:30';
    const input = wrapper.find('input');
    const reference = wrapper.find({ ref: 'reference' }).vm;

    // 测试渲染
    await sleep();
    expect(wrapper.vm.value).toBe('09:30');
    expect(input.element.value).toBe('09:30');

    // 测试选择值
    input.trigger('focus');
    await sleep();

    expect(handleFocus).toBeCalled();
    await sleep();
    expect(document.querySelector('.el-picker-panel').style.display).toBe('');
    document.querySelectorAll('.el-picker-panel .time-select-item')[2].click();
    await sleep();
    expect(wrapper.vm.value).toBe('09:00');
    await sleep();
    expect(input.element.value).toBe('09:00');

    // 测试重新赋值
    wrapper.vm.value = date;
    await sleep();
    expect(wrapper.vm.value).toBe(date);
    await sleep();
    expect(input.element.value).toBe(date);

    // 测试清空
    reference.showClose = true;
    reference.handleClickIcon({ stopPropagation: () => null });
    await sleep();
    expect(wrapper.vm.value).toBe('');
    expect(input.element.value).toBe('');
  });

  test('time 请任意时间点', async () => {
    wrapper = mount(TimeVue);
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const date = new Date('2019-10-10 10:10:10');
    const input = wrapper.find('input');
    const reference = wrapper.find({ ref: 'reference' }).vm;

    // 测试渲染
    await sleep();
    expect(moment(wrapper.vm.value).format(formatTime)).toBe(
      moment('2019-09-09 09:09:09').format(formatTime)
    );
    expect(input.element.value).toBe(
      moment('2019-09-09 09:09:09').format(formatTime)
    );

    // 测试选择值
    input.trigger('focus');
    await sleep();

    expect(handleFocus).toBeCalled();
    await sleep();

    expect(
      document.querySelectorAll('.el-time-panel .active')[0].innerHTML
    ).toBe('09');
    expect(
      document.querySelectorAll('.el-time-panel .active')[1].innerHTML
    ).toBe('09');
    expect(
      document.querySelectorAll('.el-time-panel .active')[2].innerHTML
    ).toBe('09');

    document.querySelectorAll('.el-time-panel .active')[0].nextSibling.click();

    reference.pickerVisible = false;
    await sleep(200);

    expect(document.querySelector('.el-time-panel').style.display).toBe('none');

    expect(moment(wrapper.vm.value).format(formatTime)).toBe(
      moment('2019-09-09 10:09:09').format(formatTime)
    );
    expect(input.element.value).toBe(
      moment('2019-09-09 10:09:09').format(formatTime)
    );

    // 测试重新赋值
    wrapper.vm.value = date;
    await sleep();
    expect(moment(wrapper.vm.value).format(formatTime)).toBe(
      moment(date).format(formatTime)
    );
    expect(input.element.value).toBe(moment(date).format(formatTime));

    // 测试清空
    reference.showClose = true;
    reference.handleClickIcon({ stopPropagation: () => null });
    await sleep();
    expect(wrapper.vm.value).toBe('');
    expect(input.element.value).toBe('');
  });

  test('time unlink 模式', async () => {
    wrapper = mount(TimeVue);
    wrapper.setProps({
      unlink: true
    });
    const input = wrapper.find('input');
    // 测试选择值
    input.trigger('focus');
    await sleep();

    document.querySelectorAll('.el-time-panel .active')[0].nextSibling.click();
    await sleep();
    document.querySelector('.el-time-panel .el-button--primary').click();
    await sleep();

    expect(moment(wrapper.vm.value).format(formatTime)).toBe(
      moment('2019-09-09 10:09:09').format(formatTime)
    );
    expect(input.element.value).toBe(
      moment('2019-09-09 10:09:09').format(formatTime)
    );
  });

  test('date-range 选择日期范围', async () => {
    wrapper = mount(DateRangeVue);
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const date = [new Date('2018-10-10'), new Date('2019-11-11')];
    const input1 = wrapper.findAll('input').at(0);
    const input2 = wrapper.findAll('input').at(1);
    const reference = wrapper.find({ ref: 'reference' }).vm;
    // 测试渲染
    await sleep();
    expect([
      moment(wrapper.vm.value[0]).format(formatDate),
      moment(wrapper.vm.value[1]).format(formatDate)
    ]).toStrictEqual([
      moment(new Date('2018-08-09')).format(formatDate),
      moment(new Date('2019-10-10')).format(formatDate)
    ]);
    expect([
      moment(new Date(input1.element.value)).format(formatDate),
      moment(new Date(input2.element.value)).format(formatDate)
    ]).toStrictEqual([
      moment(new Date('2018-08-09')).format(formatDate),
      moment(new Date('2019-10-10')).format(formatDate)
    ]);

    // 测试选择值
    input1.trigger('focus');
    await sleep();

    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    input1.trigger('focus');
    await sleep();

    // 测试回显
    expect([
      moment(wrapper.vm.value[0]).format(formatDate),
      moment(wrapper.vm.value[1]).format(formatDate)
    ]).toStrictEqual([
      moment(new Date('2018-08-09')).format(formatDate),
      moment(new Date('2019-10-10')).format(formatDate)
    ]);
    expect([
      moment(new Date(input1.element.value)).format(formatDate),
      moment(new Date(input2.element.value)).format(formatDate)
    ]).toStrictEqual([
      moment(new Date('2018-08-09')).format(formatDate),
      moment(new Date('2019-10-10')).format(formatDate)
    ]);

    expect(handleFocus).toBeCalled();
    await sleep();

    expect(document.querySelector('.el-picker-panel').style.display).toBe('');
    document
      .querySelector('.el-picker-panel .start-date')
      .previousSibling.click();
    await sleep();

    document.querySelector('.el-picker-panel .end-date').nextSibling.click();
    await sleep();

    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    expect([
      moment(wrapper.vm.value[0]).format(formatDate),
      moment(wrapper.vm.value[1]).format(formatDate)
    ]).toStrictEqual([
      moment(new Date('2018-08-08')).format(formatDate),
      moment(new Date('2019-10-11')).format(formatDate)
    ]);
    expect([
      moment(new Date(input1.element.value)).format(formatDate),
      moment(new Date(input2.element.value)).format(formatDate)
    ]).toStrictEqual([
      moment(new Date('2018-08-08')).format(formatDate),
      moment(new Date('2019-10-11')).format(formatDate)
    ]);

    // 测试重新赋值
    wrapper.vm.value = date;
    await sleep();
    expect([
      moment(wrapper.vm.value[0]).format(formatDate),
      moment(wrapper.vm.value[1]).format(formatDate)
    ]).toStrictEqual([
      moment(new Date('2018-10-10')).format(formatDate),
      moment(new Date('2019-11-11')).format(formatDate)
    ]);
    expect([
      moment(new Date(input1.element.value)).format(formatDate),
      moment(new Date(input2.element.value)).format(formatDate)
    ]).toStrictEqual([
      moment(new Date('2018-10-10')).format(formatDate),
      moment(new Date('2019-11-11')).format(formatDate)
    ]);

    // 测试清空
    reference.showClose = true;
    reference.handleClickIcon({ stopPropagation: () => null });
    await sleep();
    expect(wrapper.vm.value).toBe('');
    expect(input1.element.value).toBe('');
    expect(input2.element.value).toBe('');

    // 测试临界值
    reference.pickerVisible = false;
    await sleep(200);

    const endDate = [new Date('2019/12/31'), new Date('2019/12/31')];
    wrapper.vm.value = endDate;
    await sleep();

    input1.trigger('focus');
    await sleep();

    // 选择下一天
    document.querySelector('.el-picker-panel .end-date').nextSibling.click();
    await sleep();

    // 选择二月
    document
      .querySelectorAll('.el-picker-panel .el-picker-panel__header-label')[1]
      .click();
    await sleep();
    document.querySelectorAll('.el-picker-panel .el-month-table td')[1].click();
    await sleep();

    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    expect([
      moment(wrapper.vm.value[0]).format(formatDate),
      moment(wrapper.vm.value[1]).format(formatDate)
    ]).toStrictEqual([
      moment(endDate[1])
        .set('month', 1)
        .format(formatDate),
      moment(endDate[0])
        .add(1, 'd')
        .format(formatDate)
    ]);
    expect([
      moment(new Date(input1.element.value)).format(formatDate),
      moment(new Date(input2.element.value)).format(formatDate)
    ]).toStrictEqual([
      moment(endDate[1])
        .set('month', 1)
        .format(formatDate),
      moment(endDate[0])
        .add(1, 'd')
        .format(formatDate)
    ]);
  });

  test('month-range 选择月份范围', async () => {
    wrapper = mount(MonthRangeVue);
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const date = [new Date('2017-05-01'), new Date('2020-07-01')];
    const input1 = wrapper.findAll('input').at(0);
    const input2 = wrapper.findAll('input').at(1);

    // 测试渲染
    await sleep();
    expect([
      moment(wrapper.vm.value[0]).format(formatMonth),
      moment(wrapper.vm.value[1]).format(formatMonth)
    ]).toStrictEqual([
      moment(new Date('2018-02')).format(formatMonth),
      moment(new Date('2019-08')).format(formatMonth)
    ]);
    expect([
      moment(new Date(input1.element.value)).format(formatMonth),
      moment(new Date(input2.element.value)).format(formatMonth)
    ]).toStrictEqual([
      moment(new Date('2018-02')).format(formatMonth),
      moment(new Date('2019-08')).format(formatMonth)
    ]);

    // 测试选择值
    input1.trigger('focus');
    await sleep();

    expect(handleFocus).toBeCalled();
    await sleep();

    expect(document.querySelector('.el-picker-panel').style.display).toBe('');

    document.querySelector('.el-picker-panel .start-date').nextSibling.click();
    await sleep();

    document.querySelector('.el-picker-panel .end-date').nextSibling.click();
    await sleep();

    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    expect([
      moment(wrapper.vm.value[0]).format(formatMonth),
      moment(wrapper.vm.value[1]).format(formatMonth)
    ]).toStrictEqual([
      moment(new Date('2018-03')).format(formatMonth),
      moment(new Date('2019-09')).format(formatMonth)
    ]);
    expect([
      moment(new Date(input1.element.value)).format(formatMonth),
      moment(new Date(input2.element.value)).format(formatMonth)
    ]).toStrictEqual([
      moment(new Date('2018-03')).format(formatMonth),
      moment(new Date('2019-09')).format(formatMonth)
    ]);

    // 测试重新赋值
    wrapper.vm.value = date;
    await sleep();

    expect([
      moment(wrapper.vm.value[0]).format(formatMonth),
      moment(wrapper.vm.value[1]).format(formatMonth)
    ]).toStrictEqual([
      moment(new Date('2017-05')).format(formatMonth),
      moment(new Date('2020-07')).format(formatMonth)
    ]);
    expect([
      moment(new Date(input1.element.value)).format(formatMonth),
      moment(new Date(input2.element.value)).format(formatMonth)
    ]).toStrictEqual([
      moment(new Date('2017-05')).format(formatMonth),
      moment(new Date('2020-07')).format(formatMonth)
    ]);
  });

  test('year-range 选择年范围', async () => {
    wrapper = mount(YearRangeVue);
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const date = [new Date('2017'), new Date('2020')];
    const input1 = wrapper.findAll('input').at(0);
    const input2 = wrapper.findAll('input').at(1);

    // 测试渲染
    await sleep();
    expect([
      moment(wrapper.vm.value[0]).format(formatYear),
      moment(wrapper.vm.value[1]).format(formatYear)
    ]).toStrictEqual([
      moment(new Date('2018')).format(formatYear),
      moment(new Date('2019')).format(formatYear)
    ]);
    expect([
      moment(new Date(input1.element.value)).format(formatYear),
      moment(new Date(input2.element.value)).format(formatYear)
    ]).toStrictEqual([
      moment(new Date('2018')).format(formatYear),
      moment(new Date('2019')).format(formatYear)
    ]);

    // 测试选择值
    input1.trigger('focus');
    await sleep();

    expect(handleFocus).toBeCalled();
    await sleep();

    expect(document.querySelector('.el-picker-panel').style.display).toBe('');
    console.log(document.querySelector('.el-picker-panel .start-date'))

    document.querySelector('.el-picker-panel .start-date').nextSibling.click();
    await sleep();

    document.querySelector('.el-picker-panel .end-date').nextSibling.click();
    await sleep();

    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    expect([
      moment(wrapper.vm.value[0]).format(formatYear),
      moment(wrapper.vm.value[1]).format(formatYear)
    ]).toStrictEqual([
      moment(new Date('2019')).format(formatYear),
      moment(new Date('2020')).format(formatYear)
    ]);
    expect([
      moment(new Date(input1.element.value)).format(formatYear),
      moment(new Date(input2.element.value)).format(formatYear)
    ]).toStrictEqual([
      moment(new Date('2019')).format(formatYear),
      moment(new Date('2020')).format(formatYear)
    ]);

    // 测试重新赋值
    wrapper.vm.value = date;
    await sleep();

    expect([
      moment(wrapper.vm.value[0]).format(formatYear),
      moment(wrapper.vm.value[1]).format(formatYear)
    ]).toStrictEqual([
      moment(new Date('2017')).format(formatYear),
      moment(new Date('2020')).format(formatYear)
    ]);
    expect([
      moment(new Date(input1.element.value)).format(formatYear),
      moment(new Date(input2.element.value)).format(formatYear)
    ]).toStrictEqual([
      moment(new Date('2017')).format(formatYear),
      moment(new Date('2020')).format(formatYear)
    ]);
  });

  test('date-time-range 选择时间范围', async () => {
    wrapper = mount(DateTimeRangeVue);
    wrapper.setProps({
      defaultTime: ['08:00:00', '12:00:00']
    });
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const date = [
      moment(new Date('2016/05/05 04:04:04')),
      moment(new Date('2017/06/06 05:05:05'))
    ];
    const input1 = wrapper.findAll('input').at(0);
    const input2 = wrapper.findAll('input').at(1);
    const reference = wrapper.find({ ref: 'reference' }).vm;

    // 测试渲染
    await sleep();
    expect([
      moment(wrapper.vm.value[0]).format(formatDateTime),
      moment(wrapper.vm.value[1]).format(formatDateTime)
    ]).toStrictEqual([
      moment(new Date('2018/05/05 02:02:02')).format(formatDateTime),
      moment(new Date('2019/06/06 08:08:08')).format(formatDateTime)
    ]);
    expect([
      moment(new Date(input1.element.value)).format(formatDateTime),
      moment(new Date(input2.element.value)).format(formatDateTime)
    ]).toStrictEqual([
      moment(new Date('2018/05/05 02:02:02')).format(formatDateTime),
      moment(new Date('2019/06/06 08:08:08')).format(formatDateTime)
    ]);

    // 测试选择值
    input1.trigger('focus');
    await sleep();

    expect(handleFocus).toBeCalled();
    await sleep();

    expect(document.querySelector('.el-picker-panel').style.display).toBe('');
    document.querySelector('.el-picker-panel .start-date').nextSibling.click();
    await sleep();

    document.querySelector('.el-picker-panel .end-date').nextSibling.click();
    await sleep();

    document.querySelectorAll('.el-picker-panel input')[0].focus();
    await sleep();

    document
      .querySelectorAll('.el-picker-panel .el-time-spinner__wrapper')[0]
      .querySelector('.active')
      .nextSibling.click();
    await sleep();

    document.querySelectorAll('.el-picker-panel input')[1].focus();
    await sleep();

    document
      .querySelectorAll('.el-picker-panel .el-time-spinner__wrapper')[3]
      .querySelector('.active')
      .nextSibling.click();
    await sleep();

    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    expect([
      moment(wrapper.vm.value[0]).format(formatDateTime),
      moment(wrapper.vm.value[1]).format(formatDateTime)
    ]).toStrictEqual([
      moment(new Date('2018/05/06 03:02:02')).format(formatDateTime),
      moment(new Date('2019/06/07 09:08:08')).format(formatDateTime)
    ]);
    expect([
      moment(new Date(input1.element.value)).format(formatDateTime),
      moment(new Date(input2.element.value)).format(formatDateTime)
    ]).toStrictEqual([
      moment(new Date('2018/05/06 03:02:02')).format(formatDateTime),
      moment(new Date('2019/06/07 09:08:08')).format(formatDateTime)
    ]);

    // 测试重新赋值
    wrapper.vm.value = date;
    await sleep();
    expect([
      moment(wrapper.vm.value[0]).format(formatDateTime),
      moment(wrapper.vm.value[1]).format(formatDateTime)
    ]).toStrictEqual([
      moment(new Date('2016/05/05 04:04:04')).format(formatDateTime),
      moment(new Date('2017/06/06 05:05:05')).format(formatDateTime)
    ]);
    expect([
      moment(new Date(input1.element.value)).format(formatDateTime),
      moment(new Date(input2.element.value)).format(formatDateTime)
    ]).toStrictEqual([
      moment(new Date('2016/05/05 04:04:04')).format(formatDateTime),
      moment(new Date('2017/06/06 05:05:05')).format(formatDateTime)
    ]);

    // 测试清空
    reference.showClose = true;
    reference.handleClickIcon({ stopPropagation: () => null });
    await sleep();
    expect(wrapper.vm.value).toBe('');
    expect(input1.element.value).toBe('');
    expect(input2.element.value).toBe('');

    input1.trigger('focus');
    await sleep();

    const $input1 = document.querySelector(
      '.el-picker-panel .el-date-range-picker__editors-wrap.is-left input'
    );
    const $input2 = document.querySelector(
      '.el-picker-panel .el-date-range-picker__editors-wrap.is-right input'
    );
    expect($input1.value).toBe('08:00:00');
    expect($input2.value).toBe('12:00:00');
  });

  /**
   *  format & valueFormat
   */

  test('date 面板 format & value-format', async () => {
    wrapper = mount(DateVue);
    wrapper.setProps({
      format: 'yyyy 年 MM 月 dd 日',
      valueFormat: 'yyyy 年 MM 月 dd 日'
    });
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const input = wrapper.find('input');
    input.trigger('focus');
    await sleep();

    expect(handleFocus).toBeCalled();
    await sleep();

    expect(document.querySelector('.el-picker-panel').style.display).toBe('');

    document.querySelector('.el-picker-panel .selected').nextSibling.click();
    await sleep();

    expect(handleChange).toBeCalled();
    await sleep();

    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    expect(wrapper.vm.value).toBe('2019 年 08 月 10 日');
    expect(input.element.value).toBe('2019 年 08 月 10 日');

    // 测试其他格式
    await sleep();
    wrapper.setProps({
      format: 'yyyy-MM-dd',
      valueFormat: 'yyyy-MM'
    });

    input.trigger('focus');
    await sleep();

    // 以今日测试格式
    document.querySelector('.el-picker-panel .el-picker-panel__now').click();
    await sleep();
    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    expect(wrapper.vm.value).toBe(moment().format('YYYY-MM'));
    expect(input.element.value).toBe(moment().format('YYYY-MM-DD'));

    // 测试时间戳
    await sleep();
    const date = 1598948561240;
    wrapper.vm.value = date;
    wrapper.setProps({
      format: 'yyyy-MM-dd',
      valueFormat: 'timestamp'
    });
    await sleep();

    input.trigger('focus');
    await sleep();

    document.querySelector('.el-picker-panel .selected').nextSibling.click();
    await sleep();

    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    expect(wrapper.vm.value).toBe(1598976000000);
    expect(input.element.value).toBe('2020-09-02');
  });

  test('date-range 面板 format & valueFormat', async () => {
    wrapper = mount(DateRangeVue);
    wrapper.setProps({
      format: 'yyyy 年 MM 月 dd 日',
      valueFormat: 'yyyy 年 MM 月 dd 日'
    });
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const input1 = wrapper.findAll('input').at(0);
    const input2 = wrapper.findAll('input').at(1);

    input1.trigger('focus');
    await sleep();

    document
      .querySelector('.el-picker-panel .start-date')
      .previousSibling.click();
    await sleep();

    document.querySelector('.el-picker-panel .end-date').nextSibling.click();
    await sleep();

    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    expect([wrapper.vm.value[0], wrapper.vm.value[1]]).toStrictEqual([
      '2018 年 08 月 08 日',
      '2019 年 10 月 11 日'
    ]);
    expect([input1.element.value, input2.element.value]).toStrictEqual([
      '2018 年 08 月 08 日',
      '2019 年 10 月 11 日'
    ]);

    // 测试其他格式
    await sleep();
    const date = ['2018-08-09', '2019-10-10'];
    wrapper.vm.value = date;
    wrapper.setProps({
      format: 'yyyy-MM-dd',
      valueFormat: 'yyyy-MM'
    });
    await sleep();

    input1.trigger('focus');
    await sleep();
    // 以今日测试格式
    document.querySelector('.el-picker-panel .el-picker-panel__now').click();
    await sleep();

    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    expect([wrapper.vm.value[0], wrapper.vm.value[1]]).toStrictEqual([
      moment().format('YYYY-MM'),
      moment().format('YYYY-MM')
    ]);
    expect([input1.element.value, input2.element.value]).toStrictEqual([
      moment().format('YYYY-MM-DD'),
      moment().format('YYYY-MM-DD')
    ]);
  });

  test('time-range 面板 format & valueFormat', async () => {
    wrapper = mount(TimeRangeVue);
    wrapper.setProps({
      format: 'HH:mm',
      valueFormat: 'HH:mm'
    });
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const input1 = wrapper.findAll('input').at(0);
    const input2 = wrapper.findAll('input').at(1);

    wrapper.vm.value = [];
    await sleep();

    // 测试选择值
    input1.trigger('focus');
    await sleep();

    expect(handleFocus).toBeCalled();
    await sleep();

    document
      .querySelectorAll('.el-picker-panel .el-time-spinner')[0]
      .querySelectorAll('.el-time-spinner__item')[1]
      .click();
    await sleep();

    document
      .querySelectorAll('.el-picker-panel .el-time-spinner')[1]
      .querySelectorAll('.el-time-spinner__item')[2]
      .click();
    await sleep();

    expect(handleChange).toBeCalled();
    await sleep();

    document.querySelector('.el-picker-panel .el-button--primary').click();
    await sleep();

    expect(handleInput).toBeCalled();
    await sleep(200);

    expect([wrapper.vm.value[0], wrapper.vm.value[1]]).toStrictEqual([
      '01:00',
      '02:00'
    ]);
    expect([input1.element.value, input2.element.value]).toStrictEqual([
      '01:00',
      '02:00'
    ]);
    expect(document.querySelector('.el-picker-panel').style.display).toBe(
      'none'
    );
    expect(handleBlur).toBeCalled();
  });

  /**
   *  picker-options
   */

  test('date 面板 picker-options', async () => {
    wrapper = mount(DateVue);
    wrapper.setProps({
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > new Date('2019-08-09');
        },
        dateClassRender(time) {
          return time.getDay() === 0 ? "sunday" : ""
        }
      }
    });
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    const input = wrapper.find('input');

    input.trigger('focus');
    await sleep();

    expect(
      document
        .querySelector('.el-picker-panel .selected')
        .nextSibling.getAttribute('class')
        .indexOf('disabled') !== -1
    ).toBeTruthy();
    expect(
      document.querySelector('.el-picker-panel .el-picker-panel__now') === null
    ).toBeTruthy();
    expect(
      document.querySelector('.el-picker-panel .sunday') !== null
    ).toBeTruthy();

    // 测试禁用后日点击无效
    document
      .querySelector('.el-picker-panel .el-date-table .selected')
      .nextSibling.click();

    // 测试禁用后年点击无效
    document.querySelectorAll('.el-picker-panel__header-label')[0].click();
    await sleep();

    document
      .querySelector('.el-picker-panel .el-year-table .selected')
      .nextSibling.click();
    await sleep();

    expect(document.querySelector('.el-year-table') !== null).toBeTruthy();
    document.querySelector('.v-modal').click();
    await sleep();

    // 测试禁用后月点击无效
    document.querySelectorAll('.el-picker-panel__header-label')[1].click();
    await sleep();

    document
      .querySelector('.el-picker-panel .el-month-table .selected')
      .nextSibling.click();
    await sleep();

    expect(document.querySelector('.el-month-table') !== null).toBeTruthy();
    expect(moment(wrapper.vm.value).format(formatDate)).toBe(
      moment(new Date('2019/08/09')).format(formatDate)
    );
    expect(input.element.value).toBe('2019/08/09');

    // 取反测试
    wrapper.setProps({
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < new Date('2019-08-09');
        }
      }
    });

    await sleep();

    expect(
      document
        .querySelector('.el-picker-panel .selected')
        .nextSibling.getAttribute('class')
        .indexOf('disabled') === -1
    ).toBeTruthy();
    expect(
      document.querySelector('.el-picker-panel .el-picker-panel__now') !== null
    ).toBeTruthy();
  });

  test('date-range 面板 picker-options', async () => {
    wrapper = mount(DateRangeVue);
    wrapper.setProps({
      pickerOptions: {
        customValidation: () => {
          return false;
        },
        customPrompt: '自定义提示',
        disabledDate: time => {
          const startTime = new Date(
            moment('2019-11-06')
              .subtract(1, 'd')
              .format(formatDate)
          ).getTime();
          const endTime = new Date(
            moment('2019-11-06')
              .add(1, 'd')
              .format(formatDate)
          ).getTime();
          return time.getTime() < startTime || time.getTime() > endTime;
        }
      }
    });
    wrapper.setMethods({
      handleChange,
      handleInput,
      handleFocus,
      handleBlur
    });
    wrapper.vm.value = [new Date('2019-11-05'), new Date('2019-11-07')];
    await sleep();

    const input = wrapper.find('input');

    input.trigger('focus');
    await sleep();

    expect(
      document.querySelector(
        '.el-picker-panel .el-picker-panel__footer-message'
      ).innerHTML
    ).toBe('自定义提示');

    const $left = document.querySelectorAll(
      '.el-picker-panel .is-left .cell'
    )[10];
    const $right = document.querySelectorAll(
      '.el-picker-panel .is-right .cell'
    )[8];

    $left.click();
    await sleep();

    $right.click();
    await sleep();

    expect(
      document.querySelector(
        '.el-picker-panel .el-picker-panel__footer-message'
      ).className
    ).toContain('is-warning');
  });

  test('date 手动输入', async () => {
    wrapper = mount(DateVue);
    const input = wrapper.find('input');
    const reference = wrapper.find({ ref: 'reference' }).vm;

    input.trigger('focus');
    await sleep();

    const inputValue = '2019/08/09';

    input.element.value = '2019/08/0';
    input.trigger('input');
    await sleep();

    input.trigger('input');
    reference.pickerVisible = false;
    await sleep(200);

    expect(moment(wrapper.vm.value).format(formatDate)).toBe(
      moment(new Date(inputValue)).format(formatDate)
    );
    expect(input.element.value).toBe(inputValue);
  });

  test('date 插槽', async () => {
    wrapper = mount(DateSlotVue);
    const input = wrapper.find('input');

    input.trigger('focus');
    await sleep();

    expect(
      document
        .querySelector('.el-picker-panel .selected')
        .children[0].className.indexOf('custom-cell') !== -1
    ).toBeTruthy();

    expect(
      +document
        .querySelector('.el-picker-panel .custom-cell.tag')
        .innerHTML.trim()
    ).toBe(new Date().getDate());
  });
});
