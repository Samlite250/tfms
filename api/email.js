import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // CORS Headers for API calls
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

    const { type, to, name, role, user, recipientName, senderName, subject, body, weight, grade, center, receiptNumber, amount, paymentMethod, prices, effectiveDate, message } = req.body;
    console.log(`Email handler triggered: type=${type}, to=${to}`);

    if (!process.env.EMAIL_GMAIL_USER || !process.env.EMAIL_GMAIL_APP_PASSWORD) {
        return res.status(500).json({ error: 'Gmail credentials not configured on server' });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_GMAIL_USER,
            pass: process.env.EMAIL_GMAIL_APP_PASSWORD,
        },
    });

    const send = async (subject, html, recipient = to) => {
        const mailOptions = {
            from: `"COMS Notifications" <${process.env.EMAIL_GMAIL_USER}>`,
            to: recipient,
            subject,
            html,
        };
        return transporter.sendMail(mailOptions);
    };

    try {
        switch (type) {
            case 'registration_confirmation':
                await send(
                    'COMS Registration Received',
                    `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Welcome, ${name}!</h2>
            <p style="font-size: 16px; color: #334155; line-height: 1.5;">
              Thank you for signing up for the <strong>Coffee Factory Operation Management System (COMS)</strong>.
            </p>
            <p style="font-size: 16px; color: #334155; line-height: 1.5;">
              Your account registration has been received successfully. It is currently <strong>pending administrator approval</strong>. 
              You will receive another notification email once your account has been reviewed.
            </p>
            <div style="margin: 24px 0; padding: 16px; background-color: #f8fafc; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <span style="font-weight: 600; color: #b45309;">Registration Status: Pending Approval</span>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
              This email was sent automatically by COMS. Please do not reply to this email.
            </p>
          </div>`
                );
                break;

            case 'account_approved': {
                const formattedRole = role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                await send(
                    'COMS Account Approved',
                    `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #15803d; margin-top: 0;">Account Approved!</h2>
            <p style="font-size: 16px; color: #334155; line-height: 1.5;">
              Great news, ${name}! Your COMS account has been approved by the administrator.
            </p>
            <p style="font-size: 16px; color: #334155; line-height: 1.5;">
              You can now log in to the portal using your email and password.
            </p>
            <div style="margin: 24px 0; padding: 16px; background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 4px;">
              <p style="margin: 0; font-weight: 600; color: #15803d;">Role: ${formattedRole}</p>
              <p style="margin: 4px 0 0 0; font-weight: 600; color: #15803d;">Status: Active / Approved</p>
            </div>
            <a href="https://mahembefactory.vercel.app/login" style="display: inline-block; padding: 12px 24px; background-color: #2b6cb0; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Go to Login Portal
            </a>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
              This email was sent automatically by COMS. Please do not reply to this email.
            </p>
          </div>`
                );
                break;
            }

            case 'account_rejected':
                await send(
                    'COMS Registration Rejected',
                    `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #b91c1c; margin-top: 0;">Registration Rejected</h2>
            <p style="font-size: 16px; color: #334155; line-height: 1.5;">
              Hello ${name},
            </p>
            <p style="font-size: 16px; color: #334155; line-height: 1.5;">
              Your registration request for the Coffee Factory Operation Management System (COMS) has been rejected by the administrator.
            </p>
            <p style="font-size: 15px; color: #475569; line-height: 1.5;">
              If you believe this is a mistake, please reach out to your manager or factory contact.
            </p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
              This email was sent automatically by COMS. Please do not reply to this email.
            </p>
          </div>`
                );
                break;

            case 'admin_alert': {
                const formattedRole = user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const adminEmail = process.env.EMAIL_ADMIN || 'admin@mahembe-coffee.rw';
                await send(
                    'COMS Alert: New Pending Registration',
                    `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #2b6cb0; margin-top: 0;">New User Pending Approval</h2>
            <p style="font-size: 16px; color: #334155; line-height: 1.5;">
              A new user registration has been requested on the COMS platform and is awaiting approval:
            </p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: 600; color: #475569;">Name</td>
                <td style="padding: 10px 0; color: #0f172a;">${user.displayName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: 600; color: #475569;">Email</td>
                <td style="padding: 10px 0; color: #0f172a;">${user.email}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: 600; color: #475569;">Requested Role</td>
                <td style="padding: 10px 0; color: #0f172a;"><span style="background-color: #eff6ff; padding: 4px 8px; border-radius: 4px; font-size: 14px; font-weight: 500; color: #1d4ed8;">${formattedRole}</span></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: 600; color: #475569;">Phone</td>
                <td style="padding: 10px 0; color: #0f172a;">${user.phone || '—'}</td>
              </tr>
            </table>
            <a href="https://mahembefactory.vercel.app/admin" style="display: inline-block; padding: 12px 24px; background-color: #2b6cb0; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Review Pending Approvals
            </a>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
              This email was sent automatically by COMS. Please do not reply to this email.
            </p>
          </div>`,
                    adminEmail
                );
                break;
            }

            case 'message_notification':
                if (!to || !subject || !body) {
                    return res.status(400).json({ error: 'Recipient, subject, and message are required' });
                }
                await send(
                    `COMS: ${subject}`,
                    `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                      <h2 style="color: #1e3a8a; margin-top: 0;">New COMS Message</h2>
                      <p style="color: #334155;">Hello ${recipientName || 'there'},</p>
                      <p style="color: #334155;"><strong>${senderName || 'A COMS user'}</strong> sent you a message:</p>
                      <div style="white-space: pre-wrap; margin: 16px 0; padding: 16px; background: #f8fafc; border-radius: 8px; color: #334155;">${body}</div>
                      <p style="font-size: 12px; color: #64748b;">Please sign in to COMS to reply.</p>
                    </div>`
                );
                break;

            case 'coffee_received':
                await send(
                    `COMS: Coffee Received - ${receiptNumber}`,
                    `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                      <h2 style="color: #15803d; margin-top: 0;">Coffee Received</h2>
                      <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hello ${name}, your coffee delivery has been received.</p>
                      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Receipt #</td><td style="padding: 10px 0; color: #0f172a;">${receiptNumber}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Weight</td><td style="padding: 10px 0; color: #0f172a;">${weight} kg</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Grade</td><td style="padding: 10px 0; color: #0f172a;">${grade}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Collection Center</td><td style="padding: 10px 0; color: #0f172a;">${center}</td></tr>
                      </table>
                      <div style="margin: 24px 0; padding: 16px; background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 4px;"><span style="font-weight: 600; color: #15803d;">Status: Received - Pending Quality Check</span></div>
                      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                      <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">This email was sent automatically by COMS. Please do not reply to this email.</p>
                    </div>`
                );
                break;

            case 'coffee_accepted':
                await send(
                    `COMS: Coffee Accepted - ${receiptNumber}`,
                    `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                      <h2 style="color: #15803d; margin-top: 0;">Coffee Accepted</h2>
                      <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hello ${name}, your coffee delivery has been accepted.</p>
                      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Receipt #</td><td style="padding: 10px 0; color: #0f172a;">${receiptNumber}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Weight</td><td style="padding: 10px 0; color: #0f172a;">${weight} kg</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Grade</td><td style="padding: 10px 0; color: #0f172a;">${grade}</td></tr>
                      </table>
                      <div style="margin: 24px 0; padding: 16px; background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 4px;"><span style="font-weight: 600; color: #15803d;">Status: Accepted - Payment Will Be Processed</span></div>
                      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                      <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">This email was sent automatically by COMS. Please do not reply to this email.</p>
                    </div>`
                );
                break;

            case 'payment_ready':
                await send(
                    `COMS: Payment Ready - RWF ${(amount || 0).toLocaleString()}`,
                    `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                      <h2 style="color: #15803d; margin-top: 0;">Payment Ready</h2>
                      <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hello ${name}, your payment is ready for collection.</p>
                      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Amount</td><td style="padding: 10px 0; color: #0f172a; font-weight: 700; font-size: 18px;">RWF ${(amount || 0).toLocaleString()}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Receipt #</td><td style="padding: 10px 0; color: #0f172a;">${receiptNumber}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Payment Method</td><td style="padding: 10px 0; color: #0f172a;">${paymentMethod}</td></tr>
                      </table>
                      <div style="margin: 24px 0; padding: 16px; background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px;"><span style="font-weight: 600; color: #b45309;">Please collect your payment at the factory office.</span></div>
                      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                      <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">This email was sent automatically by COMS. Please do not reply to this email.</p>
                    </div>`
                );
                break;

            case 'payment_completed':
                await send(
                    `COMS: Payment Completed - RWF ${(amount || 0).toLocaleString()}`,
                    `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                      <h2 style="color: #15803d; margin-top: 0;">Payment Completed</h2>
                      <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hello ${name}, your payment has been completed.</p>
                      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Amount</td><td style="padding: 10px 0; color: #0f172a; font-weight: 700; font-size: 18px;">RWF ${(amount || 0).toLocaleString()}</td></tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">Receipt #</td><td style="padding: 10px 0; color: #0f172a;">${receiptNumber}</td></tr>
                      </table>
                      <div style="margin: 24px 0; padding: 16px; background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 4px;"><span style="font-weight: 600; color: #15803d;">Payment has been successfully processed. Thank you!</span></div>
                      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                      <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">This email was sent automatically by COMS. Please do not reply to this email.</p>
                    </div>`
                );
                break;

            case 'price_announcement': {
                let priceRows = '';
                if (prices && typeof prices === 'object') {
                    priceRows = Object.entries(prices).map(([grade, price]) =>
                        `<tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 0; font-weight: 600; color: #475569;">${grade}</td><td style="padding: 10px 0; color: #0f172a;">RWF ${(price || 0).toLocaleString()}/kg</td></tr>`
                    ).join('');
                }
                await send(
                    'COMS: New Coffee Prices Announced',
                    `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                      <h2 style="color: #2b6cb0; margin-top: 0;">Coffee Price Announcement</h2>
                      <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hello ${name}, the factory has announced new coffee prices.</p>
                      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                        <tr style="border-bottom: 2px solid #e2e8f0; background-color: #f8fafc;"><td style="padding: 10px 0; font-weight: 700; color: #1e293b;">Grade</td><td style="padding: 10px 0; font-weight: 700; color: #1e293b;">Price per kg (RWF)</td></tr>
                        ${priceRows}
                      </table>
                      <div style="margin: 24px 0; padding: 16px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;"><span style="font-weight: 600; color: #1d4ed8;">Effective from: ${effectiveDate || 'Immediately'}</span></div>
                      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                      <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">This email was sent automatically by COMS. Please do not reply to this email.</p>
                    </div>`
                );
                break;
            }

            case 'important_notice':
                await send(
                    'COMS: Important Notice',
                    `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                      <h2 style="color: #b91c1c; margin-top: 0;">Important Notice</h2>
                      <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hello ${name || 'there'},</p>
                      <div style="margin: 24px 0; padding: 16px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px;"><p style="font-size: 16px; color: #991b1b; line-height: 1.5; margin: 0;">${message || ''}</p></div>
                      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                      <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">This email was sent automatically by COMS. Please do not reply to this email.</p>
                    </div>`
                );
                break;

            case 'reminder':
                await send(
                    'COMS: Reminder',
                    `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                      <h2 style="color: #2b6cb0; margin-top: 0;">Reminder</h2>
                      <p style="font-size: 16px; color: #334155; line-height: 1.5;">Hello ${name || 'there'},</p>
                      <div style="margin: 24px 0; padding: 16px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;"><p style="font-size: 16px; color: #1e40af; line-height: 1.5; margin: 0;">${message || ''}</p></div>
                      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                      <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">This email was sent automatically by COMS. Please do not reply to this email.</p>
                    </div>`
                );
                break;

            default:
                return res.status(400).json({ error: `Unknown email type: ${type}` });
        }
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Failed to send email:', error);
        return res.status(500).json({ error: error.message || 'Failed to send email' });
    }
}
