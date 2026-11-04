import React from 'react';
import { AppSettings } from '../types';
import {
  Car,
  Sun,
  Moon,
  Settings,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { getLunarInfoFromDateString } from '../utils/lunar';

interface NavbarProps {
  settings: AppSettings;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenNewShift: () => void;
  selectedDate: string;
  onSelectDate: (d: string) => void;
  todayStr: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  isDark,
  onToggleTheme,
  onOpenSettings,
  onOpenNewShift,
  selectedDate,
  onSelectDate,
  todayStr,
}) => {
  const selectedLunar = getLunarInfoFromDateString(selectedDate);

  // Hàm lùi / tiến 1 ngày
  const handleStepDate = (days: number) => {
    const parts = selectedDate.split('-');
    const current = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    current.setDate(current.getDate() + days);
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    onSelectDate(`${y}-${m}-${d}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* LOGO & BRAND */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-grab-600 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-800 dark:text-slate-100 text-base sm:text-lg tracking-tight">
                PhongDriver<tspan className="text-grab">Pay</tspan>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-grab-50 text-grab-700 dark:bg-grab-950/60 dark:text-grab-300 border border-grab-200 dark:border-grab-800">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden xs:flex items-center gap-1">
              <span>{settings.driverName}</span>
              <span>•</span>
              <span className="text-grab-600 dark:text-grab-400 font-medium">
                {settings.vehicleType}
              </span>
            </div>
          </div>
        </div>

        {/* BỘ CHỌN NGÀY & LỊCH ÂM TƯƠNG TÁC (CHỌN ĐƯỢC MỌI NGÀY XA HƠN) */}
        <div className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs shadow-xs">
          {/* Lùi 1 ngày */}
          <button
            type="button"
            onClick={() => handleStepDate(-1)}
            className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            title="Lùi lại 1 ngày"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Ô chọn ngày tùy ý */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-grab shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectDate(e.target.value)}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer text-xs sm:text-sm"
              title="Bấm vào để chọn ngày bất kỳ trong quá khứ hoặc tương lai"
            />
          </div>

          {/* Tiến 1 ngày */}
          <button
            type="button"
            onClick={() => handleStepDate(1)}
            className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            title="Tiến lên 1 ngày"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Nút quay lại hôm nay nếu đang chọn ngày xa hơn */}
          {selectedDate !== todayStr && (
            <button
              type="button"
              onClick={() => onSelectDate(todayStr)}
              className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 transition-colors flex items-center gap-0.5"
              title="Quay lại ngày hôm nay"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Hôm nay</span>
            </button>
          )}

          {/* Hiển thị Âm lịch tương ứng của ngày đang chọn */}
          <span className="text-slate-300 dark:text-slate-600 hidden md:inline">|</span>
          <div className="hidden md:flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
            <Moon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{selectedLunar.displayText}</span>
            {selectedLunar.holiday && (
              <span className="bg-amber-400 text-amber-950 font-bold px-1.5 py-0.2 rounded text-[10px]">
                {selectedLunar.holiday}
              </span>
            )}
          </div>
        </div>

        {/* CÁC NÚT ĐIỀU KHIỂN & HÀNH ĐỘNG */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Nút chuyển Dark/Light Mode */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'Chuyển sang chế độ ban ngày' : 'Chuyển sang chế độ ban đêm'}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Cài đặt */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Cài đặt & Sao lưu"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Nút Nhập Ca Chạy */}
          <button
            type="button"
            onClick={onOpenNewShift}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-grab hover:bg-grab-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/25 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{selectedDate === todayStr ? 'Nhập Ca Hôm Nay' : `Nhập Ca ${selectedDate.split('-').slice(1).join('/')}`}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
