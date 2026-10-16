import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/supplimed',
  mongodbDb: process.env.MONGODB_DB || 'supplimed',
  jwtSecret: process.env.AUTH_SECRET || process.env.JWT_SECRET || 'supplimed_secure_jwt_secret_key_change_in_production_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173,https://supplimed-website.vercel.app').split(','),
  
  // Storage (Cloudinary persistent object storage)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'supplimed'
  },
  
  // Email
  email: {
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    from: process.env.EMAIL_FROM || 'sales@supplimed.in',
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_PORT === '465',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    service: process.env.EMAIL_SERVICE || '',
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_FROM || 'sales@supplimed.in'
  }
};
