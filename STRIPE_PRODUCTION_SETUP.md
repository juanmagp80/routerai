# ⚠️ INSTRUCCIONES PARA CONFIGURAR STRIPE EN PRODUCCIÓN

## 1. Reemplaza estas claves en tu archivo .env.local:

# Stripe Payment Integration - PRODUCCIÓN
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_TU_CLAVE_PUBLICA_DE_PRODUCCION
STRIPE_SECRET_KEY=sk_live_TU_CLAVE_SECRETA_DE_PRODUCCION
STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_DE_PRODUCCION

## 2. En stripe-service.ts, actualiza los priceId con los de producción:

export const stripeConfig: StripeConfig = {
    plans: {
        starter: {
            priceId: 'price_NUEVO_ID_STARTER_PRODUCCION', // Roulyx Starter - €39/mes
            name: 'Roulyx Starter',
            price: 39
        },
        pro: {
            priceId: 'price_NUEVO_ID_PRO_PRODUCCION', // Roulyx Pro - €79/mes
            name: 'Roulyx Pro',
            price: 79
        },
        enterprise: {
            priceId: 'price_NUEVO_ID_ENTERPRISE_PRODUCCION', // Roulyx Enterprise - €299/mes
            name: 'Roulyx Enterprise',
            price: 299
        }
    }
}

## 3. Configura webhooks en producción:
- URL: https://tu-dominio.com/api/stripe/webhook
- Eventos a escuchar:
  * checkout.session.completed
  * customer.subscription.updated
  * customer.subscription.deleted
  * invoice.payment_failed

## 4. Actualiza la versión de API si es necesario:
- Revisa que la versión '2025-09-30.clover' sea compatible
- O actualiza a la versión más reciente

## 5. TESTING IMPORTANTE:
- Prueba con una tarjeta real en pequeñas cantidades
- Verifica que los webhooks funcionen correctamente
- Confirma que los usuarios se actualicen correctamente en tu base de datos

¡NUNCA pongas las claves de producción en tu repositorio de GitHub!