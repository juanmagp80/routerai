import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || 'unknown';
    // Crear una notificación de prueba directamente en la base de datos para evitar la verificación de duplicados
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const testNotificationData = {
      user_id: userId, // TEXT para Clerk IDs
      type: 'general',
      title: 'Prueba de Notificaciones',
      message: 'Esta es una notificación de prueba para verificar que el sistema de emails funciona correctamente. Si recibes este email, ¡todo está funcionando perfectamente! 🎉',
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
        user_email: userEmail,
        test_id: Math.random().toString(36).substring(7) // ID único para cada prueba
      },
      read: false, // Usar 'read' en lugar de 'is_read'
      created_at: new Date().toISOString()
    };
    const { data: notificationData, error: notificationError } = await supabase
      .from('notifications')
      .insert(testNotificationData)
      .select()
      .single();
    if (notificationError) {
      console.error('❌ Error creating test notification:', notificationError);
      return NextResponse.json({
        success: false,
        message: 'Error creating test notification',
        error: notificationError.message,
        details: notificationError
      }, { status: 500 });
    }

    const created = !!notificationData;

    if (created) {

      // También enviar email directamente para probar
      try {
        const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: userEmail,
            subject: 'Prueba de Email - Roulyx',
            message: `
              <h2>¡Hola! 👋</h2>
              <p>Esta es una prueba del sistema de notificaciones por email de Roulyx.</p>
              <p><strong>Usuario:</strong> ${userEmail}</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
              <p>Si estás viendo este email, significa que:</p>
              <ul>
                <li>✅ El sistema de notificaciones está funcionando</li>
                <li>✅ Los emails se están enviando correctamente</li>
                <li>✅ Tu configuración de notificaciones está activa</li>
              </ul>
              <p>¡Perfecto! El sistema está listo para enviarte alertas importantes. 🚀</p>
            `
          })
        });

        const emailResult = await emailResponse.json();

        return NextResponse.json({
          success: true,
          message: 'Notificación de prueba creada',
          notification: {
            created: true,
            title: 'Prueba de Notificaciones',
            userEmail
          },
          email: {
            sent: emailResult.success,
            messageId: emailResult.messageId,
            error: emailResult.error
          }
        });

      } catch (emailError) {
        console.error('❌ Error sending test email:', emailError);

        return NextResponse.json({
          success: true,
          message: 'Notificación creada pero error enviando email',
          notification: {
            created: true,
            title: 'Prueba de Notificaciones',
            userEmail
          },
          email: {
            sent: false,
            error: emailError instanceof Error ? emailError.message : 'Unknown email error'
          }
        });
      }

    } else {
      return NextResponse.json({
        success: false,
        message: 'No se pudo crear la notificación de prueba',
        debug: {
          userId,
          userEmail,
          notificationData: testNotificationData
        }
      });
    }

  } catch (error) {
    console.error('❌ Error in test notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}