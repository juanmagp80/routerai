import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        console.log('🔍 DEBUG: Webhook received at', new Date().toISOString());
        
        // Log all headers
        const headers = req.headers;
        console.log('🔍 Headers:', Object.fromEntries(headers.entries()));
        
        // Log the body
        const body = await req.text();
        console.log('🔍 Body:', body);
        
        // Try to parse as JSON
        try {
            const jsonBody = JSON.parse(body);
            console.log('🔍 Parsed JSON:', JSON.stringify(jsonBody, null, 2));
        } catch (e) {
            console.log('🔍 Body is not valid JSON');
        }
        
        return NextResponse.json({
            success: true,
            message: 'Debug webhook received',
            timestamp: new Date().toISOString(),
            headers: Object.fromEntries(headers.entries()),
            body: body
        });
    } catch (error) {
        console.error('🔍 Debug webhook error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Debug webhook endpoint is active',
        timestamp: new Date().toISOString()
    });
}