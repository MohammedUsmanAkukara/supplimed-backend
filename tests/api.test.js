import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/server.js';
import { User } from '../src/models/User.js';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';
import { Setting } from '../src/models/Setting.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Seed default settings and test category
  await Setting.create({
    key: 'global_settings',
    websiteName: 'Supplimed',
    themeColor: '#A3C065'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Supplimed Public & Admin API Test Suite', () => {
  let adminToken = '';
  let testCategoryId = '';
  let testProductId = '';

  // 1. Health check
  test('GET /api/health should return status healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  // 2. Public Settings
  test('GET /api/settings should return public branding settings', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.settings.websiteName).toBe('Supplimed');
  });

  // 3. Unauthorized access to admin endpoints
  test('GET /api/admin/dashboard/stats should be protected (401)', async () => {
    const res = await request(app).get('/api/admin/dashboard/stats');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 4. Admin setup and login
  test('POST /api/auth/login should authenticate valid administrator', async () => {
    // Create test admin
    await User.create({
      name: 'Super Admin',
      email: 'admin@supplimed.in',
      password: 'SecurePassword123!',
      role: 'SUPER_ADMIN'
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@supplimed.in',
      password: 'SecurePassword123!'
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    adminToken = res.body.token;
  });

  // 5. Admin Category creation
  test('POST /api/categories/admin should create a new category', async () => {
    const res = await request(app)
      .post('/api/categories/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Vacuum Blood Tubes',
        slug: 'vacuum-blood-tubes',
        description: 'ISO-certified vacuum blood collection tubes',
        status: 'published'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.category.slug).toBe('vacuum-blood-tubes');
    testCategoryId = res.body.category._id;
  });

  // 6. Public Categories listing
  test('GET /api/categories should list published categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.categories.length).toBeGreaterThan(0);
  });

  // 7. Admin Product creation
  test('POST /api/products/admin should create a new product', async () => {
    const res = await request(app)
      .post('/api/products/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'HemoVac Plus K2EDTA',
        category: testCategoryId,
        packSize: 'Case of 1200',
        shortDescription: '1.0 to 10 mL volume of draw',
        status: 'published',
        isFeatured: true
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.product.slug).toBe('hemovac-plus-k2edta');
    testProductId = res.body.product._id;
  });

  // 8. Public Products listing & detail
  test('GET /api/products should return published products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  test('GET /api/products/:slug should return product details', async () => {
    const res = await request(app).get('/api/products/hemovac-plus-k2edta');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.product.name).toBe('HemoVac Plus K2EDTA');
  });

  // 9. Contact inquiry submission
  test('POST /api/inquiries should submit a client inquiry', async () => {
    const res = await request(app).post('/api/inquiries').send({
      name: 'Dr. Sarah Smith',
      email: 'sarah@clinic.com',
      phone: '+91 9876543210',
      company: 'Apollo Hospital',
      interest: 'vacuum-tubes',
      message: 'Interested in wholesale delivery of 50 cases.'
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.reference).toMatch(/^SUP-\d{6}-\d{4}$/);
  });

  // 10. Admin Certificate creation & public retrieval
  test('POST /api/certificates/admin should create an ISO certificate', async () => {
    const res = await request(app)
      .post('/api/certificates/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'ISO 13485:2016 Medical Devices Quality Management System',
        certificateNumber: 'SUP-ISO13485-TEST',
        issuingBody: 'TUV Rheinland',
        category: 'Medical Device Quality',
        fileUrl: '/images/cert-iso13485.svg',
        status: 'published'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.certificate.title).toBe('ISO 13485:2016 Medical Devices Quality Management System');
  });

  test('GET /api/certificates should return published certificates', async () => {
    const res = await request(app).get('/api/certificates');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.certificates.length).toBeGreaterThan(0);
  });

  // 11. Admin Dashboard stats
  test('GET /api/admin/dashboard/stats should return real aggregated metrics including certificates', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.products.published).toBe(1);
    expect(res.body.stats.categories).toBe(1);
    expect(res.body.stats.certificates).toBe(1);
    expect(res.body.stats.inquiries.new).toBe(1);
  });

  // 12. Forgot Password and OTP verification
  test('POST /api/auth/forgot-password should generate OTP for registered user', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'admin@supplimed.in' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const user = await User.findOne({ email: 'admin@supplimed.in' }).select('+resetPasswordOtp +resetPasswordExpire');
    expect(user.resetPasswordOtp).toBeDefined();
    expect(user.resetPasswordOtp.length).toBe(6);
    expect(user.resetPasswordExpire).toBeDefined();
  });

  test('POST /api/auth/verify-reset-otp should reject invalid OTP', async () => {
    const res = await request(app)
      .post('/api/auth/verify-reset-otp')
      .send({
        email: 'admin@supplimed.in',
        otp: '000000',
        newPassword: 'BrandNewPassword2026!'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/verify-reset-otp should reset password with valid OTP and allow login', async () => {
    const user = await User.findOne({ email: 'admin@supplimed.in' }).select('+resetPasswordOtp');
    const validOtp = user.resetPasswordOtp;

    const res = await request(app)
      .post('/api/auth/verify-reset-otp')
      .send({
        email: 'admin@supplimed.in',
        otp: validOtp,
        newPassword: 'BrandNewPassword2026!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify login with new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@supplimed.in',
        password: 'BrandNewPassword2026!'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
  });

  // 13. Media Upload & Static Image Serving
  test('POST /api/admin/media/upload should upload image and serve it via GET /uploads/:filename', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@supplimed.in',
        password: 'BrandNewPassword2026!'
      });
    const token = loginRes.body.token;

    // Upload a test PNG buffer
    const testPngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    const uploadRes = await request(app)
      .post('/api/admin/media/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', testPngBuffer, 'test-pixel.png');

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.success).toBe(true);
    expect(uploadRes.body.media.url).toMatch(/^\/uploads\//);

    // Verify the uploaded image is served statically with status 200 and image mime type
    const imageUrl = uploadRes.body.media.url;
    const fetchRes = await request(app).get(imageUrl);
    expect(fetchRes.status).toBe(200);
    expect(fetchRes.headers['content-type']).toMatch(/image/);
  });
});
