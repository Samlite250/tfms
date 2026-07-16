import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_GMAIL_USER,
        pass: process.env.EMAIL_GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: `"COMS Notifications" <${process.env.EMAIL_GMAIL_USER}>`,
    to,
    subject,
    html,
  };
  return getTransporter().sendMail(mailOptions);
}

export async function sendRegistrationConfirmation(to, name) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
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
    </div>
  `;
  return sendEmail({ to, subject: 'COMS Registration Received', html });
}

export async function sendAccountApproved(to, name, role) {
  const formattedRole = role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
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
    </div>
  `;
  return sendEmail({ to, subject: 'COMS Account Approved', html });
}

export async function sendAccountRejected(to, name) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
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
    </div>
  `;
  return sendEmail({ to, subject: 'COMS Registration Rejected', html });
}

export async function sendAdminAlert(adminEmail, user) {
  const formattedRole = user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
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
    </div>
  `;
  return sendEmail({ to: adminEmail, subject: 'COMS Alert: New Pending Registration', html });
}
