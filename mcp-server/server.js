const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} = require('@modelcontextprotocol/sdk/types.js');
require('dotenv').config();

const { query, logMcpToolCall } = require('./config/db');
const productsTools = require('./tools/products');
const ordersTools = require('./tools/orders');
const inventoryTools = require('./tools/inventory');
const analyticsTools = require('./tools/analytics');
const blockchainTools = require('./tools/blockchain');

const server = new Server(
  {
    name: process.env.MCP_SERVER_NAME || 'nexora-mcp-server',
    version: process.env.MCP_SERVER_VERSION || '1.0.0'
  },
  {
    capabilities: {
      tools: {},
      resources: {}
    }
  }
);

// 1. LIST TOOLS
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_products',
        description: 'Search the NEXORA PostgreSQL product catalog with filters for keyword, category, and price range.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term for name or brand' },
            category: { type: 'string', description: 'Category slug (e.g. gaming, electronics, fashion)' },
            minPrice: { type: 'number', description: 'Minimum price in INR' },
            maxPrice: { type: 'number', description: 'Maximum price in INR' },
            limit: { type: 'integer', description: 'Results limit (1-50)', default: 10 }
          }
        }
      },
      {
        name: 'get_product',
        description: 'Retrieve detailed product specifications, stock levels, and pricing by UUID or slug.',
        inputSchema: {
          type: 'object',
          properties: {
            identifier: { type: 'string', description: 'Product UUID or slug' }
          },
          required: ['identifier']
        }
      },
      {
        name: 'create_product',
        description: '[ADMIN WRITE TOOL] Create a new product and initialize inventory in InsForge PostgreSQL.',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Title of the product' },
            description: { type: 'string', description: 'Comprehensive product description' },
            brand: { type: 'string', description: 'Brand manufacturer name' },
            sku: { type: 'string', description: 'Unique SKU identifier' },
            price: { type: 'number', description: 'Price in INR' },
            categorySlug: { type: 'string', description: 'Category slug' },
            stock: { type: 'integer', description: 'Initial stock', default: 10 }
          },
          required: ['name', 'description', 'sku', 'price', 'categorySlug']
        }
      },
      {
        name: 'get_order_status',
        description: 'Track the delivery and payment status of an order using its order reference number.',
        inputSchema: {
          type: 'object',
          properties: {
            orderNumber: { type: 'string', description: 'Order number, e.g. NEX-2026-XXXXX' }
          },
          required: ['orderNumber']
        }
      },
      {
        name: 'update_order_status',
        description: '[ADMIN/MANAGER WRITE TOOL] Update the fulfillment status and tracking number of an order.',
        inputSchema: {
          type: 'object',
          properties: {
            orderId: { type: 'string', description: 'Order UUID' },
            orderStatus: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
              description: 'New fulfillment status'
            },
            trackingNumber: { type: 'string', description: 'Courier tracking number' }
          },
          required: ['orderId', 'orderStatus']
        }
      },
      {
        name: 'get_low_stock_products',
        description: 'Query products that are currently below their safety replenishment inventory threshold.',
        inputSchema: {
          type: 'object',
          properties: {
            threshold: { type: 'integer', description: 'Stock cutoff threshold', default: 5 }
          }
        }
      },
      {
        name: 'update_inventory',
        description: '[ADMIN/MANAGER WRITE TOOL] Update the physical warehouse stock for a product.',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string', description: 'Product UUID' },
            newStock: { type: 'integer', description: 'New physical stock quantity' }
          },
          required: ['productId', 'newStock']
        }
      },
      {
        name: 'get_sales_analytics',
        description: '[ADMIN/MANAGER TOOL] View total store revenue, order volume, and category breakdown.',
        inputSchema: {
          type: 'object',
          properties: {
            days: { type: 'integer', description: 'Timeframe in days (1-90)', default: 30 }
          }
        }
      },
      {
        name: 'get_blockchain_transaction',
        description: 'Look up an on-chain Web3 crypto payment receipt verified on Sepolia testnet.',
        inputSchema: {
          type: 'object',
          properties: {
            transactionHash: { type: 'string', description: '0x prefixed EVM transaction hash' }
          },
          required: ['transactionHash']
        }
      }
    ]
  };
});

// 2. CALL TOOL (With RBAC, Audit Logging & Validation)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const startTime = Date.now();
  let success = true;
  let errorMsg = null;
  let result = null;

  // Context: default to ADMIN for autonomous operations, or extract from headers/auth if injected
  const context = {
    role: 'ADMIN',
    userId: 'a0000000-0000-0000-0000-000000000001'
  };

  try {
    switch (name) {
      case 'search_products':
        result = await productsTools.searchProducts(args);
        break;
      case 'get_product':
        result = await productsTools.getProduct(args);
        break;
      case 'create_product':
        result = await productsTools.createProduct(args, context);
        break;
      case 'get_order_status':
        result = await ordersTools.getOrderStatus(args);
        break;
      case 'update_order_status':
        result = await ordersTools.updateOrderStatus(args, context);
        break;
      case 'get_low_stock_products':
        result = await inventoryTools.getLowStockProducts(args);
        break;
      case 'update_inventory':
        result = await inventoryTools.updateInventory(args, context);
        break;
      case 'get_sales_analytics':
        result = await analyticsTools.getSalesAnalytics(args, context);
        break;
      case 'get_blockchain_transaction':
        result = await blockchainTools.getBlockchainTransaction(args);
        break;
      default:
        throw new Error(`Unknown MCP Tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, data: result }, null, 2)
        }
      ]
    };
  } catch (err) {
    success = false;
    errorMsg = err.message;
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: false, error: { code: 'TOOL_ERROR', message: err.message } }, null, 2)
        }
      ]
    };
  } finally {
    // Record audit log to PostgreSQL mcp_audit_logs
    await logMcpToolCall({
      userId: context.userId,
      role: context.role,
      toolName: name,
      parameters: args,
      success,
      errorMessage: errorMsg,
      executionTimeMs: Date.now() - startTime
    });
  }
});

// 3. LIST RESOURCES
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'product://catalog',
        name: 'Product Catalog Summary',
        description: 'High level summary of all active items and prices',
        mimeType: 'application/json'
      },
      {
        uri: 'inventory://low-stock',
        name: 'Critical Inventory Alerts',
        description: 'Products requiring immediate warehouse restocking',
        mimeType: 'application/json'
      },
      {
        uri: 'analytics://overview',
        name: 'Executive Sales Summary',
        description: 'Overall platform sales and revenue metrics',
        mimeType: 'application/json'
      }
    ]
  };
});

// 4. READ RESOURCE
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'product://catalog') {
    const res = await query('SELECT id, name, sku, price, rating FROM products WHERE is_active = TRUE LIMIT 30');
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(res.rows, null, 2)
        }
      ]
    };
  }

  if (uri === 'inventory://low-stock') {
    const res = await query(`
      SELECT p.name, p.sku, inv.stock, inv.low_stock_threshold
      FROM products p
      JOIN inventory inv ON p.id = inv.product_id
      WHERE inv.stock <= inv.low_stock_threshold
    `);
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(res.rows, null, 2)
        }
      ]
    };
  }

  if (uri === 'analytics://overview') {
    const res = await query(`
      SELECT 
        SUM(total_amount) AS total_revenue,
        COUNT(id) AS total_orders
      FROM orders
      WHERE payment_status = 'PAID'
    `);
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(res.rows[0], null, 2)
        }
      ]
    };
  }

  throw new Error(`Resource not found: ${uri}`);
});

// Start Stdio server transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[NEXORA MCP Server] Running on stdio transport.');
}

if (process.env.NODE_ENV !== 'test') {
  run().catch((err) => {
    console.error('[MCP Fatal Error]:', err);
    process.exit(1);
  });
}

module.exports = { server };
