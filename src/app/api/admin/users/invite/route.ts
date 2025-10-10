import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const body = await req.json();
    const { email, name, resendToUserId } = body;

    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    // generate token and store invitation
    const token = (globalThis as unknown as { crypto?: { randomUUID?: () => string } })?.crypto?.randomUUID
        ? (globalThis as unknown as { crypto: { randomUUID: () => string } }).crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: inv, error } = await supabaseAdmin
        .from('invitations')
        .insert([{ email, name, token, created_by: resendToUserId || null }])
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

    return NextResponse.json({ ok: true, invitation: inv });
}
