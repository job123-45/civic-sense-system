const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');

const app = express();

// ---------------------
// Middleware
// ---------------------

// Allowed origins — dev + production (Vercel)
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://civic-sense-system.vercel.app',
  process.env.CLIENT_URL, // optional override via env var
].filter(Boolean); // remove undefined if CLIENT_URL not set

// CORS — allow configured origins with credentials
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server calls (e.g. Postman, health checks) with no origin
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ---------------------
// Static files (uploaded images)
// ---------------------

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

// ---------------------
// Routes
// ---------------------

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

// Enhanced health check — shows DB + env var status so you can diagnose Render issues from the browser
app.get('/api/health', (req, res) => {
  const mongoUri = process.env.MONGO_URI || '';
  const isAtlas  = mongoUri.startsWith('mongodb+srv://');
  const isLocal  = mongoUri.startsWith('mongodb://127') || mongoUri.startsWith('mongodb://localhost');

  res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV:       process.env.NODE_ENV    || '(not set)',
      PORT:           process.env.PORT        || '(not set — defaulting to 5000)',
      MONGO_URI_type: isAtlas ? 'Atlas ✅' : isLocal ? 'Local ⚠️  (will fail on Render)' : '(not set ❌)',
      JWT_SECRET:     process.env.JWT_SECRET  ? 'set ✅' : '(not set ❌)',
      CLIENT_URL:     process.env.CLIENT_URL  || '(not set — using hardcoded allowlist)',
    },
    cors_origins: ALLOWED_ORIGINS,
  });
});

// Root endpoint — after API routes, before 404 handler
// Visiting https://civic-backend.onrender.com/ will show this
app.get('/', (req, res) => {
  res.json({
    message: '✅ Civic Sense backend is running',
    docs: {
      health:  '/api/health',
      auth:    '/api/auth/login  |  /api/auth/signup  |  /api/auth/me',
      issues:  '/api/issues',
    },
  });
});

// ---------------------
// Error handler
// ---------------------

// Handle multer errors
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.',
    });
  }
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ---------------------
// Start server
// ---------------------

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const dbConnected = await connectDB();

  app.listen(PORT, () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const host = isProduction
      ? 'https://civic-backend.onrender.com'
      : `http://localhost:${PORT}`;

    console.log('');
    console.log(`🚀 Server running on ${host}`);
    console.log(`📋 API Base:    ${host}/api`);
    console.log(`🔐 Auth:        POST /api/auth/signup, POST /api/auth/login`);
    console.log(`📝 Issues:      /api/issues`);
    console.log(`💚 Health:      GET /api/health`);
    console.log(`🌍 CORS origins: ${ALLOWED_ORIGINS.join(', ')}`);
    if (!dbConnected) {
      console.log('');
      console.log(`⚠️  Database NOT connected — fix MONGO_URI in .env`);
    }
    console.log('');
  });
};

startServer();
