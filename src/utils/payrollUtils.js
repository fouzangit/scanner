/**
 * Payroll calculation utilities
 */

export const calculatePayrollStats = (attendanceRecords, hourlyRate, baseSalary) => {
  const stats = {
    totalWorkingDays: 0,
    totalLateMinutes: 0,
    totalDeductions: 0,
    totalPresent: 0,
    totalAbsent: 0
  };

  // Group by date to count unique days
  const presentDates = new Set();
  
  attendanceRecords.forEach(record => {
    if (record.attendance_status === 'present') {
      presentDates.add(record.date);
      stats.totalPresent++;
      stats.totalLateMinutes += (record.late_minutes || 0);
      stats.totalDeductions += (record.deduction_amount || 0);
    }
  });

  stats.totalWorkingDays = presentDates.size;
  
  // Final salary calculation
  // Usually salary = base - deductions + bonuses
  stats.finalSalary = Math.max(0, baseSalary - stats.totalDeductions);

  return stats;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const getMonthYearString = (date = new Date()) => {
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};
