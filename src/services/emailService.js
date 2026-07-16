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
