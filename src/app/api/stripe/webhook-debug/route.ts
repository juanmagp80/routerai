import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const body = await request.text()
        const sig = headers().get('stripe-signature')
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

        console.log('=== WEBHOOK DEBUG ===')
        console.log('Received webhook at:', new Date().toISOString())
        console.log('Has signature:', !!sig)
        console.log('Has webhook secret:', !!webhookSecret)
        console.log('Body length:', body.length)
        console.log('Signature preview:', sig?.substring(0, 50) + '...')

        if (body.length > 0) {
            try {
                const parsed = JSON.parse(body)
                console.log('Event type:', parsed.type)
                console.log('Event id:', parsed.id)
                if (parsed.data?.object?.metadata) {
                    console.log('Metadata:', parsed.data.object.metadata)
                }
            } catch (e) {
                console.log('Could not parse body as JSON')
            }
        }
        console.log('=== END WEBHOOK DEBUG ===')

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