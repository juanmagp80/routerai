import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  try {
    const { to, name, userId } = await req.json();
    
    console.log(`🔧 Send welcome email API called with:`, { to, name, userId });
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔑 RESEND_API_KEY configured: ${!!process.env.RESEND_API_KEY}`);

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured');
      return NextResponse.json({
        success: false,
        message: 'Email service not configured',
        note: 'Configure RESEND_API_KEY for email functionality'
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Usar el dominio verificado roulyx.com para poder enviar a cualquier email
    const fromEmail = 'Roulyx <welcome@roulyx.com>';

    // Enviar siempre al email del usuario real
    const targetEmail = to;
    
    console.log(`📧 Email configuration:`, { fromEmail, targetEmail });

    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin`;
    const docsUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/docs`;

    console.log(`📤 Attempting to send email via Resend...`);
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [targetEmail],
      subject: `¡Bienvenido a Roulyx, ${name}! 🚀`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido a Roulyx</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto;">
              <!-- Logo -->
              <div style="margin-bottom: 20px;">
                <svg width="48" height="48" viewBox="0 0 64 64" style="display: inline-block;">
                  <!-- Neural Network Node (Central) -->
                  <circle cx="32" cy="32" r="6" fill="#ffffff" opacity="0.9"/>
                  
                  <!-- Input Layer Nodes -->
                  <circle cx="12" cy="20" r="4" fill="#ffffff" opacity="0.7"/>
                  <circle cx="12" cy="32" r="4" fill="#ffffff" opacity="0.7"/>
                  <circle cx="12" cy="44" r="4" fill="#ffffff" opacity="0.7"/>
                  
                  <!-- Output Layer Nodes -->
                  <circle cx="52" cy="20" r="4" fill="#ffffff" opacity="0.7"/>
                  <circle cx="52" cy="32" r="4" fill="#ffffff" opacity="0.7"/>
                  <circle cx="52" cy="44" r="4" fill="#ffffff" opacity="0.7"/>
                  
                  <!-- Connections -->
                  <line x1="16" y1="20" x2="26" y2="32" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
                  <line x1="16" y1="32" x2="26" y2="32" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
                  <line x1="16" y1="44" x2="26" y2="32" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
                  
                  <line x1="38" y1="32" x2="48" y2="20" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
                  <line x1="38" y1="32" x2="48" y2="32" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
                  <line x1="38" y1="32" x2="48" y2="44" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
                </svg>
              </div>
              
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                Roulyx
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px; font-weight: 400;">
                AI Router Platform
              </p>
            </div>
          </div>

          <!-- Main Content -->
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            
            <!-- Welcome Message -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 16px 0;">
                ¡Bienvenido, ${name}! 🎉
              </h2>
              <p style="color: #4b5563; font-size: 18px; margin: 0; line-height: 1.5;">
                Tu cuenta en Roulyx ha sido creada exitosamente. Estás a punto de acceder a los modelos de IA más avanzados del mundo.
              </p>
            </div>

            <!-- Getting Started Steps -->
            <div style="margin: 40px 0;">
              <h3 style="color: #1f2937; font-size: 20px; font-weight: 600; margin: 0 0 24px 0; text-align: center;">
                Primeros pasos para comenzar
              </h3>
              
              <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; margin-right: 16px; flex-shrink: 0;">1</div>
                  <div>
                    <h4 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Crea tu primera API Key</h4>
                    <p style="color: #4b5563; font-size: 14px; margin: 0; line-height: 1.4;">Genera una clave API segura para autenticar tus requests a nuestros modelos de IA.</p>
                  </div>
                </div>
              </div>
              
              <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; margin-right: 16px; flex-shrink: 0;">2</div>
                  <div>
                    <h4 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Explora nuestros modelos</h4>
                    <p style="color: #4b5563; font-size: 14px; margin: 0; line-height: 1.4;">Accede a GPT-4, Claude, Gemini, Grok y más de 40 modelos desde una sola API.</p>
                  </div>
                </div>
              </div>
              
              <div style="background: #f9fafb; border-radius: 12px; padding: 24px;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; margin-right: 16px; flex-shrink: 0;">3</div>
                  <div>
                    <h4 style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Haz tu primera request</h4>
                    <p style="color: #4b5563; font-size: 14px; margin: 0; line-height: 1.4;">Usa nuestra API para generar contenido, analizar datos o cualquier tarea de IA.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Plan Info -->
            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px solid #bfdbfe; border-radius: 12px; padding: 24px; margin: 32px 0;">
              <div style="text-align: center;">
                <h3 style="color: #1e40af; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">
                  Plan FREE Activado ✨
                </h3>
                <p style="color: #1e40af; font-size: 14px; margin: 0 0 16px 0;">
                  Tienes acceso a <strong>100 requests gratuitas</strong> este mes para probar nuestros modelos.
                </p>
                <div style="display: flex; justify-content: center; gap: 24px; text-align: center;">
                  <div>
                    <div style="color: #1e40af; font-size: 20px; font-weight: 700;">100</div>
                    <div style="color: #3b82f6; font-size: 12px;">Requests/mes</div>
                  </div>
                  <div>
                    <div style="color: #1e40af; font-size: 20px; font-weight: 700;">1</div>
                    <div style="color: #3b82f6; font-size: 12px;">API Key</div>
                  </div>
                  <div>
                    <div style="color: #1e40af; font-size: 20px; font-weight: 700;">5</div>
                    <div style="color: #3b82f6; font-size: 12px;">Req/minuto</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${dashboardUrl}" 
                 style="background: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; margin: 8px;">
                Ir al Dashboard 🚀
              </a>
              <br>
              <a href="${docsUrl}" 
                 style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px; display: inline-block; margin: 8px;">
                Ver Documentación 📚
              </a>
            </div>



            <!-- Support -->
            <div style="text-align: center; margin: 40px 0 20px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                ¿Necesitas ayuda? Estamos aquí para apoyarte en tu journey con IA.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 32px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <div style="max-width: 600px; margin: 0 auto;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
                © 2025 Roulyx. Todos los derechos reservados.
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 0;">
                Recibes este email porque te registraste en Roulyx. 
                Tu información está segura y nunca será compartida.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Resend error:', error);
      console.error('❌ Full error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ success: false, error: error.message });
    }

    console.log(`✅ Welcome email sent successfully!`);
    console.log(`📧 Recipient: ${targetEmail}`);
    console.log(`📨 Message ID: ${data?.id}`);
    console.log(`📤 From: ${fromEmail}`);
    
    return NextResponse.json({ 
      success: true, 
      messageId: data?.id,
      recipient: targetEmail
    });

  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}