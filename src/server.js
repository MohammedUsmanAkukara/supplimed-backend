import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimiter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import navigationRoutes from './routes/navigationRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import brochureRoutes from './routes/brochureRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import { getPublicGalleryMedia } from './controllers/mediaController.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import seoRoutes from './routes/seoRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Managed per frontend deployment
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration for local dev and production
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (
        config.corsOrigins.includes(origin) ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive CORS
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body and Cookie Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logger
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Serve persistent uploads statically (supports running from workspace root or server directory)
const serverUploadsPath = path.join(__dirname, '..', 'public', 'uploads');
const rootUploadsPath = path.resolve('public', 'uploads');

if (!fs.existsSync(serverUploadsPath)) {
  fs.mkdirSync(serverUploadsPath, { recursive: true });
}
app.use('/uploads', express.static(serverUploadsPath));

if (path.resolve(serverUploadsPath) !== path.resolve(rootUploadsPath) && fs.existsSync(rootUploadsPath)) {
  app.use('/uploads', express.static(rootUploadsPath));
}

// Dynamic Technical SEO routes at root
app.use('/', seoRoutes);

// General API rate limiter
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'degraded',
    database: {
      connected: isDbConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null
    },
    timestamp: new Date().toISOString(),
    service: 'Supplimed API & CMS Server',
    environment: config.nodeEnv
  });
});

// Guard: verify database connectivity for API operations (prevents 10s buffering timeouts)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is currently unavailable. Please verify MongoDB Atlas IP whitelist or network connection.',
      error: 'DATABASE_DISCONNECTED'
    });
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/brochures', brochureRoutes);
app.get('/api/media', getPublicGalleryMedia);
app.use('/api/admin/media', mediaRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/audit-logs', auditRoutes);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server if not in test mode
if (config.nodeEnv !== 'test') {
  connectDB().then((conn) => {
    if (!conn) {
      if (config.nodeEnv === 'production') {
        console.error('[MongoDB FATAL] Could not connect to MongoDB in production mode. Process exiting.');
        process.exit(1);
      } else {
        console.warn('[MongoDB WARNING] Server starting in DEGRADED mode without an active database connection.');
      }
    }
    app.listen(config.port, () => {
      console.log(`[Supplimed Server] Running on http://localhost:${config.port} in ${config.nodeEnv} mode`);
    });
  }).catch((err) => {
    console.error('[MongoDB Startup Error]', err);
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
  });
}

export default app;
