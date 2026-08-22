import { sendSMS } from '../server/sms.js';
import fs from 'fs';

// Read .env file directly from current folder
try {
    const envPath = fs.existsSync('./.env') ? './.env' : '../.env';
    const envText = fs.readFileSync(envPath, 'utf8');
    envText.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim();
            if (key && !key.startsWith('#')) {
                process.env[key] = val;
            }
        }
    });
} catch (e) {
    console.warn('Could not load .env file:', e.message);
}

console.log('--- Africa\'s Talking Credentials Check ---');
console.log('Username:', process.env.AFRICASTALKING_USERNAME || '(not set)');
console.log('API Key:', process.env.AFRICASTALKING_API_KEY ? `${process.env.AFRICASTALKING_API_KEY.substring(0, 10)}...` : '(not set)');

const recipient = process.argv[2] || '0790268691';

console.log(`\nDispatching test SMS to recipient: ${recipient}...`);

sendSMS({
    type: 'admin_alert',
    to: recipient,
    user: { displayName: 'Live Verification Test', role: 'farmer', phone: recipient }
}).then((res) => {
    console.log('\n[SUCCESS] SMS Gateway Response:');
    console.log(JSON.stringify(res, null, 2));
}).catch((err) => {
    console.error('\n[FAILURE] SMS Gateway Error:');
    console.error(err.message);
});
