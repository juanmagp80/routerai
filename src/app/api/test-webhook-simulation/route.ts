import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configurar Supabase admin para crear usuarios
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { email, name } = await req.json();

        if (!email) {
            return NextResponse.json({
                success: false,
                error: 'Email is required'
            }, { status: 400 });
        }

        console.log(`🧪 Simulating webhook for: ${name} (${email})`);

        // Simular el proceso completo del webhook
        const userId = `test-${Date.now()}`;
        const userName = name || 'Test User';

        // 1. Simular creación en Supabase (opcional, solo para test)
        console.log(`📝 Would create user in database: ${userId}`);

        // 2. Enviar email de bienvenida (la parte que nos interesa)
        try {
            // Usar siempre la URL correcta
            const baseUrl = 'https://routerai.vercel.app';

            console.log(`📧 Attempting to send welcome email to: ${email}`);
            console.log(`🌐 Using base URL: ${baseUrl}`);

            const emailResponse = await fetch(`${baseUrl}/api/send-welcome-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: email,
                    name: userName,
                    userId: userId
                })
            });

            console.log(`📡 Email API response status: ${emailResponse.status}`);

            const emailResult = await emailResponse.json();
            console.log('📧 Email API result:', emailResult);

            if (emailResult.success) {
                console.log(`✅ Welcome email sent successfully to ${email} - Message ID: ${emailResult.messageId}`);
                
                return NextResponse.json({
                    success: true,
                    message: 'Webhook simulation completed successfully',
                    email: {
                        sent: true,
                        messageId: emailResult.messageId,
                        recipient: email
                    },
                    user: {
                        id: userId,
                        name: userName,
                        email: email
                    }
                });
            } else {
                console.error('❌ Error sending welcome email:', emailResult.error);
                
                return NextResponse.json({
                    success: false,
                    error: 'Failed to send welcome email',
                    details: emailResult
                });
            }
        } catch (emailError) {
            console.error('❌ Error sending welcome email:', emailError);
            
            return NextResponse.json({
                success: false,
                error: 'Email sending failed',
                details: emailError instanceof Error ? emailError.message : 'Unknown error'
            });
        }

    } catch (error) {
        console.error('❌ Error in webhook simulation:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}