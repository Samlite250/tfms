const EMAIL_API_URL = import.meta.env.VITE_EMAIL_API_URL || '/api/email';

export async function triggerEmail(payload) {
    try {
        const response = await fetch(EMAIL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to send email');
        }
        return await response.json();
    } catch (error) {
        console.error('Error sending email request:', error);
        return { success: false, error: error.message };
    }
}

export async function sendRegistrationConfirmation(to, name) {
    return triggerEmail({ type: 'registration_confirmation', to, name });
}

export async function sendAccountApproved(to, name, role) {
    return triggerEmail({ type: 'account_approved', to, name, role });
}

export async function sendAccountRejected(to, name) {
    return triggerEmail({ type: 'account_rejected', to, name });
}

export async function sendAdminAlert(user) {
    return triggerEmail({ type: 'admin_alert', user });
}

export async function sendMessageNotification({ to, recipientName, senderName, subject, body }) {
    return triggerEmail({ type: 'message_notification', to, recipientName, senderName, subject, body });
}

export async function sendCoffeeReceivedEmail(to, name, { weight, grade, center, receiptNumber }) {
    return triggerEmail({ type: 'coffee_received', to, name, weight, grade, center, receiptNumber });
}

export async function sendCoffeeAcceptedEmail(to, name, { weight, grade, receiptNumber }) {
    return triggerEmail({ type: 'coffee_accepted', to, name, weight, grade, receiptNumber });
}

export async function sendPaymentReadyEmail(to, name, { amount, receiptNumber, paymentMethod }) {
    return triggerEmail({ type: 'payment_ready', to, name, amount, receiptNumber, paymentMethod });
}

export async function sendPaymentCompletedEmail(to, name, { amount, receiptNumber }) {
    return triggerEmail({ type: 'payment_completed', to, name, amount, receiptNumber });
}

export async function sendPriceAnnouncementEmail(to, name, { prices, effectiveDate }) {
    return triggerEmail({ type: 'price_announcement', to, name, prices, effectiveDate });
}

export async function sendImportantNoticeEmail(to, name, { message }) {
    return triggerEmail({ type: 'important_notice', to, name, message });
}

export async function sendReminderEmail(to, name, { message }) {
    return triggerEmail({ type: 'reminder', to, name, message });
}
