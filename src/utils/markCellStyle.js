// helper ทั่วไป
const isTruthy = v =>
  v === true || v === 1 || v === '1' || v === 'Y' || v === 'y' || v === 'true';

/**
 * สร้าง cellStyle function แบบ reusable
 * @param {Object} opt
 * @param {string}  opt.field         ชื่อฟิลด์ของคอลัมน์นั้น
 * @param {Function} [opt.lockFn]     (rowData, field) => boolean  บอกว่า cell นี้ล็อกไหม
 * @param {'true'|'false'|Function} [opt.highlightWhen='true']
 *        จะไฮไลต์ตอนค่าเป็น true, false หรือส่งฟังก์ชัน (params)=>boolean เอง
 * @param {string}  [opt.highlightColor='#303030'] สีพื้นหลังตอนไฮไลต์
 * @param {string}  [opt.lockedColor='#ececec']    สีตอนล็อก/disabled
 */
function makeCenteredCellStyle(opt) {
  const {
    field,
    lockFn,
    highlightWhen = 'true',
    highlightColor = '#303030',
    lockedColor = '#ececec',
  } = opt;

  return function cellStyle(params) {
    const locked = typeof lockFn === 'function' ? !!lockFn(params.data, field) : false;

    let shouldHighlight = false;
    if (typeof highlightWhen === 'function') {
      shouldHighlight = !!highlightWhen(params);
    } else if (highlightWhen === 'true') {
      shouldHighlight = isTruthy(params.value);
    } else if (highlightWhen === 'false') {
      shouldHighlight = params.value === false || params.value === '0' || params.value === 0;
    }

    const base = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 0,
    };

    if (locked) {
      return { ...base, backgroundColor: lockedColor, cursor: 'not-allowed', userSelect: 'none' };
    }
    if (shouldHighlight) {
      return { ...base, backgroundColor: highlightColor };
    }
    return base;
  };
}

export default makeCenteredCellStyle;