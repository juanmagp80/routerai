import { NextResponse } from 'next/server';

// Simple catch-all to redirect unknown clerk-related login paths to /sign-in
export async function GET(req: Request) {
  return NextResponse.redirect(new URL('/sign-in', req.url));
}

export async function POST(req: Request) {
  return NextResponse.redirect(new URL('/sign-in', req.url));
}
