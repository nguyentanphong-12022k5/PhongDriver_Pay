import React from 'react';
import { AppSettings } from '../types';
import {
  Car,
  Sun,
  Moon,
  Settings,
  Plus,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { getLunarInfoFromDateString } from '../utils/lunar';

interface NavbarProps {
  settings: AppSettings;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenNewShift: () => void;
  todayStr: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  isDark,
  onToggleTheme,
  onOpenSettings,
  onOpenNewShift,
  todayStr,
}) => {
  const lunar = getLunarInfoFromDateString(todayStr);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* LOGO & BRAND */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-grab-600 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-800 dark:text-slate-100 text-base sm:text-lg tracking-tight">
                PhongDriver<span className="text-grab">Pay</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-grab-50 text-grab-700 dark:bg-grab-950/60 dark:text-grab-300 border border-grab-200 dark:border-grab-800">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>{settings.driverName}</span>
              <span>•</span>
              <span className="text-grab-600 dark:text-grab-400 font-medium">
                {settings.vehicleType}
              </span>
            </div>
          </div>
        </div>

        {/* THÔNG TIN LỊCH ÂM DƯƠNG HÔM NAY (DESKTOP) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-xs">
          <Calendar className="w-4 h-4 text-grab" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            Hôm nay: <strong className="text-slate-800 dark:text-slate-100">{todayStr}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
            {lunar.displayText}
          </span>
          {lunar.holiday && (
            <span className="bg-amber-400 text-amber-950 font-bold px-1.5 py-0.5 rounded text-[10px]">
              {lunar.holiday}
            </span>
          )}
        </div>

        {/* CÁC NÚT ĐIỀU KHIỂN & HÀNH ĐỘNG */}
        <div className="flex items-center gap-2">
          {/* Nút chuyển Dark/Light Mode */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'Chuyển sang chế độ ban ngày' : 'Chuyển sang chế độ ban đêm'}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Cài đặt */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Cài đặt & Sao lưu"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Nút Nhập Ca Chạy (Desktop / Mobile Header) */}
          <button
            onClick={onOpenNewShift}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-grab hover:bg-grab-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nhập Ca Hôm Nay</span>
          </button>
        </div>
      </div>
    </header>
  );
};
