const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env file
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found.');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] ? match[2].trim() : '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      env[match[1]] = value;
    }
  });
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

const tablesToTest = [
  'tahun_anggaran',
  'provinsi',
  'kabupaten_kota',
  'institusi_pendidikan',
  'sumber_dana_institusi',
  'pengeluaran_bulanan_institusi',
  'rincian_pengeluaran_item',
  'users',
  'audit_anomaly',
  'alokasi_provinsi',
  'alokasi_kabupaten_kota'
];

async function runTests() {
  console.log('Testing connection and tables...\n');
  for (const table of tablesToTest) {
    try {
      const { data, error, status } = await supabase.from(table).select('*').limit(1);
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`❌ Tabel [${table}]: BELUM ADA di database.`);
        } else {
          console.log(`⚠️ Tabel [${table}]: Ada error lain: ${error.message} (Status: ${status}, Code: ${error.code})`);
        }
      } else {
        console.log(`✅ Tabel [${table}]: BERHASIL diakses! Mengembalikan ${data ? data.length : 0} baris.`);
      }
    } catch (err) {
      console.log(`❌ Tabel [${table}]: Gagal total: ${err.message}`);
    }
  }
}

runTests();
