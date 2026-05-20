import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function fix() {
  // The bad record: id 03d5896b — checkout (09:35 UTC = 3:05 PM IST) is before check-in (15:25 UTC = 8:55 PM IST)
  // Deleting it so admin can re-enter correct times manually via the Edit/Add UI
  const BAD_ID = '03d5896b-c5e9-4b6d-a07c-4bcba85ded46';

  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', BAD_ID);

  if (error) {
    console.error('❌ Failed to delete bad record:', error.message);
  } else {
    console.log('✅ Bad attendance record deleted successfully!');
    console.log('ℹ️  The admin can now re-add the correct attendance for "ytrewq" via Manual Attendance in the admin portal.');
  }
}

fix();
