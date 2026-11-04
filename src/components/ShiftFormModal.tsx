import React, { useState, useEffect } from 'react';
import { ShiftRecord, OtherExpenseItem } from '../types';
import { calculateShift, formatCurrency } from '../utils/calculations';
import { getLunarInfoFromDateString } from '../utils/lunar';
import {
  X,
  Calendar,
  Clock,
  Navigation,
  Car,
  CircleDollarSign,
  Fuel,
  Utensils,
  Wrench,
  PiggyBank,
  Plus,
  Trash2,
  Save,
  Moon,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

interface ShiftFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: ShiftRecord) => void;
  initialRecord?: ShiftRecord | null;
  todayStr: string;
}

export const ShiftFormModal: React.FC<ShiftFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRecord,
  todayStr,
}) => {
  // Trạng thái các trường dữ liệu
  const [date, setDate] = useState<string>(todayStr);
  const [onlineHours, setOnlineHours] = useState<number>(8.0);
  const [tripsCount, setTripsCount] = useState<number>(18);
  const [distanceKm, setDistanceKm] = useState<number>(110);

  // Doanh thu
  const [appFare, setAppFare] = useState<number>(600000);
  const [bonus, setBonus] = useState<number>(80000);
  const [tips, setTips] = useState<number>(40000);

  // Chi phí
  const [petrol, setPetrol] = useState<number>(80000);
  const [meals, setMeals] = useState<number>(50000);
  const [maintenance, setMaintenance] = useState<number>(0);
  const [maintenanceNote, setMaintenanceNote] = useState<string>('');

  // Chi tiêu đột xuất / khác
  const [otherExpenses, setOtherExpenses] = useState<OtherExpenseItem[]>([]);
  const [newOtherName, setNewOtherName] = useState<string>('');
  const [newOtherAmount, setNewOtherAmount] = useState<number | ''>('');

  // Trích tiết kiệm
  const [savings, setSavings] = useState<number>(100000);
  const [notes, setNotes] = useState<string>('');

  // Tab đang chọn (để chia nhỏ form nếu cần hoặc cuộn mượt)
  const [activeSection, setActiveSection] = useState<'all' | 'work' | 'revenue' | 'expense' | 'savings'>('all');

  useEffect(() => {
    if (initialRecord) {
      setDate(initialRecord.date);
      setOnlineHours(initialRecord.workInfo?.onlineHours || 0);
      setTripsCount(initialRecord.workInfo?.tripsCount || 0);
      setDistanceKm(initialRecord.workInfo?.distanceKm || 0);

      setAppFare(initialRecord.revenue?.appFare || 0);
      setBonus(initialRecord.revenue?.bonus || 0);
      setTips(initialRecord.revenue?.tips || 0);

      setPetrol(initialRecord.expenses?.petrol || 0);
      setMeals(initialRecord.expenses?.meals || 0);
      setMaintenance(initialRecord.expenses?.maintenance || 0);
      setMaintenanceNote(initialRecord.expenses?.maintenanceNote || '');
      setOtherExpenses(initialRecord.expenses?.otherExpenses ? [...initialRecord.expenses.otherExpenses] : []);

      setSavings(initialRecord.savings || 0);
      setNotes(initialRecord.notes || '');
    } else {
      // Đặt lại giá trị mặc định cho ca mới
      setDate(todayStr);
      setOnlineHours(8.0);
      setTripsCount(18);
      setDistanceKm(110);
      setAppFare(600000);
      setBonus(80000);
      setTips(40000);
      setPetrol(80000);
      setMeals(50000);
      setMaintenance(0);
      setMaintenanceNote('');
      setOtherExpenses([]);
      setSavings(100000);
      setNotes('');
    }
  }, [initialRecord, todayStr, isOpen]);

  if (!isOpen) return null;

  // Lấy thông tin âm lịch của ngày đang chọn
  const lunarInfo = getLunarInfoFromDateString(date);

  // Tạo đối tượng tạm để tính toán live
  const currentRecordState: ShiftRecord = {
    id: initialRecord?.id || 'temp',
    date,
    workInfo: { onlineHours, tripsCount, distanceKm },
    revenue: { appFare, bonus, tips },
    expenses: { petrol, maintenance, maintenanceNote, meals, otherExpenses },
    savings,
    notes,
    createdAt: initialRecord?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const liveCalc = calculateShift(currentRecordState);

  // Hàm thêm chi phí khác
  const handleAddOtherExpense = () => {
    if (!newOtherName.trim() || !newOtherAmount || Number(newOtherAmount) <= 0) return;
    const newItem: OtherExpenseItem = {
      id: `other_${Date.now()}`,
      name: newOtherName.trim(),
      amount: Number(newOtherAmount),
    };
    setOtherExpenses([...otherExpenses, newItem]);
    setNewOtherName('');
    setNewOtherAmount('');
  };

  const handleRemoveOtherExpense = (id: string) => {
    setOtherExpenses(otherExpenses.filter((item) => item.id !== id));
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRecord: ShiftRecord = {
      id: initialRecord?.id || `record_${date}_${Date.now()}`,
      date,
      workInfo: {
        onlineHours: Number(onlineHours) || 0,
        tripsCount: Number(tripsCount) || 0,
        distanceKm: Number(distanceKm) || 0,
      },
      revenue: {
        appFare: Number(appFare) || 0,
        bonus: Number(bonus) || 0,
        tips: Number(tips) || 0,
      },
      expenses: {
        petrol: Number(petrol) || 0,
        maintenance: Number(maintenance) || 0,
        maintenanceNote: maintenanceNote.trim(),
        meals: Number(meals) || 0,
        otherExpenses,
      },
      savings: Number(savings) || 0,
      notes: notes.trim(),
      createdAt: initialRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(finalRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* HEADER MODAL */}
        <div className="px-5 py-4 bg-grab text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {initialRecord ? 'Chỉnh Sửa Ca Chạy' : 'Ghi Chép Ca Chạy Mới'}
              </h2>
              <p className="text-xs text-emerald-100">
                Nhập liệu nhanh, tự động tính lãi ròng và lưu trữ tức thì
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* THÔNG TIN ÂM LỊCH & CHỌN NGÀY */}
        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 px-5 py-3 border-b border-emerald-100 dark:border-emerald-800/40 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-grab-700 dark:text-grab-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">Ngày chạy:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-grab outline-none"
            />
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl shadow-xs border border-emerald-200/60 dark:border-emerald-800/50">
            <Moon className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-emerald-800 dark:text-emerald-300">
              {lunarInfo.displayText}
            </span>
            {lunarInfo.holiday && (
              <span className="bg-amber-400 text-amber-950 font-bold px-1.5 py-0.5 rounded text-[10px]">
                {lunarInfo.holiday}
              </span>
            )}
            {!lunarInfo.holiday && lunarInfo.specialTag && (
              <span className="bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.5 rounded text-[10px]">
                {lunarInfo.specialTag}
              </span>
            )}
          </div>
        </div>

        {/* NỘI DUNG CUỘN (SCROLLABLE FORM BODY) */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* PHẦN 1: THÔNG TIN LÀM VIỆC */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold text-sm">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>1. Thông Tin Làm Việc</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Giờ online */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Số giờ chạy (Online)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={onlineHours}
                    onChange={(e) => setOnlineHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-grab outline-none text-base"
                  />
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => setOnlineHours((h) => Math.min(24, Math.round((h + 0.5) * 10) / 10))}
                      className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs font-bold hover:bg-slate-300"
                    >
                      +0.5
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnlineHours((h) => Math.max(0, Math.round((h - 0.5) * 10) / 10))}
                      className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs font-bold hover:bg-slate-300"
                    >
                      -0.5
                    </button>
                  </div>
                </div>
              </div>

              {/* Số cuốc */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Số cuốc xe xong
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={tripsCount}
                    onChange={(e) => setTripsCount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-grab outline-none text-base"
                  />
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => setTripsCount((c) => c + 1)}
                      className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs font-bold hover:bg-slate-300"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => setTripsCount((c) => Math.max(0, c - 1))}
                      className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs font-bold hover:bg-slate-300"
                    >
                      -1
                    </button>
                  </div>
                </div>
              </div>

              {/* Km đã đi */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Quãng đường (Km)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-grab outline-none text-base"
                  />
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => setDistanceKm((k) => k + 5)}
                      className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs font-bold hover:bg-slate-300"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => setDistanceKm((k) => Math.max(0, k - 5))}
                      className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-xs font-bold hover:bg-slate-300"
                    >
                      -5
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PHẦN 2: DOANH THU */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-sm">
                <CircleDollarSign className="w-4 h-4 text-grab" />
                <span>2. Doanh Thu Trong Ca</span>
              </div>
              <span className="text-xs font-bold text-grab-700 dark:text-grab-300">
                Gộp: {formatCurrency(liveCalc.grossRevenue)}
              </span>
            </div>

            <div className="space-y-3">
              {/* Cước App */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Cước nhận từ khách / App (VNĐ)
                  </label>
                  <span className="text-xs font-bold text-emerald-600">{formatCurrency(appFare)}</span>
                </div>
                <input
                  type="number"
                  step="5000"
                  min="0"
                  value={appFare}
                  onChange={(e) => setAppFare(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-grab outline-none text-base"
                />
                <div className="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[20000, 50000, 100000, 200000, 500000].map((add) => (
                    <button
                      key={add}
                      type="button"
                      onClick={() => setAppFare((f) => f + add)}
                      className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-grab hover:border-grab transition-colors"
                    >
                      +{add / 1000}k
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAppFare(0)}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-500"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              {/* Thưởng & Tip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Thưởng (ngọc, mốc cuốc)
                    </label>
                    <span className="text-xs font-bold text-emerald-600">{formatCurrency(bonus)}</span>
                  </div>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    value={bonus}
                    onChange={(e) => setBonus(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-grab outline-none text-base"
                  />
                  <div className="flex items-center gap-1.5 mt-1">
                    {[30000, 50000, 80000, 120000].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBonus(b)}
                        className="px-2 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:border-grab"
                      >
                        {b / 1000}k
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Tiền Tip từ khách
                    </label>
                    <span className="text-xs font-bold text-emerald-600">{formatCurrency(tips)}</span>
                  </div>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    value={tips}
                    onChange={(e) => setTips(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-grab outline-none text-base"
                  />
                  <div className="flex items-center gap-1.5 mt-1">
                    {[10000, 20000, 50000].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTips((prev) => prev + t)}
                        className="px-2 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:border-grab"
                      >
                        +{t / 1000}k
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PHẦN 3: CHI PHÍ CỐ ĐỊNH & VẬN HÀNH */}
          <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-200/60 dark:border-rose-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold text-sm">
                <Fuel className="w-4 h-4 text-rose-500" />
                <span>3. Chi Phí Vận Hành & Ăn Uống</span>
              </div>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Tổng chi: {formatCurrency(liveCalc.totalExpenses)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tiền xăng */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiền xăng xe (VNĐ)
                </label>
                <input
                  type="number"
                  step="5000"
                  min="0"
                  value={petrol}
                  onChange={(e) => setPetrol(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-rose-400 outline-none"
                />
                <div className="flex items-center gap-1.5 mt-1.5">
                  {[50000, 70000, 90000, 110000].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPetrol(p)}
                      className="px-2 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                    >
                      {p / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiền ăn uống */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiền ăn uống trong ca (cơm, nước)
                </label>
                <input
                  type="number"
                  step="5000"
                  min="0"
                  value={meals}
                  onChange={(e) => setMeals(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-rose-400 outline-none"
                />
                <div className="flex items-center gap-1.5 mt-1.5">
                  {[35000, 50000, 65000, 80000].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMeals(m)}
                      className="px-2 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                    >
                      {m / 1000}k
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bảo dưỡng / Sửa xe */}
            <div className="pt-2 border-t border-rose-100 dark:border-rose-900/40">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bảo dưỡng / Thay nhớt / Sửa xe (VNĐ)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    value={maintenance}
                    onChange={(e) => setMaintenance(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-rose-400 outline-none"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[120000, 150000, 250000].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMaintenance(m)}
                        className="px-2 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                      >
                        {m / 1000}k
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ghi chú bảo dưỡng (nếu có)
                  </label>
                  <input
                    type="text"
                    value={maintenanceNote}
                    onChange={(e) => setMaintenanceNote(e.target.value)}
                    placeholder="Ví dụ: Thay nhớt Motul, vá xe..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-rose-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Khoản chi tiêu đột xuất / khác */}
            <div className="pt-2 border-t border-rose-100 dark:border-rose-900/40 space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Khoản chi đột xuất / Khác (phạt, mua đồ nhà, đóng quỹ...)
              </label>

              {/* Danh sách đã thêm */}
              {otherExpenses.length > 0 && (
                <div className="space-y-1.5">
                  {otherExpenses.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs"
                    >
                      <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(item.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOtherExpense(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Form thêm khoản chi đột xuất */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newOtherName}
                  onChange={(e) => setNewOtherName(e.target.value)}
                  placeholder="Lý do (VD: Bị phạt 150k, mua nước...)"
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-rose-400"
                />
                <input
                  type="number"
                  value={newOtherAmount}
                  onChange={(e) => setNewOtherAmount(e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="Số tiền"
                  className="w-28 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-rose-400 font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddOtherExpense}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Thêm
                </button>
              </div>
            </div>
          </div>

          {/* PHẦN 4: TRÍCH QUỸ TIẾT KIỆM */}
          <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold text-sm">
                <PiggyBank className="w-4 h-4 text-amber-600" />
                <span>4. Trích Quỹ Tiết Kiệm Hôm Nay</span>
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                Cất riêng: {formatCurrency(savings)}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Khoản tiền bạn muốn trích cất riêng vào heo đất / tài khoản tiết kiệm trước khi tiêu xài tiền mặt.
            </p>

            <div>
              <input
                type="number"
                step="10000"
                min="0"
                value={savings}
                onChange={(e) => setSavings(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-amber-500 outline-none text-base"
              />
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {[0, 50000, 100000, 150000, 200000].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSavings(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      savings === s
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                    }`}
                  >
                    {s === 0 ? 'Không trích' : `${s / 1000}k`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GHI CHÚ CHUNG */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ghi chú thêm trong ngày (thời tiết, khu vực nổ cuốc, tình hình đường xá...)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ví dụ: Trời mưa to lúc 5h chiều, ngập đường Nguyễn Hữu Cảnh..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-grab outline-none"
            />
          </div>
        </form>

        {/* FOOTER & LIVE PREVIEW SUMMARY BANNER */}
        <div className="bg-slate-50 dark:bg-slate-900 px-5 py-3.5 border-t border-slate-200 dark:border-slate-700 shrink-0 space-y-3">
          {/* Tóm tắt tính toán tức thì */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Thu Gộp [1]</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {formatCurrency(liveCalc.grossRevenue)}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Tổng Chi [2]</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(liveCalc.totalExpenses)}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-grab block text-[10px] uppercase font-bold">Lãi Ròng Đút Túi [3]</span>
              <span className="font-black text-grab text-sm sm:text-base">
                {formatCurrency(liveCalc.netIncome)}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
              <span className="text-indigo-600 block text-[10px] uppercase font-bold">Tiền Mặt Tiêu [5]</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-300">
                {formatCurrency(liveCalc.cashRemaining)}
              </span>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-grab hover:bg-grab-600 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              {initialRecord ? 'Cập Nhật Ca Chạy' : 'Lưu Ca Chạy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
