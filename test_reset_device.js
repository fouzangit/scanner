import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

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
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  // Get first employee
  const { data: employees, error: getError } = await supabase
    .from('employees')
    .select('*')
    .limit(1);

  if (getError) {
    console.error("Get error:", getError);
    return;
  }

  if (!employees || employees.length === 0) {
    console.log("No employees found.");
    return;
  }

  const employee = employees[0];
  console.log("Trying to update employee:", employee.name, "ID:", employee.id);

  // Try to update device_id to null
  const { data, error: updateError } = await supabase
    .from('employees')
    .update({ device_id: null })
    .eq('id', employee.id)
    .select();

  console.log("Update Result:", data);
  console.log("Update Error:", updateError);
}

run();
