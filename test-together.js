const https = require('https');

const API_KEY = process.env.TOGETHER_API_KEY || '0249d7c3eab3bc24dcc3c1bb5aedfdfcbb1e18a869859a81d318f9197c49d682';

console.log('🔧 Testing Together API connectivity...');
console.log('🔑 API Key (first 20 chars):', API_KEY.substring(0, 20) + '...');

const testPayload = JSON.stringify({
    model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
    messages: [
        { role: 'user', content: 'Hello, respond with just "API working"' }
    ],
    max_tokens: 20,
    temperature: 0.1
});

const options = {
    hostname: 'api.together.xyz',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testPayload)
    },
    timeout: 30000 // 30 seconds timeout
};

console.log('🌐 Making request to:', options.hostname + options.path);

const req = https.request(options, (res) => {
    console.log('✅ Response status:', res.statusCode);
    console.log('📋 Response headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('📄 Response body:', data);
        try {
            const json = JSON.parse(data);
            if (json.choices && json.choices[0] && json.choices[0].message) {
                console.log('🎉 API Response:', json.choices[0].message.content);
            }
        } catch (e) {
            console.log('⚠️  Could not parse JSON response');
        }
    });
});

req.on('error', (err) => {
    console.error('❌ Request error:', err.message);
    console.error('🔍 Error code:', err.code);
});

req.on('timeout', () => {
    console.error('⏱️  Request timeout (30s)');
    req.destroy();
});

req.write(testPayload);
req.end();

console.log('⏳ Request sent, waiting for response...');