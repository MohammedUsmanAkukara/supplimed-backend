import mongoose from 'mongoose';
import readline from 'readline';
import { User } from '../models/User.js';
import { connectDB, closeDB } from '../config/db.js';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace('--', '');
      parsed[key] = args[i + 1] || true;
      i++;
    }
  }
  return parsed;
};

const prompt = (question) => {
  if (!process.stdin.isTTY) {
    return Promise.resolve('');
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

async function createAdmin() {
  console.log('==================================================');
  console.log('   SUPPLIMED — SUPER ADMINISTRATOR SETUP SCRIPT   ');
  console.log('==================================================\n');

  try {
    const conn = await connectDB();
    if (!conn) {
      console.error('\n[Error] Could not establish connection to MongoDB.');
      console.log('Please ensure your MONGODB_URI in server/.env is configured with your MongoDB Atlas connection string.');
      console.log('Example: MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/supplimed?retryWrites=true&w=majority\n');
      process.exit(1);
    }

    const args = parseArgs();
    let name = args.name;
    let email = args.email;
    let password = args.password;

    if (!email && process.stdin.isTTY) {
      email = await prompt('Enter Administrator Email: ');
    }
    if (!name && process.stdin.isTTY) {
      name = await prompt('Enter Administrator Full Name (Default: Super Admin): ');
    }
    if (!password && process.stdin.isTTY) {
      password = await prompt('Enter Administrator Password (min 8 characters): ');
    }

    // Default fallbacks for automated or non-interactive execution
    email = email || 'admin@supplimed.in';
    name = name || 'Super Admin';
    password = password || 'SupplimedAdmin2026!';

    if (password.length < 8) {
      console.error('\n[Error] Password must be at least 8 characters long.');
      process.exit(1);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      existing.role = 'SUPER_ADMIN';
      existing.isActive = true;
      await existing.save();
      console.log(`\n[Success] Existing user "${email}" verified and granted SUPER_ADMIN privileges.`);
      await closeDB();
      process.exit(0);
    }

    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'SUPER_ADMIN',
      isActive: true
    });

    console.log('\n--------------------------------------------------');
    console.log('[SUCCESS] Super Administrator account ready!');
    console.log(`Name:     ${admin.name}`);
    console.log(`Email:    ${admin.email}`);
    console.log(`Password: ${password}`);
    console.log(`Role:     ${admin.role}`);
    console.log('--------------------------------------------------');
    console.log('Login Route: /admin/login\n');
  } catch (error) {
    console.error(`\n[Error] Failed to create administrator: ${error.message}`);
    process.exit(1);
  } finally {
    await closeDB();
    process.exit(0);
  }
}

createAdmin();
