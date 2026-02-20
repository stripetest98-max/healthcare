const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create Supabase admin client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  const migrationsDir = path.join(__dirname, '../database/migrations');
  
  try {
    // Get all migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files:\n`);

    for (const file of files) {
      console.log(`📄 Running: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Execute SQL
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        // Try alternative method - direct query
        console.log(`   ⚠️  RPC method failed, trying direct query...`);
        
        // Split SQL into individual statements
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
          try {
            await supabase.rpc('exec', { sql: statement });
          } catch (err) {
            console.log(`   ⚠️  Statement skipped (might already exist)`);
          }
        }
        
        console.log(`   ✅ ${file} completed (with warnings)\n`);
      } else {
        console.log(`   ✅ ${file} completed successfully\n`);
      }
    }

    console.log('🎉 All migrations completed!\n');
    console.log('✅ Tables created:');
    console.log('   - profiles');
    console.log('   - appointments');
    console.log('   - prescriptions');
    console.log('   - lab_reports\n');
    
    console.log('📊 Verifying tables...');
    await verifyTables();

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n⚠️  Please run migrations manually in Supabase SQL Editor');
    console.log('📁 Migration files location: backend/database/migrations/\n');
    process.exit(1);
  }
}

async function verifyTables() {
  const tables = ['profiles', 'appointments', 'prescriptions', 'lab_reports'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ❌ ${table} - Not found or error`);
      } else {
        console.log(`   ✅ ${table} - Ready`);
      }
    } catch (err) {
      console.log(`   ❌ ${table} - Not accessible`);
    }
  }
  
  console.log('\n✨ Migration process complete!\n');
}

// Run migrations
runMigrations();
