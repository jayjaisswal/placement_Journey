require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const articleRoutes = require('./routes/articles');
const quizRoutes = require('./routes/quiz');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const readLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const writeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
app.use('/api', readLimiter);
app.use('/api', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return writeLimiter(req, res, next);
  }
  next();
});

// Routes
app.use('/api/articles', articleRoutes);
app.use('/api/quiz', quizRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB and start server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_journey';
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
