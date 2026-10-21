import { config } from '../config/env.js';
import { Setting } from '../models/Setting.js';

let nodemailer;
try {
  nodemailer = await import('nodemailer').then((m) => m.default || m);
} catch (e) {
  console.warn('[Mailer Warning] nodemailer module not yet loaded or installed, falling back to mock transporter.');
}

/**
 * Creates and returns the active Nodemailer transporter.
 * Prioritizes dynamic credentials stored in MongoDB Settings (configured via Admin Panel),
 * then falls back to environment variables in config.email, and lastly null (simulation).
 */
export const getTransporter = async (passedSettings = null) => {
  if (!nodemailer || config.nodeEnv === 'test') {
    return null;
  }

  // 1. Fetch settings from DB if not provided
  let settings = passedSettings;
  if (!settings) {
    try {
      settings = await Setting.findOne({ key: 'global_settings' }).lean();
    } catch {
      settings = null;
    }
  }

  // 2. Check if dynamic SMTP is configured in Admin Panel
  const dynamicSmtp = settings?.smtp;
  if (dynamicSmtp && dynamicSmtp.host && dynamicSmtp.user && dynamicSmtp.enabled !== false) {
    const port = Number(dynamicSmtp.port) || 465;
    const isSecure = Boolean(dynamicSmtp.secure) || port === 465;

    return nodemailer.createTransport({
      host: dynamicSmtp.host.trim(),
      port,
      secure: isSecure,
      auth: {
        user: dynamicSmtp.user.trim(),
        pass: dynamicSmtp.pass ? dynamicSmtp.pass.trim() : ''
      },
      tls: {
        rejectUnauthorized: false
      },
      requireTLS: dynamicSmtp.requireTls !== false
    });
  }

  // 3. Fallback to environment variables
  if (config.email.service) {
    return nodemailer.createTransport({
      service: config.email.service,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });
  }

  if (config.email.host && config.email.user) {
    return nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  return null;
};

/**
 * Builds HTML template for Admin Notification
 */
const buildAdminEmailHtml = (inquiry, settings) => {
  const brandName = settings?.websiteName || 'Supplimed';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Customer Enquiry - ${inquiry.reference}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #166534; padding: 28px 32px; color: #ffffff; }
    .header h1 { margin: 0 0 6px 0; font-size: 22px; font-weight: 800; }
    .header p { margin: 0; font-size: 13px; opacity: 0.9; }
    .body { padding: 32px; }
    .badge { display: inline-block; background: #dcfce7; color: #166534; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 6px; margin-bottom: 20px; }
    .field-row { margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
    .field-row:last-child { border-bottom: none; }
    .label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px; margin-bottom: 4px; }
    .value { font-size: 15px; font-weight: 600; color: #0f172a; word-break: break-word; }
    .message-box { background: #f8fafc; border-left: 4px solid #A3C065; padding: 16px; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #334155; margin-top: 6px; }
    .footer { background: #f1f5f9; padding: 18px 32px; font-size: 12px; color: #64748b; text-align: center; }
    .action-btn { display: inline-block; background: #166534; color: #ffffff !important; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 13px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${brandName} - New Sales Enquiry</h1>
      <p>A new potential client submitted an enquiry on the website.</p>
    </div>
    <div class="body">
      <div class="badge">Reference ID: ${inquiry.reference}</div>

      <div class="field-row">
        <div class="label">Customer Full Name</div>
        <div class="value">${inquiry.name}</div>
      </div>

      <div class="field-row">
        <div class="label">Email Address</div>
        <div class="value"><a href="mailto:${inquiry.email}" style="color: #166534; text-decoration: underline;">${inquiry.email}</a></div>
      </div>

      <div class="field-row">
        <div class="label">Phone / WhatsApp</div>
        <div class="value">${inquiry.phone || 'N/A'}</div>
      </div>

      <div class="field-row">
        <div class="label">Company / Institution</div>
        <div class="value">${inquiry.company || 'Not Specified'}</div>
      </div>

      <div class="field-row">
        <div class="label">Product / Service Interest</div>
        <div class="value" style="color: #166534; font-weight: 700;">${inquiry.interest || 'General Inquiry'}</div>
      </div>

      <div class="field-row">
        <div class="label">Customer Message & Requirements</div>
        <div class="message-box">${inquiry.message.replace(/\n/g, '<br/>')}</div>
      </div>

      <a href="mailto:${inquiry.email}?subject=RE: Supplimed Inquiry [Ref: ${inquiry.reference}]" class="action-btn">
        Reply to Customer Directly
      </a>
    </div>
    <div class="footer">
      This notification was generated automatically by the ${brandName} Online Portal.<br/>
      Received at: ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Builds HTML template for Customer Acknowledgment
 */
const buildCustomerEmailHtml = (inquiry, settings) => {
  const brandName = settings?.websiteName || 'Supplimed';
  const supportEmail = settings?.contactEmail || 'sales@supplimed.in';
  const phone = settings?.contactPhone || '+91 (123) 456-7890';
  const address = settings?.address || 'Noida, Uttar Pradesh, India';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>We Received Your Enquiry - ${inquiry.reference}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #166534; padding: 32px; color: #ffffff; text-align: center; }
    .header h1 { margin: 0 0 8px 0; font-size: 24px; font-weight: 800; }
    .header p { margin: 0; font-size: 14px; opacity: 0.95; }
    .body { padding: 32px; font-size: 15px; line-height: 1.6; color: #334155; }
    .greeting { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .ref-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center; }
    .ref-label { font-size: 12px; color: #166534; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .ref-code { font-size: 20px; font-weight: 800; color: #14532d; font-family: monospace; margin-top: 4px; }
    .summary-box { background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px; margin: 20px 0; }
    .summary-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
    .contact-box { background: #f1f5f9; padding: 16px; border-radius: 8px; margin-top: 24px; font-size: 13px; color: #475569; }
    .footer { background: #0f172a; padding: 20px 32px; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${brandName}</h1>
      <p>Precision Diagnostic Equipment & Medical Consumables</p>
    </div>
    <div class="body">
      <div class="greeting">Dear ${inquiry.name},</div>
      <p>
        Thank you for contacting <strong>${brandName}</strong>. We have received your inquiry and our clinical sales team is reviewing your requirements.
      </p>

      <div class="ref-card">
        <div class="ref-label">Your Tracking Reference Number</div>
        <div class="ref-code">${inquiry.reference}</div>
      </div>

      <div class="summary-box">
        <div class="summary-title">Summary of Your Request</div>
        <p style="margin: 4px 0;"><strong>Category / Interest:</strong> ${inquiry.interest || 'General Enquiry'}</p>
        <p style="margin: 4px 0;"><strong>Your Message:</strong> "${inquiry.message}"</p>
      </div>

      <p>
        One of our product specialists will reach out to you via email or phone within <strong>24 business hours</strong> with technical specifications, pricing, and sample availability.
      </p>

      <div class="contact-box">
        <strong>Need urgent assistance?</strong><br/>
        Email: <a href="mailto:${supportEmail}" style="color: #166534; font-weight: 600;">${supportEmail}</a><br/>
        Phone: ${phone}<br/>
        Facility: ${address}
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.<br/>
      ISO 13485:2016 & ISO 9001:2015 Certified Manufacturing
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Builds Plaintext template for Admin Notification (crucial for spam filters)
 */
const buildAdminEmailText = (inquiry, settings) => {
  const brandName = settings?.websiteName || 'Supplimed';
  return `
${brandName} - New Sales Enquiry
Reference ID: ${inquiry.reference}

Customer Name: ${inquiry.name}
Email Address: ${inquiry.email}
Phone Number: ${inquiry.phone || 'N/A'}
Organization/Company: ${inquiry.company || 'N/A'}
Product of Interest: ${inquiry.interest || 'General'}
Source: ${inquiry.source || 'Website'}

Customer Message:
${inquiry.message || 'No additional message provided.'}

Timestamp: ${new Date().toLocaleString()}
Please reply directly to ${inquiry.email} to contact this customer.
`;
};

/**
 * Builds Plaintext template for Customer Confirmation (crucial for spam filters)
 */
const buildCustomerEmailText = (inquiry, settings) => {
  const brandName = settings?.websiteName || 'Supplimed';
  const supportEmail = settings?.contactEmail || 'sales@supplimed.in';
  const phone = settings?.contactPhone || '+91 97622 10484';
  const address = settings?.address || 'Shop No-04, Sr No-1148, Bhairat Building, Near Datta Mandir, Bopodi, Pune';

  return `
Hello ${inquiry.name},

Thank you for contacting ${brandName}.
We have successfully received your product inquiry regarding "${inquiry.interest || 'our medical diagnostic products'}".

Your Enquiry Reference ID is: ${inquiry.reference}

Our technical sales team is reviewing your requirements and will reach out to you within 24 business hours.

Enquiry Summary:
- Reference: ${inquiry.reference}
- Name: ${inquiry.name}
- Product: ${inquiry.interest || 'General'}
- Message: ${inquiry.message || 'N/A'}

Need immediate assistance?
- Official Email: ${supportEmail}
- Support Phone: ${phone}
- Facility: ${address}

Sincerely,
${brandName} Technical Sales & Quality Assurance
ISO 13485:2016 Certified Manufacturing
`;
};

/**
 * Sends both Admin Notification and Customer Confirmation emails
 */
export const sendInquiryEmails = async ({ inquiry }) => {
  try {
    // 1. Fetch site settings for branding and recipient email
    const settings = await Setting.findOne({ key: 'global_settings' }).lean().catch(() => null);
    const adminRecipient = settings?.notificationEmail || settings?.contactEmail || config.email.adminEmail;

    const fromName = settings?.smtp?.fromName || settings?.websiteName || 'Supplimed';
    const fromEmail = settings?.smtp?.fromEmail || settings?.smtp?.user || config.email.from || settings?.contactEmail || 'support@supplimed.in';
    const sender = {
      name: fromName,
      address: fromEmail
    };

    const transporter = await getTransporter(settings);

    // Prepare email payloads with both text and html (multipart/alternative)
    const adminMailOptions = {
      from: sender,
      to: adminRecipient,
      replyTo: `"${inquiry.name}" <${inquiry.email}>`,
      subject: `[New Enquiry ${inquiry.reference}] ${inquiry.name} - ${inquiry.interest || 'Supplimed'}`,
      text: buildAdminEmailText(inquiry, settings),
      html: buildAdminEmailHtml(inquiry, settings),
      headers: {
        'X-Mailer': 'Supplimed-Mailer/1.0',
        'X-Entity-Ref-ID': inquiry.reference
      }
    };

    const customerMailOptions = {
      from: sender,
      to: inquiry.email,
      replyTo: adminRecipient,
      subject: `Thank you for contacting Supplimed [Ref: ${inquiry.reference}]`,
      text: buildCustomerEmailText(inquiry, settings),
      html: buildCustomerEmailHtml(inquiry, settings),
      headers: {
        'X-Mailer': 'Supplimed-Mailer/1.0',
        'X-Entity-Ref-ID': inquiry.reference
      }
    };

    if (transporter) {
      let adminSent = false;
      let customerSent = false;

      try {
        await transporter.sendMail(adminMailOptions);
        adminSent = true;
        console.log(`[Nodemailer] Admin notification sent successfully to ${adminRecipient} for ${inquiry.reference}`);
      } catch (adminErr) {
        console.error(`[Nodemailer Warning] Failed to send admin notification:`, adminErr?.message || adminErr);
      }

      try {
        await transporter.sendMail(customerMailOptions);
        customerSent = true;
        console.log(`[Nodemailer] Customer acknowledgment sent successfully to ${inquiry.email} for ${inquiry.reference}`);
      } catch (customerErr) {
        console.error(`[Nodemailer Warning] Failed to send customer acknowledgment:`, customerErr?.message || customerErr);
      }

      return {
        adminSent,
        customerSent
      };
    } else {
      // Mock / Dev fallback: Log cleanly so developers can inspect email output
      console.log(`\n================== [NODEMAILER SIMULATION (DEV MODE)] ==================`);
      console.log(`[ADMIN EMAIL TO]: ${adminRecipient}`);
      console.log(`[SUBJECT]: ${adminMailOptions.subject}`);
      console.log(`[CUSTOMER EMAIL TO]: ${inquiry.email}`);
      console.log(`[SUBJECT]: ${customerMailOptions.subject}`);
      console.log(`[ENQUIRY REFERENCE]: ${inquiry.reference}`);
      console.log(`Tip: Configure SMTP in Admin Panel > Settings > SMTP Settings for production delivery.`);
      console.log(`========================================================================\n`);

      return {
        adminSent: true,
        customerSent: true,
        simulated: true
      };
    }
  } catch (error) {
    console.error('[Nodemailer Error] Error processing inquiry emails:', error);
    return {
      adminSent: false,
      customerSent: false,
      error: error.message
    };
  }
};

/**
 * Validates and sends a live test email directly from the Admin Panel
 */
export const sendTestEmail = async ({ to, smtpConfig }) => {
  if (!nodemailer) {
    throw new Error('Nodemailer is not installed or available on the server.');
  }

  if (!smtpConfig || !smtpConfig.host || !smtpConfig.user) {
    throw new Error('SMTP Host and Username/Email are required to test connection.');
  }

  const port = Number(smtpConfig.port) || 587;
  const isSecure = Boolean(smtpConfig.secure) || port === 465;

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host.trim(),
    port,
    secure: isSecure,
    auth: {
      user: smtpConfig.user.trim(),
      pass: smtpConfig.pass ? smtpConfig.pass.trim() : ''
    },
    tls: {
      rejectUnauthorized: false
    },
    requireTLS: smtpConfig.requireTls !== false
  });

  // 1. Verify connection
  await transporter.verify();

  // 2. Send test email
  const fromName = smtpConfig.fromName || 'Supplimed Healthcare';
  const fromEmail = smtpConfig.fromEmail || smtpConfig.user;
  const recipient = to || smtpConfig.user;

  const textContent = `
Hello Administrator,

This is a live test email sent from Supplimed Management Panel to verify your custom SMTP and TLS mail configuration.

Configuration Details:
- SMTP Host: ${smtpConfig.host}
- Port: ${port}
- Security: ${isSecure ? 'SSL (Port 465)' : 'TLS / STARTTLS'}
- Authenticated User: ${smtpConfig.user}
- Sender Name: ${fromName}

If you are reading this email, your mail credentials and TLS transport are 100% operational.
All customer inquiries submitted on the website will be delivered to: ${recipient}.

Sent At: ${new Date().toLocaleString()}
Supplimed Management Panel
`;

  const mailOptions = {
    from: {
      name: fromName,
      address: fromEmail
    },
    to: recipient,
    subject: `Supplimed SMTP & TLS Verification Test [${new Date().toLocaleTimeString()}]`,
    text: textContent,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="background: #166534; padding: 20px; border-radius: 8px; color: #ffffff; text-align: center;">
          <h2 style="margin: 0;">SMTP &amp; TLS Verified Successfully!</h2>
          <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Supplimed Admin Email Configuration</p>
        </div>
        <div style="padding: 24px 8px; color: #334155; font-size: 14px; line-height: 1.6;">
          <p>Hello Administrator,</p>
          <p>Your custom SMTP and TLS mail settings have been verified and authenticated successfully with your mail server.</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 16px 0; font-size: 13px;">
            <p style="margin: 4px 0;"><strong>SMTP Host:</strong> ${smtpConfig.host}</p>
            <p style="margin: 4px 0;"><strong>Port:</strong> ${port}</p>
            <p style="margin: 4px 0;"><strong>Security:</strong> ${isSecure ? 'SSL (Port 465)' : 'TLS / STARTTLS'}</p>
            <p style="margin: 4px 0;"><strong>Authenticated User:</strong> ${smtpConfig.user}</p>
            <p style="margin: 4px 0;"><strong>Sender Name:</strong> ${fromName}</p>
          </div>
          <p>From now on, all incoming inquiries from the website will automatically notify you and send an instant acknowledgment to your customers.</p>
        </div>
        <div style="text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          Sent from Supplimed Management Panel
        </div>
      </div>
    `,
    headers: {
      'X-Mailer': 'Supplimed-Mailer/1.0',
      'X-Priority': '1 (Highest)'
    }
  };

  const info = await transporter.sendMail(mailOptions);
  return {
    success: true,
    messageId: info.messageId,
    recipient
  };
};

/**
 * Sends a 6-digit verification OTP email for Password Reset
 */
export const sendOtpResetEmail = async ({ to, name, otp }) => {
  try {
    const settings = await Setting.findOne({ key: 'global_settings' }).lean().catch(() => null);
    const brandName = settings?.websiteName || 'Supplimed';
    const fromName = settings?.smtp?.fromName || brandName;
    const fromEmail = settings?.smtp?.fromEmail || settings?.smtp?.user || config.email.from || 'support@supplimed.in';
    const senderFrom = `"${fromName}" <${fromEmail}>`;

    const transporter = await getTransporter(settings);

    const otpText = `
Hello ${name || 'Administrator'},

A request was received to reset the password for your ${brandName} administrator account (${to}).

Your 6-digit One-Time Password (OTP) is: ${otp}
This OTP is valid for the next 15 minutes.

If you did not request this, please ignore this email or contact security.

Sincerely,
${brandName} Portal Security
`;

    const mailOptions = {
      from: {
        name: fromName,
        address: fromEmail
      },
      to,
      subject: `${otp} is your ${brandName} Admin Password Reset OTP Code`,
      text: otpText,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Supplimed Password Reset OTP</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
    .header { background: #166534; padding: 28px 32px; color: #ffffff; text-align: center; }
    .header h1 { margin: 0 0 4px 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 0; font-size: 13px; opacity: 0.9; }
    .body { padding: 32px; font-size: 14px; line-height: 1.6; color: #334155; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .otp-card { background: #f0fdf4; border: 2px dashed #86efac; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
    .otp-code { font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #166534; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; margin: 8px 0; text-indent: 8px; }
    .otp-expiry { font-size: 12px; font-weight: 600; color: #15803d; }
    .alert-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #92400e; margin-top: 20px; }
    .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 32px; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${brandName} Portal Security</h1>
      <p>Administrator Account Verification</p>
    </div>
    <div class="body">
      <div class="greeting">Hello ${name || 'Administrator'},</div>
      <p>
        A request was received to reset the password for your <strong>${brandName}</strong> administrator account (${to}).
      </p>
      <p>Use the following 6-digit One-Time Password (OTP) to complete your password reset:</p>

      <div class="otp-card">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #166534; letter-spacing: 1px;">Verification OTP</div>
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">&#9200; Valid for the next 15 minutes</div>
      </div>

      <p>Enter this OTP in the admin login portal along with your new password to update your credentials.</p>

      <div class="alert-box">
        <strong>Security Notice:</strong> Never share this OTP with anyone. Supplimed staff will never ask for your password or verification codes. If you did not request this reset, your account is secure and you can safely ignore this email.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${brandName} Healthcare. ISO 13485:2016 Certified.<br/>
      This is an automated system security notification.
    </div>
  </div>
</body>
</html>
      `
    };

    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Nodemailer] OTP email sent successfully to ${to}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`\n================== [NODEMAILER OTP SIMULATION (DEV MODE)] ==================`);
      console.log(`[TO]: ${to}`);
      console.log(`[OTP CODE]: ${otp}`);
      console.log(`[VALID FOR]: 15 minutes`);
      console.log(`============================================================================\n`);
      return { success: true, simulated: true, otp };
    }
  } catch (error) {
    console.error('[Nodemailer Error] Failed to send OTP email:', error);
    throw error;
  }
};

/**
 * Sends a confirmation email after successful Password Reset
 */
export const sendPasswordChangedConfirmationEmail = async ({ to, name }) => {
  try {
    const settings = await Setting.findOne({ key: 'global_settings' }).lean().catch(() => null);
    const brandName = settings?.websiteName || 'Supplimed';
    const fromName = settings?.smtp?.fromName || brandName;
    const fromEmail = settings?.smtp?.fromEmail || settings?.smtp?.user || config.email.from || 'support@supplimed.in';

    const transporter = await getTransporter(settings);

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: `Your ${brandName} Admin Password Has Been Reset Successfully`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="background: #166534; padding: 20px; border-radius: 8px; color: #ffffff; text-align: center;">
            <h2 style="margin: 0;">Password Reset Complete</h2>
            <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">${brandName} Administration</p>
          </div>
          <div style="padding: 24px 8px; color: #334155; font-size: 14px; line-height: 1.6;">
            <p>Hello ${name || 'Administrator'},</p>
            <p>The password for your Supplimed account (<strong>${to}</strong>) was successfully updated via OTP verification at <strong>${new Date().toLocaleString()}</strong>.</p>
            <p>You can now sign in with your new password at the admin portal.</p>
            <p style="margin-top: 24px; font-size: 12px; color: #64748b;">
              If you did not perform this change, please contact technical support immediately at <a href="mailto:${fromEmail}">${fromEmail}</a>.
            </p>
          </div>
        </div>
      `
    };

    if (transporter) {
      await transporter.sendMail(mailOptions);
    }
    return { success: true };
  } catch (err) {
    console.warn('[Mailer Notice] Failed to send password changed confirmation email:', err.message);
    return { success: false, error: err.message };
  }
};
