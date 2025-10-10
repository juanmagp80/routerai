const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_BASE = 'https://api.resend.com';

export class EmailService {
    static async sendInvite(email: string, name: string, token: string, inviterName?: string) {
        if (!RESEND_API_KEY) {
            console.warn('RESEND_API_KEY not configured; skipping email send');
            return false;
        }

        const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/invites/accept?token=${encodeURIComponent(token)}`;

        const body = {
            from: 'no-reply@yourdomain.com',
            to: [email],
            subject: `You're invited to join ${inviterName || 'our team'}`,
            html: `<p>Hi ${name || ''},</p>
      <p>You have been invited to join. Click the link to accept:</p>
      <p><a href="${acceptUrl}">Accept invitation</a></p>
      <p>If you didn't expect this, ignore this email.</p>`
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
