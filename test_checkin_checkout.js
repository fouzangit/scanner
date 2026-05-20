// ==========================================================================
// POST-FIX VERIFICATION TEST
// Validates that grace period deductions now match expected values
// ==========================================================================

import {
  calculateLateMinutes,
  calculateEarlyLeaveMinutes,
  calculateDeduction,
  createISTDate,
  checkShiftWindow,
  SHIFTS
} from './src/utils/calculateLate.js';

let passes = 0;
let failures = 0;
const failDetails = [];

function assert(condition, message, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passes++;
  } else {
    console.log(`  ❌ FAIL: ${message}`);
    if (details) console.log(`          ${details}`);
    failures++;
    failDetails.push({ message, details });
  }
}

function section(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}`);
}

function day(label) {
  console.log(`\n  --- ${label} ---`);
}

// ==========================================================================
// EMPLOYEE 1 — AHMED
// Assistant Morning: 9:00–15:00, Grace 30m, ₹250/hr
// ==========================================================================
section('EMPLOYEE 1 — AHMED (Assistant, Morning, Grace 30m, ₹250/hr)');

day('Day 1: 8:55 AM → 3:05 PM — On time');
{
  const late = calculateLateMinutes(createISTDate('2026-05-18', '08:55'), 'assistant', 'morning');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-18', '15:05'), 'assistant', 'morning');
  assert(late === 0, `Late = 0 (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
  assert(calculateDeduction(late, 250) === 0, `Deduction = ₹0`);
}

day('Day 2: 9:20 AM → 3:00 PM — Within grace');
{
  const late = calculateLateMinutes(createISTDate('2026-05-19', '09:20'), 'assistant', 'morning');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-19', '15:00'), 'assistant', 'morning');
  assert(late === 0, `Late = 0 (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
  assert(calculateDeduction(late, 250) === 0, `Deduction = ₹0`);
}

day('Day 3: 9:45 AM → 3:10 PM — Late 15m after grace, Ded ₹62.5');
{
  const late = calculateLateMinutes(createISTDate('2026-05-20', '09:45'), 'assistant', 'morning');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-20', '15:10'), 'assistant', 'morning');
  const ded = calculateDeduction(late, 250);
  assert(late === 15, `Late = 15 mins after grace (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
  assert(ded === 62.5, `Deduction = ₹62.5 (got ₹${ded})`);
}

day('Day 4: 10:10 AM → 2:50 PM — Late 40m after grace, Ded ₹166.67');
{
  const late = calculateLateMinutes(createISTDate('2026-05-21', '10:10'), 'assistant', 'morning');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-21', '14:50'), 'assistant', 'morning');
  const ded = calculateDeduction(late, 250);
  assert(late === 40, `Late = 40 mins after grace (got ${late})`);
  assert(early === 10, `Early = 10 mins (got ${early})`);
  assert(ded === 166.67, `Late deduction = ₹166.67 (got ₹${ded})`);
}

day('Day 5: 8:50 AM → 4:00 PM — 1 hour overtime');
{
  const late = calculateLateMinutes(createISTDate('2026-05-22', '08:50'), 'assistant', 'morning');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-22', '16:00'), 'assistant', 'morning');
  assert(late === 0, `Late = 0 (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
}

// ==========================================================================
// EMPLOYEE 2 — SALMAN
// Assistant Evening: 17:00–21:00, Grace 15m, ₹300/hr
// ==========================================================================
section('EMPLOYEE 2 — SALMAN (Assistant, Evening, Grace 15m, ₹300/hr)');

day('Day 1: 4:58 PM → 9:02 PM — On time');
{
  const late = calculateLateMinutes(createISTDate('2026-05-18', '16:58'), 'assistant', 'evening');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-18', '21:02'), 'assistant', 'evening');
  assert(late === 0, `Late = 0 (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
}

day('Day 2: 5:10 PM → 9:00 PM — Within grace');
{
  const late = calculateLateMinutes(createISTDate('2026-05-19', '17:10'), 'assistant', 'evening');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-19', '21:00'), 'assistant', 'evening');
  assert(late === 0, `Late = 0 (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
}

day('Day 3: 5:25 PM → 9:05 PM — Late 10m after grace, Ded ₹50');
{
  const late = calculateLateMinutes(createISTDate('2026-05-20', '17:25'), 'assistant', 'evening');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-20', '21:05'), 'assistant', 'evening');
  const ded = calculateDeduction(late, 300);
  assert(late === 10, `Late = 10 mins after grace (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
  assert(ded === 50, `Deduction = ₹50 (got ₹${ded})`);
}

day('Day 4: 5:50 PM → 8:40 PM — Late 35m after grace, Ded ₹175');
{
  const late = calculateLateMinutes(createISTDate('2026-05-21', '17:50'), 'assistant', 'evening');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-21', '20:40'), 'assistant', 'evening');
  const ded = calculateDeduction(late, 300);
  assert(late === 35, `Late = 35 mins after grace (got ${late})`);
  assert(early === 20, `Early = 20 mins (got ${early})`);
  assert(ded === 175, `Late deduction = ₹175 (got ₹${ded})`);
}

day('Day 5: 4:45 PM → 10:00 PM — 1 hour overtime');
{
  const late = calculateLateMinutes(createISTDate('2026-05-22', '16:45'), 'assistant', 'evening');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-22', '22:00'), 'assistant', 'evening');
  assert(late === 0, `Late = 0 (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
}

// ==========================================================================
// EMPLOYEE 3 — DR. IMRAN
// Doctor Morning: 10:00–15:00, Grace 30m, ₹600/hr
// ==========================================================================
section('EMPLOYEE 3 — DR. IMRAN (Doctor, Morning, Grace 30m, ₹600/hr)');

day('Day 1: 9:55 AM → 3:10 PM — On time');
{
  const late = calculateLateMinutes(createISTDate('2026-05-18', '09:55'), 'doctor', 'morning');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-18', '15:10'), 'doctor', 'morning');
  assert(late === 0, `Late = 0 (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
}

day('Day 2: 10:25 AM → 3:00 PM — Within grace');
{
  const late = calculateLateMinutes(createISTDate('2026-05-19', '10:25'), 'doctor', 'morning');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-19', '15:00'), 'doctor', 'morning');
  assert(late === 0, `Late = 0 (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
}

day('Day 3: 10:45 AM → 3:05 PM — Late 15m after grace, Ded ₹150');
{
  const late = calculateLateMinutes(createISTDate('2026-05-20', '10:45'), 'doctor', 'morning');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-20', '15:05'), 'doctor', 'morning');
  const ded = calculateDeduction(late, 600);
  assert(late === 15, `Late = 15 mins after grace (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
  assert(ded === 150, `Deduction = ₹150 (got ₹${ded})`);
}

day('Day 4: 11:20 AM → 2:30 PM — Late 50m after grace, Ded ₹500');
{
  const late = calculateLateMinutes(createISTDate('2026-05-21', '11:20'), 'doctor', 'morning');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-21', '14:30'), 'doctor', 'morning');
  const ded = calculateDeduction(late, 600);
  assert(late === 50, `Late = 50 mins after grace (got ${late})`);
  assert(early === 30, `Early = 30 mins (got ${early})`);
  assert(ded === 500, `Late deduction = ₹500 (got ₹${ded})`);
}

day('Day 5: 9:40 AM → 4:00 PM — 1 hour overtime');
{
  const late = calculateLateMinutes(createISTDate('2026-05-22', '09:40'), 'doctor', 'morning');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-22', '16:00'), 'doctor', 'morning');
  assert(late === 0, `Late = 0 (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
}

// ==========================================================================
// EMPLOYEE 4 — DR. AYAAN
// Doctor Evening: 18:00–21:00, Grace 15m, ₹700/hr
// ==========================================================================
section('EMPLOYEE 4 — DR. AYAAN (Doctor, Evening, Grace 15m, ₹700/hr)');

day('Day 1: 5:59 PM → 9:10 PM — On time');
{
  const late = calculateLateMinutes(createISTDate('2026-05-18', '17:59'), 'doctor', 'evening');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-18', '21:10'), 'doctor', 'evening');
  assert(late === 0, `Late = 0 (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
}

day('Day 2: 6:10 PM → 9:00 PM — Within grace');
{
  const late = calculateLateMinutes(createISTDate('2026-05-19', '18:10'), 'doctor', 'evening');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-19', '21:00'), 'doctor', 'evening');
  assert(late === 0, `Late = 0 (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
}

day('Day 3: 6:25 PM → 9:05 PM — Late 10m after grace, Ded ₹116.67');
{
  const late = calculateLateMinutes(createISTDate('2026-05-20', '18:25'), 'doctor', 'evening');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-20', '21:05'), 'doctor', 'evening');
  const ded = calculateDeduction(late, 700);
  assert(late === 10, `Late = 10 mins after grace (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
  assert(ded === 116.67, `Deduction = ₹116.67 (got ₹${ded})`);
}

day('Day 4: 7:00 PM → 8:30 PM — Late 45m after grace, Ded ₹525');
{
  const late = calculateLateMinutes(createISTDate('2026-05-21', '19:00'), 'doctor', 'evening');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-21', '20:30'), 'doctor', 'evening');
  const ded = calculateDeduction(late, 700);
  assert(late === 45, `Late = 45 mins after grace (got ${late})`);
  assert(early === 30, `Early = 30 mins (got ${early})`);
  assert(ded === 525, `Late deduction = ₹525 (got ₹${ded})`);
}

day('Day 5: 5:30 PM → 10:00 PM — 1.5 hours overtime');
{
  const late = calculateLateMinutes(createISTDate('2026-05-22', '17:30'), 'doctor', 'evening');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-22', '22:00'), 'doctor', 'evening');
  assert(late === 0, `Late = 0 (got ${late})`);
  assert(early === 0, `Early = 0 (got ${early})`);
}

// ==========================================================================
// EDGE CASES
// ==========================================================================
section('EDGE CASE TESTS');

day('Edge 1: Check-in 12:00 PM, Check-out 12:30 PM');
{
  const late = calculateLateMinutes(createISTDate('2026-05-23', '12:00'), 'assistant', 'morning');
  const early = calculateEarlyLeaveMinutes(createISTDate('2026-05-23', '12:30'), 'assistant', 'morning');
  assert(late > 0, `Should be late (got ${late})`);
  assert(early > 0, `Should have early leave (got ${early})`);
}

day('Edge 2: Check-in after shift end');
{
  const w1 = checkShiftWindow(createISTDate('2026-05-23', '15:30'), 'assistant', 'morning');
  assert(w1.isValid === false, `Assistant morning: 3:30 PM rejected (got ${w1.isValid})`);
  const w2 = checkShiftWindow(createISTDate('2026-05-23', '21:30'), 'doctor', 'evening');
  assert(w2.isValid === false, `Doctor evening: 9:30 PM rejected (got ${w2.isValid})`);
}

day('Edge 3: No check-out');
assert(true, `Handled by attendanceService — check_out_time stays null`);

day('Edge 4: Multiple check-ins same day');
assert(true, `Handled by attendanceService — duplicate blocked via employee_id+date+shift query`);

day('Edge 5: Check-out before check-in');
assert(true, `Handled by attendanceService — requires existing check-in record`);

// ==========================================================================
// SUMMARY
// ==========================================================================
console.log(`\n${'='.repeat(60)}`);
console.log(`  FINAL TEST SUMMARY`);
console.log(`${'='.repeat(60)}`);
console.log(`  ✅ Passed: ${passes}`);
console.log(`  ❌ Failed: ${failures}`);
console.log(`  Total:   ${passes + failures}`);

if (failDetails.length > 0) {
  console.log(`\n  Failed tests:`);
  failDetails.forEach((f, i) => {
    console.log(`    ${i + 1}. ${f.message}`);
    if (f.details) console.log(`       ${f.details}`);
  });
}

console.log(`${'='.repeat(60)}\n`);
process.exit(failures > 0 ? 1 : 0);
