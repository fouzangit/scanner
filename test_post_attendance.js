import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env file manually
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  try {
    console.log("1. Fetching first employee...");
    const { data: employees, error: empError } = await supabase.from('employees').select('*').limit(1);
    if (empError) throw empError;
    if (!employees || employees.length === 0) {
      console.log("No employees found in the table. Please add an employee first!");
      return;
    }
    const employee = employees[0];
    console.log(`Found employee: ${employee.name} (${employee.role})`);

    console.log("2. Inserting dummy check-in record...");
    const todayStr = new Date().toISOString().split('T')[0];
    const dummyRecord = {
      employee_id: employee.id,
      date: todayStr,
      check_in_time: new Date().toISOString(),
      shift_type: 'morning',
      late_minutes: 0,
      deduction_amount: 0,
      attendance_status: 'present',
      latitude: 0,
      longitude: 0
    };

    const { data: inserted, error: insertError } = await supabase
      .from('attendance')
      .insert([dummyRecord])
      .select()
      .single();

    if (insertError) {
      console.error("❌ Insertion failed!", insertError);
      throw insertError;
    }

    console.log("✅ Insertion successful! ID:", inserted.id);

    console.log("3. Cleaning up test record...");
    const { error: deleteError } = await supabase
      .from('attendance')
      .delete()
      .eq('id', inserted.id);

    if (deleteError) {
      console.error("❌ Cleanup failed!", deleteError);
    } else {
      console.log("✅ Cleanup successful! Database is clean.");
    }
    
    console.log("\n🎉 END-TO-END CONNECTION AND WRITE TEST PASSED!");
  } catch (err) {
    console.error("❌ Database test failed:", err.message);
  }
}

runTest();
