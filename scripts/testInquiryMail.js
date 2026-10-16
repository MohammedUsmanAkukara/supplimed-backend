import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { sendInquiryEmails } from '../src/utils/mailer.js';

async function testInquiryMail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB });
    console.log('Connected to MongoDB Atlas.');

    const mockInquiry = {
      reference: 'INQ-' + Math.floor(100000 + Math.random() * 900000),
      name: 'Dr. Test Physician',
      email: 'support@supplimed.in',
      phone: '+91 9876543210',
      company: 'Supplimed Diagnostic Labs',
      interest: 'HemoVac Plus Vacuum Tubes',
      message: 'Automated system-generated email verification test via Secureserver Port 465 SSL.'
    };

    console.log('Dispatching test inquiry emails with reference:', mockInquiry.reference);
    const result = await sendInquiryEmails({ inquiry: mockInquiry });
    console.log('Result from sendInquiryEmails:', result);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error in testInquiryMail:', err);
    process.exit(1);
  }
}

testInquiryMail();
