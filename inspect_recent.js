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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: employees, error: err1 } = await supabase.from('employees').select('*');
  console.log("EMPLOYEES:", employees, "Error1:", err1);
  
  const { data: attendance, error: err2 } = await supabase.from('attendance').select('*').limit(10);
  console.log("ATTENDANCE (last 10):", attendance, "Error2:", err2);
}

run();
