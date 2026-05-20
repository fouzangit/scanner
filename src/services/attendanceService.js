import { supabase } from './supabase';
import { calculateLateMinutes, calculateEarlyLeaveMinutes, calculateDeduction } from '../utils/calculateLate';
import { validateLocation } from '../utils/location';

export const attendanceService = {
  // Mark attendance with GPS and Late/Early logic
  markAttendance: async (employee, type = 'auto') => {
    try {
      // 1. Get Office Settings (Location + Radius)
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (settingsError) throw new Error('Could not fetch office settings. Contact admin.');

      // 2. Validate GPS only if office location has been configured (not 0,0)
      const gpsConfigured = settings && 
        settings.office_latitude !== 0 && 
        settings.office_longitude !== 0;

      let locationCoords = { latitude: 0, longitude: 0 };

      if (gpsConfigured) {
        const locValidation = await validateLocation(
          settings.office_latitude, 
          settings.office_longitude, 
          settings.allowed_radius
        );
        if (!locValidation.isValid) {
          throw new Error(`You are ${Math.round(locValidation.distance)}m away from the office.\nYour Device GPS: ${locValidation.coords.latitude.toFixed(5)}, ${locValidation.coords.longitude.toFixed(5)}.\nSave these coordinates in Admin Settings to pass!`);
        }
        locationCoords = locValidation.coords;
      }
      // If GPS not configured yet, skip location check and allow attendance

      // 2.5 Determine actual shift for 'both'
      const now = new Date();
      const currentHour = now.getHours();
      let actualShiftType = employee.shift_type;
      
      if (actualShiftType === 'both') {
        actualShiftType = currentHour < 15 ? 'morning' : 'evening';
      }

      // 3. Check if already marked for today/shift
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const { data: existing } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('date', todayStr)
        .eq('shift_type', actualShiftType)
        .maybeSingle();

      if (type === 'checkout') {
        if (!existing) {
          throw new Error(`You must check in for your ${actualShiftType} shift before checking out.`);
        }
        if (existing.check_out_time) {
          throw new Error(`You have already checked out for your ${actualShiftType} shift.`);
        }
      }

      if (type === 'checkin' && existing) {
        throw new Error(`You have already checked in for your ${actualShiftType} shift.`);
      }

      const shouldCheckOut = type === 'checkout' || (type === 'auto' && existing);

      if (shouldCheckOut) {
        if (existing && existing.check_out_time) {
          throw new Error(`Attendance already completed for today's ${actualShiftType} shift.`);
        }

        const recordToUpdate = existing;
        if (!recordToUpdate) {
          throw new Error(`No check-in record found to check out.`);
        }

        // --- CHECK OUT FLOW ---
        const earlyMinutes = calculateEarlyLeaveMinutes(now, employee.role, actualShiftType);
        const earlyDeduction = calculateDeduction(earlyMinutes, employee.hourly_rate || 0);
        const totalDeduction = (recordToUpdate.deduction_amount || 0) + earlyDeduction;

        const updatePayload = {
          check_out_time: now.toISOString(),
          deduction_amount: totalDeduction
        };
        // Only include early_leave_minutes if column exists (safe update)
        try { updatePayload.early_leave_minutes = earlyMinutes; } catch (_) {}

        const { data, error } = await supabase
          .from('attendance')
          .update(updatePayload)
          .eq('id', recordToUpdate.id)
          .select()
          .single();

        if (error) throw new Error('Check-out failed: ' + error.message);
        return { data, type: 'checkout' };
      }

      // --- CHECK IN FLOW ---
      const lateMinutes = calculateLateMinutes(now, employee.role, actualShiftType);
      const deduction = calculateDeduction(lateMinutes, employee.hourly_rate || 0);

      const insertPayload = {
        employee_id: employee.id,
        date: todayStr,
        check_in_time: now.toISOString(),
        shift_type: actualShiftType,
        late_minutes: lateMinutes,
        deduction_amount: deduction,
        attendance_status: 'present',
        latitude: locationCoords.latitude,
        longitude: locationCoords.longitude
      };

      const { data, error } = await supabase
        .from('attendance')
        .insert([insertPayload])
        .select()
        .single();

      if (error) throw new Error('Check-in failed: ' + error.message);
      return { data, type: 'checkin' };

    } catch (err) {
      throw err;
    }
  },

  // Get attendance history for employee
  getEmployeeHistory: async (employeeId, limit = 30) => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get daily stats for Admin
  getDailyStats: async () => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const { data, error } = await supabase
      .from('attendance')
      .select('*, employees(*)')
      .eq('date', todayStr);
    
    if (error) throw error;
    return data;
  }
};
