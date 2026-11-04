import React from 'react';
import { FilterPeriod, LunarDateInfo } from '../types';
import { getLunarInfoFromDateString } from '../utils/lunar';
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Moon,
} from 'lucide-react';

interface FilterBarProps {
  period: FilterPeriod;
  onPeriodChange: (p: FilterPeriod) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomDateChange: (start: string, end: string) => void;
  todayStr: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  period,
  onPeriodChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
  todayStr,
}) => {
  // Thông tin âm lịch của ngày hôm nay hoặc ngày được chọn
  const todayLunar: LunarDateInfo = getLunarInfoFromDateString(
    period === 'custom' && customStartDate ? customStartDate : todayStr
  );

  const periods: { key: FilterPeriod; label: string }[] = [
    { key: 'today', label: 'Hôm nay' },
    { key: 'yesterday', label: 'Hôm qua' },
    { key: 'this_week', label: 'Tuần này' },
    { key: 'this_month', label: 'Tháng này' },
    { key: 'this_year', label: 'Năm nay' },
    { key: 'all', label: 'Tất cả' },
    { key: 'custom', label: 'Tùy chọn' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Nút lọc thời gian (Scrollable on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {periods.map((p) => {
            const active = period === p.key;
            return (
              <button
                key={p.key}
                onClick={() => onPeriodChange(p.key)}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all ${
                  active
                    ? 'bg-grab text-white shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Thẻ hiển thị ngày Âm lịch & Lễ Tết */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl text-xs">
          <Moon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-emerald-800 dark:text-emerald-200">
              {todayLunar.displayText}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              ({todayLunar.canChiDay})
            </span>
            {todayLunar.holiday && (
              <span className="inline-flex items-center gap-1 font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md text-[10px] animate-pulse">
                <Sparkles className="w-2.5 h-2.5" />
                {todayLunar.holiday}
              </span>
            )}
            {!todayLunar.holiday && todayLunar.specialTag && (
              <span className="font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded text-[10px]">
                {todayLunar.specialTag}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nếu chọn Tùy chọn: hiển thị 2 ô chọn ngày */}
      {period === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Từ ngày:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => onCustomDateChange(e.target.value, customEndDate)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-grab outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Đến ngày:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => onCustomDateChange(customStartDate, e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-grab outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
