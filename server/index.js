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

// CORS — allow frontend dev server
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
    console.log('');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 API Base: http://localhost:${PORT}/api`);
    console.log(`🔐 Auth:     POST /api/auth/signup, POST /api/auth/login`);
    console.log(`📝 Issues:   /api/issues`);
    console.log(`💚 Health:   GET /api/health`);
    if (!dbConnected) {
      console.log('');
      console.log(`⚠️  Database NOT connected — fix MONGO_URI in .env`);
    }
    console.log('');
  });
};

startServer();
