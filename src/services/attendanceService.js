import { supabase } from './supabase';
import { calculateLateMinutes, calculateEarlyLeaveMinutes, calculateDeduction } from '../utils/calculateLate';
import { validateLocation } from '../utils/location';

export const attendanceService = {
  // Mark attendance with GPS and Late/Early logic
  markAttendance: async (employee) => {
    try {
      // 1. Get Office Settings (Location + Radius)
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .single();
      
      if (settingsError) throw new Error('Could not fetch office settings');

      // 2. Validate GPS
      const locValidation = await validateLocation(
        settings.office_latitude, 
        settings.office_longitude, 
        settings.allowed_radius
      );

      if (!locValidation.isValid) {
        throw new Error(`You are outside the office radius (${locValidation.distance}m away)`);
      }

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

      if (existing) {
        if (existing.check_out_time) {
          throw new Error(`Attendance already completed for today's ${actualShiftType} shift`);
        }

        // --- CHECK OUT FLOW ---
        const earlyMinutes = calculateEarlyLeaveMinutes(now, employee.role, actualShiftType);
        const earlyDeduction = calculateDeduction(earlyMinutes, employee.hourly_rate);
        const totalDeduction = existing.deduction_amount + earlyDeduction;

        const { data, error } = await supabase
          .from('attendance')
          .update({
            check_out_time: now.toISOString(),
            early_leave_minutes: earlyMinutes,
            deduction_amount: totalDeduction
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return { data, type: 'checkout' };
      }

      // --- CHECK IN FLOW ---
      const lateMinutes = calculateLateMinutes(now, employee.role, actualShiftType);
      const deduction = calculateDeduction(lateMinutes, employee.hourly_rate);

      const { data, error } = await supabase
        .from('attendance')
        .insert([{
          employee_id: employee.id,
          date: todayStr,
          check_in_time: now.toISOString(),
          shift_type: actualShiftType,
          late_minutes: lateMinutes,
          deduction_amount: deduction,
          attendance_status: 'present',
          latitude: locValidation.coords.latitude,
          longitude: locValidation.coords.longitude
        }])
        .select()
        .single();

      if (error) throw error;
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
