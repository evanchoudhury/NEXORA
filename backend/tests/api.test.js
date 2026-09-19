const request = require('supertest');
const app = require('../server');
const { pool } = require('../config/insforge');

describe('NEXORA E-Commerce API Endpoints', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('GET /api/health returns HEALTHY status and InsForge PostgreSQL backend', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('HEALTHY');
    expect(res.body.platform).toBe('InsForge PostgreSQL');
  });

  test('GET /api/categories returns the 8 seeded categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.categories)).toBe(true);
    expect(res.body.data.categories.length).toBeGreaterThanOrEqual(8);
  });

  test('GET /api/products returns paginated products catalog', async () => {
    const res = await request(app).get('/api/products?limit=5');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBe(5);
    expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(32);
  });

  test('GET /api/products?category=gaming filters appropriately', async () => {
    const res = await request(app).get('/api/products?category=gaming');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBeGreaterThan(0);
    res.body.data.products.forEach(p => {
      expect(p.category_slug).toBe('gaming');
    });
  });

  test('POST /api/auth/login succeeds for demo customer', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer@nexora.com',
        password: 'Password@123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('customer@nexora.com');
  });

  test('POST /api/orders/validate-coupon verifies valid coupon code', async () => {
    const res = await request(app)
      .post('/api/orders/validate-coupon')
      .send({
        code: 'NEXORA10',
        subtotal: 5000
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.discountAmount).toBe(500); // 10% of 5000 = 500
  });

  test('GET /api/blockchain/quote calculates cryptocurrency equivalent', async () => {
    const res = await request(app).get('/api/blockchain/quote?fiatAmount=14000');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.currency).toBe('ETH');
    expect(res.body.data.cryptoAmount).toBe(0.05); // 14000 / 280000 = 0.05
  });
});
