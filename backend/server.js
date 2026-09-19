const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { pool } = require('./config/insforge');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Route handlers
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const adminRoutes = require('./routes/adminRoutes');

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allows Bootstrap CDN & fonts in EJS views
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// EJS View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Apply general API rate limiting to /api routes
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'HEALTHY',
    service: 'NEXORA E-Commerce API',
    platform: 'InsForge PostgreSQL',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products/:productId/reviews', reviewRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/admin', adminRoutes);

app.post('/api/create-checkout-session', async (req, res) => {
  // TODO: Set mode to "subscription" if selling recurring products.
  const mode = 'payment';

  // Use the fixed_by_ui parameters from the Field Intents section above.
  // success_url, cancel_url, and line_items are sample_only — replace with real values, then list in TODO.
  // Only include payment_method_collection when mode is "subscription".
  const sessionParams = {
    ui_mode: 'hosted_page',
    mode,
    billing_address_collection: 'auto',
    phone_number_collection: {
      enabled: false
    },
    automatic_tax: {
      enabled: false
    },
    allow_promotion_codes: false,
    submit_type: 'auto',
    integration_identifier: 'hosted_web_0001',
    origin_context: 'web',
    success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN}`,
    line_items: [{ price: 'price_...', quantity: 1 }]
  };
  if (mode === 'subscription') {
    sessionParams.payment_method_collection = 'always'; // Use the fixed_by_ui value from Field Intents
  }
  const session = await stripe.checkout.sessions.create(sessionParams);

  res.redirect(303, session.url);
});

// SSR Routes (Invoices & Reports)
app.use('/admin', adminRoutes);

// 404 handler for unknown API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`
    }
  });
});

// Centralized error handling
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 NEXORA Backend Server running on http://localhost:${PORT}`);
    console.log(`📦 Database: InsForge PostgreSQL connected`);
    console.log(`🔗 Web3: Sepolia Testnet RPC integration active`);
    console.log(`📄 SSR Invoices & Reports ready at http://localhost:${PORT}/admin`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
