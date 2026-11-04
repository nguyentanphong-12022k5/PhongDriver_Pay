import React, { useState, useEffect, useMemo } from 'react';
import { ShiftRecord, FilterPeriod, AppSettings } from './types';
import {
  getSavedRecords,
  saveRecords,
  upsertRecord,
  deleteRecord,
  resetToMockData,
  clearAllRecords,
  getAppSettings,
  saveAppSettings,
  formatDate,
} from './utils/storage';
import { aggregateRecords } from './utils/calculations';
import { exportToExcel } from './utils/excel';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { KpiCards } from './components/KpiCards';
import { ChartsView } from './components/ChartsView';
import { HistoryTable } from './components/HistoryTable';
import { ShiftFormModal } from './components/ShiftFormModal';
import { SettingsModal } from './components/SettingsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import {
  Plus,
  FileSpreadsheet,
  CheckCircle,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const App: React.FC = () => {
  // Trạng thái cấu hình & giao diện
  const [settings, setSettings] = useState<AppSettings>(getAppSettings);
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('phongdriver_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Đồng bộ dark mode với class `dark` của thẻ html
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('phongdriver_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('phongdriver_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Danh sách bản ghi ca chạy
  const [records, setRecords] = useState<ShiftRecord[]>(getSavedRecords);

  // Ngày hôm nay
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatDate(today), [today]);

  // Bộ lọc thời gian
  const [period, setPeriod] = useState<FilterPeriod>('this_week');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return formatDate(d);
  });
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);

  // Tab di động (dashboard, history, charts)
  const [mobileTab, setMobileTab] = useState<'dashboard' | 'history' | 'charts'>('dashboard');

  // Modal ca chạy & Cài đặt
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ShiftRecord | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Thông báo Toast nhanh
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Lọc danh sách bản ghi theo khoảng thời gian đã chọn
  const filteredRecords = useMemo(() => {
    if (period === 'all') return records;

    if (period === 'today') {
      return records.filter((r) => r.date === todayStr);
    }

    if (period === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      const yesterdayStr = formatDate(y);
      return records.filter((r) => r.date === yesterdayStr);
    }

    if (period === 'this_week') {
      // Tuần hiện tại (từ thứ 2 đến chủ nhật)
      const now = new Date(today);
      const currentDay = now.getDay();
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      const mondayStr = formatDate(monday);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const sundayStr = formatDate(sunday);

      return records.filter((r) => r.date >= mondayStr && r.date <= sundayStr);
    }

    if (period === 'this_month') {
      const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM
      return records.filter((r) => r.date.startsWith(currentMonthPrefix));
    }

    if (period === 'this_year') {
      const currentYearPrefix = todayStr.substring(0, 4); // YYYY
      return records.filter((r) => r.date.startsWith(currentYearPrefix));
    }

    if (period === 'custom') {
      return records.filter((r) => {
        if (customStartDate && r.date < customStartDate) return false;
        if (customEndDate && r.date > customEndDate) return false;
        return true;
      });
    }

    return records;
  }, [records, period, todayStr, today, customStartDate, customEndDate]);

  // Tổng hợp chỉ số
  const summary = useMemo(() => aggregateRecords(filteredRecords), [filteredRecords]);

  // Nhãn thời gian hiển thị trên mục tiêu
  const periodLabel = useMemo(() => {
    switch (period) {
      case 'today':
        return 'Hôm nay';
      case 'yesterday':
        return 'Hôm qua';
      case 'this_week':
        return 'Tuần này';
      case 'this_month':
        return 'Tháng này';
      case 'this_year':
        return 'Năm nay';
      case 'custom':
        return 'Khoảng ngày chọn';
      default:
        return 'Tất cả';
    }
  }, [period]);

  // Hành động thêm/sửa ca chạy
  const handleSaveShift = (record: ShiftRecord) => {
    const updated = upsertRecord(record);
    setRecords(updated);
    showToast('Đã lưu dữ liệu ca chạy thành công!');
  };

  // Hành động xóa ca chạy
  const handleDeleteShift = (id: string) => {
    const updated = deleteRecord(id);
    setRecords(updated);
    showToast('Đã xóa ca chạy thành công.');
  };

  // Hành động cập nhật cài đặt
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveAppSettings(newSettings);
    showToast('Đã lưu cài đặt!');
  };

  // Nạp lại dữ liệu mẫu
  const handleResetMock = () => {
    const mock = resetToMockData();
    setRecords(mock);
    showToast('Đã nạp lại 7 ngày dữ liệu mẫu!');
  };

  // Xóa toàn bộ
  const handleClearAll = () => {
    const empty = clearAllRecords();
    setRecords(empty);
    showToast('Đã xóa toàn bộ dữ liệu.');
  };

  // Nhập dữ liệu từ file
  const handleImportRecords = (imported: ShiftRecord[]) => {
    // Gộp dữ liệu: thêm mới hoặc cập nhật nếu trùng ngày/id
    let merged = [...records];
    imported.forEach((item) => {
      const idx = merged.findIndex((m) => m.id === item.id || m.date === item.date);
      if (idx >= 0) {
        merged[idx] = item;
      } else {
        merged.push(item);
      }
    });
    merged.sort((a, b) => b.date.localeCompare(a.date));
    saveRecords(merged);
    setRecords(merged);
    showToast(`Đã nạp thành công ${imported.length} ca chạy!`);
  };

  const handleOpenNewShift = () => {
    setEditingRecord(null);
    setIsShiftModalOpen(true);
  };

  const handleOpenEditShift = (record: ShiftRecord) => {
    setEditingRecord(record);
    setIsShiftModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors pb-20 sm:pb-10">
      {/* THANH ĐIỀU HƯỚNG TRÊN CÙNG */}
      <Navbar
        settings={settings}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNewShift={handleOpenNewShift}
        todayStr={todayStr}
      />

      {/* TOAST THÔNG BÁO TỰ ĐỘNG LƯU / THÀNH CÔNG */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* NỘI DUNG CHÍNH (MAIN CONTAINER) */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-5">
        {/* BỘ LỌC THỜI GIAN & LỊCH ÂM DƯƠNG */}
        <FilterBar
          period={period}
          onPeriodChange={setPeriod}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomDateChange={(start, end) => {
            setCustomStartDate(start);
            setCustomEndDate(end);
          }}
          todayStr={todayStr}
        />

        {/* NỘI DUNG THEO TAB TRÊN MOBILE HOẶC TOÀN BỘ TRÊN DESKTOP */}
        {/* 1. MÀN HÌNH TỔNG QUAN (KPI + MỤC TIÊU) */}
        <div className={`space-y-5 ${mobileTab !== 'dashboard' ? 'hidden sm:block' : 'block'}`}>
          <KpiCards
            summary={summary}
            dailyTarget={settings.dailyTarget}
            periodLabel={periodLabel}
          />
        </div>

        {/* 2. BIỂU ĐỒ TRỰC QUAN (CHARTS) */}
        <div className={`space-y-5 ${mobileTab !== 'charts' && mobileTab !== 'dashboard' ? 'hidden sm:block' : ''} ${mobileTab === 'charts' ? 'block' : 'hidden lg:block'}`}>
          <ChartsView records={filteredRecords} isDark={isDark} />
        </div>

        {/* 3. BẢNG LỊCH SỬ & QUẢN LÝ CA CHẠY */}
        <div className={`space-y-5 ${mobileTab !== 'history' && mobileTab !== 'dashboard' ? 'hidden sm:block' : ''} ${mobileTab === 'history' ? 'block' : 'block'}`}>
          <HistoryTable
            records={filteredRecords}
            onEdit={handleOpenEditShift}
            onDelete={handleDeleteShift}
            onExportExcel={() => exportToExcel(filteredRecords)}
          />
        </div>

        {/* BANNER MẸO TIẾT KIỆM CHO BÁC TÀI */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
              <Lightbulb className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-100">
                Mẹo tài chính cho Bác tài Grab:
              </span>{' '}
              <span className="text-slate-500 dark:text-slate-400">
                Hãy trích cố định từ 50k - 100k mỗi ngày vào quỹ tiết kiệm trước khi tiêu xài tiền mặt, và thay nhớt xe máy đều đặn mỗi 1.500km để máy luôn bốc, tiết kiệm xăng!
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="inline-flex items-center gap-1 font-semibold text-grab">
              <ShieldCheck className="w-4 h-4" /> Dữ liệu lưu an toàn trên máy
            </span>
          </div>
        </div>
      </main>

      {/* MODAL NHẬP / SỬA CA CHẠY */}
      <ShiftFormModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        onSave={handleSaveShift}
        initialRecord={editingRecord}
        todayStr={todayStr}
      />

      {/* MODAL CÀI ĐẶT & SAO LƯU */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        records={records}
        onImportRecords={handleImportRecords}
        onResetMock={handleResetMock}
        onClearAll={handleClearAll}
      />

      {/* THANH ĐIỀU HƯỚNG DƯỚI ĐÁY CHO ĐIỆN THOẠI (MOBILE BOTTOM NAVIGATION) */}
      <MobileBottomNav
        currentTab={mobileTab}
        onSelectTab={setMobileTab}
        onOpenNewShift={handleOpenNewShift}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
    </div>
  );
};

export default App;
