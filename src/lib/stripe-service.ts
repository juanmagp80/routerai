import Stripe from 'stripe'
import { PlanLimitsService } from './plan-limits-service'
import { supabase } from './supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-09-30.clover'
})

export interface StripeConfig {
    plans: {
        [key: string]: {
            priceId: string
            name: string
            price: number
        }
    }
}

export const stripeConfig: StripeConfig = {
    plans: {
        starter: {
            priceId: 'price_1SDp0o2ULfqKVBqVsydpZwiU', // Roulyx Starter - €39/mes
            name: 'Roulyx Starter',
            price: 39
        },
        pro: {
            priceId: 'price_1SCLNc2ULfqKVBqVKXWa5Va4', // Roulyx Pro - €79/mes
            name: 'Roulyx Pro',
            price: 79
        },
        enterprise: {
            priceId: 'price_1SCLO32ULfqKVBqV0CitIdp0', // Roulyx Enterprise - €299/mes
            name: 'Roulyx Enterprise',
            price: 299
        }
    }
}

export class StripeService {
    // Crear customer en Stripe
    static async createCustomer(userId: string, email: string, name: string): Promise<string | null> {
        try {
            const customer = await stripe.customers.create({
                email,
                name,
                metadata: {
                    userId
                }
            })

            // Guardar customer ID en nuestra base de datos
            await supabase
                .from('users')
                .update({ stripe_customer_id: customer.id })
                .eq('id', userId)

            return customer.id
        } catch (error) {
            console.error('Error creating Stripe customer:', error)
            return null
        }
    }

    // Obtener o crear customer
    static async getOrCreateCustomer(userId: string): Promise<string | null> {
        try {
            // Verificar si ya tiene customer ID
            const { data: user, error } = await supabase
                .from('users')
                .select('stripe_customer_id, email, name')
                .eq('id', userId)
                .single()

            if (error || !user) {
                console.error('Error fetching user:', error)
                return null
            }

            if (user.stripe_customer_id) {
                return user.stripe_customer_id
            }

            // Crear nuevo customer
            return await this.createCustomer(userId, user.email, user.name)
        } catch (error) {
            console.error('Error in getOrCreateCustomer:', error)
            return null
        }
    }

    // Crear sesión de checkout para upgrade
    static async createCheckoutSession(
        userId: string,
        planName: string,
        successUrl: string,
        cancelUrl: string
    ): Promise<{ url: string | null, sessionId: string | null }> {
        try {
            const planConfig = stripeConfig.plans[planName]
            if (!planConfig) {
                throw new Error(`Plan ${planName} not found`)
            }

            const customerId = await this.getOrCreateCustomer(userId)
            if (!customerId) {
                throw new Error('Could not create or get customer')
            }

            const session = await stripe.checkout.sessions.create({
                customer: customerId,
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: planConfig.priceId,
                        quantity: 1
                    }
                ],
                mode: 'subscription',
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    userId,
                    planName
                },
                subscription_data: {
                    metadata: {
                        userId,
                        planName
                    }
                }
            })

            return {
                url: session.url,
                sessionId: session.id
            }
        } catch (error) {
            console.error('Error creating checkout session:', error)
            return { url: null, sessionId: null }
        }
    }

    // Crear portal de customer para gestionar suscripción
    static async createCustomerPortalSession(userId: string, returnUrl: string): Promise<string | null> {
        try {
            const customerId = await this.getOrCreateCustomer(userId)
            if (!customerId) {
                return null
            }

            const session = await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: returnUrl
            })

            return session.url
        } catch (error) {
            console.error('Error creating customer portal session:', error)
            return null
        }
    }

    // Actualizar plan del usuario después de pago exitoso
    static async updateUserPlan(userId: string, planName: string, subscriptionId: string): Promise<boolean> {
        try {
            // Obtener límites del nuevo plan
            const planLimits = await PlanLimitsService.getPlanLimits(planName)
            if (!planLimits) {
                console.error(`Plan limits not found for ${planName}`)
                return false
            }

            // Actualizar usuario con nuevo plan
            const { error } = await supabase
                .from('users')
                .update({
                    plan: planName,
                    api_key_limit: planLimits.api_key_limit,
                    stripe_subscription_id: subscriptionId,
                    free_trial_expires_at: null, // Remover expiración de prueba
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)

            if (error) {
                console.error('Error updating user plan:', error)
                return false
            }

            console.log(`✅ User ${userId} upgraded to ${planName} plan`)
            return true
        } catch (error) {
            console.error('Error in updateUserPlan:', error)
            return false
        }
    }

    // Manejar evento de webhook de Stripe
    static async handleWebhookEvent(event: Stripe.Event): Promise<boolean> {
        try {
            switch (event.type) {
                case 'checkout.session.completed':
                    return await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)

                case 'customer.subscription.updated':
                    return await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)

                case 'customer.subscription.deleted':
                    return await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)

                case 'invoice.payment_failed':
                    return await this.handlePaymentFailed(event.data.object as Stripe.Invoice)

                default:
                    console.log(`Unhandled webhook event type: ${event.type}`)
                    return true
            }
        } catch (error) {
            console.error('Error handling webhook event:', error)
            return false
        }
    }

    // Manejar checkout completado
    private static async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<boolean> {
        try {
            const userId = session.metadata?.userId
            const planName = session.metadata?.planName

            if (!userId || !planName) {
                console.error('Missing userId or planName in checkout session metadata')
                return false
            }

            if (session.subscription) {
                const subscriptionId = typeof session.subscription === 'string'
                    ? session.subscription
                    : session.subscription.id

                return await this.updateUserPlan(userId, planName, subscriptionId)
            }

            return false
        } catch (error) {
            console.error('Error in handleCheckoutCompleted:', error)
            return false
        }
    }

    // Manejar actualización de suscripción
    private static async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<boolean> {
        try {
            const userId = subscription.metadata?.userId
            if (!userId) {
                console.error('Missing userId in subscription metadata')
                return false
            }

            // Verificar si la suscripción está activa
            if (subscription.status !== 'active') {
                // Si no está activa, degradar a plan free
                return await this.downgradeToFree(userId)
            }

            return true
        } catch (error) {
            console.error('Error in handleSubscriptionUpdated:', error)
            return false
        }
    }

    // Manejar suscripción cancelada
    private static async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<boolean> {
        try {
            const userId = subscription.metadata?.userId
            if (!userId) {
                console.error('Missing userId in subscription metadata')
                return false
            }

            return await this.downgradeToFree(userId)
        } catch (error) {
            console.error('Error in handleSubscriptionDeleted:', error)
            return false
        }
    }

    // Manejar fallo de pago
    private static async handlePaymentFailed(invoice: Stripe.Invoice): Promise<boolean> {
        try {
            // Aquí podrías enviar una notificación al usuario sobre el fallo de pago
            console.log(`Payment failed for invoice ${invoice.id}`)
            return true
        } catch (error) {
            console.error('Error in handlePaymentFailed:', error)
            return false
        }
    }

    // Degradar usuario a plan free
    private static async downgradeToFree(userId: string): Promise<boolean> {
        try {
            const freeLimits = await PlanLimitsService.getPlanLimits('free')
            if (!freeLimits) {
                console.error('Free plan limits not found')
                return false
            }

            const { error } = await supabase
                .from('users')
                .update({
                    plan: 'free',
                    api_key_limit: freeLimits.api_key_limit,
                    stripe_subscription_id: null,
                    free_trial_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días más
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)

            if (error) {
                console.error('Error downgrading user to free:', error)
                return false
            }

            console.log(`⬇️ User ${userId} downgraded to free plan`)
            return true
        } catch (error) {
            console.error('Error in downgradeToFree:', error)
            return false
        }
    }

    // Obtener información de suscripción del usuario
    static async getUserSubscription(userId: string) {
        try {
            const { data: user, error } = await supabase
                .from('users')
                .select('stripe_customer_id, stripe_subscription_id, plan')
                .eq('id', userId)
                .single()

            if (error || !user) {
                return null
            }

            if (!user.stripe_subscription_id) {
                return { plan: user.plan, status: 'none' }
            }

            const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id)

            return {
                plan: user.plan,
                status: subscription.status,
                currentPeriodEnd: (subscription as unknown as { current_period_end: number }).current_period_end * 1000,
                cancelAtPeriodEnd: (subscription as unknown as { cancel_at_period_end: boolean }).cancel_at_period_end
            }
        } catch (error) {
            console.error('Error getting user subscription:', error)
            return null
        }
    }
}