import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Buscar todas las suscripciones del usuario
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
    })

    // Filtrar por el usuario actual
    const userSubscriptions = subscriptions.data.filter(sub => 
      sub.metadata.userId === userId || sub.metadata.clerk_user_id === userId
    )

    if (userSubscriptions.length === 0) {
      return NextResponse.json({
        hasSubscription: false,
        subscriptionStatus: null,
        cancelAtPeriodEnd: false
      })
    }

    // Buscar la suscripción activa
    const activeSubscription = userSubscriptions.find(sub => 
      sub.status === 'active' || sub.status === 'trialing'
    )

    if (!activeSubscription) {
      return NextResponse.json({
        hasSubscription: false,
        subscriptionStatus: 'inactive',
        cancelAtPeriodEnd: false
      })
    }

    return NextResponse.json({
      hasSubscription: true,
      subscriptionStatus: activeSubscription.status,
      cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
      subscriptionId: activeSubscription.id
    })

  } catch (error) {
    console.error('Error checking subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    )
  }
}