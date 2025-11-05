import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Configurar Supabase admin para crear usuarios
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    console.log('🚨 UNSAFE WEBHOOK: Verification disabled for testing');
    
    try {
        // Obtener el body de la request SIN verificación
        const payload = await req.text();
        const body = JSON.parse(payload);

        console.log('📝 Raw webhook data received:', JSON.stringify(body, null, 2));

        // Manejar el evento directamente
        const eventType = body.type;
        console.log(`🎣 Event type: ${eventType}`);

        if (eventType === 'user.created') {
            console.log(`🎯 Processing user.created event...`);
            
            const { id, email_addresses, first_name, last_name } = body.data;

            const userEmail = email_addresses[0]?.email_address;
            const userName = `${first_name || ''} ${last_name || ''}`.trim() || 'Usuario';

            console.log(`👤 New user registered: ${userName} (${userEmail})`);
            console.log(`📋 User ID: ${id}`);

            // Enviar email de bienvenida directamente
            try {
                const baseUrl = 'https://routerai.vercel.app';

                console.log(`📧 Attempting to send welcome email to: ${userEmail}`);

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

                return NextResponse.json({
                    success: true,
                    message: 'UNSAFE webhook processed successfully',
                    email: emailResult,
                    warning: 'This webhook bypasses security verification - FOR TESTING ONLY'
                });

            } catch (emailError) {
                console.error('❌ Error sending welcome email:', emailError);
                return NextResponse.json({
                    success: false,
                    error: 'Email sending failed',
                    details: emailError instanceof Error ? emailError.message : 'Unknown error'
                });
            }
        }

        // Para otros tipos de eventos
        console.log(`🔄 Non-user.created event received: ${eventType}`);
        return NextResponse.json({ received: true, eventType, warning: 'UNSAFE webhook - verification disabled' });

    } catch (error) {
        console.error('❌ Error processing unsafe webhook:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}