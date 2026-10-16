import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

async function updateSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB });
    console.log('Connected to MongoDB Atlas.');

    const Setting = mongoose.model('Setting', new mongoose.Schema({}, { strict: false }));

    const updated = await Setting.findOneAndUpdate(
      { key: 'global_settings' },
      {
        $set: {
          'smtp.enabled': true,
          'smtp.host': 'sg2plzcpnl509592.prod.sin2.secureserver.net',
          'smtp.port': 465,
          'smtp.secure': true,
          'smtp.requireTls': true,
          'smtp.user': 'support@supplimed.in',
          'smtp.pass': '@Hb1t7bbknj',
          'smtp.fromEmail': 'support@supplimed.in',
          'smtp.fromName': 'Supplimed'
        }
      },
      { new: true, upsert: true }
    );

    console.log('Updated SMTP settings in MongoDB Atlas:');
    console.log(JSON.stringify(updated.smtp, null, 2));
    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error('Failed to update settings:', err);
    process.exit(1);
  }
}

updateSettings();
