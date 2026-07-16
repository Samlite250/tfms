import express from 'express';
import cors from 'cors';
import { loadEnvFile } from 'node:process';
import {
    sendRegistrationConfirmation,
    sendAccountApproved,
    sendAccountRejected,
    sendAdminAlert
} from './email.js';

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

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`COMS Email Server running on port ${PORT}`);
});
