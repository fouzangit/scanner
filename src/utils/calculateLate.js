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

// Get the date and time parts in Indian Standard Time (IST, UTC+5:30)
export const getISTDateParts = (timeInput) => {
  const date = new Date(timeInput);
  const utcMs = date.getTime();
  const istMs = utcMs + (5.5 * 60 * 60 * 1000);
  const istDate = new Date(istMs);
  
  return {
    year: istDate.getUTCFullYear(),
    month: istDate.getUTCMonth(),
    date: istDate.getUTCDate(),
    hours: istDate.getUTCHours(),
    minutes: istDate.getUTCMinutes()
  };
};

// Create a timezone-safe UTC date representing the local date/time of the clinic (IST)
export const createISTDate = (dateStr, timeStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
  // Subtract 5.5 hours to convert back to the actual UTC time representing this IST time
  return new Date(utcDate.getTime() - (5.5 * 60 * 60 * 1000));
};

export const calculateLateMinutes = (checkInTime, role, shiftType) => {
  const shift = SHIFTS[role]?.[shiftType];
  if (!shift) return 0;

  const [expectedH, expectedM] = shift.start.split(':').map(Number);
  const checkIn = new Date(checkInTime);
  
  // Get date parts of check-in in IST
  const checkInIST = getISTDateParts(checkIn);
  
  // Construct expected shift start in IST, then offset to UTC
  const expectedISTInUTC = Date.UTC(checkInIST.year, checkInIST.month, checkInIST.date, expectedH, expectedM, 0, 0);
  const expectedEpochMs = expectedISTInUTC - (5.5 * 60 * 60 * 1000);

  const diffMs = checkIn.getTime() - expectedEpochMs;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  // If checked in before or during grace period, not late
  if (diffMinutes <= shift.grace) return 0;
  
  return diffMinutes - shift.grace;
};

export const calculateEarlyLeaveMinutes = (checkOutTime, role, shiftType) => {
  const shift = SHIFTS[role]?.[shiftType];
  if (!shift) return 0;

  const [expectedH, expectedM] = shift.end.split(':').map(Number);
  const checkOut = new Date(checkOutTime);
  
  // Get date parts of check-out in IST
  const checkOutIST = getISTDateParts(checkOut);
  
  // Construct expected shift end in IST, then offset to UTC
  const expectedISTInUTC = Date.UTC(checkOutIST.year, checkOutIST.month, checkOutIST.date, expectedH, expectedM, 0, 0);
  const expectedEpochMs = expectedISTInUTC - (5.5 * 60 * 60 * 1000);

  const diffMs = expectedEpochMs - checkOut.getTime();
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

// Check if the current time is within the allowed shift check-in window (starts 2 hours before shift start, ends at shift end)
export const checkShiftWindow = (timeInput, role, shiftType) => {
  const shift = SHIFTS[role]?.[shiftType];
  if (!shift) return { isValid: false, message: 'Invalid shift configuration.' };

  const [startH, startM] = shift.start.split(':').map(Number);
  const [endH, endM] = shift.end.split(':').map(Number);

  const ist = getISTDateParts(timeInput);
  const currentMinutes = ist.hours * 60 + ist.minutes;

  // Check-in allowed starting 2 hours (120 minutes) before the shift starts
  const startMinutes = (startH * 60 + startM) - 120;
  const endMinutes = endH * 60 + endM;

  if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
    const formatTime12h = (h, m) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 || 12;
      return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    };
    const windowStartStr = formatTime12h(Math.floor(startMinutes / 60), startMinutes % 60);
    const windowEndStr = formatTime12h(endH, endM);
    return {
      isValid: false,
      message: `No active check-in window. For your ${shiftType} shift, you can check in between ${windowStartStr} and ${windowEndStr}.`
    };
  }

  return { isValid: true };
};
