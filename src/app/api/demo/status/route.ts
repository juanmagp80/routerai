import { NextRequest, NextResponse } from 'next/server';
import { DemoLimitManager } from '@/lib/demo-limit-manager';

export async function GET() {
  try {
    const isDemoMode = DemoLimitManager.isDemoMode();
    
    return NextResponse.json({
      isDemoMode,
      environment: process.env.NODE_ENV,
      limits: isDemoMode ? {
        maxRequestsPerDay: 10,
        maxTotalRequestsPerDay: 100,
        maxMessageLength: 500,
        allowedModels: ['gpt-3.5-turbo', 'claude-3-haiku-20240307', 'gemini-1.5-flash', 'llama-3.1-8b-instant']
      } : null
    });
    
  } catch (error) {
    console.error('Error checking demo status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}