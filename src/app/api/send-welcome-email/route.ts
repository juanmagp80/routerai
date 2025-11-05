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

    // Usar el dominio correcto en producción
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.roulyx.com' 
      : 'http://localhost:3000';
    const dashboardUrl = `${baseUrl}/admin`;
    const docsUrl = `${baseUrl}/docs`;

    console.log(`📤 Attempting to send email via Resend...`);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: targetEmail,
      subject: `🚀 Welcome to Roulyx, ${name}! Your gateway to AI's future`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Welcome to Roulyx!</title>
          <!--[if mso]>
          <noscript>
            <xml>
              <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          </noscript>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #1f2937; background-color: #f8fafc;">
          
          <!-- Preheader -->
          <div style="display: none; font-size: 1px; color: #f8fafc; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
            Your Roulyx account is ready. Access 40+ AI models through a single API. Get started now!
          </div>

          <!-- Email Container -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
            <tr>
              <td align="center" style="padding: 0;">
                
                <!-- Header -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%); border-radius: 0 0 24px 24px;">
                  <tr>
                    <td align="center" style="padding: 48px 24px;">
                      
                      <!-- Logo -->
                      <div style="margin-bottom: 24px;">
                        <svg width="64" height="64" viewBox="0 0 64 64" style="display: block;">
                          <defs>
                            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" style="stop-color: #10b981; stop-opacity: 1" />
                              <stop offset="50%" style="stop-color: #06b6d4; stop-opacity: 1" />
                              <stop offset="100%" style="stop-color: #3b82f6; stop-opacity: 1" />
                            </linearGradient>
                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                              <feMerge> 
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                          </defs>
                          
                          <!-- Background circle -->
                          <circle cx="32" cy="32" r="30" fill="rgba(16, 185, 129, 0.1)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="2"/>
                          
                          <!-- Neural network connections -->
                          <g opacity="0.8" filter="url(#glow)">
                            <path d="M12 20 Q24 26 32 32" stroke="url(#logoGrad)" stroke-width="2.5" fill="none"/>
                            <path d="M12 32 L32 32" stroke="url(#logoGrad)" stroke-width="2.5"/>
                            <path d="M12 44 Q24 38 32 32" stroke="url(#logoGrad)" stroke-width="2.5" fill="none"/>
                            <path d="M32 32 Q40 26 52 20" stroke="url(#logoGrad)" stroke-width="2.5" fill="none"/>
                            <path d="M32 32 L52 32" stroke="url(#logoGrad)" stroke-width="2.5"/>
                            <path d="M32 32 Q40 38 52 44" stroke="url(#logoGrad)" stroke-width="2.5" fill="none"/>
                          </g>
                          
                          <!-- Nodes -->
                          <g filter="url(#glow)">
                            <circle cx="12" cy="20" r="4" fill="#10b981"/>
                            <circle cx="12" cy="32" r="4" fill="#10b981"/>
                            <circle cx="12" cy="44" r="4" fill="#10b981"/>
                            <circle cx="32" cy="32" r="8" fill="url(#logoGrad)" stroke="#ffffff" stroke-width="2"/>
                            <circle cx="32" cy="32" r="3" fill="#ffffff"/>
                            <circle cx="52" cy="20" r="4" fill="#3b82f6"/>
                            <circle cx="52" cy="32" r="4" fill="#3b82f6"/>
                            <circle cx="52" cy="44" r="4" fill="#3b82f6"/>
                          </g>
                        </svg>
                      </div>
                      
                      <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 36px; font-weight: 800; letter-spacing: -1px; text-align: center;">
                        Roulyx
                      </h1>
                      <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 18px; font-weight: 500; text-align: center;">
                        Intelligent AI Router Platform
                      </p>
                      
                    </td>
                  </tr>
                </table>

                <!-- Main Content -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; margin: 24px 0; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                  <tr>
                    <td style="padding: 48px 32px;">
                      
                      <!-- Welcome Message -->
                      <div style="text-align: center; margin-bottom: 48px;">
                        <h2 style="color: #0f172a; font-size: 32px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.2;">
                          Hello ${name}! 👋
                        </h2>
                        <p style="color: #475569; font-size: 20px; margin: 0 0 24px 0; line-height: 1.5;">
                          Your <strong style="color: #10b981;">Roulyx</strong> account is ready
                        </p>
                        <p style="color: #64748b; font-size: 16px; margin: 0; line-height: 1.6;">
                          You now have access to over <strong>40 AI models</strong> through a single API. 
                          Our intelligent system automatically selects the best model for each task.
                        </p>
                      </div>

                      <!-- Feature Highlights -->
                      <div style="margin: 48px 0;">
                        <h3 style="color: #0f172a; font-size: 24px; font-weight: 600; margin: 0 0 32px 0; text-align: center;">
                          What can you do now?
                        </h3>
                        
                        <div style="display: block; margin-bottom: 24px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td width="48" style="vertical-align: top; padding-right: 16px;">
                                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                  <span style="color: white; font-size: 24px; font-weight: bold;">🔑</span>
                                </div>
                              </td>
                              <td style="vertical-align: top;">
                                <h4 style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">
                                  Create your first API Key
                                </h4>
                                <p style="color: #64748b; font-size: 15px; margin: 0; line-height: 1.5;">
                                  Generate a secure API key in seconds and start making requests immediately.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </div>

                        <div style="display: block; margin-bottom: 24px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td width="48" style="vertical-align: top; padding-right: 16px;">
                                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                  <span style="color: white; font-size: 24px; font-weight: bold;">🤖</span>
                                </div>
                              </td>
                              <td style="vertical-align: top;">
                                <h4 style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">
                                  Access premium models
                                </h4>
                                <p style="color: #64748b; font-size: 15px; margin: 0; line-height: 1.5;">
                                  GPT-4, Claude, Gemini, Grok and many more. One endpoint for all.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </div>

                        <div style="display: block;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td width="48" style="vertical-align: top; padding-right: 16px;">
                                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                  <span style="color: white; font-size: 24px; font-weight: bold;">🎯</span>
                                </div>
                              </td>
                              <td style="vertical-align: top;">
                                <h4 style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">
                                  Intelligent routing
                                </h4>
                                <p style="color: #64748b; font-size: 15px; margin: 0; line-height: 1.5;">
                                  Our system selects the optimal model based on cost, speed and quality.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </div>

                      <!-- Plan Info -->
                      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: 16px; padding: 32px; margin: 48px 0; text-align: center;">
                        <div style="margin-bottom: 16px;">
                          <span style="background: #0ea5e9; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Plan FREE
                          </span>
                        </div>
                        <h3 style="color: #0c4a6e; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">
                          Your account is activated! ✨
                        </h3>
                        <p style="color: #075985; font-size: 16px; margin: 0 0 24px 0;">
                          You have <strong>100 free requests</strong> this month to explore all our models
                        </p>
                        
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td width="33%" style="text-align: center; padding: 0 8px;">
                              <div style="color: #0c4a6e; font-size: 24px; font-weight: 800; margin-bottom: 4px;">100</div>
                              <div style="color: #0369a1; font-size: 12px; font-weight: 500;">Requests/month</div>
                            </td>
                            <td width="33%" style="text-align: center; padding: 0 8px;">
                              <div style="color: #0c4a6e; font-size: 24px; font-weight: 800; margin-bottom: 4px;">40+</div>
                              <div style="color: #0369a1; font-size: 12px; font-weight: 500;">AI Models</div>
                            </td>
                            <td width="33%" style="text-align: center; padding: 0 8px;">
                              <div style="color: #0c4a6e; font-size: 24px; font-weight: 800; margin-bottom: 4px;">24/7</div>
                              <div style="color: #0369a1; font-size: 12px; font-weight: 500;">Availability</div>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- CTA Buttons -->
                      <div style="text-align: center; margin: 48px 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                          <tr>
                            <td style="padding: 0 0 16px 0;">
                              <a href="${dashboardUrl}" 
                                 style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3); transition: all 0.3s ease;">
                                🚀 Access Dashboard
                              </a>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <a href="${docsUrl}" 
                                 style="color: #475569; padding: 12px 24px; text-decoration: none; border: 2px solid #e2e8f0; border-radius: 12px; font-weight: 500; font-size: 14px; display: inline-block; transition: all 0.3s ease;">
                                📚 View Documentation
                              </a>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Support -->
                      <div style="text-align: center; margin: 48px 0 0 0; padding: 32px 0; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; font-size: 16px; margin: 0 0 16px 0; font-weight: 500;">
                          Need help?
                        </p>
                        <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;">
                          Our team is here to support you on your AI journey.<br>
                          Reply to this email or visit our documentation.
                        </p>
                      </div>
                      
                    </td>
                  </tr>
                </table>

                <!-- Footer -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px;">
                  <tr>
                    <td style="padding: 32px 24px; text-align: center;">
                      <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0;">
                        © 2025 Roulyx. All rights reserved.
                      </p>
                      <p style="color: #cbd5e1; font-size: 11px; margin: 0; line-height: 1.4;">
                        You're receiving this email because you signed up for Roulyx.<br>
                        Your information is secure and will never be shared.
                      </p>
                    </td>
                  </tr>
                </table>
                
              </td>
            </tr>
          </table>
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