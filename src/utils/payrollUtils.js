/**
 * Payroll calculation utilities
 */

export const calculatePayrollStats = (attendanceRecords, hourlyRate, baseSalary, startDateStr, endDateStr) => {
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
  
  // Calculate total calendar days in range
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Calculate expected working days (excluding Sundays) in range
  let expectedWorkingDays = 0;
  let tempDate = new Date(start);
  for (let i = 0; i < diffDays; i++) {
    if (tempDate.getDay() !== 0) { // 0 is Sunday
      expectedWorkingDays++;
    }
    tempDate.setDate(tempDate.getDate() + 1);
  }

  // Baseline to prevent divide by zero
  if (expectedWorkingDays === 0) expectedWorkingDays = 1;

  // Base salary for this date range (capped at full monthly salary)
  const proportionalBase = Math.min(baseSalary, Math.round((baseSalary / 30) * diffDays));

  // Attendance ratio based on expected working days (capped at 1)
  const attendanceRatio = Math.min(1, stats.totalWorkingDays / expectedWorkingDays);

  // Final salary calculation
  const earnedBase = Math.round(proportionalBase * attendanceRatio);
  stats.finalSalary = Math.max(0, earnedBase - stats.totalDeductions);

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
