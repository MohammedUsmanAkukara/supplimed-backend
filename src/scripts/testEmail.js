import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

async function testMail() {
  console.log('Testing SMTP connection with:');
  console.log('Host:', process.env.EMAIL_HOST);
  console.log('Port:', process.env.EMAIL_PORT);
  console.log('User:', process.env.EMAIL_USER);

  const port = parseInt(process.env.EMAIL_PORT, 10) || 465;
  const isSecure = process.env.EMAIL_SECURE === 'true' || port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: port,
    secure: isSecure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Verifying transporter connection...');
    await transporter.verify();
    console.log('SUCCESS: Transporter verified successfully!');

    console.log(`Sending test email to ${process.env.EMAIL_USER}...`);
    const info = await transporter.sendMail({
      from: `"Supplimed Mail Verification" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_USER,
      subject: `Supplimed SMTP Test Email - ${new Date().toLocaleString()}`,
      text: 'This is a test email verifying that Supplimed email delivery (port 465 SSL) is working properly.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #166534; border-radius: 8px;">
          <h2 style="color: #166534;">Supplimed Mailer Verification Successful</h2>
          <p>This automated test confirms that the SMTP credentials and SSL connection are functioning properly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    console.log('SUCCESS: Test email sent successfully! MessageId:', info.messageId);
    process.exit(0);
  } catch (err) {
    console.error('SMTP test failed with error:', err);
    process.exit(1);
  }
}

testMail();
