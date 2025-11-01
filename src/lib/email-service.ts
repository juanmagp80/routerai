const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_BASE = 'https://api.resend.com';

export class EmailService {
  static async sendInvite(email: string, name: string, token: string, inviterName?: string) {
    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured; skipping email send');
      return false;
    }

    const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/invites/accept?token=${encodeURIComponent(token)}`;

    const body = {
      from: 'onboarding@resend.dev', // Using Resend's verified domain for testing
      to: [email],
      subject: `You're invited to join ${inviterName || 'Roulyx'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You're invited!</h2>
          <p>Hi ${name || 'there'},</p>
          <p>You have been invited to join Roulyx by ${inviterName || 'a team member'}.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" 
               style="background-color: #007cba; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p><strong>Important:</strong> This invitation will expire in 7 days.</p>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #666; font-size: 12px;">
            If you didn't expect this invitation, you can safely ignore this email.
            <br>
            If the button doesn't work, copy and paste this link: ${acceptUrl}
          </p>
        </div>
      `
    };

    const res = await fetch(`${RESEND_BASE}/emails`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    return res.ok;
  }
}
