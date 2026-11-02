require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Initialize app
const app = express();

// Ensure the local file system uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static uploaded files (photos)
app.use('/uploads', express.static(uploadsDir));

// Mount Routers with Rate Limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api', apiLimiter, feedbackRoutes);

// Root Route for basic server diagnostics
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Digital Public Service Feedback Portal API (Upgraded)' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong on the server!' });
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
