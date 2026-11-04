import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ShiftRecord } from '../types';
import { calculateShift, formatCurrency, formatNumber } from '../utils/calculations';
import { TrendingUp, PieChart, BarChart3, AlertCircle } from 'lucide-react';

// Đăng ký các module ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartsViewProps {
  records: ShiftRecord[];
  isDark: boolean;
}

export const ChartsView: React.FC<ChartsViewProps> = ({ records, isDark }) => {
  if (!records || records.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Chưa có dữ liệu biểu đồ</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hãy nhập ca chạy hoặc chọn khoảng thời gian khác.</p>
      </div>
    );
  }

  // Sắp xếp ngày tăng dần để vẽ biểu đồ xu hướng
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

  const labels = sorted.map((r) => {
    const parts = r.date.split('-');
    return `${parts[2]}/${parts[1]}`;
  });

  const grossData = sorted.map((r) => calculateShift(r).grossRevenue);
  const expenseData = sorted.map((r) => calculateShift(r).totalExpenses);
  const netData = sorted.map((r) => calculateShift(r).netIncome);
  const savingsData = sorted.map((r) => calculateShift(r).savings);

  // Tính cơ cấu chi phí
  let totalPetrol = 0;
  let totalMeals = 0;
  let totalMaint = 0;
  let totalOthers = 0;

  sorted.forEach((r) => {
    totalPetrol += Number(r.expenses?.petrol) || 0;
    totalMeals += Number(r.expenses?.meals) || 0;
    totalMaint += Number(r.expenses?.maintenance) || 0;
    totalOthers += calculateShift(r).totalOtherExpenses;
  });

  const totalAllExpenses = totalPetrol + totalMeals + totalMaint + totalOthers;

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)';

  // Dữ liệu biểu đồ xu hướng
  const trendChartData = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Doanh thu gộp',
        data: grossData,
        backgroundColor: 'rgba(0, 177, 79, 0.65)',
        borderColor: '#00B14F',
        borderWidth: 1.5,
        borderRadius: 6,
        order: 2,
      },
      {
        type: 'line' as const,
        label: 'Lãi ròng đút túi',
        data: netData,
        borderColor: '#10b981',
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
        tension: 0.3,
        fill: true,
        order: 1,
      },
      {
        type: 'line' as const,
        label: 'Tổng chi phí',
        data: expenseData,
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [4, 4],
        pointBackgroundColor: '#ef4444',
        pointRadius: 3,
        tension: 0.2,
        order: 3,
      },
    ],
  };

  const trendChartOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { family: 'Inter', size: 12, weight: 500 },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 11 } },
      },
      y: {
        grid: { color: gridColor },
        ticks: {
          color: textColor,
          callback: (val) => `${Number(val) / 1000}k`,
          font: { size: 11 },
        },
      },
    },
  };

  // Dữ liệu biểu đồ cơ cấu chi phí
  const doughnutData = {
    labels: ['Xăng xe', 'Ăn uống', 'Bảo dưỡng/Sửa xe', 'Chi phí khác'],
    datasets: [
      {
        data: [totalPetrol, totalMeals, totalMaint, totalOthers],
        backgroundColor: [
          '#f59e0b', // Xăng - Amber
          '#3b82f6', // Ăn uống - Blue
          '#ec4899', // Bảo dưỡng - Pink
          '#8b5cf6', // Khác - Purple
        ],
        borderWidth: isDark ? 2 : 2,
        borderColor: isDark ? '#1e293b' : '#ffffff',
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          font: { size: 12 },
          usePointStyle: true,
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => {
            const val = Number(ctx.parsed) || 0;
            const pct = totalAllExpenses > 0 ? Math.round((val / totalAllExpenses) * 100) : 0;
            return ` ${ctx.label}: ${formatCurrency(val)} (${pct}%)`;
          },
        },
      },
    },
    cutout: '68%',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Biểu đồ xu hướng */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-grab rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Biểu Đồ Xu Hướng Thu Nhập & Chi Phí
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                So sánh doanh thu gộp, tổng chi phí và lợi nhuận ròng thực nhận
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-grab-700 dark:text-grab-300">
            {sorted.length} ca chạy
          </span>
        </div>
        <div className="h-[280px] sm:h-[320px] w-full">
          <Bar data={trendChartData as any} options={trendChartOptions as any} />
        </div>
      </div>

      {/* Biểu đồ tròn cơ cấu chi phí */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Cơ Cấu Chi Phí Vận Hành
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tổng chi: {formatCurrency(totalAllExpenses)}
              </p>
            </div>
          </div>

          <div className="h-[210px] w-full relative flex items-center justify-center">
            {totalAllExpenses > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="text-center text-xs text-slate-400">Không phát sinh chi phí</div>
            )}
          </div>
        </div>

        {/* Bảng mini tóm tắt tỷ lệ */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/20">
            <span className="text-amber-700 dark:text-amber-300 font-medium">Xăng:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {totalAllExpenses > 0 ? Math.round((totalPetrol / totalAllExpenses) * 100) : 0}%
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/20">
            <span className="text-blue-700 dark:text-blue-300 font-medium">Ăn uống:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {totalAllExpenses > 0 ? Math.round((totalMeals / totalAllExpenses) * 100) : 0}%
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-pink-50/60 dark:bg-pink-950/20">
            <span className="text-pink-700 dark:text-pink-300 font-medium">Bảo dưỡng:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {totalAllExpenses > 0 ? Math.round((totalMaint / totalAllExpenses) * 100) : 0}%
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50/60 dark:bg-purple-950/20">
            <span className="text-purple-700 dark:text-purple-300 font-medium">Khác:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {totalAllExpenses > 0 ? Math.round((totalOthers / totalAllExpenses) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
