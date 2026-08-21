import dotenv from 'dotenv';
dotenv.config();

export async function sendSMS({ type, to, name, role, user, receiptNumber, weight, grade, center, amount, paymentMethod, prices, effectiveDate, message, senderName, body, pricePerKg, totalPrice }) {
    if (!to) {
        throw new Error('Recipient phone number (to) is required for SMS');
    }

    let textMessage = '';

    switch (type) {
        case 'registration_confirmation':
            textMessage = `COMS: Hello ${name || 'User'}, your registration has been received and is pending admin approval. You will receive an SMS when approved.`;
            break;

        case 'account_approved': {
            const formattedRole = role ? role.replace(/_/g, ' ').toUpperCase() : 'USER';
            textMessage = `COMS: Great news ${name || ''}! Your account has been APPROVED with role [${formattedRole}]. You can now sign in at https://mahembefactory.vercel.app/login`;
            break;
        }

        case 'account_rejected':
            textMessage = `COMS: Hello ${name || ''}, your account registration request for COMS has been rejected. Please contact factory management for assistance.`;
            break;

        case 'admin_alert':
            textMessage = `COMS Admin Alert: New registration request from ${user?.displayName || name} (${user?.role || 'User'}). Review at https://mahembefactory.vercel.app/admin`;
            break;

        case 'coffee_received': {
            const formattedTotal = totalPrice ? ` Total: RWF ${Number(totalPrice).toLocaleString()}.` : '';
            textMessage = `COMS: Coffee delivery received! Receipt #${receiptNumber || 'N/A'}. Weight: ${weight}kg, Grade: ${grade || 'N/A'}, Center: ${center || 'Mahembe'}.${formattedTotal} Pending inspection.`;
            break;
        }

        case 'coffee_accepted':
            textMessage = `COMS: Coffee delivery #${receiptNumber} (${weight}kg, Grade ${grade}) has passed quality check and is ACCEPTED. Payment will be processed soon.`;
            break;

        case 'payment_ready':
            textMessage = `COMS: Payment of RWF ${Number(amount || 0).toLocaleString()} for Receipt #${receiptNumber} is READY for collection via ${paymentMethod || 'Office Cash/MoMo'}.`;
            break;

        case 'payment_completed':
            textMessage = `COMS: Payment of RWF ${Number(amount || 0).toLocaleString()} for Receipt #${receiptNumber} has been COMPLETED. Thank you!`;
            break;

        case 'price_announcement':
            textMessage = `COMS: New coffee prices announced effective ${effectiveDate || 'immediately'}. Please check COMS portal for grade breakdown.`;
            break;

        case 'important_notice':
            textMessage = `COMS Important Notice: ${message || 'Please check your COMS portal for urgent updates.'}`;
            break;

        case 'reminder':
            textMessage = `COMS Reminder: ${message || 'Friendly reminder from Mahembe Coffee Factory.'}`;
            break;

        case 'message_notification':
            textMessage = `COMS Message from ${senderName || 'Staff'}: ${body ? (body.length > 100 ? body.substring(0, 97) + '...' : body) : 'You have a new message.'}`;
            break;

        default:
            throw new Error(`Unknown SMS notification type: ${type}`);
    }

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (twilioSid && twilioAuthToken && twilioPhone) {
        const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;

        const params = new URLSearchParams();
        params.append('To', to);
        params.append('From', twilioPhone);
        params.append('Body', textMessage);

        const response = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || 'Twilio SMS send failed');
        }
        return { success: true, provider: 'twilio', sid: responseData.sid, to, message: textMessage };
    }

    console.log(`[SMS SIMULATOR] Sent SMS to ${to}: "${textMessage}"`);
    return {
        success: true,
        provider: 'simulated',
        to,
        message: textMessage,
        timestamp: new Date().toISOString(),
    };
}
