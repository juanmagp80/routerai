import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { StripeService } from '@/lib/stripe-service'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { plan } = body

    if (!plan || !['starter', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan specified' },
        { status: 400 }
      )
    }

    // URLs de success y cancel
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/admin/billing?success=true&plan=${plan}`
    const cancelUrl = `${baseUrl}/admin/billing?canceled=true`

    // Crear sesión de checkout
    const { url, sessionId } = await StripeService.createCheckoutSession(
      userId,
      plan,
      successUrl,
      cancelUrl
    )

    if (!url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      checkoutUrl: url,
      sessionId
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}