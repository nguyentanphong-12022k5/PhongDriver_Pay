import React, { useState } from 'react';
import { ShiftRecord } from '../types';
import { calculateShift, formatCurrency, formatNumber } from '../utils/calculations';
import { getLunarInfoFromDateString } from '../utils/lunar';
import {
  Search,
  FileSpreadsheet,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Navigation,
  CheckCircle2,
  Sparkles,
  Moon,
  AlertTriangle,
  Receipt,
  PiggyBank,
  Wallet,
} from 'lucide-react';

interface HistoryTableProps {
  records: ShiftRecord[];
  onEdit: (record: ShiftRecord) => void;
  onDelete: (id: string) => void;
  onExportExcel: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  records,
  onEdit,
  onDelete,
  onExportExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // Sắp xếp ngày mới nhất lên đầu
  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));

  // Tìm kiếm theo ngày, ghi chú, tên chi phí khác
  const filteredRecords = sortedRecords.filter((record) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchDate = record.date.includes(term);
    const matchNote = (record.notes || '').toLowerCase().includes(term);
    const matchMaint = (record.expenses?.maintenanceNote || '').toLowerCase().includes(term);
    const matchOther = (record.expenses?.otherExpenses || []).some((item) =>
      item.name.toLowerCase().includes(term)
    );
    const lunar = getLunarInfoFromDateString(record.date);
    const matchLunar = lunar.displayText.toLowerCase().includes(term) || (lunar.holiday || '').toLowerCase().includes(term);

    return matchDate || matchNote || matchMaint || matchOther || matchLunar;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      onDelete(recordToDelete);
      setRecordToDelete(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      {/* HEADER BẢNG & TÌM KIẾM */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base sm:text-lg">
            Nhật Ký & Lịch Sử Ca Chạy
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hiển thị {filteredRecords.length} / {records.length} ngày đã ghi chép
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm ngày, ghi chú, bảo dưỡng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-grab"
            />
          </div>

          {/* Nút xuất Excel */}
          <button
            onClick={onExportExcel}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap active:scale-95"
            title="Xuất bảng tính Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="p-8 text-center text-slate-400">
          <p className="text-sm">Không tìm thấy ca chạy nào phù hợp với từ khóa.</p>
        </div>
      ) : (
        <>
          {/* GIAO DIỆN DESKTOP: BẢNG DỮ LIỆU ĐẦY ĐỦ */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700">
                  <th className="py-3 px-3">Ngày Dương</th>
                  <th className="py-3 px-3">Âm Lịch</th>
                  <th className="py-3 px-2 text-center">Giờ</th>
                  <th className="py-3 px-2 text-center">Cuốc</th>
                  <th className="py-3 px-2 text-center">Km</th>
                  <th className="py-3 px-3 text-right">[1] Thu Gộp</th>
                  <th className="py-3 px-3 text-right">[2] Tổng Chi</th>
                  <th className="py-3 px-3 text-right">[3] Lãi Ròng</th>
                  <th className="py-3 px-3 text-right">[4] Tiết Kiệm</th>
                  <th className="py-3 px-3 text-right">[5] Tiền Mặt</th>
                  <th className="py-3 px-3">Ghi Chú</th>
                  <th className="py-3 px-3 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredRecords.map((record) => {
                  const calc = calculateShift(record);
                  const lunar = getLunarInfoFromDateString(record.date);
                  const isExpanded = expandedId === record.id;

                  return (
                    <React.Fragment key={record.id}>
                      <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors">
                        {/* Ngày dương */}
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                          {record.date}
                        </td>

                        {/* Âm lịch */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Moon className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                              {lunar.displayText}
                            </span>
                            {lunar.holiday && (
                              <span className="bg-amber-400 text-amber-950 font-bold px-1.5 py-0.2 rounded text-[10px]">
                                {lunar.holiday}
                              </span>
                            )}
                            {!lunar.holiday && lunar.specialTag && (
                              <span className="bg-emerald-100 text-emerald-800 font-bold px-1 py-0.2 rounded text-[10px]">
                                {lunar.specialTag}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Giờ */}
                        <td className="py-3 px-2 text-center text-slate-700 dark:text-slate-300 font-medium">
                          {record.workInfo?.onlineHours || 0}h
                        </td>

                        {/* Cuốc */}
                        <td className="py-3 px-2 text-center text-slate-700 dark:text-slate-300 font-medium">
                          {record.workInfo?.tripsCount || 0}
                        </td>

                        {/* Km */}
                        <td className="py-3 px-2 text-center text-slate-700 dark:text-slate-300 font-medium">
                          {record.workInfo?.distanceKm || 0}
                        </td>

                        {/* Thu gộp */}
                        <td className="py-3 px-3 text-right font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {formatCurrency(calc.grossRevenue)}
                        </td>

                        {/* Tổng chi */}
                        <td className="py-3 px-3 text-right font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                          {formatCurrency(calc.totalExpenses)}
                        </td>

                        {/* Thu nhập ròng */}
                        <td className="py-3 px-3 text-right font-black text-grab whitespace-nowrap text-sm">
                          {formatCurrency(calc.netIncome)}
                        </td>

                        {/* Tiết kiệm */}
                        <td className="py-3 px-3 text-right font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                          {formatCurrency(calc.savings)}
                        </td>

                        {/* Tiền mặt */}
                        <td className="py-3 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                          {formatCurrency(calc.cashRemaining)}
                        </td>

                        {/* Ghi chú */}
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400 max-w-[160px] truncate">
                          {record.notes || (record.expenses?.maintenanceNote ? `Sửa: ${record.expenses.maintenanceNote}` : '-')}
                        </td>

                        {/* Nút thao tác */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => toggleExpand(record.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              title="Xem chi tiết phân bổ"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => onEdit(record)}
                              className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                              title="Sửa ca chạy"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setRecordToDelete(record.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Xóa ca chạy"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* HÀNG MỞ RỘNG CHI TIẾT */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                          <td colSpan={12} className="p-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="grid grid-cols-4 gap-4 text-xs">
                              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 space-y-1">
                                <div className="font-bold text-slate-700 dark:text-slate-200">Chi Tiết Doanh Thu</div>
                                <div className="flex justify-between">
                                  <span>Cước App:</span>
                                  <span className="font-semibold">{formatCurrency(record.revenue?.appFare || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Thưởng:</span>
                                  <span className="font-semibold">{formatCurrency(record.revenue?.bonus || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tip:</span>
                                  <span className="font-semibold">{formatCurrency(record.revenue?.tips || 0)}</span>
                                </div>
                                {calc.taxAmount > 0 && (
                                  <div className="flex justify-between text-blue-600 dark:text-blue-400">
                                    <span>Thuế TNCN/VAT:</span>
                                    <span className="font-bold">-{formatCurrency(calc.taxAmount)}</span>
                                  </div>
                                )}
                                {calc.platformFee > 0 && (
                                  <div className="flex justify-between text-blue-600 dark:text-blue-400">
                                    <span>Chiết khấu sàn:</span>
                                    <span className="font-bold">-{formatCurrency(calc.platformFee)}</span>
                                  </div>
                                )}
                                {calc.totalTaxAndFees > 0 && (
                                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-1 text-emerald-700 dark:text-emerald-300 font-bold">
                                    <span>Sau thuế/phí:</span>
                                    <span>{formatCurrency(calc.revenueAfterTax)}</span>
                                  </div>
                                )}
                              </div>

                              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 space-y-1">
                                <div className="font-bold text-slate-700 dark:text-slate-200">Chi Tiết Chi Phí</div>
                                <div className="flex justify-between">
                                  <span>Xăng:</span>
                                  <span className="font-semibold text-rose-600">{formatCurrency(record.expenses?.petrol || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Ăn uống:</span>
                                  <span className="font-semibold text-rose-600">{formatCurrency(record.expenses?.meals || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Bảo dưỡng:</span>
                                  <span className="font-semibold text-rose-600">{formatCurrency(record.expenses?.maintenance || 0)}</span>
                                </div>
                                {record.expenses?.maintenanceNote && (
                                  <div className="text-[10px] text-slate-400 italic">
                                    {record.expenses.maintenanceNote}
                                  </div>
                                )}
                              </div>

                              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 space-y-1">
                                <div className="font-bold text-slate-700 dark:text-slate-200">Chi Phí Đột Xuất & Khác</div>
                                {(record.expenses?.otherExpenses || []).length > 0 ? (
                                  record.expenses?.otherExpenses.map((oth) => (
                                    <div key={oth.id} className="flex justify-between">
                                      <span>{oth.name}:</span>
                                      <span className="font-semibold text-rose-600">{formatCurrency(oth.amount)}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-slate-400">Không có phát sinh</div>
                                )}
                              </div>

                              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 space-y-1">
                                <div className="font-bold text-slate-700 dark:text-slate-200">Hiệu Suất Ca Chạy</div>
                                <div className="flex justify-between">
                                  <span>Doanh thu / Giờ:</span>
                                  <span className="font-semibold">{formatCurrency(calc.hourlyWage)}/h</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Lãi ròng / Giờ:</span>
                                  <span className="font-semibold text-grab">{formatCurrency(calc.netHourlyWage)}/h</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Doanh thu / Km:</span>
                                  <span className="font-semibold">{formatCurrency(calc.revenuePerKm)}/km</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tỷ suất lợi nhuận:</span>
                                  <span className="font-bold text-emerald-600">{calc.profitMargin}%</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* GIAO DIỆN MOBILE: DẠNG CARD (MOBILE-FIRST CARD VIEW) */}
          <div className="block lg:hidden divide-y divide-slate-100 dark:divide-slate-700/60 p-2 sm:p-3 space-y-3">
            {filteredRecords.map((record) => {
              const calc = calculateShift(record);
              const lunar = getLunarInfoFromDateString(record.date);
              const isExpanded = expandedId === record.id;

              return (
                <div
                  key={record.id}
                  className="bg-slate-50/70 dark:bg-slate-750 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700 shadow-xs space-y-3"
                >
                  {/* Dòng tiêu đề card: Ngày dương & Ngày âm */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        {record.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        <Moon className="w-3 h-3 text-amber-500" />
                        <span>{lunar.displayText}</span>
                        {lunar.holiday && (
                          <span className="bg-amber-400 text-amber-950 font-bold px-1.5 py-0.2 rounded text-[10px]">
                            {lunar.holiday}
                          </span>
                        )}
                        {!lunar.holiday && lunar.specialTag && (
                          <span className="bg-emerald-200 text-emerald-900 font-bold px-1 py-0.2 rounded text-[10px]">
                            {lunar.specialTag}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(record)}
                        className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setRecordToDelete(record.id)}
                        className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Thông tin làm việc: Giờ, Cuốc, Km */}
                  <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-700/60 p-2.5 rounded-xl text-center text-xs border border-slate-100 dark:border-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Giờ chạy</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {record.workInfo?.onlineHours || 0}h
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Số cuốc</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {record.workInfo?.tripsCount || 0} cuốc
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Quãng đường</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {record.workInfo?.distanceKm || 0} km
                      </span>
                    </div>
                  </div>

                  {/* 2 chỉ số nổi bật: Lãi ròng đút túi & Chi phí */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <span className="text-grab block text-[10px] font-bold uppercase">
                        [3] Lãi Thực Nhận
                      </span>
                      <span className="font-black text-grab text-base">
                        {formatCurrency(calc.netIncome)}
                      </span>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800">
                      <span className="text-rose-600 block text-[10px] font-bold uppercase">
                        [2] Tổng Chi Phí
                      </span>
                      <span className="font-bold text-rose-600 text-base">
                        {formatCurrency(calc.totalExpenses)}
                      </span>
                    </div>
                  </div>

                  {/* Tiết kiệm & Tiền mặt */}
                  <div className="flex items-center justify-between text-xs px-1 text-slate-600 dark:text-slate-300">
                    <div>
                      Trích Tiết Kiệm: <span className="font-bold text-amber-600">{formatCurrency(calc.savings)}</span>
                    </div>
                    <div>
                      Tiền Mặt Còn: <span className="font-bold text-indigo-600">{formatCurrency(calc.cashRemaining)}</span>
                    </div>
                  </div>

                  {/* Nút xem chi tiết mở rộng */}
                  <button
                    onClick={() => toggleExpand(record.id)}
                    className="w-full py-1 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 hover:text-slate-700"
                  >
                    <span>{isExpanded ? 'Thu gọn chi tiết' : 'Xem chi tiết các khoản'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Chi tiết mở rộng trên mobile */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-600 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cước App:</span>
                        <span className="font-semibold">{formatCurrency(record.revenue?.appFare || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Thưởng & Tip:</span>
                        <span className="font-semibold">
                          {formatCurrency((record.revenue?.bonus || 0) + (record.revenue?.tips || 0))}
                        </span>
                      </div>
                      {calc.taxAmount > 0 && (
                        <div className="flex justify-between text-blue-600 dark:text-blue-400">
                          <span className="text-slate-400">Thuế TNCN/VAT:</span>
                          <span className="font-bold">-{formatCurrency(calc.taxAmount)}</span>
                        </div>
                      )}
                      {calc.platformFee > 0 && (
                        <div className="flex justify-between text-blue-600 dark:text-blue-400">
                          <span className="text-slate-400">Chiết khấu sàn:</span>
                          <span className="font-bold">-{formatCurrency(calc.platformFee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tiền xăng:</span>
                        <span className="font-semibold text-rose-500">{formatCurrency(record.expenses?.petrol || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ăn uống:</span>
                        <span className="font-semibold text-rose-500">{formatCurrency(record.expenses?.meals || 0)}</span>
                      </div>
                      {record.expenses?.maintenance > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Bảo dưỡng:</span>
                          <span className="font-semibold text-rose-500">
                            {formatCurrency(record.expenses.maintenance)} ({record.expenses.maintenanceNote || 'Sửa xe'})
                          </span>
                        </div>
                      )}
                      {(record.expenses?.otherExpenses || []).map((oth) => (
                        <div key={oth.id} className="flex justify-between">
                          <span className="text-slate-400">{oth.name}:</span>
                          <span className="font-semibold text-rose-500">{formatCurrency(oth.amount)}</span>
                        </div>
                      ))}
                      {record.notes && (
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 italic text-[11px]">
                          "{record.notes}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">
                Xác Nhận Xóa Ca Chạy
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Bạn có chắc chắn muốn xóa nhật ký ca chạy này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-500/20"
              >
                Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
