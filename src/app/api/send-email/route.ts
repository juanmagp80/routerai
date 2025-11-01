import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { to, subject, message } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not configured, skipping email');
      return NextResponse.json({ success: false, message: 'Email service not configured' });
    }

    console.log(`📧 Sending email to ${to}: ${subject}`);

    // Para desarrollo, usar el dominio por defecto de Resend
    const fromEmail = process.env.NODE_ENV === 'production' 
      ? 'Roulyx <notifications@roulyx.com>' 
      : 'Roulyx <onboarding@resend.dev>';

    // En desarrollo, Resend solo permite enviar a tu email registrado
    const targetEmail = process.env.NODE_ENV === 'production' 
      ? to 
      : 'agentroutermcp@gmail.com'; // Tu email registrado en Resend

    console.log(`📤 Sending from: ${fromEmail} to: ${targetEmail}`);
    
    if (process.env.NODE_ENV !== 'production' && to !== 'agentroutermcp@gmail.com') {
      console.log(`🔄 Development mode: Redirecting email from ${to} to ${targetEmail}`);
    }

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [targetEmail],
      subject: `${subject}${targetEmail !== to ? ` (Originally for: ${to})` : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Roulyx</h1>
          </div>
          ${targetEmail !== to ? `
          <div style="padding: 15px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; margin: 10px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              🚧 <strong>Development Mode:</strong> This email was originally intended for <strong>${to}</strong> but redirected to your registered email for testing.
            </p>
          </div>
          ` : ''}
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2 style="color: #333;">${subject.replace('[Roulyx] ', '').replace(/ \(Originally for:.*\)/, '')}</h2>
            <p style="color: #666; line-height: 1.6;">${message}</p>
            <div style="margin-top: 30px; padding: 15px; background-color: #e3f2fd; border-radius: 5px;">
              <p style="margin: 0; color: #1976d2; font-size: 14px;">
                📊 You can check your usage and manage your account at: 
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="color: #1976d2;">
                  ${process.env.NEXT_PUBLIC_APP_URL}/admin
                </a>
              </p>
            </div>
          </div>
          <div style="padding: 20px; text-align: center; background-color: #f0f0f0; font-size: 12px; color: #666;">
            <p>© 2025 Roulyx. All rights reserved.</p>
            <p>You received this email because you have usage alerts enabled in your account settings.</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return NextResponse.json({ success: false, error: error.message });
    }

    console.log('✅ Email sent successfully:', data?.id);
    return NextResponse.json({ success: true, messageId: data?.id });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}