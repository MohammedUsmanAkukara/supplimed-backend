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

  // 10. Admin Dashboard stats
  test('GET /api/admin/dashboard/stats should return real aggregated metrics', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.products.published).toBe(1);
    expect(res.body.stats.categories).toBe(1);
    expect(res.body.stats.inquiries.new).toBe(1);
  });
});
