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

  try {
    // Check if real SMS Provider credentials are configured (Twilio, Africa's Talking, or Generic Gateway)
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (twilioSid && twilioAuthToken && twilioPhone) {
      // Twilio API Call
      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;

      const params = new URLSearchParams();
      params.append('To', to);
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

      return res.status(200).json({ success: true, provider: 'twilio', sid: responseData.sid, to, message: textMessage });
    }

    // Default mode: Simulated / Development SMS Logging Gateway
    console.log(`[SMS SIMULATOR] Sent SMS to ${to}: "${textMessage}"`);
    return res.status(200).json({
      success: true,
      provider: 'simulated',
      to,
      message: textMessage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return res.status(500).json({ error: error.message || 'Failed to send SMS' });
  }
}
