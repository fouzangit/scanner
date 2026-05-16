/**
 * Logic for shift timings and late deduction calculations
 */

export const SHIFTS = {
  assistant: {
    morning: { start: '09:00', end: '15:00', grace: 30 },
    evening: { start: '17:00', end: '21:00', grace: 15 }
  },
  doctor: {
    morning: { start: '10:00', end: '15:00', grace: 30 },
    evening: { start: '18:00', end: '21:00', grace: 15 }
  }
};

export const calculateLateMinutes = (checkInTime, role, shiftType) => {
  const shift = SHIFTS[role]?.[shiftType];
  if (!shift) return 0;

  const [expectedH, expectedM] = shift.start.split(':').map(Number);
  const checkIn = new Date(checkInTime);
  
  const expectedTime = new Date(checkIn);
  expectedTime.setHours(expectedH, expectedM, 0, 0);

  const diffMs = checkIn.getTime() - expectedTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  // If checked in before or during grace period, not late
  if (diffMinutes <= shift.grace) return 0;
  
  return diffMinutes;
};

export const calculateEarlyLeaveMinutes = (checkOutTime, role, shiftType) => {
  const shift = SHIFTS[role]?.[shiftType];
  if (!shift) return 0;

  const [expectedH, expectedM] = shift.end.split(':').map(Number);
  const checkOut = new Date(checkOutTime);
  
  const expectedTime = new Date(checkOut);
  expectedTime.setHours(expectedH, expectedM, 0, 0);

  const diffMs = expectedTime.getTime() - checkOut.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  // If checked out after or exactly at end time, no early leave penalty
  if (diffMinutes <= 0) return 0;
  
  return diffMinutes;
};

export const calculateDeduction = (penaltyMinutes, hourlyRate) => {
  if (penaltyMinutes <= 0) return 0;
  const ratePerMinute = hourlyRate / 60;
  return Math.round(ratePerMinute * penaltyMinutes * 100) / 100;
};
