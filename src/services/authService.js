import { supabase } from './supabase';

/**
 * Service for handling employee and admin authentication
 * Note: For this PWA, we use a simplified phone-number based persistent session.
 */

export const authService = {
  getOrCreateDeviceId: () => {
    let deviceId = localStorage.getItem('clinic_device_id');
    if (!deviceId) {
      deviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      localStorage.setItem('clinic_device_id', deviceId);
    }
    return deviceId;
  },

  // Login using phone number with Device Binding
  login: async (phone) => {
    // 1. Get or create a persistent Device ID on this phone/browser
    const deviceId = authService.getOrCreateDeviceId();

    // 2. Fetch employee
    const { data: employee, error } = await supabase
      .from('employees')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !employee) throw new Error('Employee not found or invalid phone number');

    // 3. Device Binding Logic
    if (!employee.allow_multiple_devices) {
      if (!employee.device_id) {
        // First time login: Bind this device to the employee
        const { error: updateError } = await supabase
          .from('employees')
          .update({ device_id: deviceId })
          .eq('id', employee.id);
        
        if (updateError) throw new Error('Failed to bind device to account.');
        employee.device_id = deviceId; // Update local state
      } else if (employee.device_id !== deviceId) {
        // Locked to another device
        throw new Error('Access Denied. Your account is linked to another device. Please contact the Admin.');
      }
    }

    // 4. Store permanently
    localStorage.setItem('clinic_employee', JSON.stringify(employee));
    return employee;
  },

  // Get current logged in employee from storage
  getCurrentUser: () => {
    const user = localStorage.getItem('clinic_employee');
    return user ? JSON.parse(user) : null;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('clinic_employee');
  },

  // Admin "auth" - simplified for demo or could use Supabase Auth
  isAdminLoggedIn: () => {
    return sessionStorage.getItem('clinic_admin_token') === 'true';
  },

  adminLogin: (password) => {
    if (password === 'admin123') { // Example static password
      sessionStorage.setItem('clinic_admin_token', 'true');
      return true;
    }
    return false;
  }
};
