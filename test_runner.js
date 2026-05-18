// Test script for ClinicPulse calculations
import { calculateLateMinutes, calculateEarlyLeaveMinutes, calculateDeduction } from './src/utils/calculateLate.js';
import { calculatePayrollStats } from './src/utils/payrollUtils.js';

console.log("==========================================");
console.log("RUNNING COMPREHENSIVE CALCULATION TESTS...");
console.log("==========================================\n");

let failures = 0;
let passes = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passes++;
  } else {
    console.log(`❌ FAIL: ${message}`);
    failures++;
  }
}

// ----------------------------------------
// Test Set 1: calculateLateMinutes
// Assistant Morning Shift: Start 09:00, Grace 30 mins
// ----------------------------------------
console.log("--- 1. Testing Late Check-In Calculations (Assistant Morning: 09:00, Grace 30m) ---");

// Check-in early at 08:45
const t1 = new Date("2026-05-18T08:45:00");
assert(calculateLateMinutes(t1, 'assistant', 'morning') === 0, "Check-in before shift start should be 0 mins late");

// Check-in exactly at 09:00
const t2 = new Date("2026-05-18T09:00:00");
assert(calculateLateMinutes(t2, 'assistant', 'morning') === 0, "Check-in exactly at shift start should be 0 mins late");

// Check-in within grace period (09:20)
const t3 = new Date("2026-05-18T09:20:00");
assert(calculateLateMinutes(t3, 'assistant', 'morning') === 0, "Check-in within grace period (09:20) should be 0 mins late");

// Check-in exactly at grace limit (09:30)
const t4 = new Date("2026-05-18T09:30:00");
assert(calculateLateMinutes(t4, 'assistant', 'morning') === 0, "Check-in at grace limit (09:30) should be 0 mins late");

// Check-in 1 minute past grace limit (09:31)
const t5 = new Date("2026-05-18T09:31:00");
assert(calculateLateMinutes(t5, 'assistant', 'morning') === 31, `Check-in 1 min past grace (09:31) should be 31 mins late (got ${calculateLateMinutes(t5, 'assistant', 'morning')})`);

// Check-in extremely late (10:15)
const t6 = new Date("2026-05-18T10:15:00");
assert(calculateLateMinutes(t6, 'assistant', 'morning') === 75, `Check-in extremely late (10:15) should be 75 mins late (got ${calculateLateMinutes(t6, 'assistant', 'morning')})`);


// ----------------------------------------
// Test Set 2: calculateEarlyLeaveMinutes
// Assistant Morning Shift: End 15:00
// ----------------------------------------
console.log("\n--- 2. Testing Early Leave Calculations (Assistant Morning: End 15:00) ---");

// Check-out late at 15:15
const c1 = new Date("2026-05-18T15:15:00");
assert(calculateEarlyLeaveMinutes(c1, 'assistant', 'morning') === 0, "Check-out after shift end should be 0 mins early leave");

// Check-out exactly at 15:00
const c2 = new Date("2026-05-18T15:00:00");
assert(calculateEarlyLeaveMinutes(c2, 'assistant', 'morning') === 0, "Check-out exactly at shift end should be 0 mins early leave");

// Check-out early at 14:30
const c3 = new Date("2026-05-18T14:30:00");
assert(calculateEarlyLeaveMinutes(c3, 'assistant', 'morning') === 30, `Check-out early (14:30) should be 30 mins early leave (got ${calculateEarlyLeaveMinutes(c3, 'assistant', 'morning')})`);

// Check-out extremely early (11:00)
const c4 = new Date("2026-05-18T11:00:00");
assert(calculateEarlyLeaveMinutes(c4, 'assistant', 'morning') === 240, `Check-out extremely early (11:00) should be 240 mins early leave (got ${calculateEarlyLeaveMinutes(c4, 'assistant', 'morning')})`);


// ----------------------------------------
// Test Set 3: calculateDeduction
// Rate: 150/hr (2.5 per min)
// ----------------------------------------
console.log("\n--- 3. Testing Penalty Deduction Calculations ---");
assert(calculateDeduction(0, 150) === 0, "0 mins penalty should result in 0 deduction");
assert(calculateDeduction(30, 150) === 75, `30 mins penalty at 150/hr should be 75 deduction (got ${calculateDeduction(30, 150)})`);
assert(calculateDeduction(45, 120) === 90, `45 mins penalty at 120/hr should be 90 deduction (got ${calculateDeduction(45, 120)})`);
assert(calculateDeduction(7, 100) === 11.67, `7 mins penalty at 100/hr should be 11.67 deduction (got ${calculateDeduction(7, 100)})`);


// ----------------------------------------
// Test Set 4: calculatePayrollStats
// baseSalary: 30000, range: May 1 to May 18 (18 days, 15 working days expected)
// ----------------------------------------
console.log("\n--- 4. Testing Payroll Calculations & Edge Cases (Base: 30000, 18-day range) ---");

// Case 4.1: Worked 0 days (No attendance records)
const p1 = calculatePayrollStats([], 150, 30000, "2026-05-01", "2026-05-18");
assert(p1.finalSalary === 0, `0 days worked should yield ₹0 salary (got ₹${p1.finalSalary})`);
assert(p1.totalWorkingDays === 0, "0 days worked should show 0 working days");

// Case 4.2: Worked all 15 expected days perfectly (no late checkins)
const perfectAttendance = Array(15).fill(0).map((_, i) => ({
  date: `2026-05-${String(i+1).padStart(2, '0')}`,
  attendance_status: 'present',
  late_minutes: 0,
  deduction_amount: 0
}));
const p2 = calculatePayrollStats(perfectAttendance, 150, 30000, "2026-05-01", "2026-05-18");
// Proportional period base = (30000/30) * 18 = 18000.
// Attendance ratio = 15/15 = 1. Earned = 18000.
assert(p2.finalSalary === 18000, `Perfect attendance for 18 days should yield ₹18,000 (got ₹${p2.finalSalary})`);

// Case 4.3: Worked 5 days out of 15 expected, with 60 mins total lateness (rate 120/hr = 2/min, total deduction = 120)
const partialAttendance = Array(5).fill(0).map((_, i) => ({
  date: `2026-05-${String(i+1).padStart(2, '0')}`,
  attendance_status: 'present',
  late_minutes: 12,
  deduction_amount: 24
}));
const p3 = calculatePayrollStats(partialAttendance, 120, 30000, "2026-05-01", "2026-05-18");
// Proportional base = (30000/30) * 18 = 18000.
// Ratio = 5/15 = 0.3333333333333333.
// Earned base = 18000 * (5/15) = 6000.
// Deductions = 5 * 24 = 120.
// Final = 6000 - 120 = 5880.
assert(p3.finalSalary === 5880, `Partial attendance (5/15) with deductions should yield ₹5,880 (got ₹${p3.finalSalary})`);

// Case 4.4: Deductions exceed earnings (Worked 1 day, late 500 mins, rate 120/hr, earned = 1200, deductions = 1000)
// Base salary: 30000, expected: 15, calendar: 18.
// Proportional Base = 18000.
// Worked 1 day -> earned = 18000 * (1/15) = 1200.
// Late deduction = 1000.
// Net salary = 1200 - 1000 = 200.
const extremeLog1 = [{ date: "2026-05-01", attendance_status: "present", late_minutes: 500, deduction_amount: 1000 }];
const p4 = calculatePayrollStats(extremeLog1, 120, 30000, "2026-05-01", "2026-05-18");
assert(p4.finalSalary === 200, `High deductions should be subtracted correctly (got ₹${p4.finalSalary})`);

// Case 4.5: Deductions exceed earnings resulting in negative (Worked 1 day, late 700 mins, rate 120/hr, earned = 1200, deductions = 1400)
// Net should be capped at ₹0 (no negative salary payout)
const extremeLog2 = [{ date: "2026-05-01", attendance_status: "present", late_minutes: 700, deduction_amount: 1400 }];
const p5 = calculatePayrollStats(extremeLog2, 120, 30000, "2026-05-01", "2026-05-18");
assert(p5.finalSalary === 0, `Salary should never be negative, capped at 0 (got ₹${p5.finalSalary})`);


console.log("\n==========================================");
console.log("TESTING SUMMARY:");
console.log(`Passed: ${passes} / ${passes + failures}`);
console.log(`Failed: ${failures}`);
console.log("==========================================");

if (failures > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
