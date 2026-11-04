import { LunarDateInfo } from '../types/index';

/**
 * Thuật toán tính Âm lịch Việt Nam dựa trên công trình của TS. Hồ Ngọc Đức (Múi giờ UTC+7).
 * Hỗ trợ chuyển đổi từ Dương lịch sang Âm lịch, tính Can Chi, ngày Sóc (Mùng 1), ngày Vọng (Rằm),
 * và xác định các ngày Tết, ngày Lễ truyền thống Việt Nam.
 */

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

// Chuyển đổi ngày dương lịch sang số ngày Julian (JDN)
export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

// Chuyển đổi số ngày Julian sang ngày dương lịch
export function jdToDate(jd: number): [number, number, number] {
  let a: number, b: number, c: number, d: number, e: number, m: number;
  if (jd > 2299160) {
    a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  d = Math.floor((4 * c + 3) / 1461);
  e = c - Math.floor((1461 * d) / 4);
  m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = b * 100 + d - 4800 + Math.floor(m / 10);
  return [day, month, year];
}

// Tính ngày Sóc (New Moon) theo múi giờ timeZone (mặc định 7 cho Việt Nam)
export function getNewMoonDay(k: number, timeZone = 7): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
  C1 -= 0.0004 * Math.sin(3 * dr * Mpr);
  C1 += 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin((M + Mpr) * dr);
  C1 -= 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  C1 -= 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 += 0.0010 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((2 * Mpr + M) * dr);
  const JdNew = Jd1 + C1;
  return Math.floor(JdNew + 0.5 + timeZone / 24);
}

// Tính kinh độ Mặt Trời (Sun Longitude) tại thời điểm jdn
export function getSunLongitude(jdn: number, timeZone = 7): number {
  const T = (jdn - 2451545.0 + 0.5 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L * dr;
  L = L - Math.PI * 2 * Math.floor(L / (Math.PI * 2));
  return Math.floor((L / Math.PI) * 6);
}

// Tìm ngày bắt đầu tháng 11 âm lịch của năm yy
function getLunarMonth11(yy: number, timeZone = 7): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

// Tìm tháng nhuận trong năm âm lịch
function getLeapMonthOffset(a11: number, timeZone = 7): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

/**
 * Chuyển ngày Dương lịch sang Âm lịch
 */
export function convertSolar2Lunar(dd: number, mm: number, yy: number, timeZone = 7): [number, number, number, boolean] {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear = yy;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = true;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  return [lunarDay, lunarMonth, lunarYear, lunarLeap];
}

// Can Chi năm
export function getCanChiYear(year: number): string {
  const can = CAN[(year + 6) % 10];
  const chi = CHI[(year + 8) % 12];
  return `${can} ${chi}`;
}

// Can Chi ngày
export function getCanChiDay(jd: number): string {
  const can = CAN[(jd + 9) % 10];
  const chi = CHI[(jd + 1) % 12];
  return `${can} ${chi}`;
}

// Can Chi tháng
export function getCanChiMonth(lunarMonth: number, lunarYear: number): string {
  const canYearIndex = (lunarYear + 6) % 10;
  // Giáp Kỷ khởi Bính Dần (index 2: Bính)
  const canMonthStart = (canYearIndex % 5) * 2 + 2;
  const can = CAN[(canMonthStart + lunarMonth - 1) % 10];
  const chi = CHI[(lunarMonth + 1) % 12]; // Tháng 1 là Dần (index 2)
  return `${can} ${chi}`;
}

/**
 * Kiểm tra các ngày lễ truyền thống hoặc sự kiện Âm/Dương lịch
 */
function getSpecialDayNote(solarDay: number, solarMonth: number, lunarDay: number, lunarMonth: number, isLeap: boolean): { holiday: string | null; tag: string | null } {
  // Lễ Âm lịch
  if (!isLeap) {
    if (lunarMonth === 1) {
      if (lunarDay === 1) return { holiday: 'Mùng 1 Tết Nguyên Đán', tag: 'Tết Âm Lịch' };
      if (lunarDay === 2) return { holiday: 'Mùng 2 Tết Nguyên Đán', tag: 'Tết Âm Lịch' };
      if (lunarDay === 3) return { holiday: 'Mùng 3 Tết Nguyên Đán', tag: 'Tết Âm Lịch' };
      if (lunarDay === 15) return { holiday: 'Tết Nguyên Tiêu (Rằm tháng Giêng)', tag: 'Rằm Lớn' };
    }
    if (lunarMonth === 3 && lunarDay === 10) return { holiday: 'Giỗ Tổ Hùng Vương', tag: 'Quốc Lễ' };
    if (lunarMonth === 4 && lunarDay === 15) return { holiday: 'Đại Lễ Phật Đản', tag: 'Lễ Phật' };
    if (lunarMonth === 5 && lunarDay === 5) return { holiday: 'Tết Đoan Ngọ (5/5 ÂL)', tag: 'Tết Đoan Ngọ' };
    if (lunarMonth === 7 && lunarDay === 15) return { holiday: 'Lễ Vu Lan Báo Hiếu (Rằm tháng 7)', tag: 'Rằm Lớn' };
    if (lunarMonth === 8 && lunarDay === 15) return { holiday: 'Tết Trung Thu (Rằm tháng 8)', tag: 'Trung Thu' };
    if (lunarMonth === 12 && lunarDay === 23) return { holiday: 'Ông Công Ông Táo Chầu Trời', tag: 'Táo Quân' };
    if (lunarMonth === 12 && (lunarDay === 29 || lunarDay === 30)) return { holiday: 'Đêm Giao Thừa Tết Nguyên Đán', tag: 'Giao Thừa' };
  }

  // Lễ Dương lịch
  if (solarDay === 1 && solarMonth === 1) return { holiday: 'Tết Dương Lịch', tag: 'Nghỉ Lễ' };
  if (solarDay === 14 && solarMonth === 2) return { holiday: 'Lễ Tình Nhân (Valentine)', tag: 'Sự Kiện' };
  if (solarDay === 8 && solarMonth === 3) return { holiday: 'Quốc Tế Phụ Nữ', tag: 'Sự Kiện' };
  if (solarDay === 30 && solarMonth === 4) return { holiday: 'Giải Phóng Miền Nam 30/4', tag: 'Quốc Lễ' };
  if (solarDay === 1 && solarMonth === 5) return { holiday: 'Quốc Tế Lao Động 1/5', tag: 'Quốc Lễ' };
  if (solarDay === 2 && solarMonth === 9) return { holiday: 'Quốc Khánh Nước CHXHCNVN 2/9', tag: 'Quốc Lễ' };
  if (solarDay === 20 && solarMonth === 10) return { holiday: 'Ngày Phụ Nữ Việt Nam 20/10', tag: 'Sự Kiện' };
  if (solarDay === 24 && solarMonth === 12) return { holiday: 'Đêm Giáng Sinh (Noel)', tag: 'Noel' };

  // Mùng 1 & Rằm hàng tháng
  if (lunarDay === 1) {
    return { holiday: null, tag: 'Mùng 1 (Đầu Tháng)' };
  }
  if (lunarDay === 15) {
    return { holiday: null, tag: 'Hôm Rằm (Ngày Vọng)' };
  }

  return { holiday: null, tag: null };
}

/**
 * Hàm chính nhận vào chuỗi ngày Dương YYYY-MM-DD và trả về thông tin Âm Lịch đầy đủ
 */
export function getLunarInfoFromDateString(dateStr: string): LunarDateInfo {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const jd = jdFromDate(day, month, year);
  const [lDay, lMonth, lYear, isLeap] = convertSolar2Lunar(day, month, year);

  const canChiYear = getCanChiYear(lYear);
  const canChiMonth = getCanChiMonth(lMonth, lYear);
  const canChiDay = getCanChiDay(jd);

  const special = getSpecialDayNote(day, month, lDay, lMonth, isLeap);
  const isFirstOrFullMoon = lDay === 1 || lDay === 15;

  const leapText = isLeap ? ' (Nhuận)' : '';
  const displayText = `${lDay}/${lMonth}${leapText} ÂL (${canChiYear})`;

  return {
    day: lDay,
    month: lMonth,
    year: lYear,
    isLeap,
    canChiYear,
    canChiMonth,
    canChiDay,
    displayText,
    holiday: special.holiday,
    isFirstOrFullMoon,
    specialTag: special.tag
  };
}
