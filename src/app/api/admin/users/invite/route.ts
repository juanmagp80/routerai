import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const body = await req.json();
    const { email, name, resendToUserId } = body;

    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Check for existing active invitation
    const { data: existingInv } = await supabaseAdmin
        .from('invitations')
        .select('*')
        .eq('email', email)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (existingInv) {
        // Check resend limit (max 5 resends per invitation)
        if (existingInv.resend_count >= 5) {
            return NextResponse.json({
                error: 'Maximum resend limit reached for this email. Please create a new invitation.'
            }, { status: 429 });
        }

        // Update resend count
        const { error: updateError } = await supabaseAdmin
            .from('invitations')
            .update({ resend_count: existingInv.resend_count + 1 })
            .eq('id', existingInv.id);

        if (updateError) {
            console.error('Error updating resend count:', updateError);
            return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 });
        }

        // Reuse existing token for resend
        try {
            const { EmailService } = await import('@/lib/email-service');
            await EmailService.sendInvite(email, name || existingInv.name || '', existingInv.token);
        } catch (e) {
            console.warn('Failed to resend invite email:', e);
        }

        return NextResponse.json({
            ok: true,
            invitation: { ...existingInv, resend_count: existingInv.resend_count + 1 },
            message: 'Invitation resent successfully'
        });
    }

    // Create new invitation
    const token = (globalThis as unknown as { crypto?: { randomUUID?: () => string } })?.crypto?.randomUUID
        ? (globalThis as unknown as { crypto: { randomUUID: () => string } }).crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const { data: inv, error } = await supabaseAdmin
        .from('invitations')
        .insert([{
            email,
            name,
            token,
            created_by: resendToUserId || null,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
        }])
        .select('*')
        .single();

    if (error) {
        console.error('Error creating invitation:', error);
        return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }

    // send email (best-effort)
    try {
        const { EmailService } = await import('@/lib/email-service');
        await EmailService.sendInvite(email, name || '', inv.token);
    } catch (e) {
        console.warn('Failed to send invite email:', e);
    }

    return NextResponse.json({ ok: true, invitation: inv, message: 'Invitation created successfully' });
}
