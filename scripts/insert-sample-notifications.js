// Script para insertar notificaciones de ejemplo
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertSampleNotifications() {
  try {
    console.log('🔍 Finding users...');

    // Primero obtenemos un usuario existente
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('clerk_user_id, email')
      .limit(1);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    const userId = users[0].clerk_user_id;
    console.log(`✅ Found user: ${users[0].email} (${userId})`);

    // Crear notificaciones de ejemplo
    const sampleNotifications = [
      {
        user_id: userId,
        type: 'limit_warning',
        title: 'API Usage Warning',
        message: 'You have used 80% of your monthly API request limit. Consider upgrading your plan to avoid service interruption.',
        metadata: { threshold: 80, current_usage: 4000, limit: 5000 },
        read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        user_id: userId,
        type: 'upgrade_suggestion',
        title: 'Upgrade Recommendation',
        message: 'Based on your usage patterns, we recommend upgrading to the PRO plan for better performance and higher limits.',
        metadata: { suggested_plan: 'pro', current_plan: 'starter' },
        read: false,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        user_id: userId,
        type: 'trial_expiring',
        title: 'Trial Expiring Soon',
        message: 'Your free trial will expire in 3 days. Upgrade now to continue enjoying all features.',
        metadata: { days_remaining: 3, trial_end_date: '2024-11-15' },
        read: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        user_id: userId,
        type: 'limit_reached',
        title: 'API Limit Reached',
        message: 'You have reached your monthly API request limit. Upgrade your plan or wait until next month to continue using the service.',
        metadata: { current_usage: 5000, limit: 5000 },
        read: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
      },
      {
        user_id: userId,
        type: 'general',
        title: 'Welcome to Roulyx!',
        message: 'Thank you for joining Roulyx. Start by creating your first API key and exploring our powerful AI models.',
        metadata: { welcome_message: true },
        read: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
      }
    ];

    console.log('📝 Inserting sample notifications...');

    const { data, error } = await supabase
      .from('notifications')
      .insert(sampleNotifications)
      .select();

    if (error) {
      console.error('Error inserting notifications:', error);
      return;
    }

    console.log(`✅ Successfully inserted ${data.length} notifications:`);
    data.forEach((notification, index) => {
      console.log(`   ${index + 1}. ${notification.title} (${notification.type}) - ${notification.read ? 'Read' : 'Unread'}`);
    });

    // Verificar que se insertaron correctamente
    const { data: allNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError);
      return;
    }

    console.log(`\n📊 Total notifications for user: ${allNotifications.length}`);
    console.log(`📧 Unread: ${allNotifications.filter(n => !n.read).length}`);
    console.log(`✅ Read: ${allNotifications.filter(n => n.read).length}`);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Ejecutar el script
insertSampleNotifications();