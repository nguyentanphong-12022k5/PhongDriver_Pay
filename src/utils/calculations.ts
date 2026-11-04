import { ShiftRecord, ShiftCalculated } from '../types';

/**
 * Tính toán các chỉ số cho một bản ghi ca chạy (Bao gồm Thuế TNCN/VAT & Chiết khấu sàn)
 */
export function calculateShift(record: ShiftRecord): ShiftCalculated {
  const { revenue, expenses, workInfo, savings } = record;

  // [1] Tổng thu nhập gộp (Chưa trừ chi phí): Cước app + Thưởng + Tip
  const appFare = Number(revenue?.appFare) || 0;
  const bonus = Number(revenue?.bonus) || 0;
  const tips = Number(revenue?.tips) || 0;
  const grossRevenue = appFare + bonus + tips;

  // Khấu trừ Thuế & Phí sàn
  const taxAmount = Number(revenue?.taxAmount) || 0;
  const platformFee = Number(revenue?.platformFee) || 0;
  const totalTaxAndFees = taxAmount + platformFee;
  const revenueAfterTax = Math.max(0, grossRevenue - totalTaxAndFees);

  // [2] Tổng chi phí vận hành: Tiền xăng + Ăn uống + Bảo dưỡng + Các khoản chi đột xuất
  const petrol = Number(expenses?.petrol) || 0;
  const maintenance = Number(expenses?.maintenance) || 0;
  const meals = Number(expenses?.meals) || 0;
  
  const totalOtherExpenses = Array.isArray(expenses?.otherExpenses)
    ? expenses.otherExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    : 0;

  const totalExpenses = petrol + maintenance + meals + totalOtherExpenses;

  // [3] Thu nhập ròng (Lãi thực nhận đút túi) = Doanh thu sau thuế/phí - Tổng chi phí
  const netIncome = revenueAfterTax - totalExpenses;

  // [4] Tiền tiết kiệm tích lũy / trích quỹ
  const savingAmount = Number(savings) || 0;

  // [5] Tiền mặt còn lại sau khi trừ tiết kiệm: [3] - [4]
  const cashRemaining = netIncome - savingAmount;

  // Các chỉ số hiệu suất
  const hours = Number(workInfo?.onlineHours) || 0;
  const trips = Number(workInfo?.tripsCount) || 0;
  const km = Number(workInfo?.distanceKm) || 0;

  const hourlyWage = hours > 0 ? Math.round(grossRevenue / hours) : 0;
  const netHourlyWage = hours > 0 ? Math.round(netIncome / hours) : 0;
  const revenuePerKm = km > 0 ? Math.round(grossRevenue / km) : 0;
  const expensePerKm = km > 0 ? Math.round(totalExpenses / km) : 0;
  const revenuePerTrip = trips > 0 ? Math.round(grossRevenue / trips) : 0;
  const profitMargin = grossRevenue > 0 ? Math.round((netIncome / grossRevenue) * 1000) / 10 : 0;

  return {
    grossRevenue,
    taxAmount,
    platformFee,
    totalTaxAndFees,
    revenueAfterTax,
    totalOtherExpenses,
    totalExpenses,
    netIncome,
    savings: savingAmount,
    cashRemaining,
    hourlyWage,
    netHourlyWage,
    revenuePerKm,
    expensePerKm,
    revenuePerTrip,
    profitMargin,
  };
}

export interface SummaryAggregated {
  totalGrossRevenue: number;
  totalTaxAmount: number;
  totalPlatformFee: number;
  totalRevenueAfterTax: number;
  totalExpenses: number;
  totalNetIncome: number;
  totalSavings: number;
  totalCashRemaining: number;
  totalOnlineHours: number;
  totalTripsCount: number;
  totalDistanceKm: number;
  avgHourlyWage: number;
  avgNetHourlyWage: number;
  avgRevenuePerKm: number;
  avgExpensePerKm: number;
  avgRevenuePerTrip: number;
  avgProfitMargin: number;
  expenseBreakdown: {
    petrol: number;
    meals: number;
    maintenance: number;
    others: number;
  };
  shiftCount: number;
}

/**
 * Tổng hợp các chỉ số theo tập bản ghi (Hôm nay, Tuần, Tháng, Năm...)
 */
export function aggregateRecords(records: ShiftRecord[]): SummaryAggregated {
  let totalGrossRevenue = 0;
  let totalTaxAmount = 0;
  let totalPlatformFee = 0;
  let totalRevenueAfterTax = 0;
  let totalExpenses = 0;
  let totalNetIncome = 0;
  let totalSavings = 0;
  let totalCashRemaining = 0;
  let totalOnlineHours = 0;
  let totalTripsCount = 0;
  let totalDistanceKm = 0;

  let petrolSum = 0;
  let mealsSum = 0;
  let maintenanceSum = 0;
  let othersSum = 0;

  records.forEach((record) => {
    const calc = calculateShift(record);
    totalGrossRevenue += calc.grossRevenue;
    totalTaxAmount += calc.taxAmount;
    totalPlatformFee += calc.platformFee;
    totalRevenueAfterTax += calc.revenueAfterTax;
    totalExpenses += calc.totalExpenses;
    totalNetIncome += calc.netIncome;
    totalSavings += calc.savings;
    totalCashRemaining += calc.cashRemaining;

    totalOnlineHours += Number(record.workInfo?.onlineHours) || 0;
    totalTripsCount += Number(record.workInfo?.tripsCount) || 0;
    totalDistanceKm += Number(record.workInfo?.distanceKm) || 0;

    petrolSum += Number(record.expenses?.petrol) || 0;
    mealsSum += Number(record.expenses?.meals) || 0;
    maintenanceSum += Number(record.expenses?.maintenance) || 0;
    othersSum += calc.totalOtherExpenses;
  });

  const shiftCount = records.length;
  const avgHourlyWage = totalOnlineHours > 0 ? Math.round(totalGrossRevenue / totalOnlineHours) : 0;
  const avgNetHourlyWage = totalOnlineHours > 0 ? Math.round(totalNetIncome / totalOnlineHours) : 0;
  const avgRevenuePerKm = totalDistanceKm > 0 ? Math.round(totalGrossRevenue / totalDistanceKm) : 0;
  const avgExpensePerKm = totalDistanceKm > 0 ? Math.round(totalExpenses / totalDistanceKm) : 0;
  const avgRevenuePerTrip = totalTripsCount > 0 ? Math.round(totalGrossRevenue / totalTripsCount) : 0;
  const avgProfitMargin = totalGrossRevenue > 0 ? Math.round((totalNetIncome / totalGrossRevenue) * 1000) / 10 : 0;

  return {
    totalGrossRevenue,
    totalTaxAmount,
    totalPlatformFee,
    totalRevenueAfterTax,
    totalExpenses,
    totalNetIncome,
    totalSavings,
    totalCashRemaining,
    totalOnlineHours: Math.round(totalOnlineHours * 10) / 10,
    totalTripsCount,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    avgHourlyWage,
    avgNetHourlyWage,
    avgRevenuePerKm,
    avgExpensePerKm,
    avgRevenuePerTrip,
    avgProfitMargin,
    expenseBreakdown: {
      petrol: petrolSum,
      meals: mealsSum,
      maintenance: maintenanceSum,
      others: othersSum,
    },
    shiftCount,
  };
}

/**
 * Định dạng tiền tệ VNĐ (ví dụ: 650.000 ₫)
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ₫';
}

/**
 * Định dạng số gọn gàng (ví dụ: 12.5)
 */
export function formatNumber(num: number, maxDecimals = 1): string {
  if (isNaN(num) || num === null || num === undefined) return '0';
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: maxDecimals,
  }).format(num);
}
