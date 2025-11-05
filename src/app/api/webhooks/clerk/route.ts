import { NextRequest, NextResponse } from 'next/server';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

// Configurar Supabase admin para crear usuarios
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // Obtener el webhook secret de Clerk desde las variables de entorno
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('❌ CLERK_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Obtener los headers para verificar la signature
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // Si no hay headers de verificación, rechazar la request
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Error occurred -- no svix headers' },
      { status: 400 }
    );
  }

  // Obtener el body de la request
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Crear una nueva instancia de webhook de Svix con el secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verificar el webhook
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('❌ Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Error occurred during webhook verification' },
      { status: 400 }
    );
  }

  // Manejar el evento
  const eventType = evt.type;
  
  console.log(`🎣 Clerk webhook received: ${eventType}`);

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    const userEmail = email_addresses[0]?.email_address;
    const userName = `${first_name || ''} ${last_name || ''}`.trim() || 'Usuario';

    console.log(`👤 New user registered: ${userName} (${userEmail})`);

    try {
      // Determinar rol automáticamente (primer usuario = admin, resto = developer)
      let role: 'admin' | 'developer' | 'viewer' = 'developer';
      
      try {
        const { data: admins } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .limit(1);

        if (!admins || admins.length === 0) {
          role = 'admin';
          console.log('🔑 First user detected, assigning admin role');
        }
      } catch (err) {
        console.error('Error checking existing admins:', err);
        role = 'developer'; // Fallback seguro
      }

      // 1. Crear el usuario en Supabase
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_user_id: id,
          email: userEmail,
          name: userName,
          role: role,
          status: 'active',
          plan: 'free',
          department: 'General',
          api_key_limit: 1, // Plan FREE: 1 API key
          is_active: true,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userError) {
        console.error('❌ Error creating user in database:', userError);
        return NextResponse.json(
          { error: 'Error creating user in database' },
          { status: 500 }
        );
      }

      console.log('✅ User created in database:', userData);

      // 2. Crear configuraciones por defecto del usuario
      const { error: settingsError } = await supabaseAdmin
        .from('user_settings')
        .insert({
          user_id: id,
          settings: {
            theme: 'light',
            language: 'es',
            compactView: false,
            usageAlerts: true,
            defaultModel: 'gpt-4o-mini',
            weeklyReports: true,
            emailNotifications: true,
            preferredProviders: ['openai'],
            usageAlertThreshold: 80,
            autoModelRotation: false
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (settingsError) {
        console.error('❌ Error creating user settings:', settingsError);
      } else {
        console.log('✅ User settings created');
      }

      // 3. Crear notificación de bienvenida
      const { error: notificationError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: id,
          type: 'welcome',
          title: '¡Bienvenido a Roulyx! 🎉',
          message: `¡Hola ${userName}! Gracias por registrarte en Roulyx. Tu cuenta ha sido creada exitosamente. Para comenzar, crea tu primera API key y explora nuestros potentes modelos de IA.`,
          metadata: {
            welcome_message: true,
            user_email: userEmail,
            registration_date: new Date().toISOString(),
            assigned_role: role
          },
          read: false,
          created_at: new Date().toISOString()
        });

      if (notificationError) {
        console.error('❌ Error creating welcome notification:', notificationError);
      } else {
        console.log('✅ Welcome notification created');
      }

      // 4. Enviar email de bienvenida
      try {
        // Determinar la URL base correcta
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? 'https://roulyx.com' 
          : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
        
        console.log(`📧 Attempting to send welcome email to: ${userEmail}`);
        console.log(`🌐 Using base URL: ${baseUrl}`);
        
        const emailResponse = await fetch(`${baseUrl}/api/send-welcome-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: userEmail,
            name: userName,
            userId: id
          })
        });

        console.log(`📡 Email API response status: ${emailResponse.status}`);
        
        const emailResult = await emailResponse.json();
        console.log('📧 Email API result:', emailResult);

        if (emailResult.success) {
          console.log(`✅ Welcome email sent successfully to ${userEmail} - Message ID: ${emailResult.messageId}`);
        } else {
          console.error('❌ Error sending welcome email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('❌ Error sending welcome email:', emailError);
      }

      return NextResponse.json({
        success: true,
        message: 'User created and welcome process completed',
        user: userData
      });

    } catch (error) {
      console.error('❌ Error processing user registration:', error);
      return NextResponse.json(
        { error: 'Error processing user registration' },
        { status: 500 }
      );
    }
  }

  // Para otros tipos de eventos, solo devolver OK
  return NextResponse.json({ received: true });
}