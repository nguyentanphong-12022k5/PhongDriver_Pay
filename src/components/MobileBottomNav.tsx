import React from 'react';
import { LayoutDashboard, History, Plus, BarChart3, Settings } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: 'dashboard' | 'history' | 'charts';
  onSelectTab: (tab: 'dashboard' | 'history' | 'charts') => void;
  onOpenNewShift: () => void;
  onOpenSettings: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewShift,
  onOpenSettings,
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-lg">
      {/* Tab Tổng Quan */}
      <button
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center gap-1 p-1 text-[11px] font-semibold transition-colors ${
          currentTab === 'dashboard'
            ? 'text-grab'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Tổng Quan</span>
      </button>

      {/* Tab Lịch Sử */}
      <button
        onClick={() => onSelectTab('history')}
        className={`flex flex-col items-center gap-1 p-1 text-[11px] font-semibold transition-colors ${
          currentTab === 'history'
            ? 'text-grab'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <History className="w-5 h-5" />
        <span>Lịch Sử</span>
      </button>

      {/* Nút Nhập Ca Nổi Bật Chính Giữa */}
      <button
        onClick={onOpenNewShift}
        className="flex flex-col items-center justify-center -mt-5"
        title="Nhập ca chạy"
      >
        <div className="w-13 h-13 rounded-full bg-grab text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 border-4 border-white dark:border-slate-900 active:scale-95 transition-transform">
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </div>
        <span className="text-[10px] font-bold text-grab mt-0.5">Nhập Ca</span>
      </button>

      {/* Tab Biểu Đồ */}
      <button
        onClick={() => onSelectTab('charts')}
        className={`flex flex-col items-center gap-1 p-1 text-[11px] font-semibold transition-colors ${
          currentTab === 'charts'
            ? 'text-grab'
            : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <BarChart3 className="w-5 h-5" />
        <span>Biểu Đồ</span>
      </button>

      {/* Nút Cài Đặt */}
      <button
        onClick={onOpenSettings}
        className="flex flex-col items-center gap-1 p-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <Settings className="w-5 h-5" />
        <span>Cài Đặt</span>
      </button>
    </nav>
  );
};
