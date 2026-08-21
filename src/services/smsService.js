const SMS_API_URL = import.meta.env.VITE_SMS_API_URL || '/api/sms';

export async function checkSMSProviderStatus() {
    try {
        const response = await fetch(SMS_API_URL, { method: 'GET' });
        if (!response.ok) return { success: false, hasRealProvider: false };
        return await response.json();
    } catch (err) {
        console.warn('Failed to check SMS provider status:', err);
        return { success: false, hasRealProvider: false, error: err.message };
    }
}

export async function triggerSMS(payload) {
    if (!payload.to) {
        console.warn('SMS dispatch skipped: No recipient phone number provided');
        return { success: false, error: 'No phone number provided' };
    }

    try {
        const response = await fetch(SMS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to send SMS');
        }

        const data = await response.json();
        console.log('SMS sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Error sending SMS request:', error);
        return { success: false, error: error.message };
    }
}

export async function sendRegistrationConfirmationSMS(to, name) {
    return triggerSMS({ type: 'registration_confirmation', to, name });
}

export async function sendAccountApprovedSMS(to, name, role) {
    return triggerSMS({ type: 'account_approved', to, name, role });
}

export async function sendAccountRejectedSMS(to, name) {
    return triggerSMS({ type: 'account_rejected', to, name });
}

export async function sendAdminAlertSMS(user) {
    if (!user?.phone) return { success: false, error: 'Admin phone number not configured' };
    return triggerSMS({ type: 'admin_alert', to: user.phone, user });
}

export async function sendMessageNotificationSMS({ to, recipientName, senderName, subject, body }) {
    return triggerSMS({ type: 'message_notification', to, recipientName, senderName, subject, body });
}

export async function sendCoffeeReceivedSMS(to, name, { weight, grade, center, receiptNumber, pricePerKg, totalPrice }) {
    return triggerSMS({ type: 'coffee_received', to, name, weight, grade, center, receiptNumber, pricePerKg, totalPrice });
}

export async function sendCoffeeAcceptedSMS(to, name, { weight, grade, receiptNumber }) {
    return triggerSMS({ type: 'coffee_accepted', to, name, weight, grade, receiptNumber });
}

export async function sendPaymentReadySMS(to, name, { amount, receiptNumber, paymentMethod }) {
    return triggerSMS({ type: 'payment_ready', to, name, amount, receiptNumber, paymentMethod });
}

export async function sendPaymentCompletedSMS(to, name, { amount, receiptNumber }) {
    return triggerSMS({ type: 'payment_completed', to, name, amount, receiptNumber });
}

export async function sendPriceAnnouncementSMS(to, name, { prices, effectiveDate }) {
    return triggerSMS({ type: 'price_announcement', to, name, prices, effectiveDate });
}

export async function sendImportantNoticeSMS(to, name, { message }) {
    return triggerSMS({ type: 'important_notice', to, name, message });
}

export async function sendReminderSMS(to, name, { message }) {
    return triggerSMS({ type: 'reminder', to, name, message });
}
