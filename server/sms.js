function normalizePhoneNumber(phone) {
    if (!phone) return '';
    let cleaned = String(phone).replace(/[\s\-\(\)]/g, '');

    if (/^7[2389]\d{7}$/.test(cleaned)) {
        return `+250${cleaned}`;
    }
    if (/^0[71]\d{8}$/.test(cleaned)) {
        return `+250${cleaned.substring(1)}`;
    }
    if (/^250\d{9}$/.test(cleaned)) {
        return `+${cleaned}`;
    }
    if (cleaned.startsWith('+')) {
        return cleaned;
    }
    if (/^\d{9,15}$/.test(cleaned)) {
        return `+${cleaned}`;
    }

    return cleaned;
}

export async function sendSMS(payload) {
    const {
        type,
        to,
        name,
        role,
        user,
        receiptNumber,
        weight,
        grade,
        center,
        amount,
        paymentMethod,
        prices,
        effectiveDate,
        message,
        senderName,
        body,
        pricePerKg,
        totalPrice
    } = payload;

    if (!to) {
        throw new Error('Phone number recipient (to) is required for SMS');
    }

    const formattedPhone = normalizePhoneNumber(to);
    console.log(`[SMS DISPATCH] Original: "${to}" -> Normalized: "${formattedPhone}"`);
    let textMessage = '';

    switch (type) {
        case 'registration_confirmation':
            textMessage = `Mahembe Factory: Hello ${name || 'User'}, your registration has been received and is pending admin approval. You will receive an SMS when approved.`;
            break;

        case 'account_approved': {
            const formattedRole = role ? role.replace(/_/g, ' ').toUpperCase() : 'USER';
            textMessage = `Mahembe Factory: Great news ${name || ''}! Your account has been APPROVED with role [${formattedRole}]. You can now sign in at https://mahembefactory.vercel.app/login`;
            break;
        }

        case 'account_rejected':
            textMessage = `Mahembe Factory: Hello ${name || ''}, your account registration request for Mahembe Coffee Factory has been rejected. Please contact factory management for assistance.`;
            break;

        case 'admin_alert': {
            const applicantName = user?.displayName || user?.name || name || 'Applicant';
            const rawRole = user?.role || role || 'User';
            const formattedRole = rawRole.replace(/_/g, ' ').toUpperCase();
            const phoneInfo = user?.phone || 'N/A';
            textMessage = `[Mahembe Factory] Admin Alert: New registration request from ${applicantName} (${formattedRole}, Phone: ${phoneInfo}). Review at https://mahembefactory.vercel.app/admin`;
            break;
        }

        case 'coffee_received': {
            const formattedTotal = totalPrice ? ` Total: RWF ${Number(totalPrice).toLocaleString()}.` : '';
            textMessage = `Mahembe Factory: Coffee delivery received! Receipt #${receiptNumber || 'N/A'}. Weight: ${weight}kg, Grade: ${grade || 'N/A'}, Center: ${center || 'Mahembe'}.${formattedTotal} Pending inspection.`;
            break;
        }

        case 'coffee_accepted':
            textMessage = `Mahembe Factory: Coffee delivery #${receiptNumber} (${weight}kg, Grade ${grade}) has passed quality check and is ACCEPTED. Payment will be processed soon.`;
            break;

        case 'payment_ready':
            textMessage = `Mahembe Factory: Payment of RWF ${Number(amount || 0).toLocaleString()} for Receipt #${receiptNumber} is READY for collection via ${paymentMethod || 'Office Cash/MoMo'}.`;
            break;

        case 'payment_completed':
            textMessage = `Mahembe Factory: Payment of RWF ${Number(amount || 0).toLocaleString()} for Receipt #${receiptNumber} has been COMPLETED. Thank you!`;
            break;

        case 'price_announcement':
            textMessage = `Mahembe Factory: New coffee prices announced effective ${effectiveDate || 'immediately'}. Please check Mahembe Factory portal for grade breakdown.`;
            break;

        case 'important_notice':
            textMessage = `Mahembe Factory Notice: ${message || 'Please check your Mahembe Factory portal for urgent updates.'}`;
            break;

        case 'reminder':
            textMessage = `Mahembe Factory Reminder: ${message || 'Friendly reminder from Mahembe Coffee Factory.'}`;
            break;

        case 'message_notification':
            textMessage = `Mahembe Factory Message from ${senderName || 'Staff'}: ${body ? (body.length > 100 ? body.substring(0, 97) + '...' : body) : 'You have a new message.'}`;
            break;

        default:
            textMessage = message || `Mahembe Factory Notification for ${name || 'User'}`;
    }

    const providerStatus = {
        africastalking: Boolean(process.env.AFRICASTALKING_API_KEY && process.env.AFRICASTALKING_USERNAME),
        twilio: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
        infobip: Boolean(process.env.INFOBIP_API_KEY && process.env.INFOBIP_BASE_URL),
        generic_gateway: Boolean(process.env.SMS_GATEWAY_URL),
    };

    const hasAnyRealProvider = Object.values(providerStatus).some(Boolean);

    const errors = [];

    // Provider 1: Twilio
    if (providerStatus.twilio) {
        try {
            const twilioSid = process.env.TWILIO_ACCOUNT_SID;
            const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
            const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

            const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
            const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;

            const params = new URLSearchParams();
            params.append('To', formattedPhone);
            params.append('From', twilioPhone);
            params.append('Body', textMessage);

            const twilioRes = await fetch(twilioUrl, {
                method: 'POST',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            });

            const responseData = await twilioRes.json();
            if (!twilioRes.ok) {
                throw new Error(responseData.message || 'Twilio SMS send failed');
            }

            return { success: true, provider: 'twilio', sid: responseData.sid, to: formattedPhone, message: textMessage };
        } catch (err) {
            console.error('Twilio dispatch error:', err.message);
            errors.push(`Twilio: ${err.message}`);
        }
    }

    // Provider 2: Africa's Talking
    if (providerStatus.africastalking) {
        try {
            const username = process.env.AFRICASTALKING_USERNAME || 'sandbox';
            const apiKey = process.env.AFRICASTALKING_API_KEY;
            const senderId = process.env.AFRICASTALKING_SENDER_ID || '';

            const atUrl = username === 'sandbox'
                ? 'https://api.sandbox.africastalking.com/version1/messaging'
                : 'https://api.africastalking.com/version1/messaging';

            const params = new URLSearchParams();
            params.append('username', username);
            params.append('to', formattedPhone);
            params.append('message', textMessage);
            if (senderId) params.append('from', senderId);

            const atRes = await fetch(atUrl, {
                method: 'POST',
                headers: {
                    'apiKey': apiKey,
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            });

            const atRaw = await atRes.text();
            let atData = {};
            try { atData = JSON.parse(atRaw); } catch { /* plain text response */ }

            if (!atRes.ok) {
                throw new Error(atData.errorMessage || atData.message || atRaw || 'Africa\'s Talking API request failed');
            }

            const recipients = atData?.SMSMessageData?.Recipients || [];
            const recipient = recipients[0] || {};
            const recipientStatus = recipient.status;
            const statusCode = recipient.statusCode;

            const isSuccess = recipientStatus === 'Success' || recipientStatus === 'Sent' || statusCode === 100 || statusCode === 101 || statusCode === 102;

            if (recipients.length > 0 && !isSuccess) {
                throw new Error(`Africa's Talking status: ${recipientStatus || 'Failed'} (Code ${statusCode || 'unknown'})`);
            }

            return {
                success: true,
                provider: 'africastalking',
                to: formattedPhone,
                message: textMessage,
                details: recipientStatus || 'Message sent',
                cost: recipient.cost || 'N/A'
            };
        } catch (err) {
            console.error('Africa\'s Talking dispatch error:', err.message);
            errors.push(`Africa's Talking: ${err.message}`);
        }
    }

    // Provider 3: Infobip
    if (providerStatus.infobip) {
        try {
            const baseUrl = process.env.INFOBIP_BASE_URL.replace(/^https?:\/\//, '');
            const apiKey = process.env.INFOBIP_API_KEY;
            const senderId = process.env.INFOBIP_SENDER_ID || 'COMS';

            const infobipRes = await fetch(`https://${baseUrl}/sms/2/text/single`, {
                method: 'POST',
                headers: {
                    'Authorization': `App ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    from: senderId,
                    to: formattedPhone,
                    text: textMessage,
                }),
            });

            const infobipData = await infobipRes.json();
            if (!infobipRes.ok) {
                throw new Error(infobipData.requestError?.serviceException?.text || 'Infobip SMS failed');
            }

            return {
                success: true,
                provider: 'infobip',
                to: formattedPhone,
                message: textMessage,
            };
        } catch (err) {
            console.error('Infobip dispatch error:', err.message);
            errors.push(`Infobip: ${err.message}`);
        }
    }

    // Provider 4: Generic Gateway
    if (providerStatus.generic_gateway) {
        try {
            const gatewayUrl = process.env.SMS_GATEWAY_URL;
            const apiKey = process.env.SMS_API_KEY || '';

            const gatewayRes = await fetch(gatewayUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
                },
                body: JSON.stringify({
                    to: formattedPhone,
                    message: textMessage,
                    sender: process.env.SMS_SENDER_ID || 'COMS',
                }),
            });

            const gatewayData = await gatewayRes.json().catch(() => ({}));
            if (!gatewayRes.ok) {
                throw new Error(gatewayData.error || gatewayData.message || 'Generic Gateway error');
            }

            return {
                success: true,
                provider: 'generic_gateway',
                to: formattedPhone,
                message: textMessage,
            };
        } catch (err) {
            console.error('Generic Gateway dispatch error:', err.message);
            errors.push(`Generic Gateway: ${err.message}`);
        }
    }

    // Default simulation mode (only when no real provider is configured)
    if (!hasAnyRealProvider) {
        console.log(`[SMS NOTICE] Real SMS not sent to ${formattedPhone} because no SMS provider credentials exist in process.env`);
        return {
            success: true,
            provider: 'simulated',
            isSimulated: true,
            to: formattedPhone,
            message: textMessage,
            notice: 'REAL SMS NOT DELIVERED to phone because SMS Gateway credentials (e.g. AFRICASTALKING_API_KEY or TWILIO_ACCOUNT_SID) are not set in environment variables on server.',
            timestamp: new Date().toISOString(),
        };
    }

    throw new Error(`Failed to deliver SMS via configured providers: ${errors.join('; ')}`);
}

