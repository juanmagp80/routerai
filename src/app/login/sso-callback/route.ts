import { NextResponse } from 'next/server';

// Handles Clerk SSO callback requests that include query params like
// after_sign_in_url / after_sign_up_url / redirect_url so they don't 404.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const target = url.searchParams.get('after_sign_in_url') || url.searchParams.get('after_sign_up_url') || url.searchParams.get('redirect_url') || '/sign-in';
    return NextResponse.redirect(new URL(String(target), req.url));
  } catch {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
}

export async function POST(req: Request) {
  // For POST callbacks, do the same: redirect to provided URL if present.
  try {
    const url = new URL(req.url);
    const target = url.searchParams.get('after_sign_in_url') || url.searchParams.get('after_sign_up_url') || url.searchParams.get('redirect_url') || '/sign-in';
    return NextResponse.redirect(new URL(String(target), req.url));
  } catch {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
}
