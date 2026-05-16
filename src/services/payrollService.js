import { supabase } from './supabase';
import { calculatePayrollStats } from '../utils/payrollUtils';

export const payrollService = {
  // Generate payroll for all employees in a date range
  generatePayroll: async (startDate, endDate) => {
    try {
      // 1. Fetch all employees
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('*');
      
      if (empError) throw empError;

      // 2. Fetch attendance for the range
      const { data: attendance, error: attError } = await supabase
        .from('attendance')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);
      
      if (attError) throw attError;

      // 3. Process payroll for each employee
      const payrollData = employees.map(emp => {
        const empAttendance = attendance.filter(a => a.employee_id === emp.id);
        const stats = calculatePayrollStats(empAttendance, emp.hourly_rate, emp.monthly_salary);
        
        return {
          employee_id: emp.id,
          employee_name: emp.name,
          role: emp.role,
          shift_type: emp.shift_type,
          payroll_start_date: startDate,
          payroll_end_date: endDate,
          ...stats
        };
      });

      return payrollData;
    } catch (err) {
      throw err;
    }
  },

  // Save payroll to database
  savePayrollRecord: async (record) => {
    const { data, error } = await supabase
      .from('payroll')
      .insert([record])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get payroll history
  getPayrollHistory: async () => {
    const { data, error } = await supabase
      .from('payroll')
      .select('*, employees(name, role)')
      .order('payroll_end_date', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
