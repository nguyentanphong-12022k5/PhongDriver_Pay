import * as XLSX from 'xlsx';
import { ShiftRecord } from '../types';
import { calculateShift } from './calculations';
import { getLunarInfoFromDateString } from './lunar';

/**
 * Xuất danh sách ca chạy ra file Excel (.xlsx) chuẩn tiếng Việt
 */
export function exportToExcel(records: ShiftRecord[], filenamePrefix = 'Bao_Cao_Thu_Nhap_Grab'): void {
  if (!records || records.length === 0) {
    alert('Không có dữ liệu ca chạy để xuất file Excel!');
    return;
  }

  // Sắp xếp theo ngày tăng dần để báo cáo liền mạch
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

  const headers = [
    'STT',
    'Ngày Dương',
    'Âm Lịch',
    'Sự Kiện / Lễ',
    'Giờ Chạy (h)',
    'Số Cuốc',
    'Quãng Đường (Km)',
    'Cước App (VNĐ)',
    'Tiền Thưởng (VNĐ)',
    'Tiền Tip (VNĐ)',
    'TỔNG DOANH THU (VNĐ)',
    'Tiền Xăng (VNĐ)',
    'Tiền Ăn Uống (VNĐ)',
    'Bảo Dưỡng/Sửa Xe (VNĐ)',
    'Chi Khác/Đột Xuất (VNĐ)',
    'TỔNG CHI PHÍ (VNĐ)',
    'THU NHẬP RÒNG (VNĐ)',
    'TRÍCH TIẾT KIỆM (VNĐ)',
    'TIỀN MẶT CÒN LẠI (VNĐ)',
    'Lương TB/Giờ (VNĐ)',
    'Doanh Thu/Km (VNĐ)',
    'Ghi Chú',
  ];

  let sumHours = 0;
  let sumTrips = 0;
  let sumKm = 0;
  let sumFare = 0;
  let sumBonus = 0;
  let sumTips = 0;
  let sumGross = 0;
  let sumPetrol = 0;
  let sumMeals = 0;
  let sumMaint = 0;
  let sumOther = 0;
  let sumExpenses = 0;
  let sumNet = 0;
  let sumSavings = 0;
  let sumCash = 0;

  const rows = sorted.map((record, index) => {
    const calc = calculateShift(record);
    const lunar = getLunarInfoFromDateString(record.date);

    const hours = record.workInfo?.onlineHours || 0;
    const trips = record.workInfo?.tripsCount || 0;
    const km = record.workInfo?.distanceKm || 0;
    const fare = record.revenue?.appFare || 0;
    const bonus = record.revenue?.bonus || 0;
    const tips = record.revenue?.tips || 0;
    const petrol = record.expenses?.petrol || 0;
    const meals = record.expenses?.meals || 0;
    const maint = record.expenses?.maintenance || 0;
    const other = calc.totalOtherExpenses;
    const savings = calc.savings;

    sumHours += hours;
    sumTrips += trips;
    sumKm += km;
    sumFare += fare;
    sumBonus += bonus;
    sumTips += tips;
    sumGross += calc.grossRevenue;
    sumPetrol += petrol;
    sumMeals += meals;
    sumMaint += maint;
    sumOther += other;
    sumExpenses += calc.totalExpenses;
    sumNet += calc.netIncome;
    sumSavings += savings;
    sumCash += calc.cashRemaining;

    // Chi tiết chi phí khác
    const otherDetails = (record.expenses?.otherExpenses || [])
      .map((item) => `${item.name}: ${item.amount}`)
      .join(', ');

    const note = [record.notes, record.expenses?.maintenanceNote ? `Bảo dưỡng: ${record.expenses.maintenanceNote}` : '', otherDetails ? `Chi khác: ${otherDetails}` : '']
      .filter(Boolean)
      .join(' | ');

    return [
      index + 1,
      record.date,
      lunar.displayText,
      lunar.holiday || lunar.specialTag || '',
      hours,
      trips,
      km,
      fare,
      bonus,
      tips,
      calc.grossRevenue,
      petrol,
      meals,
      maint,
      other,
      calc.totalExpenses,
      calc.netIncome,
      savings,
      calc.cashRemaining,
      calc.hourlyWage,
      calc.revenuePerKm,
      note,
    ];
  });

  // Hàng tổng cộng
  const summaryRow = [
    'TỔNG',
    `${sorted.length} ngày`,
    '',
    '',
    Math.round(sumHours * 10) / 10,
    sumTrips,
    Math.round(sumKm * 10) / 10,
    sumFare,
    sumBonus,
    sumTips,
    sumGross,
    sumPetrol,
    sumMeals,
    sumMaint,
    sumOther,
    sumExpenses,
    sumNet,
    sumSavings,
    sumCash,
    sumHours > 0 ? Math.round(sumGross / sumHours) : 0,
    sumKm > 0 ? Math.round(sumGross / sumKm) : 0,
    'Tổng kết kỳ báo cáo',
  ];

  const data = [headers, ...rows, summaryRow];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Căn chỉnh độ rộng các cột
  const colWidths = [
    { wch: 6 },  // STT
    { wch: 13 }, // Ngày Dương
    { wch: 22 }, // Âm Lịch
    { wch: 25 }, // Lễ / Sự Kiện
    { wch: 14 }, // Giờ
    { wch: 10 }, // Cuốc
    { wch: 18 }, // Km
    { wch: 16 }, // Cước
    { wch: 16 }, // Thưởng
    { wch: 14 }, // Tip
    { wch: 22 }, // Tổng Doanh Thu
    { wch: 15 }, // Xăng
    { wch: 16 }, // Cơm nước
    { wch: 22 }, // Bảo Dưỡng
    { wch: 22 }, // Chi Khác
    { wch: 20 }, // Tổng Chi Phí
    { wch: 22 }, // Thu Nhập Ròng
    { wch: 22 }, // Tiết Kiệm
    { wch: 22 }, // Tiền Mặt Còn Lại
    { wch: 18 }, // TB/Giờ
    { wch: 18 }, // TB/Km
    { wch: 35 }, // Ghi Chú
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Báo Cáo Grab');

  const todayStr = new Date().toISOString().split('T')[0];
  const filename = `${filenamePrefix}_${todayStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Xuất dữ liệu sao lưu dạng file JSON
 */
export function exportToJson(records: ShiftRecord[]): void {
  const jsonStr = JSON.stringify(records, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const todayStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `PhongDriver_Backup_${todayStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Nhập dữ liệu từ file JSON
 */
export async function importFromJson(file: File): Promise<ShiftRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        if (!Array.isArray(data)) {
          throw new Error('Định dạng file sao lưu không hợp lệ (không phải danh sách)!');
        }
        // Kiểm tra sơ bộ các trường bắt buộc
        const validRecords: ShiftRecord[] = data.filter((item) => item && item.date && typeof item.date === 'string');
        if (validRecords.length === 0) {
          throw new Error('Không tìm thấy bản ghi hợp lệ nào trong file!');
        }
        resolve(validRecords);
      } catch (err: any) {
        reject(new Error(err.message || 'Lỗi khi đọc file JSON!'));
      }
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc file!'));
    reader.readAsText(file);
  });
}

/**
 * Nhập dữ liệu từ file Excel (.xlsx, .xls, .csv)
 */
export async function importFromExcel(file: File): Promise<ShiftRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawJson || rawJson.length < 2) {
          throw new Error('File Excel rỗng hoặc không có dữ liệu!');
        }

        const headers: string[] = rawJson[0] || [];
        const dateIdx = headers.findIndex((h) => String(h).includes('Ngày'));
        const hoursIdx = headers.findIndex((h) => String(h).includes('Giờ'));
        const tripsIdx = headers.findIndex((h) => String(h).includes('Cuốc'));
        const kmIdx = headers.findIndex((h) => String(h).includes('Km') || String(h).includes('Đường'));
        const fareIdx = headers.findIndex((h) => String(h).includes('Cước'));
        const bonusIdx = headers.findIndex((h) => String(h).includes('Thưởng'));
        const tipsIdx = headers.findIndex((h) => String(h).includes('Tip'));
        const petrolIdx = headers.findIndex((h) => String(h).includes('Xăng'));
        const mealsIdx = headers.findIndex((h) => String(h).includes('Ăn'));
        const maintIdx = headers.findIndex((h) => String(h).includes('Bảo Dưỡng') || String(h).includes('Sửa'));
        const otherIdx = headers.findIndex((h) => String(h).includes('Khác'));
        const savingsIdx = headers.findIndex((h) => String(h).includes('Tiết Kiệm'));
        const noteIdx = headers.findIndex((h) => String(h).includes('Ghi Chú'));

        const parsedRecords: ShiftRecord[] = [];

        for (let i = 1; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (!row || row.length === 0) continue;

          // Bỏ qua dòng tổng kết
          const firstCol = String(row[0] || '').trim();
          if (firstCol.toUpperCase().includes('TỔNG') || firstCol.toUpperCase().includes('TOTAL')) {
            continue;
          }

          let dateVal = String(row[dateIdx >= 0 ? dateIdx : 1] || '').trim();
          if (!dateVal || !dateVal.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Có thể định dạng DD/MM/YYYY
            const ddmmyyyy = dateVal.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
            if (ddmmyyyy) {
              dateVal = `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
            } else {
              continue;
            }
          }

          const hours = parseFloat(row[hoursIdx]) || 0;
          const trips = parseInt(row[tripsIdx], 10) || 0;
          const km = parseFloat(row[kmIdx]) || 0;
          const fare = parseFloat(row[fareIdx]) || 0;
          const bonus = parseFloat(row[bonusIdx]) || 0;
          const tips = parseFloat(row[tipsIdx]) || 0;
          const petrol = parseFloat(row[petrolIdx]) || 0;
          const meals = parseFloat(row[mealsIdx]) || 0;
          const maint = parseFloat(row[maintIdx]) || 0;
          const otherAmount = parseFloat(row[otherIdx]) || 0;
          const savings = parseFloat(row[savingsIdx]) || 0;
          const note = noteIdx >= 0 ? String(row[noteIdx] || '') : '';

          parsedRecords.push({
            id: `imported_${dateVal}_${Date.now()}_${i}`,
            date: dateVal,
            workInfo: {
              onlineHours: hours,
              tripsCount: trips,
              distanceKm: km,
            },
            revenue: {
              appFare: fare,
              bonus: bonus,
              tips: tips,
            },
            expenses: {
              petrol,
              maintenance: maint,
              meals,
              otherExpenses: otherAmount > 0 ? [{ id: `oth_${i}`, name: 'Chi khác', amount: otherAmount }] : [],
            },
            savings,
            notes: note,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        if (parsedRecords.length === 0) {
          throw new Error('Không phân tích được dòng dữ liệu nào từ file Excel!');
        }

        resolve(parsedRecords);
      } catch (err: any) {
        reject(new Error(err.message || 'Lỗi khi xử lý file Excel!'));
      }
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc file!'));
    reader.readAsBinaryString(file);
  });
}
