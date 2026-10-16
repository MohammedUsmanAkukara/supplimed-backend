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
 * If credentials are not set, falls back to logging emails to the console.
 */
export const getTransporter = async () => {
  if (!nodemailer) {
    return null;
  }

  // Check if custom SMTP service or host is provided
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
 * Sends both Admin Notification and Customer Confirmation emails
 */
export const sendInquiryEmails = async ({ inquiry }) => {
  try {
    // 1. Fetch site settings for branding and recipient email
    const settings = await Setting.findOne({ key: 'global_settings' }).lean().catch(() => null);
    const adminRecipient = settings?.notificationEmail || settings?.contactEmail || config.email.adminEmail;
    const senderFrom = `"${settings?.websiteName || 'Supplimed'}" <${config.email.from}>`;

    const transporter = await getTransporter();

    // Prepare email payloads
    const adminMailOptions = {
      from: senderFrom,
      to: adminRecipient,
      replyTo: `"${inquiry.name}" <${inquiry.email}>`,
      subject: `[New Enquiry ${inquiry.reference}] ${inquiry.name} - ${inquiry.interest || 'Supplimed'}`,
      html: buildAdminEmailHtml(inquiry, settings)
    };

    const customerMailOptions = {
      from: senderFrom,
      to: inquiry.email,
      replyTo: adminRecipient,
      subject: `Thank you for contacting Supplimed [Ref: ${inquiry.reference}]`,
      html: buildCustomerEmailHtml(inquiry, settings)
    };

    if (transporter) {
      // Send both emails in parallel
      const results = await Promise.allSettled([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(customerMailOptions)
      ]);

      const adminResult = results[0];
      const customerResult = results[1];

      if (adminResult.status === 'fulfilled') {
        console.log(`[Nodemailer] Admin notification sent successfully to ${adminRecipient} for ${inquiry.reference}`);
      } else {
        console.warn(`[Nodemailer Warning] Failed to send admin notification:`, adminResult.reason?.message || adminResult.reason);
      }

      if (customerResult.status === 'fulfilled') {
        console.log(`[Nodemailer] Customer acknowledgment sent successfully to ${inquiry.email} for ${inquiry.reference}`);
      } else {
        console.warn(`[Nodemailer Warning] Failed to send customer acknowledgment:`, customerResult.reason?.message || customerResult.reason);
      }

      return {
        adminSent: adminResult.status === 'fulfilled',
        customerSent: customerResult.status === 'fulfilled'
      };
    } else {
      // Mock / Dev fallback: Log cleanly so developers can inspect email output
      console.log(`\n================== [NODEMAILER SIMULATION (DEV MODE)] ==================`);
      console.log(`[ADMIN EMAIL TO]: ${adminRecipient}`);
      console.log(`[SUBJECT]: ${adminMailOptions.subject}`);
      console.log(`[CUSTOMER EMAIL TO]: ${inquiry.email}`);
      console.log(`[SUBJECT]: ${customerMailOptions.subject}`);
      console.log(`[ENQUIRY REFERENCE]: ${inquiry.reference}`);
      console.log(`Tip: Configure EMAIL_HOST, EMAIL_USER, EMAIL_PASS in server/.env for production SMTP delivery.`);
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
