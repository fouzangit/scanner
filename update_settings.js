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
  console.log("Updating Settings to match user's device coordinates: 17.35742, 78.41735");
  const { data, error } = await supabase
    .from('settings')
    .update({
      office_latitude: 17.35742,
      office_longitude: 78.41735,
      allowed_radius: 200 // 200 meters is standard and safe
    })
    .eq('id', 1)
    .select();

  if (error) {
    console.error("Error updating settings:", error);
  } else {
    console.log("Settings updated successfully:", data);
  }
}

run();
