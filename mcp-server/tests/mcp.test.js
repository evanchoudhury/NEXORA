const { searchProducts } = require('../tools/products');
const { getOrderStatus } = require('../tools/orders');
const { getLowStockProducts } = require('../tools/inventory');
const { pool } = require('../config/db');

describe('NEXORA MCP Server Tools', () => {
  afterAll(async () => {
    await pool.end();
  });

  test('search_products MCP tool returns matching products from database', async () => {
    const result = await searchProducts({ query: 'AuraSound', limit: 2 });
    expect(result).toBeDefined();
    expect(result.count).toBeGreaterThan(0);
    expect(result.products[0].name).toContain('AuraSound');
  });

  test('get_order_status MCP tool tracks demo seeded order', async () => {
    const result = await getOrderStatus({ orderNumber: 'NEX-2026-98214' });
    expect(result).toBeDefined();
    expect(result.order_number).toBe('NEX-2026-98214');
    expect(result.payment_status).toBe('PAID');
  });

  test('get_low_stock_products MCP tool identifies products below safety cutoff', async () => {
    const result = await getLowStockProducts({ threshold: 5 });
    expect(result).toBeDefined();
    expect(Array.isArray(result.lowStockItems)).toBe(true);
    expect(result.count).toBeGreaterThan(0);
  });
});
