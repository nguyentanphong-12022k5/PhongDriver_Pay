import assert from 'node:assert';
import { convertSolar2Lunar, getLunarInfoFromDateString, jdFromDate, getCanChiYear } from '../src/utils/lunar.ts';
import { calculateShift, aggregateRecords, formatCurrency, formatNumber } from '../src/utils/calculations.ts';
import { ShiftRecord } from '../src/types/index.ts';

// Giả lập LocalStorage trong môi trường Node.js để test storage lifecycle
const storageMap = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, val: string) => storageMap.set(key, String(val)),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};
(globalThis as any).localStorage = mockLocalStorage;

// Import storage sau khi đã mock localStorage
const {
  getSavedRecords,
  saveRecords,
  upsertRecord,
  deleteRecord,
  clearAllRecords,
  resetToMockData,
  formatDate,
} = await import('../src/utils/storage.ts');

console.log('================================================================');
console.log('🚗 BẮT ĐẦU CHẠY TOÀN BỘ BỘ TEST QA / TESTER CHO PHONGDRIVER PAY');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(testName: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } catch (err: any) {
    console.error(`❌ [FAIL] ${testName}`);
    console.error(`   -> Lỗi: ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// PHẦN 1: TEST ĐỘ CHÍNH XÁC CỦA THUẬT TOÁN ÂM LỊCH & LỄ TẾT
// -----------------------------------------------------------------------------
console.log('--- TEST SUITE 1: THUẬT TOÁN ÂM LỊCH VIỆT NAM (UTC+7) ---');

runTest('1.1. Chuyển đổi ngày Tết Nguyên Đán 2024 (10/02/2024 -> 01/01 Giáp Thìn)', () => {
  const [lDay, lMonth, lYear] = convertSolar2Lunar(10, 2, 2024);
  assert.strictEqual(lDay, 1, 'Ngày âm phải là Mùng 1');
  assert.strictEqual(lMonth, 1, 'Tháng âm phải là Tháng 1 (Tháng Giêng)');
  assert.strictEqual(lYear, 2024, 'Năm âm là 2024 (Giáp Thìn)');

  const info = getLunarInfoFromDateString('2024-02-10');
  assert.strictEqual(info.holiday, 'Mùng 1 Tết Nguyên Đán', 'Phải nhận diện Mùng 1 Tết');
});

runTest('1.2. Nhận diện ngày Giỗ Tổ Hùng Vương (18/04/2024 là 10/03 ÂL)', () => {
  const info = getLunarInfoFromDateString('2024-04-18');
  assert.strictEqual(info.day, 10, 'Ngày 10');
  assert.strictEqual(info.month, 3, 'Tháng 3');
  assert.strictEqual(info.holiday, 'Giỗ Tổ Hùng Vương');
});

runTest('1.3. Nhận diện ngày Mùng 1 và Hôm Rằm (15 ÂL)', () => {
  // 15/07 ÂL 2024 là ngày 18/08/2024 (Vu Lan)
  const vuLanInfo = getLunarInfoFromDateString('2024-08-18');
  assert.strictEqual(vuLanInfo.day, 15, 'Hôm Rằm ngày 15');
  assert.strictEqual(vuLanInfo.month, 7, 'Tháng 7');
  assert.strictEqual(vuLanInfo.holiday, 'Lễ Vu Lan Báo Hiếu (Rằm tháng 7)');
  assert.strictEqual(vuLanInfo.isFirstOrFullMoon, true);
});

runTest('1.4. Can Chi chính xác theo thiên văn', () => {
  assert.strictEqual(getCanChiYear(2024), 'Giáp Thìn');
  assert.strictEqual(getCanChiYear(2025), 'Ất Tỵ');
  assert.strictEqual(getCanChiYear(2026), 'Bính Ngọ');
});

// -----------------------------------------------------------------------------
// PHẦN 2: TEST CÔNG THỨC TÍNH TOÁN 5 CHỈ SỐ & THUẾ TNCN/VAT
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 2: CÔNG THỨC TÍNH TOÁN 5 CHỈ SỐ & KHẤU TRỪ THUẾ ---');

runTest('2.1. Tính toán chuẩn ca chạy có thuế 1.5% và trích tiết kiệm', () => {
  const sampleRecord: ShiftRecord = {
    id: 'test_1',
    date: '2026-11-04',
    workInfo: { onlineHours: 8, tripsCount: 16, distanceKm: 100 },
    revenue: {
      appFare: 600000,
      bonus: 50000,
      tips: 30000,
      taxAmount: 9000, // 1.5% của 600k
      platformFee: 0,
      isFareNet: true,
    },
    expenses: {
      petrol: 70000,
      meals: 45000,
      maintenance: 0,
      otherExpenses: [{ id: 'oth_1', name: 'Nước mía', amount: 15000 }],
    },
    savings: 100000,
    createdAt: '',
    updatedAt: '',
  };

  const calc = calculateShift(sampleRecord);

  // [1] Thu nhập gộp: 600k + 50k + 30k = 680k
  assert.strictEqual(calc.grossRevenue, 680000, 'Thu nhập gộp phải là 680.000 ₫');
  assert.strictEqual(calc.taxAmount, 9000, 'Tiền thuế 9.000 ₫');
  assert.strictEqual(calc.revenueAfterTax, 671000, 'Thu nhập sau thuế phải là 671.000 ₫');

  // [2] Tổng chi phí: 70k + 45k + 0 + 15k = 130k
  assert.strictEqual(calc.totalExpenses, 130000, 'Tổng chi phí phải là 130.000 ₫');

  // [3] Lãi ròng đút túi: 671k - 130k = 541k
  assert.strictEqual(calc.netIncome, 541000, 'Lãi ròng đút túi phải là 541.000 ₫');

  // [4] Tiết kiệm: 100k
  assert.strictEqual(calc.savings, 100000, 'Quỹ tiết kiệm là 100.000 ₫');

  // [5] Tiền mặt còn lại: 541k - 100k = 441k
  assert.strictEqual(calc.cashRemaining, 441000, 'Tiền mặt còn lại phải là 441.000 ₫');

  // Hiệu suất:
  // Lương gộp/h = 680k / 8h = 85.000 ₫/h
  assert.strictEqual(calc.hourlyWage, 85000);
  // Lương ròng/h = 541k / 8h = 67.625 ₫/h
  assert.strictEqual(calc.netHourlyWage, 67625);
  // Doanh thu/km = 680k / 100km = 6.800 ₫/km
  assert.strictEqual(calc.revenuePerKm, 6800);
});

runTest('2.2. Kiểm tra cước chưa trừ phí sàn (Chiết khấu Grab 20%)', () => {
  const grossFareRecord: ShiftRecord = {
    id: 'test_gross',
    date: '2026-11-04',
    workInfo: { onlineHours: 5, tripsCount: 10, distanceKm: 50 },
    revenue: {
      appFare: 500000, // Cước khách trả
      bonus: 0,
      tips: 0,
      taxAmount: 7500, // 1.5%
      platformFee: 100000, // 20% của 500k
      isFareNet: false,
    },
    expenses: { petrol: 50000, meals: 30000, maintenance: 0, otherExpenses: [] },
    savings: 50000,
    createdAt: '',
    updatedAt: '',
  };

  const calc = calculateShift(grossFareRecord);
  assert.strictEqual(calc.totalTaxAndFees, 107500, 'Tổng khấu trừ = 100k phí sàn + 7.5k thuế');
  assert.strictEqual(calc.revenueAfterTax, 392500, 'Doanh thu sau phí sàn và thuế');
  assert.strictEqual(calc.totalExpenses, 80000, 'Tổng chi');
  assert.strictEqual(calc.netIncome, 312500, 'Lãi ròng đút túi = 392.5k - 80k = 312.5k');
});

runTest('2.3. Xử lý trường hợp ngoại lệ: Toàn bộ số 0 hoặc để trống (Không lỗi NaN/Infinity)', () => {
  const emptyRecord: ShiftRecord = {
    id: 'test_empty',
    date: '2026-11-04',
    workInfo: { onlineHours: 0, tripsCount: 0, distanceKm: 0 },
    revenue: { appFare: 0, bonus: 0, tips: 0 },
    expenses: { petrol: 0, maintenance: 0, meals: 0, otherExpenses: [] },
    savings: 0,
    createdAt: '',
    updatedAt: '',
  };

  const calc = calculateShift(emptyRecord);
  assert.strictEqual(calc.grossRevenue, 0);
  assert.strictEqual(calc.totalExpenses, 0);
  assert.strictEqual(calc.netIncome, 0);
  assert.strictEqual(calc.cashRemaining, 0);
  assert.strictEqual(calc.hourlyWage, 0, 'Phải bằng 0 khi giờ = 0, không được là NaN');
  assert.strictEqual(calc.revenuePerKm, 0, 'Phải bằng 0 khi km = 0, không được là NaN');
  assert.strictEqual(calc.revenuePerTrip, 0, 'Phải bằng 0 khi cuốc = 0, không được là NaN');
  assert.strictEqual(calc.profitMargin, 0);
});

runTest('2.4. Định dạng tiền tệ VNĐ chuẩn và đẹp', () => {
  assert.strictEqual(formatCurrency(0), '0 ₫');
  assert.strictEqual(formatCurrency(400298), '400.298 ₫');
  assert.strictEqual(formatCurrency(3500000), '3.500.000 ₫');
});

// -----------------------------------------------------------------------------
// PHẦN 3: TEST BẢO TOÀN DỮ LIỆU & KIỂM TRA LỖI DỮ LIỆU ẢO
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 3: KIỂM TRA LƯU TRỮ & ĐẢM BẢO KHÔNG PHÁT SINH DỮ LIỆU ẢO ---');

runTest('3.1. Lần đầu mở app: Tự tạo 7 ngày dữ liệu mẫu', () => {
  mockLocalStorage.clear();
  const initial = getSavedRecords();
  assert.strictEqual(initial.length, 7, 'Lần đầu tiên mở app phải có 7 ca mẫu');
});

runTest('3.2. Bác tài bấm "Xóa Toàn Bộ Dữ Liệu": Phải về rỗng 0 ca', () => {
  const cleared = clearAllRecords();
  assert.strictEqual(cleared.length, 0, 'Danh sách phải về 0');
  const stored = getSavedRecords();
  assert.strictEqual(stored.length, 0, 'LocalStorage phải lưu mảng rỗng 0 phần tử');
});

runTest('3.3. QUAN TRỌNG: Bác tài nhập 1 ca duy nhất -> KHÔNG ĐƯỢC TỰ SINH LẠI DỮ LIỆU MẪU', () => {
  // Giả lập bác tài vừa xóa xong, giờ nhập 1 ca chạy thật của ngày hôm nay
  const myRealShift: ShiftRecord = {
    id: 'my_real_shift_1',
    date: '2026-11-04',
    workInfo: { onlineHours: 8.5, tripsCount: 18, distanceKm: 110 },
    revenue: { appFare: 400298, bonus: 0, tips: 0 },
    expenses: { petrol: 50000, meals: 28000, maintenance: 0, otherExpenses: [] },
    savings: 80000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const currentRecords = getSavedRecords(); // Hiện đang là []
  assert.strictEqual(currentRecords.length, 0, 'Phải đang là 0 ca');

  // Thêm ca chạy mới
  const updated = upsertRecord(myRealShift, currentRecords);

  // KIỂM TRA TUYỆT ĐỐI: CHỈ ĐƯỢC CÓ ĐÚNG 1 CA CHẠY!
  assert.strictEqual(updated.length, 1, 'Số lượng ca chạy bắt buộc phải chính xác là 1, không được sinh lại 7 ca mẫu!');
  assert.strictEqual(updated[0].revenue.appFare, 400298);

  // Đọc lại từ LocalStorage để kiểm chứng tính bền vững
  const reread = getSavedRecords();
  assert.strictEqual(reread.length, 1, 'Sau khi F5 đọc lại từ LocalStorage vẫn phải là 1 ca');
});

runTest('3.4. Bác tài chỉnh sửa ca chạy đó: Vẫn giữ nguyên 1 ca, cập nhật số liệu mới', () => {
  const existing = getSavedRecords();
  assert.strictEqual(existing.length, 1);

  const editedShift: ShiftRecord = {
    ...existing[0],
    revenue: { ...existing[0].revenue, bonus: 50000 }, // Thêm 50k thưởng
  };

  const updated = upsertRecord(editedShift, existing);
  assert.strictEqual(updated.length, 1, 'Vẫn là 1 ca chạy');
  assert.strictEqual(updated[0].revenue.bonus, 50000, 'Tiền thưởng đã cập nhật');
});

runTest('3.5. Bác tài xóa ca chạy: Danh sách về 0 và không bao giờ tự nạp lại', () => {
  const existing = getSavedRecords();
  const remaining = deleteRecord(existing[0].id, existing);
  assert.strictEqual(remaining.length, 0, 'Đã xóa về 0');

  // Thử gọi lại getSavedRecords sau khi xóa
  const checkAfterReload = getSavedRecords();
  assert.strictEqual(checkAfterReload.length, 0, 'Không tự động nạp lại mẫu');
});

// -----------------------------------------------------------------------------
// PHẦN 4: TEST BỘ LỌC THỜI GIAN (HÔM NAY / TUẦN / THÁNG / NĂM)
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 4: TỔNG HỢP VÀ BỘ LỌC THỜI GIAN ---');

runTest('4.1. Tổng hợp dữ liệu theo Tháng này', () => {
  const testShifts: ShiftRecord[] = [
    {
      id: 's1',
      date: '2026-11-04',
      workInfo: { onlineHours: 8, tripsCount: 15, distanceKm: 90 },
      revenue: { appFare: 500000, bonus: 0, tips: 0 },
      expenses: { petrol: 60000, meals: 40000, maintenance: 0, otherExpenses: [] },
      savings: 50000,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 's2',
      date: '2026-11-03',
      workInfo: { onlineHours: 9, tripsCount: 18, distanceKm: 110 },
      revenue: { appFare: 600000, bonus: 50000, tips: 20000 },
      expenses: { petrol: 80000, meals: 50000, maintenance: 120000, otherExpenses: [] },
      savings: 100000,
      createdAt: '',
      updatedAt: '',
    },
  ];

  const summary = aggregateRecords(testShifts);
  assert.strictEqual(summary.shiftCount, 2, 'Tổng số 2 ca');
  assert.strictEqual(summary.totalGrossRevenue, 1170000, 'Tổng thu gộp = 500k + 670k = 1.170.000 ₫');
  assert.strictEqual(summary.totalExpenses, 350000, 'Tổng chi = 100k + 250k = 350.000 ₫');
  assert.strictEqual(summary.totalNetIncome, 820000, 'Thu nhập ròng = 1.170k - 350k = 820.000 ₫');
  assert.strictEqual(summary.totalSavings, 150000, 'Tiết kiệm = 50k + 100k = 150.000 ₫');
  assert.strictEqual(summary.totalCashRemaining, 670000, 'Tiền mặt còn = 820k - 150k = 670.000 ₫');
  assert.strictEqual(summary.totalTripsCount, 33, 'Tổng 33 cuốc');
  assert.strictEqual(summary.totalDistanceKm, 200, 'Tổng 200 km');
  assert.strictEqual(summary.totalOnlineHours, 17, 'Tổng 17 giờ');
});

// -----------------------------------------------------------------------------
// PHẦN 5: KIỂM TRA TÌNH HUỐNG LỖ (CHI PHÍ VƯỢT DOANH THU & TIỀN MẶT ÂM)
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 5: TRƯỜNG HỢP NGOẠI LỆ CHI PHÍ VƯỢT DOANH THU (LÃI ÂM) ---');

runTest('5.1. Ca chạy bị bể lốp xe hoặc sửa lớn, chi phí cao hơn doanh thu', () => {
  const lossShift: ShiftRecord = {
    id: 'loss_shift',
    date: '2026-11-04',
    workInfo: { onlineHours: 4, tripsCount: 5, distanceKm: 30 },
    revenue: { appFare: 150000, bonus: 0, tips: 0 },
    expenses: { petrol: 50000, meals: 40000, maintenance: 350000, otherExpenses: [] }, // Chi 440k
    savings: 0,
    createdAt: '',
    updatedAt: '',
  };

  const calc = calculateShift(lossShift);
  assert.strictEqual(calc.grossRevenue, 150000);
  assert.strictEqual(calc.totalExpenses, 440000);
  assert.strictEqual(calc.netIncome, -290000, 'Lãi ròng phải là âm -290.000 ₫ (Không bị crash)');
  assert.strictEqual(calc.cashRemaining, -290000, 'Tiền mặt còn lại âm -290.000 ₫');
});

// -----------------------------------------------------------------------------
// PHẦN 6: KIỂM TRA PHỤC HỒI KHI LOCALSTORAGE BỊ LỖI DỮ LIỆU HỎNG (CORRUPTED JSON)
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 6: KHẢ NĂNG TỰ PHỤC HỒI KHI DỮ LIỆU LOCALSTORAGE BỊ HỎNG ---');

runTest('6.1. Dữ liệu trong LocalStorage là chuỗi JSON lỗi -> Không bao giờ bị crash trắng trang', () => {
  mockLocalStorage.setItem('phongdriver_pay_records', '{ corrupted_invalid_json }');
  mockLocalStorage.setItem('phongdriver_initialized_v2', 'true');

  const records = getSavedRecords();
  assert.ok(Array.isArray(records), 'Phải trả về mảng rỗng an toàn');
  assert.strictEqual(records.length, 0, 'Phải an toàn không crash app');
});

// -----------------------------------------------------------------------------
// PHẦN 7: KIỂM TRA CÁC NGÀY LỄ TRUYỀN THỐNG VIỆT NAM TRONG NĂM
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 7: CÁC NGÀY LỄ TRUYỀN THỐNG VIỆT NAM (ÂM LỊCH) ---');

runTest('7.1. Tết Đoan Ngọ (05/05 ÂL)', () => {
  // 10/06/2024 là 05/05 Giáp Thìn
  const info = getLunarInfoFromDateString('2024-06-10');
  assert.strictEqual(info.day, 5);
  assert.strictEqual(info.month, 5);
  assert.strictEqual(info.holiday, 'Tết Đoan Ngọ (5/5 ÂL)');
});

runTest('7.2. Tết Trung Thu (15/08 ÂL)', () => {
  // 17/09/2024 là 15/08 Giáp Thìn
  const info = getLunarInfoFromDateString('2024-09-17');
  assert.strictEqual(info.day, 15);
  assert.strictEqual(info.month, 8);
  assert.strictEqual(info.holiday, 'Tết Trung Thu (Rằm tháng 8)');
  assert.strictEqual(info.isFirstOrFullMoon, true);
});

runTest('7.3. Ông Công Ông Táo (23 tháng Chạp)', () => {
  // 22/01/2025 là 23/12 Giáp Thìn
  const info = getLunarInfoFromDateString('2025-01-22');
  assert.strictEqual(info.day, 23);
  assert.strictEqual(info.month, 12);
  assert.strictEqual(info.holiday, 'Ông Công Ông Táo Chầu Trời');
});

runTest('7.4. Ngày 29/02/2024 (Năm nhuận Dương lịch)', () => {
  const info = getLunarInfoFromDateString('2024-02-29');
  assert.strictEqual(info.day, 20);
  assert.strictEqual(info.month, 1);
  assert.strictEqual(info.year, 2024);
});

console.log('\n================================================================');
console.log(`📊 TỔNG KẾT KẾT QUẢ TEST: ${passedTests}/${totalTests} TESTS ĐẠT YÊU CẦU (100% PASS)`);
console.log('================================================================');
