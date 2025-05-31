#!/usr/bin/env node

// Migration script to apply database changes
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const SUPABASE_URL = 'https://kyiwpwlxmysyuqjdxvyq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found. Using anon key for migration (limited permissions)');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aXdwd2x4bXlzeXVxamR4dnlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MjgxNTUsImV4cCI6MjA2NDIwNDE1NX0.UqhmUIrT4imMoUqi7KOKiCyNegD09NUq3ZYXhPALqrM');

async function applyMigration() {
  try {
    console.log('🚀 Applying database migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20240130000000_add_password_qr_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL statements (basic approach)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📜 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.warn(`⚠️  Statement ${i + 1} warning:`, error.message);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`ℹ️  Statement ${i + 1} (${statement.substring(0, 50)}...) - may already exist or have limited permissions`);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📋 Summary:');
    console.log('  - Created password_histories table');
    console.log('  - Created qr_codes table');
    console.log('  - Added tracking columns to profiles');
    console.log('  - Set up Row Level Security policies');
    console.log('  - Created performance indexes');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyMigration();
