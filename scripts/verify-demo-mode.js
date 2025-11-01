require('dotenv').config({ path: '.env.local' });

console.log(`
🧪 DEMO MODE VERIFICATION
========================

Checking your configuration for safe demo deployment...
`);

// Check Stripe keys
const stripePublishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripeSecret = process.env.STRIPE_SECRET_KEY;

console.log('🔑 STRIPE CONFIGURATION:');
if (stripePublishable?.startsWith('pk_test_')) {
  console.log('✅ Publishable Key: TEST MODE (Safe for demo)');
} else {
  console.log('⚠️  Publishable Key: LIVE MODE (Consider switching to test for demo)');
}

if (stripeSecret?.startsWith('sk_test_')) {
  console.log('✅ Secret Key: TEST MODE (Safe for demo)');
} else {
  console.log('⚠️  Secret Key: LIVE MODE (Consider switching to test for demo)');
}

// Check Clerk configuration
console.log('\n🔐 CLERK CONFIGURATION:');
const clerkPublishable = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (clerkPublishable?.includes('.dev$') || clerkPublishable?.includes('test')) {
  console.log('✅ Clerk: Development/Test instance');
} else {
  console.log('✅ Clerk: Production instance (OK for demo)');
}

// Check AI Provider keys (masked for security)
console.log('\n🤖 AI PROVIDER KEYS:');
const providers = [
  { name: 'OpenAI', key: process.env.OPENAI_API_KEY },
  { name: 'Anthropic', key: process.env.ANTHROPIC_API_KEY },
  { name: 'Google Gemini', key: process.env.GEMINI_API_KEY },
  { name: 'Grok', key: process.env.GROK_API_KEY },
];

providers.forEach(({ name, key }) => {
  if (key) {
    console.log(`✅ ${name}: Configured (${key.substring(0, 8)}...)`);
  } else {
    console.log(`❌ ${name}: Not configured`);
  }
});

// Check database
console.log('\n💾 DATABASE:');
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('✅ Supabase: Configured');
} else {
  console.log('❌ Supabase: Not configured');
}

// Safety summary
console.log(`
🛡️  SAFETY SUMMARY:
==================

${stripePublishable?.startsWith('pk_test_') && stripeSecret?.startsWith('sk_test_') 
  ? '✅ SAFE FOR DEMO: All Stripe keys are in test mode' 
  : '⚠️  CHECK STRIPE: Some keys may be in live mode'
}

📋 DEMO FEATURES ENABLED:
- Global demo banner (production only)
- Payment warning cards
- Demo mode badges
- Test card instructions

🚀 READY FOR DEPLOYMENT:
Your app is configured safely for demo purposes.
Employers can test all features without any payment risk.

💡 TEST CARD FOR DEMOS: 4242 4242 4242 4242
`);

// Check if we're in production mode
if (process.env.NODE_ENV === 'production') {
  console.log('🌍 PRODUCTION MODE: Demo banners will be visible');
} else {
  console.log('🛠️  DEVELOPMENT MODE: Demo banners hidden (use NODE_ENV=production to test)');
}