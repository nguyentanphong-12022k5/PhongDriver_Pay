import React, { useEffect, useRef } from 'react';
import { SummaryAggregated, formatCurrency, formatNumber } from '../utils/calculations';
import {
  Wallet,
  TrendingUp,
  Receipt,
  PiggyBank,
  Banknote,
  Clock,
  Navigation,
  CheckCircle2,
  Target,
  Percent,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface KpiCardsProps {
  summary: SummaryAggregated;
  dailyTarget: number;
  periodLabel: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ summary, dailyTarget, periodLabel }) => {
  const hasCelebrated = useRef(false);

  // Tính tỷ lệ đạt mục tiêu (nếu là hôm nay hoặc có số liệu)
  const targetAmount = dailyTarget || 500000;
  const progressPercent = Math.min(100, Math.round((summary.totalNetIncome / targetAmount) * 100));

  useEffect(() => {
    if (progressPercent >= 100 && !hasCelebrated.current && summary.totalNetIncome > 0) {
      hasCelebrated.current = true;
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00B14F', '#10b981', '#fbbf24', '#3b82f6'],
        });
      } catch (e) {
        // ignore
      }
    }
  }, [progressPercent, summary.totalNetIncome]);

  return (
    <div className="space-y-4">
      {/* Thanh mục tiêu ngày (Daily Target Progress) */}
      <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-grab-600 text-white p-4 sm:p-5 rounded-2xl shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-emerald-100">
                  Mục tiêu thu nhập ({periodLabel})
                </span>
                {progressPercent >= 100 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full shadow-sm">
                    <Sparkles className="w-3 h-3" /> Đạt chỉ tiêu!
                  </span>
                )}
              </div>
              <div className="text-xl sm:text-2xl font-black tracking-tight">
                {formatCurrency(summary.totalNetIncome)}{' '}
                <span className="text-sm font-normal text-emerald-200">
                  / mục tiêu {formatCurrency(targetAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-2xl font-black">{progressPercent}%</span>
              <p className="text-[11px] text-emerald-100">
                {progressPercent >= 100
                  ? 'Vượt chỉ tiêu xuất sắc!'
                  : `Còn thiếu ${formatCurrency(Math.max(0, targetAmount - summary.totalNetIncome))}`}
              </p>
            </div>
          </div>
        </div>

        {/* Thanh tiến độ */}
        <div className="mt-3.5 bg-black/20 rounded-full h-2.5 overflow-hidden backdrop-blur-sm">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              progressPercent >= 100 ? 'bg-amber-300' : 'bg-white'
            }`}
            style={{ width: `${Math.max(4, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* 5 CHỈ SỐ CỐT LÕI (5 CARDS CHÍNH THEO YÊU CẦU ĐỀ BÀI) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* [1] Tổng thu nhập gộp */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              [1] Thu Nhập Gộp
            </span>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
              {formatCurrency(summary.totalGrossRevenue)}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Cước + Thưởng + Tip
            </p>
          </div>
        </div>

        {/* [2] Tổng chi phí */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              [2] Tổng Chi Phí
            </span>
            <div className="p-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(summary.totalExpenses)}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Xăng + Ăn + Sửa xe + Khác
            </p>
          </div>
        </div>

        {/* [3] Thu nhập ròng (Lãi thực nhận đút túi) - NỔI BẬT NHẤT */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-500/10 via-grab-500/15 to-teal-500/10 dark:from-emerald-950/40 dark:to-slate-800 p-4 rounded-2xl shadow-sm border-2 border-grab-500 dark:border-grab-600 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-grab-700 dark:text-grab-300 uppercase tracking-wide">
                [3] Lãi Thực Nhận
              </span>
            </div>
            <div className="p-1.5 bg-grab text-white rounded-lg shadow-sm">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-grab-700 dark:text-grab-400">
              {formatCurrency(summary.totalNetIncome)}
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300/80 font-medium mt-0.5">
              Đút túi = Gộp [1] - Chi [2]
            </p>
          </div>
        </div>

        {/* [4] Tiền tiết kiệm tích lũy */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              [4] Quỹ Tiết Kiệm
            </span>
            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(summary.totalSavings)}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Trích cất riêng
            </p>
          </div>
        </div>

        {/* [5] Tiền mặt còn lại sau khi trừ tiết kiệm */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              [5] Tiền Mặt Tiêu Dùng
            </span>
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(summary.totalCashRemaining)}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Còn lại = Lãi [3] - Quỹ [4]
            </p>
          </div>
        </div>
      </div>

      {/* CHỈ SỐ HIỆU SUẤT TÀI XẾ (DRIVER PERFORMANCE METRICS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 dark:bg-slate-800/50 p-3 sm:p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl shadow-xs">
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Lương TB / Giờ</div>
            <div className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
              {formatCurrency(summary.avgHourlyWage)}/h
            </div>
            <div className="text-[10px] text-slate-400">
              Thực nhận: {formatCurrency(summary.avgNetHourlyWage)}/h
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl shadow-xs">
            <Navigation className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Doanh thu / Km</div>
            <div className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
              {formatCurrency(summary.avgRevenuePerKm)}/km
            </div>
            <div className="text-[10px] text-slate-400">
              Chi phí: {formatCurrency(summary.avgExpensePerKm)}/km
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Doanh thu / Cuốc</div>
            <div className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
              {formatCurrency(summary.avgRevenuePerTrip)}
            </div>
            <div className="text-[10px] text-slate-400">
              Tổng {summary.totalTripsCount} cuốc ({summary.totalDistanceKm} km)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl shadow-xs">
            <Percent className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Tỷ lệ Lãi Ròng</div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
              {summary.avgProfitMargin}%
            </div>
            <div className="text-[10px] text-slate-400">
              Chạy tổng {summary.totalOnlineHours}h online
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
