export interface OtherExpenseItem {
  id: string;
  name: string;
  amount: number;
  note?: string;
}

export interface WorkInfo {
  onlineHours: number; // Số giờ online/chạy xe
  tripsCount: number;  // Số cuốc xe hoàn thành
  distanceKm: number;  // Số Km đã đi
}

export interface Revenue {
  appFare: number; // Cước nhận từ khách / cuốc xe trên App
  bonus: number;   // Thưởng (ngọc, mốc cuốc, thưởng nóng)
  tips: number;    // Tiền Tip của khách
}

export interface Expenses {
  petrol: number;                   // Tiền xăng xe
  maintenance: number;              // Tiền bảo dưỡng/thay nhớt/sửa xe
  maintenanceNote?: string;         // Ghi chú bảo dưỡng (ví dụ: thay nhớt Castrol)
  meals: number;                    // Tiền ăn uống trong ca chạy
  otherExpenses: OtherExpenseItem[];// Khoản chi tiêu đột xuất / khác
}

export interface ShiftRecord {
  id: string;
  date: string; // Định dạng YYYY-MM-DD (Lịch dương)
  workInfo: WorkInfo;
  revenue: Revenue;
  expenses: Expenses;
  savings: number; // Trích quỹ tiết kiệm cất riêng
  notes?: string;  // Ghi chú chung ngày chạy xe
  createdAt: string;
  updatedAt: string;
}

export interface ShiftCalculated {
  grossRevenue: number;         // [1] Tổng thu nhập gộp (Cước + Thưởng + Tip)
  totalOtherExpenses: number;   // Tổng chi phí khác/đột xuất
  totalExpenses: number;        // [2] Tổng chi phí (Xăng + Ăn uống + Bảo dưỡng + Đột xuất)
  netIncome: number;            // [3] Thu nhập ròng (Lãi thực nhận đút túi) = [1] - [2]
  savings: number;              // [4] Tiền tiết kiệm trích quỹ
  cashRemaining: number;        // [5] Tiền mặt còn lại sau khi trừ tiết kiệm = [3] - [4]
  hourlyWage: number;           // Doanh thu gộp TB / giờ
  netHourlyWage: number;        // Thu nhập ròng TB / giờ
  revenuePerKm: number;         // Doanh thu TB / Km
  expensePerKm: number;         // Chi phí TB / Km
  revenuePerTrip: number;       // Doanh thu TB / Cuốc
  profitMargin: number;         // Tỷ suất sinh lời ròng (%)
}

export interface LunarDateInfo {
  day: number;
  month: number;
  year: number;
  isLeap: boolean;
  canChiYear: string;
  canChiMonth: string;
  canChiDay: string;
  displayText: string;
  holiday: string | null;
  isFirstOrFullMoon: boolean; // Mùng 1 hoặc Rằm (15)
  specialTag: string | null;
}

export type FilterPeriod = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'this_year' | 'custom' | 'all';

export interface AppSettings {
  driverName: string;
  vehicleType: 'GrabBike' | 'GrabCar' | 'GrabFood' | 'Khác';
  dailyTarget: number; // Mục tiêu doanh thu/thu nhập ròng ngày (VNĐ)
  theme: 'light' | 'dark';
}
