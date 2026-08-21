import express from 'express';
import cors from 'cors';
import { loadEnvFile } from 'node:process';
import {
    sendRegistrationConfirmation,
    sendAccountApproved,
    sendAccountRejected,
    sendAdminAlert
} from './email.js';
import { sendSMS } from './sms.js';

// Vite reads .env itself, while this standalone Node server does not.
// Load it only for local development; Vercel injects production variables.
try { loadEnvFile('.env'); } catch { /* .env is optional */ }

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/email', async (req, res) => {
    const { type, to, name, role, user } = req.body;
    console.log(`Received email request: type=${type}, to=${to}`);

    try {
        switch (type) {
            case 'registration_confirmation':
                await sendRegistrationConfirmation(to, name);
                break;
            case 'account_approved':
                await sendAccountApproved(to, name, role);
                break;
            case 'account_rejected':
                await sendAccountRejected(to, name);
                break;
            case 'admin_alert':
                const adminEmail = process.env.EMAIL_ADMIN || 'admin@mahembe-coffee.rw';
                await sendAdminAlert(adminEmail, user);
                break;
            default:
                return res.status(400).json({ error: `Unknown email type: ${type}` });
        }
        return res.json({ success: true });
    } catch (error) {
        console.error('Failed to send email:', error);
        return res.status(500).json({ error: error.message || 'Failed to send email' });
    }
});

app.get('/api/sms', (req, res) => {
    const providers = {
        africastalking: Boolean(process.env.AFRICASTALKING_API_KEY && process.env.AFRICASTALKING_USERNAME),
        twilio: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
        infobip: Boolean(process.env.INFOBIP_API_KEY && process.env.INFOBIP_BASE_URL),
        generic_gateway: Boolean(process.env.SMS_GATEWAY_URL),
    };
    const hasAnyRealProvider = Object.values(providers).some(Boolean);
    return res.json({
        success: true,
        hasRealProvider: hasAnyRealProvider,
        providers,
        message: hasAnyRealProvider
            ? 'Real SMS Gateway provider is configured.'
            : 'No real SMS provider credentials found in environment variables.',
    });
});

app.post('/api/sms', async (req, res) => {
    console.log(`Received SMS request: type=${req.body?.type}, to=${req.body?.to}`);
    try {
        const result = await sendSMS(req.body);
        return res.json(result);
    } catch (error) {
        console.error('Failed to send SMS:', error);
        return res.status(500).json({ error: error.message || 'Failed to send SMS' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`COMS Email Server running on port ${PORT}`);
});
