import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST() {
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

    // Filtrar por el usuario actual (necesitarías tener el customer_id asociado)
    // Por ahora, vamos a buscar por metadata o customer email
    const userSubscriptions = subscriptions.data.filter(sub => 
      sub.metadata.userId === userId || sub.metadata.clerk_user_id === userId
    )

    if (userSubscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Cancelar la primera suscripción activa
    const activeSubscription = userSubscriptions.find(sub => sub.status === 'active')
    
    if (!activeSubscription) {
      return NextResponse.json(
        { error: 'No active subscription to cancel' },
        { status: 404 }
      )
    }

    // Cancelar al final del período de facturación actual
    const canceledSubscription = await stripe.subscriptions.update(
      activeSubscription.id,
      {
        cancel_at_period_end: true,
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period',
      subscription_id: canceledSubscription.id
    })

  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}