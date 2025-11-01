require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 VERIFICACIÓN DE CONFIGURACIÓN STRIPE\n' + '='.repeat(50));

// Verificar claves
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const secretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

console.log('📋 Estado actual:');
console.log(`Publishable Key: ${publishableKey ? publishableKey.substring(0, 12) + '...' : '❌ No encontrada'}`);
console.log(`Secret Key: ${secretKey ? secretKey.substring(0, 12) + '...' : '❌ No encontrada'}`);
console.log(`Webhook Secret: ${webhookSecret ? 'whsec_' + webhookSecret.substring(6, 18) + '...' : '❌ No encontrada'}`);

// Determinar el entorno
const isTestMode = publishableKey?.startsWith('pk_test_') || secretKey?.startsWith('sk_test_');
const isLiveMode = publishableKey?.startsWith('pk_live_') || secretKey?.startsWith('sk_live_');

console.log('\n🎯 Entorno detectado:');
if (isTestMode) {
    console.log('⚠️  MODO PRUEBA - Las transacciones no son reales');
    console.log('   Para pasar a producción, necesitas:');
    console.log('   1. Claves pk_live_ y sk_live_');
    console.log('   2. Nuevos Price IDs de productos de producción');
    console.log('   3. Webhook configurado en producción');
} else if (isLiveMode) {
    console.log('✅ MODO PRODUCCIÓN - Las transacciones son reales');
    console.log('   Asegúrate de que todo esté probado correctamente');
} else {
    console.log('❌ CONFIGURACIÓN INVÁLIDA - Revisa tus claves');
}

// Verificar Price IDs en el código
console.log('\n💰 Price IDs configurados en stripe-service.ts:');
console.log('   Starter: price_1SDp0o2ULfqKVBqVsydpZwiU');
console.log('   Pro: price_1SCLNc2ULfqKVBqVKXWa5Va4');
console.log('   Enterprise: price_1SCLO32ULfqKVBqV0CitIdp0');

if (isTestMode) {
    console.log('   ⚠️  Estos son Price IDs de prueba');
} else if (isLiveMode) {
    console.log('   ⚠️  Verifica que estos Price IDs sean de producción');
}

console.log('\n🚀 Próximos pasos:');
if (isTestMode) {
    console.log('1. Ve a tu dashboard de Stripe');
    console.log('2. Cambia a modo Live');
    console.log('3. Crea productos y precios en modo live');
    console.log('4. Actualiza las claves y Price IDs');
    console.log('5. Configura webhooks para producción');
} else if (isLiveMode) {
    console.log('1. Realiza pruebas con transacciones pequeñas');
    console.log('2. Verifica que los webhooks funcionen');
    console.log('3. Confirma actualizaciones de usuarios en BD');
}

console.log('\n' + '='.repeat(50));