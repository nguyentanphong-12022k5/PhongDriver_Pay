import { ShiftRecord, AppSettings } from '../types';

const RECORDS_STORAGE_KEY = 'phongdriver_pay_records';
const SETTINGS_STORAGE_KEY = 'phongdriver_pay_settings';

export const DEFAULT_SETTINGS: AppSettings = {
  driverName: 'Phong Grab Pro',
  vehicleType: 'GrabBike',
  dailyTarget: 500000, // Mục tiêu thu nhập ròng 500k/ngày
  theme: 'light',
};

// Hàm định dạng ngày thành YYYY-MM-DD
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Tạo dữ liệu mẫu 7 ngày gần nhất
export function generateMockRecords(): ShiftRecord[] {
  const records: ShiftRecord[] = [];
  const today = new Date();

  const mockTemplates = [
    {
      hours: 8.5,
      trips: 18,
      km: 115,
      fare: 650000,
      bonus: 80000,
      tips: 45000,
      petrol: 85000,
      meals: 55000,
      maint: 0,
      maintNote: '',
      others: [{ id: 'oth_1', name: 'Nước mía + gửi xe', amount: 20000 }],
      savings: 100000,
      notes: 'Trời mát mẻ, hoàn thành mốc ngọc buổi chiều ngon lành.',
    },
    {
      hours: 9.0,
      trips: 21,
      km: 135,
      fare: 760000,
      bonus: 110000,
      tips: 60000,
      petrol: 95000,
      meals: 65000,
      maint: 125000,
      maintNote: 'Thay nhớt Motul Scooter 800ml',
      others: [],
      savings: 100000,
      notes: 'Được khách tip 30k cuốc đi sân bay Tân Sơn Nhất.',
    },
    {
      hours: 7.5,
      trips: 16,
      km: 98,
      fare: 540000,
      bonus: 50000,
      tips: 35000,
      petrol: 70000,
      meals: 50000,
      maint: 0,
      maintNote: '',
      others: [{ id: 'oth_2', name: 'Vá xe dính đinh', amount: 30000 }],
      savings: 80000,
      notes: 'Bị cán đinh ở ngã tư Hàng Xanh, sửa nhanh chạy tiếp.',
    },
    {
      hours: 10.0,
      trips: 23,
      km: 152,
      fare: 890000,
      bonus: 140000,
      tips: 75000,
      petrol: 110000,
      meals: 70000,
      maint: 0,
      maintNote: '',
      others: [{ id: 'oth_3', name: 'Rửa xe bọt tuyết', amount: 30000 }],
      savings: 150000,
      notes: 'Chạy cuối tuần nổ cuốc liên tục, khách hào phóng.',
    },
    {
      hours: 8.0,
      trips: 17,
      km: 108,
      fare: 610000,
      bonus: 70000,
      tips: 40000,
      petrol: 80000,
      meals: 55000,
      maint: 0,
      maintNote: '',
      others: [],
      savings: 100000,
      notes: 'Ca sáng giờ cao điểm kẹt xe, ca chiều chạy êm.',
    },
    {
      hours: 6.5,
      trips: 13,
      km: 82,
      fare: 460000,
      bonus: 40000,
      tips: 25000,
      petrol: 60000,
      meals: 40000,
      maint: 0,
      maintNote: '',
      others: [{ id: 'oth_4', name: 'Mua áo mưa mới', amount: 35000 }],
      savings: 50000,
      notes: 'Mưa to buổi chiều, về nhà sớm nghỉ ngơi.',
    },
    {
      hours: 8.5,
      trips: 19,
      km: 120,
      fare: 680000,
      bonus: 90000,
      tips: 50000,
      petrol: 90000,
      meals: 60000,
      maint: 0,
      maintNote: '',
      others: [],
      savings: 100000,
      notes: 'Nhiều cuốc giao đồ ăn GrabFood đơn kép tiện đường.',
    },
  ];

  for (let i = 0; i < mockTemplates.length; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = formatDate(d);
    const t = mockTemplates[i];

    records.push({
      id: `record_${dateStr}_${Date.now() - i * 86400000}`,
      date: dateStr,
      workInfo: {
        onlineHours: t.hours,
        tripsCount: t.trips,
        distanceKm: t.km,
      },
      revenue: {
        appFare: t.fare,
        bonus: t.bonus,
        tips: t.tips,
      },
      expenses: {
        petrol: t.petrol,
        maintenance: t.maint,
        maintenanceNote: t.maintNote,
        meals: t.meals,
        otherExpenses: t.others,
      },
      savings: t.savings,
      notes: t.notes,
      createdAt: new Date(d.getTime() + 19 * 3600000).toISOString(),
      updatedAt: new Date(d.getTime() + 19 * 3600000).toISOString(),
    });
  }

  return records;
}

// Lấy danh sách bản ghi từ localStorage (nếu chưa có thì nạp mock data)
export function getSavedRecords(): ShiftRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
    if (!raw) {
      const initialMock = generateMockRecords();
      saveRecords(initialMock);
      return initialMock;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initialMock = generateMockRecords();
      saveRecords(initialMock);
      return initialMock;
    }
    return parsed;
  } catch (error) {
    console.error('Lỗi khi đọc dữ liệu từ LocalStorage:', error);
    return generateMockRecords();
  }
}

// Lưu danh sách bản ghi vào localStorage
export function saveRecords(records: ShiftRecord[]): void {
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu vào LocalStorage:', error);
  }
}

// Thêm hoặc cập nhật bản ghi
export function upsertRecord(record: ShiftRecord): ShiftRecord[] {
  const records = getSavedRecords();
  const index = records.findIndex((r) => r.id === record.id || r.date === record.date);

  if (index >= 0) {
    // Cập nhật
    records[index] = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // Thêm mới
    records.unshift({
      ...record,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Sắp xếp ngày giảm dần
  records.sort((a, b) => b.date.localeCompare(a.date));
  saveRecords(records);
  return records;
}

// Xóa bản ghi theo ID
export function deleteRecord(id: string): ShiftRecord[] {
  const records = getSavedRecords();
  const updated = records.filter((r) => r.id !== id);
  saveRecords(updated);
  return updated;
}

// Đặt lại dữ liệu mẫu
export function resetToMockData(): ShiftRecord[] {
  const mock = generateMockRecords();
  saveRecords(mock);
  return mock;
}

// Xóa toàn bộ dữ liệu
export function clearAllRecords(): ShiftRecord[] {
  saveRecords([]);
  return [];
}

// Cài đặt ứng dụng
export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Lỗi khi lưu cấu hình:', e);
  }
}
