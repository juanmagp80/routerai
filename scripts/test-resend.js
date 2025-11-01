require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

async function testResendConfiguration() {
  console.log('🔍 Testing Resend configuration...');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Test 1: Check API key validity
    console.log('1️⃣ Testing API key validity...');

    const testEmail = {
      from: 'onboarding@resend.dev', // Resend's default verified domain
      to: ['delivered@resend.dev'], // Resend's test email
      subject: 'Test Email from RouterAI',
      html: '<p>This is a test email to verify Resend configuration.</p>'
    };

    const { data, error } = await resend.emails.send(testEmail);

    if (error) {
      console.error('❌ Error sending test email:', error);

      if (error.message.includes('domain is not verified')) {
        console.log('\n📋 SOLUTION FOR DOMAIN VERIFICATION:');
        console.log('1. Go to https://resend.com/domains');
        console.log('2. Add your domain: roulyx.com');
        console.log('3. Add the required DNS records:');
        console.log('   - TXT record for verification');
        console.log('   - MX record for receiving emails');
        console.log('   - DKIM records for authentication');
        console.log('\n🔧 FOR DEVELOPMENT: Using onboarding@resend.dev (should work)');
      }
    } else {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Message ID:', data?.id);
    }

    // Test 2: List domains (if possible)
    console.log('\n2️⃣ Checking available domains...');
    try {
      // Note: This might not be available in all Resend plans
      const domains = await resend.domains.list();
      console.log('📁 Available domains:', domains);
    } catch (domainError) {
      console.log('ℹ️ Could not list domains (may not be available in your plan)');
    }

  } catch (generalError) {
    console.error('❌ General error testing Resend:', generalError);
  }
}

testResendConfiguration();