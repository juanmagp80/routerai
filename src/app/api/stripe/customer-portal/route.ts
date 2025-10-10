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

    // Crear portal de cliente para gestionar suscripción
    const portalUrl = await StripeService.createCustomerPortal(
      userId,
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    )

    if (!portalUrl) {
      return NextResponse.json(
        { error: 'Failed to create customer portal' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      portalUrl
    })

  } catch (error) {
    console.error('Error creating customer portal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}