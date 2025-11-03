import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const sig = headers().get('stripe-signature')
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
        if (body.length > 0) {
            try {
                const parsed = JSON.parse(body)
                if (parsed.data?.object?.metadata) {
                }
            } catch {
            }
        }

        return NextResponse.json({
            debug: true,
            received: true,
            hasSignature: !!sig,
            hasSecret: !!webhookSecret,
            bodyLength: body.length
        })

    } catch (error) {
        console.error('Debug webhook error:', error)
        return NextResponse.json({ error: 'Debug webhook failed' }, { status: 500 })
    }
}