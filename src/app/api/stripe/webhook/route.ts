import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { StripeService } from '@/lib/stripe-service'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = headers().get('stripe-signature')!

    if (!sig) {
      console.error('Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Manejar el evento con nuestro servicio
    await StripeService.handleWebhookEvent(event)

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}