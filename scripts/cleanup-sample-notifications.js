#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupNotifications() {
  try {
    console.log('🧹 Cleaning up sample notifications...');

    // Delete all notifications (since they are all sample data)
    const { error } = await supabase
      .from('notifications')
      .delete()
      .gte('created_at', '1900-01-01'); // This will delete all records

    if (error) {
      console.error('❌ Error deleting notifications:', error);
      return;
    }

    console.log('✅ All sample notifications have been removed');
    console.log('💡 The system will now only show real notifications based on actual usage');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

cleanupNotifications();