import React, { useState, useRef } from 'react';
import { AppSettings, ShiftRecord } from '../types';
import { exportToExcel, exportToJson, importFromJson, importFromExcel } from '../utils/excel';
import {
  X,
  Settings,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  User,
  Car,
  Target,
  ShieldCheck,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  records: ShiftRecord[];
  onImportRecords: (records: ShiftRecord[]) => void;
  onResetMock: () => void;
  onClearAll: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  records,
  onImportRecords,
  onResetMock,
  onClearAll,
}) => {
  const [driverName, setDriverName] = useState(settings.driverName);
  const [vehicleType, setVehicleType] = useState(settings.vehicleType);
  const [dailyTarget, setDailyTarget] = useState(settings.dailyTarget);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      driverName: driverName.trim() || 'Bác Tài Grab',
      vehicleType,
      dailyTarget: Number(dailyTarget) || 500000,
    });
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('Đang xử lý đọc file...');
    try {
      let imported: ShiftRecord[] = [];
      if (file.name.endsWith('.json')) {
        imported = await importFromJson(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        imported = await importFromExcel(file);
      } else {
        throw new Error('Chỉ hỗ trợ file .json, .xlsx, .xls, .csv!');
      }

      onImportRecords(imported);
      setImportStatus(`Khôi phục thành công ${imported.length} ca chạy!`);
      setTimeout(() => setImportStatus(null), 3000);
    } catch (err: any) {
      alert(`Lỗi khi nhập file: ${err.message}`);
      setImportStatus(null);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-lg overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Settings className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Cài Đặt & Sao Lưu Dữ Liệu</h3>
              <p className="text-xs text-slate-400">
                Tùy chỉnh mục tiêu, nhập xuất Excel / JSON an toàn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NỘI DUNG CÀI ĐẶT */}
        <div className="p-5 overflow-y-auto space-y-6 max-h-[75vh]">
          {/* Thông tin tài xế & Mục tiêu */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Thông Tin Cá Nhân & Xe
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên tài xế / Biệt danh
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold outline-none focus:ring-2 focus:ring-grab"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Loại hình chạy xe
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold outline-none focus:ring-2 focus:ring-grab"
                  >
                    <option value="GrabBike">GrabBike (Xe máy)</option>
                    <option value="GrabCar">GrabCar (Ô tô)</option>
                    <option value="GrabFood">GrabFood (Giao đồ ăn)</option>
                    <option value="Khác">Giao hàng / Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mục tiêu lãi ngày (VNĐ)
                  </label>
                  <div className="relative">
                    <Target className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="50000"
                      value={dailyTarget}
                      onChange={(e) => setDailyTarget(parseFloat(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-bold outline-none focus:ring-2 focus:ring-grab"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QUẢN LÝ DỮ LIỆU & SAO LƯU */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Sao Lưu & Nhập / Xuất Dữ Liệu
            </h4>

            {importStatus && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-grab border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Xuất Excel */}
              <button
                type="button"
                onClick={() => exportToExcel(records)}
                className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-left transition-colors flex items-center gap-3"
              >
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-emerald-900 dark:text-emerald-300">
                    Xuất File Excel (.xlsx)
                  </div>
                  <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
                    Báo cáo chuẩn tiếng Việt
                  </div>
                </div>
              </button>

              {/* Xuất JSON */}
              <button
                type="button"
                onClick={() => exportToJson(records)}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/40 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-left transition-colors flex items-center gap-3"
              >
                <div className="p-2.5 bg-slate-700 text-white rounded-xl">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                    Xuất Sao Lưu (JSON)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Lưu dữ liệu gốc dự phòng
                  </div>
                </div>
              </button>
            </div>

            {/* Nhập file */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv, .json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-3 rounded-2xl bg-blue-50 hover:bg-blue-100/80 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Nhập Dữ Liệu Từ File (Excel / JSON)</span>
              </button>
              <p className="text-[11px] text-slate-400 mt-1 text-center">
                Dùng khi chuyển dữ liệu sang điện thoại hoặc máy tính mới
              </p>
            </div>
          </div>

          {/* DỮ LIỆU MẪU & KHÔI PHỤC GỐC */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Dữ Liệu Thử Nghiệm & Cài Đặt Gốc
            </h4>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Nạp lại dữ liệu mẫu 7 ngày gần nhất? Các ca chạy trùng ngày sẽ được cập nhật.')) {
                    onResetMock();
                    onClose();
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Nạp Lại Dữ Liệu Mẫu (7 Ngày)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Toàn Bộ Dữ Liệu</span>
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-grab hover:bg-grab-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            Lưu Cấu Hình
          </button>
        </div>
      </div>

      {/* MODAL XÁC NHẬN XÓA TOÀN BỘ */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl border border-rose-200 dark:border-rose-900">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-100 dark:bg-rose-950/60 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">
                Xóa Sạch Dữ Liệu?
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Toàn bộ lịch sử ca chạy trên máy này sẽ bị xóa sạch hoàn toàn. Hãy đảm bảo bạn đã xuất file Excel hoặc JSON dự phòng!
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Đồng Ý Xóa Sạch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
