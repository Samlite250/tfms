function normalizePhoneNumber(phone) {
  if (!phone) return '';
  // Remove spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // If Rwanda local number like 07XXXXXXXX (10 digits starting with 07)
  if (/^07\d{8}$/.test(cleaned)) {
    return `+250${cleaned.substring(1)}`;
  }
  // If Kenya local number like 07XXXXXXXX or 01XXXXXXXX
  if (/^(07|01)\d{8}$/.test(cleaned)) {
    return `+254${cleaned.substring(1)}`;
  }
  // If starts with 2507XXXXXXXX (missing +)
  if (/^2507\d{8}$/.test(cleaned)) {
    return `+${cleaned}`;
  }
  // If starts with + already
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  // Default prefix + if digits only
  if (/^\d{10,15}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return cleaned;
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check SMS Gateway configuration status via GET
  const providerStatus = {
    africastalking: Boolean(process.env.AFRICASTALKING_API_KEY && process.env.AFRICASTALKING_USERNAME),
    twilio: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER),
    infobip: Boolean(process.env.INFOBIP_API_KEY && process.env.INFOBIP_BASE_URL),
    generic_gateway: Boolean(process.env.SMS_GATEWAY_URL),
  };

  const hasAnyRealProvider = Object.values(providerStatus).some(Boolean);

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      hasRealProvider: hasAnyRealProvider,
      providers: providerStatus,
      message: hasAnyRealProvider
        ? 'Real SMS Gateway provider is configured.'
        : 'No real SMS provider credentials found in environment variables. Configure AFRICASTALKING_API_KEY or TWILIO_ACCOUNT_SID to enable real SMS delivery to phones.',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
  } = req.body;

  console.log(`SMS handler triggered: type=${type}, to=${to}`);

  if (!to) {
    return res.status(400).json({ error: 'Phone number recipient (to) is required for SMS' });
  }

  const formattedPhone = normalizePhoneNumber(to);
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
      return res.status(400).json({ error: `Unknown SMS notification type: ${type}` });
  }

  const errors = [];

  // Provider 1: Twilio (Instant Live Delivery to Verified Numbers / Upgraded Accounts)
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

      const twilioData = await twilioRes.json();
      if (!twilioRes.ok) {
        throw new Error(twilioData.message || 'Twilio SMS send failed');
      }

      console.log(`[SMS SUCCESS] Twilio delivered SMS to ${formattedPhone}, SID: ${twilioData.sid}`);
      return res.status(200).json({
        success: true,
        provider: 'twilio',
        sid: twilioData.sid,
        to: formattedPhone,
        message: textMessage,
      });
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

      const atUrl = 'https://api.africastalking.com/version1/messaging';

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

      const atData = await atRes.json();
      if (!atRes.ok) {
        throw new Error(atData.errorMessage || atData.message || 'Africa\'s Talking API request failed');
      }

      const recipients = atData?.SMSMessageData?.Recipients || [];
      const recipientStatus = recipients[0]?.status;

      return res.status(200).json({
        success: true,
        provider: 'africastalking',
        to: formattedPhone,
        message: textMessage,
        details: recipientStatus || 'Message sent',
      });
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

      return res.status(200).json({
        success: true,
        provider: 'infobip',
        to: formattedPhone,
        message: textMessage,
      });
    } catch (err) {
      console.error('Infobip dispatch error:', err.message);
      errors.push(`Infobip: ${err.message}`);
    }
  }

  // Provider 4: Generic SMS Webhook API
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
        throw new Error(gatewayData.error || gatewayData.message || 'Generic SMS Gateway returned error');
      }

      return res.status(200).json({
        success: true,
        provider: 'generic_gateway',
        to: formattedPhone,
        message: textMessage,
      });
    } catch (err) {
      console.error('Generic Gateway dispatch error:', err.message);
      errors.push(`Generic Gateway: ${err.message}`);
    }
  }

  // If no provider succeeded or no provider is configured
  if (!hasAnyRealProvider) {
    console.warn(`[SMS NOTICE] Real SMS not sent to ${formattedPhone} because no SMS Provider environment variables are set on Vercel/server.`);
    return res.status(200).json({
      success: true,
      provider: 'simulated',
      isSimulated: true,
      to: formattedPhone,
      message: textMessage,
      notice: 'REAL SMS NOT DELIVERED to phone because SMS Gateway credentials (e.g. AFRICASTALKING_API_KEY or TWILIO_ACCOUNT_SID) are not set in environment variables on Vercel.',
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(500).json({
    success: false,
    error: `Failed to deliver SMS via configured providers: ${errors.join('; ')}`,
  });
}
