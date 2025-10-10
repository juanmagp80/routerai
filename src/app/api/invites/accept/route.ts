import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  const { token, clerk_user_id } = await req.json();

  if (!token || !clerk_user_id) return NextResponse.json({ error: 'token and clerk_user_id required' }, { status: 400 });

  if (!supabaseAdmin) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  const { data: inv } = await supabaseAdmin.from('invitations').select('*').eq('token', token).single();

  if (!inv) return NextResponse.json({ error: 'invalid token' }, { status: 400 });

  // find creator's company if any
  let company = null;
  if (inv.created_by) {
    const creator = await supabaseAdmin.from('users').select('company').eq('id', inv.created_by).single();
    company = creator.data?.company || null;
  }

  // mark invitation accepted and create user row or update existing
  await supabaseAdmin.from('invitations').update({ accepted_at: new Date().toISOString(), accepted_by: clerk_user_id }).eq('id', inv.id);

  // create user record if not exists
  const { data: existing } = await supabaseAdmin.from('users').select('*').eq('clerk_user_id', clerk_user_id).single();
  if (!existing) {
    await supabaseAdmin.from('users').insert([{ clerk_user_id, email: inv.email, name: inv.name || null, company }]);
  } else {
    await supabaseAdmin.from('users').update({ company }).eq('clerk_user_id', clerk_user_id);
  }

  return NextResponse.json({ ok: true });
}
